import { Module } from '@nestjs/common';
import { StatusOptionsService } from './status-options.service';
import { StatusOptionsController } from './status-options.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [StatusOptionsController],
  providers: [StatusOptionsService],
  exports: [StatusOptionsService],
})
export class StatusOptionsModule {}
