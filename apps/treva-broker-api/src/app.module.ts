import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { CompaniesModule } from './companies/companies.module';
import { ClientsModule } from './clients/clients.module';
import { NewsModule } from './news/news.module';
import { BrokerRoleModule } from './broker-role/broker-role.module';
import { ProjectsModule } from './projects/projects.module';
import { UploadsModule } from './uploads/uploads.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    // .env.local (git-ignored) holds machine-local secrets such as the Bitrix24
    // webhook; everything else comes from the committed .env.<mode> files.
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ['.env.local'] }),
    PrismaModule,
    CompaniesModule,
    AuthModule,
    NewsModule,
    ClientsModule,
    BrokerRoleModule,
    ProjectsModule,
    UploadsModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
