import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

// session adapter
import { RedisAdapter } from './adapter/redisAdapter.adapter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const port = process.env.SERVER_PORT;

  // serve static files
  app.useStaticAssets(join(__dirname, '..', '..', '..', 'uploads'), { prefix: '/uploads' });

  // validation pie
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // trust proxy
  app.set('trust proxy', process.env.NODE_ENV === 'development' ? 1 : 2);

  // enable cors
  app.enableCors({
    origin: process.env.SOCKET_IO_HOST_ORIGIN,
    credentials: true,
    methods: ['GET', 'POST'],
  });

  // session adapter
  const redisAdapter = new RedisAdapter(app);

  // Ensure the adapter is initialized before any server or WebSocket setup
  await redisAdapter.initializeAdapter();

  // Use the WebSocket adapter in your NestJS application
  app.useWebSocketAdapter(redisAdapter);


  await app.listen(port);
}
bootstrap();
