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
import {
  AgencyListQueryDto,
  CreateAgencyDto,
  CreateUserDto,
  SaveAgencyDto,
  SaveUserDto,
  UserListQueryDto,
} from './dto/users.dto';
import { UsersService } from './users.service';

type AuthedRequest = { user: AuthUser };

/**
 * The Admin Panel's Users screen — `users:*`, which only an admin holds. Two
 * routes are open to every signed-in account for its own record, because
 * Profile (873:48750) reads the account and changes its password.
 */
@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles('admin')
  @ApiOperation({ summary: 'Everyone with an account, newest first' })
  list(@Query() query: UserListQueryDto) {
    return this.usersService.list(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'One account (admins, or the account itself)' })
  @ApiResponse({ status: 404, description: 'No such user' })
  detail(@Request() req: AuthedRequest, @Param('id') id: string) {
    return this.usersService.detail(req.user, id);
  }

  @Get(':id/agency')
  @Roles('admin')
  @ApiOperation({ summary: 'The agency the account belongs to, if any' })
  agency(@Param('id') id: string) {
    return this.usersService.agencyLink(id);
  }

  @Post()
  @Roles('admin')
  @ApiOperation({
    summary: 'Add an agent; answers with a one-time temporary password',
  })
  @ApiResponse({ status: 409, description: 'The email is taken' })
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Edit an account (admins), or set your own password (Profile)',
  })
  update(
    @Request() req: AuthedRequest,
    @Param('id') id: string,
    @Body() dto: SaveUserDto,
  ) {
    return this.usersService.update(req.user, id, dto);
  }

  @Delete(':id')
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an account that owns no records' })
  @ApiResponse({ status: 409, description: 'The account has records' })
  async remove(@Request() req: AuthedRequest, @Param('id') id: string) {
    await this.usersService.remove(req.user, id);
  }
}

/** The Real Estate Agencies tab (873:48597): companies created at sign-up. */
@ApiTags('agencies')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('agencies')
export class AgenciesController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Registered real estate agencies' })
  list(@Query() query: AgencyListQueryDto) {
    return this.usersService.agencies(query);
  }

  @Get('managers')
  @ApiOperation({
    summary: 'Accounts that can be put in charge — those in no agency yet',
  })
  managers() {
    return this.usersService.managerOptions();
  }

  @Get(':id')
  @ApiOperation({ summary: 'One agency' })
  @ApiResponse({ status: 404, description: 'No such agency' })
  detail(@Param('id') id: string) {
    return this.usersService.agency(id);
  }

  @Post()
  @ApiOperation({
    summary:
      "Add an agency and the account that manages it; answers with the manager's one-time password",
  })
  @ApiResponse({ status: 409, description: 'The name or the email is taken' })
  create(@Body() dto: CreateAgencyDto) {
    return this.usersService.createAgency(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Edit an agency and its manager' })
  update(@Param('id') id: string, @Body() dto: SaveAgencyDto) {
    return this.usersService.updateAgency(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an agency; its members stay as accounts' })
  async remove(@Param('id') id: string) {
    await this.usersService.removeAgency(id);
  }
}
