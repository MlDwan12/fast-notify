import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import rateLimit from 'express-rate-limit';
import type { CorsOptionsDelegate } from 'cors';
import type { Express } from 'express';

async function bootstrap() {
  const corsOriginsEnv = process.env.CORS_ORIGINS ?? '';

  const corsOrigins = corsOriginsEnv
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (corsOrigins.length === 0) {
    throw new Error('CORS_ORIGINS is empty or not set');
  }
  const app = await NestFactory.create(AppModule);

  // boundary cast (один раз, осознанно)
  const server = app.getHttpAdapter().getInstance() as Express;
  server.set('trust proxy', 1);

  app.use(
    rateLimit({
      windowMs: 60_000,
      limit: 100,
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );

  const corsOptions: CorsOptionsDelegate = (req, callback) => {
    const origin = req.headers.origin;

    // запросы без Origin (curl, healthcheck)
    if (!origin) {
      callback(null, { origin: false });
      return;
    }

    if (typeof origin === 'string' && corsOrigins.includes(origin)) {
      callback(null, { origin: true, credentials: true });
      return;
    }

    callback(new Error('Not allowed by CORS'));
  };

  app.enableCors(corsOptions);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  await app.listen(process.env.PORT ?? 7171);
}

void bootstrap();
