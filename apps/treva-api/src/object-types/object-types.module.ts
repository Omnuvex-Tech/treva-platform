import { Module } from '@nestjs/common';
import { ObjectTypesService } from './object-types.service';
import { ObjectTypesController } from './object-types.controller';

@Module({
  controllers: [ObjectTypesController],
  providers: [ObjectTypesService],
  exports: [ObjectTypesService],
})
export class ObjectTypesModule {}
