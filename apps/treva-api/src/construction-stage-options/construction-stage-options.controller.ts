import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ConstructionStageOptionsService } from './construction-stage-options.service';
import { CreateConstructionStageOptionDto } from './dto/create-construction-stage-option.dto';
import { UpdateConstructionStageOptionDto } from './dto/update-construction-stage-option.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('construction-stage-options')
@Controller('construction-stage-options')
export class ConstructionStageOptionsController {
  constructor(private readonly service: ConstructionStageOptionsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new construction stage option' })
  create(@Body() createDto: CreateConstructionStageOptionDto) {
    return this.service.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all construction stage options' })
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a construction stage option by ID' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a construction stage option' })
  update(@Param('id') id: string, @Body() updateDto: UpdateConstructionStageOptionDto) {
    return this.service.update(id, updateDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a construction stage option' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
