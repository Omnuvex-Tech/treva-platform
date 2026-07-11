import { Module } from '@nestjs/common';
import { TypeOfBuildingOptionsService } from './type-of-building-options.service';
import { TypeOfBuildingOptionsController } from './type-of-building-options.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TypeOfBuildingOptionsController],
  providers: [TypeOfBuildingOptionsService],
  exports: [TypeOfBuildingOptionsService],
})
export class TypeOfBuildingOptionsModule {}
