import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ApartmentsService } from './apartments.service';
import { CreateApartmentDto } from './dto/create-apartment.dto';
import { UpdateApartmentDto } from './dto/update-apartment.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('apartments')
@Controller('apartments')
export class ApartmentsController {
  constructor(private readonly service: ApartmentsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create apartment' })
  async create(@Body() dto: CreateApartmentDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all apartments' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'apartmentTypeId', required: false })
  @ApiQuery({ name: 'ownerId', required: false })
  @ApiQuery({ name: 'minPrice', required: false })
  @ApiQuery({ name: 'maxPrice', required: false })
  @ApiQuery({ name: 'roomCount', required: false })
  @ApiQuery({ name: 'minArea', required: false })
  @ApiQuery({ name: 'maxArea', required: false })
  @ApiQuery({ name: 'minGrossArea', required: false })
  @ApiQuery({ name: 'maxGrossArea', required: false })
  @ApiQuery({ name: 'floor', required: false })
  @ApiQuery({ name: 'currency', required: false })
  @ApiQuery({ name: 'viewOptionIds', required: false })
  @ApiQuery({ name: 'status', required: false })
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('apartmentTypeId') apartmentTypeId?: string,
    @Query('ownerId') ownerId?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('roomCount') roomCount?: string,
    @Query('minArea') minArea?: string,
    @Query('maxArea') maxArea?: string,
    @Query('minGrossArea') minGrossArea?: string,
    @Query('maxGrossArea') maxGrossArea?: string,
    @Query('floor') floor?: string,
    @Query('currency') currency?: string,
    @Query('viewOptionIds') viewOptionIds?: string,
    @Query('status') status?: string,
  ) {
    return this.service.findAll({
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 12,
      apartmentTypeId,
      ownerId,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      roomCount: roomCount ? parseInt(roomCount) : undefined,
      minArea: minArea ? parseFloat(minArea) : undefined,
      maxArea: maxArea ? parseFloat(maxArea) : undefined,
      minGrossArea: minGrossArea ? parseFloat(minGrossArea) : undefined,
      maxGrossArea: maxGrossArea ? parseFloat(maxGrossArea) : undefined,
      floor: floor ? parseInt(floor) : undefined,
      currency,
      viewOptionIds,
      status,
    });
  }

  @Get('range')
  @ApiOperation({ summary: 'Get price and area range from apartments' })
  async getRange(@Query('currency') currency?: string) {
    return this.service.getRange(currency);
  }

  @Get('floors')
  @ApiOperation({ summary: 'Get available floor numbers' })
  async getFloors() {
    return this.service.getFloors();
  }

  @Get('rooms')
  @ApiOperation({ summary: 'Get available room counts' })
  async getRoomCounts() {
    return this.service.getRoomCounts();
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get apartment by slug' })
  async findBySlug(@Param('slug') slug: string) {
    return this.service.findBySlug(slug);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get apartment by ID' })
  async findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update apartment' })
  async update(@Param('id') id: string, @Body() dto: UpdateApartmentDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete apartment' })
  async remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
