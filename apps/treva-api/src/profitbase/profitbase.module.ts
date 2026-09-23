import { Module } from '@nestjs/common';
import { ProfitbaseController } from './profitbase.controller';
import { ProfitbaseClientService } from './profitbase-client.service';
import { ProfitbaseImageService } from './profitbase-image.service';
import { ProfitbaseSyncService } from './profitbase-sync.service';

@Module({
  controllers: [ProfitbaseController],
  providers: [
    ProfitbaseClientService,
    ProfitbaseImageService,
    ProfitbaseSyncService,
  ],
})
export class ProfitbaseModule {}
