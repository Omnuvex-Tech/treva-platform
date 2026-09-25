import { Module } from '@nestjs/common';
import { BitrixModule } from '../bitrix/bitrix.module';
import { ClientsController } from './clients.controller';
import { ClientsService } from './clients.service';

@Module({
  imports: [BitrixModule],
  controllers: [ClientsController],
  providers: [ClientsService],
})
export class ClientsModule {}
