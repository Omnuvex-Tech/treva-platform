import { Module } from '@nestjs/common';
import { FloorPlanController } from './floor-plan.controller';
import { FloorPlanService } from './floor-plan.service';
import { ImageMirrorService } from './image-mirror.service';
import { InventorySyncService } from './inventory-sync.service';
import { TrevaApiClient } from './treva-api.client';

/**
 * The broker's copy of treva-api's off-plan inventory: the sync that writes it
 * (triggered from Projects) and the Floor Plan endpoints that read it.
 */
@Module({
  controllers: [FloorPlanController],
  providers: [
    TrevaApiClient,
    ImageMirrorService,
    InventorySyncService,
    FloorPlanService,
  ],
  exports: [InventorySyncService],
})
export class InventoryModule {}
