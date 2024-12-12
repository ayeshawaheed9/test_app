// import {
//   WebSocketGateway,
//   WebSocketServer,
//   SubscribeMessage,
//   MessageBody,
//   OnGatewayInit,
// } from '@nestjs/websockets';
// import { Server } from 'socket.io';
// import { Logger } from '@nestjs/common';
// @WebSocketGateway()
// export class HuggingFaceGateway implements OnGatewayInit {
//   @WebSocketServer()
//   server: Server;
//   private logger: Logger = new Logger('HuggingFaceGateway');

//   afterInit() {
//     this.logger.log('Producer WebSocket initialized');
//   }

//   @SubscribeMessage('requestHuggingFace')
//   handleHuggingFaceRequest(@MessageBody() data: any) {
//     this.logger.log('Hugging Face request emitted');
//     this.server.emit('newHuggingFaceEvent', {
//       msg: 'New Hugging Face event',
//       content: data,
//     });
//   }
// }
