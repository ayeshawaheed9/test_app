import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ProxyMiddleware } from './proxy.middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const server = app.getHttpServer();
  const proxyMiddleware = app.get(ProxyMiddleware);
  app.use('/api', proxyMiddleware.use.bind(proxyMiddleware));
  proxyMiddleware.handleWebSocket(server);

  await app.listen(3000);
}
bootstrap();
