import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { UnitLayoutsService } from './unit-layouts.service';
import { CreateUnitLayoutDto } from './dto/create-unit-layout.dto';
import { UpdateUnitLayoutDto } from './dto/update-unit-layout.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('unit-layouts')
@Controller('unit-layouts')
export class UnitLayoutsController {
  constructor(private readonly unitLayoutsService: UnitLayoutsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new unit layout' })
  @ApiResponse({ status: 201, description: 'Unit layout created successfully' })
  async create(@Body() createDto: CreateUnitLayoutDto) {
    return this.unitLayoutsService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all unit layouts with filters and pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'categoryId', required: false })
  @ApiQuery({ name: 'categorySlug', required: false })
  @ApiQuery({ name: 'statusOptionId', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'minPrice', required: false, type: Number })
  @ApiQuery({ name: 'maxPrice', required: false, type: Number })
  @ApiQuery({ name: 'currency', required: false })
  @ApiQuery({ name: 'minArea', required: false, type: Number })
  @ApiQuery({ name: 'maxArea', required: false, type: Number })
  @ApiQuery({ name: 'floor', required: false, type: Number })
  @ApiQuery({ name: 'viewOptionId', required: false })
  @ApiQuery({ name: 'roomOptionId', required: false })
  @ApiQuery({ name: 'archived', required: false, type: Boolean })
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('categoryId') categoryId?: string,
    @Query('categorySlug') categorySlug?: string,
    @Query('statusOptionId') statusOptionId?: string,
    @Query('search') search?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('currency') currency?: string,
    @Query('minArea') minArea?: string,
    @Query('maxArea') maxArea?: string,
    @Query('floor') floor?: string,
    @Query('viewOptionId') viewOptionId?: string,
    @Query('roomOptionId') roomOptionId?: string,
    @Query('archived') archived?: string,
  ) {
    return this.unitLayoutsService.findAll({
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      categoryId,
      categorySlug,
      statusOptionId,
      search,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      currency,
      minArea: minArea ? parseFloat(minArea) : undefined,
      maxArea: maxArea ? parseFloat(maxArea) : undefined,
      floor: floor ? parseInt(floor, 10) : undefined,
      viewOptionId,
      roomOptionId,
      archived: archived === 'true' ? true : archived === 'false' ? false : undefined,
    });
  }

  @Get('floors')
  @ApiOperation({ summary: 'Get distinct floor values' })
  async getFloors() {
    return this.unitLayoutsService.findFloors();
  }

  @Get('range')
  @ApiOperation({ summary: 'Get price and area range from unit layouts' })
  @ApiQuery({ name: 'currency', required: false })
  async getRange(@Query('currency') currency?: string) {
    return this.unitLayoutsService.findRange(currency || 'USD');
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get unit layout statistics' })
  async getStats() {
    const counts = await this.unitLayoutsService.countByStatus();
    return counts;
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get unit layout by slug' })
  @ApiResponse({
    status: 200,
    description: 'Unit layout retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Unit layout not found' })
  async findBySlug(@Param('slug') slug: string) {
    return this.unitLayoutsService.findBySlug(slug);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get unit layout by ID' })
  @ApiResponse({
    status: 200,
    description: 'Unit layout retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Unit layout not found' })
  async findOne(@Param('id') id: string) {
    return this.unitLayoutsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a unit layout' })
  @ApiResponse({ status: 200, description: 'Unit layout updated successfully' })
  @ApiResponse({ status: 404, description: 'Unit layout not found' })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateUnitLayoutDto,
  ) {
    return this.unitLayoutsService.update(id, updateDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a unit layout' })
  @ApiResponse({ status: 200, description: 'Unit layout deleted successfully' })
  @ApiResponse({ status: 404, description: 'Unit layout not found' })
  async remove(@Param('id') id: string) {
    return this.unitLayoutsService.remove(id);
  }
}
