import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './filters/http-exception.filter';
import { UPLOADS_DIR, UPLOADS_ROUTE } from './uploads/uploads.controller';
import helmet from 'helmet';
import type { Response } from 'express';

function parseCsv(value?: string) {
  return value
    ?.split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const configService = app.get(ConfigService);
  const corsOrigins = parseCsv(configService.get<string>('CORS_ORIGINS'));
  const apiPrefix = configService.get<string>('API_PREFIX');
  const swaggerPath = configService.get<string>('SWAGGER_PATH');
  const port = Number(configService.get<string>('PORT'));

  if (!apiPrefix) {
    throw new Error('API_PREFIX is not configured');
  }

  if (!swaggerPath) {
    throw new Error('SWAGGER_PATH is not configured');
  }

  if (!Number.isInteger(port) || port <= 0) {
    throw new Error('PORT is not configured');
  }

  if (!corsOrigins?.length) {
    throw new Error('CORS_ORIGINS is not configured');
  }

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
  });

  app.useGlobalFilters(new AllExceptionsFilter());

  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      crossOriginEmbedderPolicy: false,
      contentSecurityPolicy: false,
      crossOriginOpenerPolicy: false,
    }),
  );

  // Outside the API prefix on purpose: treva-broker rewrites its own /uploads
  // here, so a stored URL stays the same whichever host serves it.
  app.useStaticAssets(UPLOADS_DIR, {
    prefix: UPLOADS_ROUTE,
    // An uploaded SVG is a document that can carry script, and it is served
    // on treva-broker's origin too. Sandboxed, it still draws in an <img> but
    // runs nothing when opened on its own.
    setHeaders: (res: Response, path: string) => {
      if (path.toLowerCase().endsWith('.svg')) {
        res.setHeader(
          'Content-Security-Policy',
          "default-src 'none'; style-src 'unsafe-inline'; sandbox",
        );
      }
    },
  });

  app.setGlobalPrefix(apiPrefix);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('TREVA Broker API')
    .setDescription('TREVA Broker CRM API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(swaggerPath, app, document);

  await app.listen(port);
}
void bootstrap();
