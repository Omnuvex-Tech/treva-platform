import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { HeatingTypeOptionsService } from './heating-type-options.service';
import { CreateHeatingTypeOptionDto } from './dto/create-heating-type-option.dto';
import { UpdateHeatingTypeOptionDto } from './dto/update-heating-type-option.dto';

@ApiTags('heating-type-options')
@Controller('heating-type-options')
export class HeatingTypeOptionsController {
  constructor(private readonly heatingTypeOptionsService: HeatingTypeOptionsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create heating type option' })
  create(@Body() createDto: CreateHeatingTypeOptionDto) {
    return this.heatingTypeOptionsService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all heating type options' })
  findAll() {
    return this.heatingTypeOptionsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get heating type option by ID' })
  findOne(@Param('id') id: string) {
    return this.heatingTypeOptionsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update heating type option' })
  update(@Param('id') id: string, @Body() updateDto: UpdateHeatingTypeOptionDto) {
    return this.heatingTypeOptionsService.update(id, updateDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete heating type option' })
  remove(@Param('id') id: string) {
    return this.heatingTypeOptionsService.remove(id);
  }
}
