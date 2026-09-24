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
import { CreateNewsDto, NewsListQueryDto, UpdateNewsDto } from './dto/news.dto';
import { NewsService } from './news.service';

type AuthedRequest = { user: AuthUser };

/**
 * Every role reads; only admins write — treva-broker's `news:create`,
 * `news:update` and `news:delete` are admin-only.
 */
@ApiTags('news')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Get()
  @ApiOperation({ summary: 'The feed, pinned first, one page at a time' })
  list(@Request() req: AuthedRequest, @Query() query: NewsListQueryDto) {
    return this.newsService.list(req.user, query);
  }

  // Declared before `:id` so "pinned" and "stats" are never read as an id.
  @Get('pinned')
  @ApiOperation({ summary: 'Pinned posts for the side rail' })
  pinned(@Request() req: AuthedRequest) {
    return this.newsService.pinned(req.user);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Posts this week, unread, new today' })
  stats(@Request() req: AuthedRequest) {
    return this.newsService.stats(req.user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'One post' })
  @ApiResponse({ status: 404, description: 'No such post, or not visible' })
  detail(@Request() req: AuthedRequest, @Param('id') id: string) {
    return this.newsService.detail(req.user, id);
  }

  @Post(':id/read')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Mark the post read for the caller' })
  @ApiResponse({ status: 404, description: 'No such post, or not visible' })
  async markRead(
    @Request() req: AuthedRequest,
    @Param('id') id: string,
  ): Promise<void> {
    await this.newsService.markRead(req.user, id);
  }

  @Post()
  @Roles('admin')
  @ApiOperation({ summary: 'Create a draft or publish a post' })
  create(@Request() req: AuthedRequest, @Body() dto: CreateNewsDto) {
    return this.newsService.create(req.user, dto);
  }

  @Patch(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Update a post (autosave, publish, edit)' })
  update(@Param('id') id: string, @Body() dto: UpdateNewsDto) {
    return this.newsService.update(id, dto);
  }

  @Delete(':id')
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a post' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.newsService.remove(id);
  }
}
