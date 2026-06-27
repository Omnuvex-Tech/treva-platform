import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { PulseCategoryService } from './pulse-category.service';
import { CreatePulseCategoryDto } from './dto/create-pulse-category.dto';
import { UpdatePulseCategoryDto } from './dto/update-pulse-category.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('pulse-categories')
@Controller('pulse/categories')
export class PulseCategoryController {
  constructor(private readonly pulseCategoryService: PulseCategoryService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a pulse category' })
  @ApiResponse({ status: 201, description: 'Category created' })
  async create(@Body() dto: CreatePulseCategoryDto) {
    return this.pulseCategoryService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all pulse categories' })
  @ApiResponse({ status: 200, description: 'Categories retrieved' })
  async findAll() {
    return this.pulseCategoryService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a pulse category by ID' })
  @ApiResponse({ status: 200, description: 'Category retrieved' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async findOne(@Param('id') id: string) {
    return this.pulseCategoryService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a pulse category' })
  @ApiResponse({ status: 200, description: 'Category updated' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async update(@Param('id') id: string, @Body() dto: UpdatePulseCategoryDto) {
    return this.pulseCategoryService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a pulse category' })
  @ApiResponse({ status: 200, description: 'Category deleted' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async remove(@Param('id') id: string) {
    return this.pulseCategoryService.remove(id);
  }
}
