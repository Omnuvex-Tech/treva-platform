import { Module } from '@nestjs/common';
import { ConstructionStageOptionsService } from './construction-stage-options.service';
import { ConstructionStageOptionsController } from './construction-stage-options.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ConstructionStageOptionsController],
  providers: [ConstructionStageOptionsService],
  exports: [ConstructionStageOptionsService],
})
export class ConstructionStageOptionsModule {}
