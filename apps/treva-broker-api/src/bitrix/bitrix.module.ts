import { Module } from '@nestjs/common';
import { BitrixClient } from './bitrix.client';
import { BitrixSyncService } from './bitrix-sync.service';

/** Bitrix24 CRM — clients registered in the panel become Bitrix leads. */
@Module({
  providers: [BitrixClient, BitrixSyncService],
  exports: [BitrixSyncService],
})
export class BitrixModule {}
