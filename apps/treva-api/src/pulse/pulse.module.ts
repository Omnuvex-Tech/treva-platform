import { Module } from '@nestjs/common';
import { PulseService } from './pulse.service';
import { PulseController } from './pulse.controller';
import { PulseCategoryService } from './pulse-category.service';
import { PulseCategoryController } from './pulse-category.controller';

@Module({
  controllers: [PulseController, PulseCategoryController],
  providers: [PulseService, PulseCategoryService],
  exports: [PulseService, PulseCategoryService],
})
export class PulseModule {}
