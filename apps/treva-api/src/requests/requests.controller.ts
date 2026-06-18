import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RequestsService } from './requests.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('requests')
@Controller('requests')
export class RequestsController {
  constructor(private readonly service: RequestsService) {}

  @Post()
  @ApiOperation({ summary: 'Create request' })
  async create(@Body() dto: CreateRequestDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all requests' })
  async findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get request by ID' })
  async findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update request' })
  async update(@Param('id') id: string, @Body() dto: UpdateRequestDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete request' })
  async remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
