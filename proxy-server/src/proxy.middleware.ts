import { Injectable, NestMiddleware } from '@nestjs/common';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { Request, Response, NextFunction } from 'express';
import * as http from 'http';
import * as net from 'net';

@Injectable()
export class ProxyMiddleware implements NestMiddleware {
  private readonly proxy = createProxyMiddleware({
    target: 'http://localhost:9001',
    changeOrigin: true,
    ws: true,
    pathRewrite: {
      '^/api': '',
    },
  });

  use(req: Request, res: Response, next: NextFunction) {
    console.log('[Proxy Middleware] HTTP Request Intercepted');
    console.log(`Request URL: ${req.url}`);
    console.log(`Request Method: ${req.method}`);
    this.proxy(req, res, next);
  }

  handleWebSocket(server: http.Server) {
    server.on(
      'upgrade',
      (req: http.IncomingMessage, socket: net.Socket, head: Buffer) => {
        console.log('[Proxy Middleware] WebSocket Upgrade Request Intercepted');
        console.log(`Upgrade Request URL: ${req.url}`);
        if (req.url?.startsWith('/api/socket.io')) {
          this.proxy.upgrade(req, socket, head);
        } else {
          console.log(
            '[Proxy Middleware] Non-API WebSocket Upgrade Request Ignored',
          );
          socket.destroy();
        }
      },
    );
  }
}
