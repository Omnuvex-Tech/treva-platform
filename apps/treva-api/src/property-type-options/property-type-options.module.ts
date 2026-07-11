import { Module } from '@nestjs/common';
import { PropertyTypeOptionsService } from './property-type-options.service';
import { PropertyTypeOptionsController } from './property-type-options.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PropertyTypeOptionsController],
  providers: [PropertyTypeOptionsService],
  exports: [PropertyTypeOptionsService],
})
export class PropertyTypeOptionsModule {}
