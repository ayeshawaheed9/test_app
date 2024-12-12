import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import Redis from 'ioredis';
import { Injectable, OnModuleInit } from '@nestjs/common';
import zlib from 'zlib';

@Injectable()
@WebSocketGateway({
  cors: {
    origin: 'http://localhost:9001',
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket'],
})
export class SocketIoGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit
{
  @WebSocketServer() private server: Server;
  private sessionPageMap: Map<string, Map<string, string>> = new Map(); // sessionId -> { pageId -> socketId }
  private redisClient;
  private subClient;

  async onModuleInit() {
    try {
      this.redisClient = new Redis.Cluster(
        [
          {
            host: process.env.REDIS_HOST,
            port: 6380,
          },
        ],
        {
          redisOptions: {
            password: process.env.REDIS_PASSWORD,
            tls: { servername: process.env.REDIS_HOST },
          },
          slotsRefreshTimeout: 5000,
        },
      );
      this.redisClient.on('error', (error) => {
        console.error('Redis Client Error:', error);
      });
    } catch (error) {
      console.error('Error connecting to Redis:', error);
      process.exit(1);
    }
    this.subClient = this.redisClient.duplicate();
    this.subClient.on('error', (error) => {
      console.error('Redis Sub Client Error:', error);
    });
    this.server.adapter(createAdapter(this.redisClient, this.subClient));
    console.log('Redis adapter set successfully for socket.io.');
  }

  generateData = () => {
    const data = [];
    for (let i = 0; i < 30000; i++) {
      data.push(`Line ${i + 1}: This is some example data.`);
    }
    return data;
  };

  compressData = (data) => {
    return new Promise((resolve, reject) => {
      const jsonString = JSON.stringify(data);
      zlib.gzip(jsonString, (err, compressed) => {
        if (err) reject(err);
        else resolve(compressed);
      });
    });
  };
  async handleConnection(socket: Socket) {
    const sessionId = socket.handshake.query.sessionId as string | undefined;
    const pageId = socket.handshake.query.pageId as string | undefined;

    if (sessionId) {
      await this.storeSession(sessionId, socket.id);

      if (pageId) {
        this.registerPage(socket, { sessionId, pageId });
        console.log(
          `Session ${sessionId} connected to page ${pageId} with socket ID ${socket.id}`,
        );
      }
    }

    setTimeout(() => {
      this.sendMessageToPage(
        sessionId,
        'notifications',
        'Welcome to the notifications page!',
      );
    }, 1000);

    
    const data = this.generateData();
    const compressedData = await this.compressData(data);
    console.log('Sending compressed data');
    socket.emit('compressed_data', compressedData);
  }

  async handleDisconnect(socket: Socket) {
    const sessionId = socket.handshake.query.sessionId as string | undefined;
    const pageId = socket.handshake.query.pageId as string | undefined;

    if (sessionId && pageId) {
      const pages = this.sessionPageMap.get(sessionId);
      if (pages) {
        pages.delete(pageId);
        console.log(`Page ${pageId} of session ${sessionId} disconnected.`);
      }
    }
  }

  registerPage(
    socket: Socket,
    { sessionId, pageId }: { sessionId: string; pageId: string },
  ) {
    if (!this.sessionPageMap.has(sessionId)) {
      this.sessionPageMap.set(sessionId, new Map());
    }
    const pages = this.sessionPageMap.get(sessionId);
    pages.set(pageId, socket.id);

    console.log(
      `Page ${pageId} registered for session ${sessionId} with socket ID: ${socket.id}`,
    );
  }

  private async storeSession(sessionId: string, socketId: string) {
    await this.subClient.set(sessionId, socketId, 'EX', 3600);
  }

  sendMessageToPage(sessionId: string, targetPageId: string, message: string) {
    const pages = this.sessionPageMap.get(sessionId);

    if (pages && pages.has(targetPageId)) {
      const socketId = pages.get(targetPageId);

      this.server.to(socketId).emit('personal_message', {
        content: message,
        pageId: targetPageId,
      });

      console.log(
        `Message sent to page ${targetPageId} of session ${sessionId}`,
      );
    } else {
      console.log(
        `Target page ${targetPageId} not found for session ${sessionId}`,
      );
    }
  }
}
