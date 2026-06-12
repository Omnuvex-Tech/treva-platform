import { Module } from '@nestjs/common';
import { RoomOptionsService } from './room-options.service';
import { RoomOptionsController } from './room-options.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [RoomOptionsController],
  providers: [RoomOptionsService],
  exports: [RoomOptionsService],
})
export class RoomOptionsModule {}
