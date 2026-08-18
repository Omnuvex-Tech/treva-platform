import { Module } from '@nestjs/common';
import { UnitTypeOptionsController } from './unit-type-options.controller';
import { UnitTypeOptionsService } from './unit-type-options.service';

@Module({
  controllers: [UnitTypeOptionsController],
  providers: [UnitTypeOptionsService],
})
export class UnitTypeOptionsModule {}
