import { Module } from '@nestjs/common';
import { ApartmentTypesService } from './apartment-types.service';
import { ApartmentTypesController } from './apartment-types.controller';

@Module({
  controllers: [ApartmentTypesController],
  providers: [ApartmentTypesService],
  exports: [ApartmentTypesService],
})
export class ApartmentTypesModule {}
