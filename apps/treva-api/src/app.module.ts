import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
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
import { ViewOptionsModule } from './view-options/view-options.module';
import { CurrenciesModule } from './currencies/currencies.module';
import { StatusOptionsModule } from './status-options/status-options.module';
import { ApartmentTypesModule } from './apartment-types/apartment-types.module';
import { ApartmentsModule } from './apartments/apartments.module';
import { OwnersModule } from './owners/owners.module';
import { AttributesModule } from './attributes/attributes.module';
import { RequestsModule } from './requests/requests.module';
import { ObjectTypesModule } from './object-types/object-types.module';
import { LcdOptionsModule } from './lcd-options/lcd-options.module';
import { TypeOfBuildingOptionsModule } from './type-of-building-options/type-of-building-options.module';
import { PropertyTypeOptionsModule } from './property-type-options/property-type-options.module';
import { ConstructionStageOptionsModule } from './construction-stage-options/construction-stage-options.module';
import { SalesOfficeOptionsModule } from './sales-office-options/sales-office-options.module';
import { HouseMaterialOptionsModule } from './house-material-options/house-material-options.module';
import { LocationOptionsModule } from './location-options/location-options.module';
import { HeatingTypeOptionsModule } from './heating-type-options/heating-type-options.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
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
    ViewOptionsModule,
    CurrenciesModule,
    StatusOptionsModule,
    ApartmentTypesModule,
    ApartmentsModule,
    OwnersModule,
    AttributesModule,
    RequestsModule,
    ObjectTypesModule,
    LcdOptionsModule,
    TypeOfBuildingOptionsModule,
    PropertyTypeOptionsModule,
    ConstructionStageOptionsModule,
    SalesOfficeOptionsModule,
    HouseMaterialOptionsModule,
    LocationOptionsModule,
    HeatingTypeOptionsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
