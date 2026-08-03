import { Controller, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ProfitbaseSyncService } from './profitbase-sync.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('profitbase')
@Controller('profitbase')
export class ProfitbaseController {
  constructor(private readonly syncService: ProfitbaseSyncService) {}

  @Post('sync')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Sync objects, houses and unit layouts from Profitbase' })
  @ApiResponse({ status: 201, description: 'Sync completed successfully' })
  async sync() {
    return this.syncService.sync();
  }
}
