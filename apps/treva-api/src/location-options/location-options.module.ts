import { Module } from '@nestjs/common';
import { LocationOptionsController } from './location-options.controller';
import { LocationOptionsService } from './location-options.service';

@Module({
  controllers: [LocationOptionsController],
  providers: [LocationOptionsService],
})
export class LocationOptionsModule {}
