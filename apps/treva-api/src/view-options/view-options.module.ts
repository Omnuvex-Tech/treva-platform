import { Module } from '@nestjs/common';
import { ViewOptionsService } from './view-options.service';
import { ViewOptionsController } from './view-options.controller';

@Module({
  controllers: [ViewOptionsController],
  providers: [ViewOptionsService],
})
export class ViewOptionsModule {}
