import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { AppService } from './app.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AppController } from './app.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { OrderSchema } from './schemas/orders.schema';
import { Order } from './schemas/orders.schema';
import { HttpModule } from '@nestjs/axios';
import { ProducerUserController } from './user/user.controller';
import { UserHttpService } from './user/user.http.service';
import { WebPubSubGatewayService } from './webpubsub/webpubsub.gateway';
import { WebPubSubController } from './webpubsub/webpubsub.controller';
import { EventController } from './webpubsub/eventhandler.controller';
import { SocketIoGateway } from './socket/socket.gateway';
@Module({
  imports: [
    HttpModule,
    MongooseModule.forRoot('mongodb://localhost:27017'),
    MongooseModule.forFeature([{ name: Order.name, schema: OrderSchema }]),
    ClientsModule.register([
      {
        name: 'ORDERS_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://localhost:5672'],
          queue: 'orders_status_queue',
          queueOptions: {
            durable: true,
            arguments: {
              'x-dead-letter-exchange': 'dlx_exchange',
              'x-dead-letter-routing-key': 'dead_letter',
            },
          },
        },
      },
    ]),
  ],
  controllers: [
    AppController,
    ProducerUserController,
    WebPubSubController,
    EventController,
  ],
  providers: [
    AppService,
    UserHttpService,
    WebPubSubGatewayService,
    SocketIoGateway,
  ],
})
export class AppModule {}
