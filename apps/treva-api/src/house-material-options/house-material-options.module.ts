import { Module } from '@nestjs/common';
import { HouseMaterialOptionsService } from './house-material-options.service';
import { HouseMaterialOptionsController } from './house-material-options.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [HouseMaterialOptionsController],
  providers: [HouseMaterialOptionsService],
  exports: [HouseMaterialOptionsService],
})
export class HouseMaterialOptionsModule {}
