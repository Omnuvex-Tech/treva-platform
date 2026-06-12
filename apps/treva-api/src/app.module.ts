import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { CategoriesModule } from './categories/categories.module';
import { UnitLayoutsModule } from './unit-layouts/unit-layouts.module';
import { UploadModule } from './upload/upload.module';
import { RoomOptionsModule } from './room-options/room-options.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ServeStaticModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => [
        {
          rootPath: join(
            process.cwd(),
            configService.get<string>('UPLOADS_DIR') ?? 'uploads',
          ),
          serveRoot:
            configService.get<string>('UPLOADS_SERVE_ROOT') ?? '/uploads',
        },
      ],
    }),
    PrismaModule,
    AuthModule,
    CategoriesModule,
    UnitLayoutsModule,
    UploadModule,
    RoomOptionsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
