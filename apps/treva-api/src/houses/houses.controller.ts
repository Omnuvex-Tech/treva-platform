import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { HousesService } from './houses.service';
import { CreateHouseDto } from './dto/create-house.dto';
import { UpdateHouseDto } from './dto/update-house.dto';

@ApiTags('houses')
@Controller('houses')
export class HousesController {
  constructor(private readonly housesService: HousesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new house' })
  @ApiResponse({ status: 201, description: 'House created successfully' })
  async create(@Body() createDto: CreateHouseDto) {
    return this.housesService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all houses with filters and pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'categoryId', required: false })
  @ApiQuery({ name: 'categorySlug', required: false })
  @ApiQuery({ name: 'status', required: false, enum: ['available', 'reserved', 'sold'] })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'archived', required: false, type: Boolean })
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('categoryId') categoryId?: string,
    @Query('categorySlug') categorySlug?: string,
    @Query('status') status?: 'available' | 'reserved' | 'sold',
    @Query('search') search?: string,
    @Query('archived') archived?: string,
  ) {
    return this.housesService.findAll({
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      categoryId,
      categorySlug,
      status,
      search,
      archived: archived === 'true' ? true : archived === 'false' ? false : undefined,
    });
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get house by slug' })
  @ApiResponse({ status: 200, description: 'House retrieved successfully' })
  @ApiResponse({ status: 404, description: 'House not found' })
  async findBySlug(@Param('slug') slug: string) {
    return this.housesService.findBySlug(slug);
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get house statistics' })
  async getStats() {
    return this.housesService.countByStatus();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get house by ID' })
  @ApiResponse({ status: 200, description: 'House retrieved successfully' })
  @ApiResponse({ status: 404, description: 'House not found' })
  async findOne(@Param('id') id: string) {
    return this.housesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a house' })
  @ApiResponse({ status: 200, description: 'House updated successfully' })
  @ApiResponse({ status: 404, description: 'House not found' })
  async update(@Param('id') id: string, @Body() updateDto: UpdateHouseDto) {
    return this.housesService.update(id, updateDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a house' })
  @ApiResponse({ status: 200, description: 'House deleted successfully' })
  @ApiResponse({ status: 404, description: 'House not found' })
  async remove(@Param('id') id: string) {
    return this.housesService.remove(id);
  }
}
