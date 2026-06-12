import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ViewOptionsService } from './view-options.service';
import { CreateViewOptionDto } from './dto/create-view-option.dto';
import { UpdateViewOptionDto } from './dto/update-view-option.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('view-options')
@Controller('view-options')
export class ViewOptionsController {
  constructor(private readonly viewOptionsService: ViewOptionsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new view option' })
  create(@Body() createDto: CreateViewOptionDto) {
    return this.viewOptionsService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all view options' })
  findAll() {
    return this.viewOptionsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a view option by ID' })
  findOne(@Param('id') id: string) {
    return this.viewOptionsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a view option' })
  update(@Param('id') id: string, @Body() updateDto: UpdateViewOptionDto) {
    return this.viewOptionsService.update(id, updateDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a view option' })
  remove(@Param('id') id: string) {
    return this.viewOptionsService.remove(id);
  }
}
