import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { PropertyTypeOptionsService } from './property-type-options.service';
import { CreatePropertyTypeOptionDto } from './dto/create-property-type-option.dto';
import { UpdatePropertyTypeOptionDto } from './dto/update-property-type-option.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('property-type-options')
@Controller('property-type-options')
export class PropertyTypeOptionsController {
  constructor(private readonly service: PropertyTypeOptionsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new property type option' })
  create(@Body() createDto: CreatePropertyTypeOptionDto) {
    return this.service.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all property type options' })
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a property type option by ID' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a property type option' })
  update(@Param('id') id: string, @Body() updateDto: UpdatePropertyTypeOptionDto) {
    return this.service.update(id, updateDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a property type option' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
