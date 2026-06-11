import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

function parseCsv(value?: string) {
  return value
    ?.split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
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

  app.setGlobalPrefix(apiPrefix);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('TREVA API')
    .setDescription('TREVA Real Estate API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(swaggerPath, app, document);

  await app.listen(port);
}
bootstrap();
