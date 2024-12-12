import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MiddlewareConsumer } from '@nestjs/common';
import { ProxyMiddleware } from './proxy.middleware';
import { NestModule } from '@nestjs/common';
@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, ProxyMiddleware],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ProxyMiddleware).forRoutes('/api');
  }
}
