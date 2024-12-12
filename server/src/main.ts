import { createClient } from 'redis';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.startAllMicroservices();
  console.log('Producer Started...');
  const port = process.env.PORT || 9001;
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

bootstrap();
