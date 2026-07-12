import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { HouseMaterialOptionsService } from './house-material-options.service';
import { CreateHouseMaterialOptionDto } from './dto/create-house-material-option.dto';
import { UpdateHouseMaterialOptionDto } from './dto/update-house-material-option.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('house-material-options')
@Controller('house-material-options')
export class HouseMaterialOptionsController {
  constructor(private readonly service: HouseMaterialOptionsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new house material option' })
  create(@Body() createDto: CreateHouseMaterialOptionDto) {
    return this.service.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all house material options' })
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a house material option by ID' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a house material option' })
  update(@Param('id') id: string, @Body() updateDto: UpdateHouseMaterialOptionDto) {
    return this.service.update(id, updateDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a house material option' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
