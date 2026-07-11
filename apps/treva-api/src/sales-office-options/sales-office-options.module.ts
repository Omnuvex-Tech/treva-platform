import { Module } from '@nestjs/common';
import { SalesOfficeOptionsService } from './sales-office-options.service';
import { SalesOfficeOptionsController } from './sales-office-options.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SalesOfficeOptionsController],
  providers: [SalesOfficeOptionsService],
  exports: [SalesOfficeOptionsService],
})
export class SalesOfficeOptionsModule {}
