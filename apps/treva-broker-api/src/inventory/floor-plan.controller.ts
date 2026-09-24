import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { LayoutListQueryDto } from './dto/floor-plan.dto';
import { FloorPlanService } from './floor-plan.service';

/** Every role reads the floor plan (`floorplan:read` is the baseline). */
@ApiTags('floor-plan')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('floor-plan/buildings')
export class FloorPlanController {
  constructor(private readonly floorPlanService: FloorPlanService) {}

  @Get()
  @ApiOperation({ summary: 'Synchronised buildings, grouped by project' })
  buildings() {
    return this.floorPlanService.buildings();
  }

  @Get(':id/floors')
  @ApiOperation({ summary: 'One building: floors, units and counts' })
  @ApiResponse({ status: 404, description: 'No such building' })
  building(@Param('id') id: string) {
    return this.floorPlanService.building(id);
  }

  @Get(':id/layouts')
  @ApiOperation({ summary: 'Layouts of one building, sorted and paginated' })
  @ApiResponse({ status: 404, description: 'No such building' })
  layouts(@Param('id') id: string, @Query() query: LayoutListQueryDto) {
    return this.floorPlanService.layouts(id, query);
  }
}
