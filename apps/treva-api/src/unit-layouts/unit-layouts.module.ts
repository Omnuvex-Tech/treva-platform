import { Module } from '@nestjs/common';
import { UnitLayoutsService } from './unit-layouts.service';
import { UnitLayoutsController } from './unit-layouts.controller';

@Module({
  controllers: [UnitLayoutsController],
  providers: [UnitLayoutsService],
  exports: [UnitLayoutsService],
})
export class UnitLayoutsModule {}
