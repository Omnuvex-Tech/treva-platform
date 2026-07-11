import { Module } from '@nestjs/common';
import { LcdOptionsService } from './lcd-options.service';
import { LcdOptionsController } from './lcd-options.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [LcdOptionsController],
  providers: [LcdOptionsService],
  exports: [LcdOptionsService],
})
export class LcdOptionsModule {}
