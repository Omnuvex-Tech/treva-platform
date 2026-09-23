import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { AuthUser } from '../auth/jwt.strategy';
import { Roles, RolesGuard } from '../auth/roles.guard';
import { ClientsService } from './clients.service';
import {
  BulkDeleteClientsDto,
  ClientListQueryDto,
  CreateClientDto,
  UpdateClientDto,
} from './dto/clients.dto';

type AuthedRequest = { user: AuthUser };

/**
 * Every role reads, registers and edits leads within its own scope (see
 * ClientsService); deleting is `clients:delete` — top brokers and admins.
 */
@ApiTags('clients')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Get()
  @ApiOperation({ summary: 'Clients the caller may see, newest first' })
  list(@Request() req: AuthedRequest, @Query() query: ClientListQueryDto) {
    return this.clientsService.list(req.user, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'One client' })
  @ApiResponse({ status: 404, description: 'No such client, or not visible' })
  detail(@Request() req: AuthedRequest, @Param('id') id: string) {
    return this.clientsService.detail(req.user, id);
  }

  @Post()
  @ApiOperation({ summary: 'Register a lead (always submitted for approval)' })
  create(@Request() req: AuthedRequest, @Body() dto: CreateClientDto) {
    return this.clientsService.create(req.user, dto);
  }

  // A path of its own rather than a DELETE with a body, which proxies drop.
  @Post('bulk-delete')
  @Roles('top_broker', 'admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete several clients at once' })
  async removeMany(
    @Request() req: AuthedRequest,
    @Body() dto: BulkDeleteClientsDto,
  ): Promise<void> {
    await this.clientsService.removeMany(req.user, dto.ids);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Edit a lead' })
  update(
    @Request() req: AuthedRequest,
    @Param('id') id: string,
    @Body() dto: UpdateClientDto,
  ) {
    return this.clientsService.update(req.user, id, dto);
  }

  @Delete(':id')
  @Roles('top_broker', 'admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a client' })
  async remove(
    @Request() req: AuthedRequest,
    @Param('id') id: string,
  ): Promise<void> {
    await this.clientsService.remove(req.user, id);
  }
}
