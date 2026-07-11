import { Module } from '@nestjs/common';
import { HeatingTypeOptionsController } from './heating-type-options.controller';
import { HeatingTypeOptionsService } from './heating-type-options.service';

@Module({
  controllers: [HeatingTypeOptionsController],
  providers: [HeatingTypeOptionsService],
})
export class HeatingTypeOptionsModule {}
