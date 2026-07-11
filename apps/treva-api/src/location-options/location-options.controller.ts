import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateLocationOptionDto } from './dto/create-location-option.dto';
import { UpdateLocationOptionDto } from './dto/update-location-option.dto';
import { LocationOptionsService } from './location-options.service';

@ApiTags('location-options')
@Controller('location-options')
export class LocationOptionsController {
  constructor(private readonly locationOptionsService: LocationOptionsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new location option' })
  create(@Body() createDto: CreateLocationOptionDto) {
    return this.locationOptionsService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all location options' })
  findAll(@Query('type') type?: string) {
    return this.locationOptionsService.findAll(type);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a location option by ID' })
  findOne(@Param('id') id: string) {
    return this.locationOptionsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a location option' })
  update(@Param('id') id: string, @Body() updateDto: UpdateLocationOptionDto) {
    return this.locationOptionsService.update(id, updateDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a location option' })
  remove(@Param('id') id: string) {
    return this.locationOptionsService.remove(id);
  }
}
