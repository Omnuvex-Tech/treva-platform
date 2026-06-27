import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { PulseService } from './pulse.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { CreateAuthorDto } from './dto/create-author.dto';
import { UpdateAuthorDto } from './dto/update-author.dto';
import { CreateKeywordDto } from './dto/create-keyword.dto';
import { UpdateKeywordDto } from './dto/update-keyword.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('pulse')
@Controller('pulse')
export class PulseController {
  constructor(private readonly pulseService: PulseService) {}

  // ─── Articles ──────────────────────────────────────────────

  @Post('articles')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new article' })
  @ApiResponse({ status: 201, description: 'Article created successfully' })
  async createArticle(@Body() dto: CreateArticleDto) {
    return this.pulseService.createArticle(dto);
  }

  @Get('articles')
  @ApiOperation({ summary: 'Get all published articles' })
  @ApiResponse({ status: 200, description: 'Articles retrieved successfully' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'category', required: false })
  async findAllArticles(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('category') category?: string,
  ) {
    return this.pulseService.findAllArticles({
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      category,
    });
  }

  @Get('articles/all')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all articles (admin - including drafts)' })
  @ApiResponse({ status: 200, description: 'Articles retrieved successfully' })
  async findAllArticlesAdmin() {
    return this.pulseService.findAllArticlesAdmin();
  }

  @Get('articles/featured')
  @ApiOperation({ summary: 'Get featured articles' })
  @ApiResponse({ status: 200, description: 'Featured articles retrieved' })
  async findFeaturedArticles() {
    return this.pulseService.findFeaturedArticles();
  }

  @Get('articles/header')
  @ApiOperation({ summary: 'Get articles by header position (left/center/right)' })
  @ApiResponse({ status: 200, description: 'Header articles retrieved' })
  @ApiQuery({ name: 'position', required: true, enum: ['left', 'center', 'right', 'week'] })
  async findHeaderArticles(
    @Query('position') position: 'left' | 'center' | 'right',
  ) {
    return this.pulseService.findHeaderArticles(position);
  }

  @Get('articles/slug/:slug')
  @ApiOperation({ summary: 'Get article by slug' })
  @ApiResponse({ status: 200, description: 'Article retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Article not found' })
  async findArticleBySlug(@Param('slug') slug: string) {
    return this.pulseService.findArticleBySlug(slug);
  }

  @Get('articles/:id')
  @ApiOperation({ summary: 'Get article by ID' })
  @ApiResponse({ status: 200, description: 'Article retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Article not found' })
  async findArticleById(@Param('id') id: string) {
    return this.pulseService.findArticleById(id);
  }

  @Patch('articles/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update an article' })
  @ApiResponse({ status: 200, description: 'Article updated successfully' })
  @ApiResponse({ status: 404, description: 'Article not found' })
  async updateArticle(
    @Param('id') id: string,
    @Body() dto: UpdateArticleDto,
  ) {
    return this.pulseService.updateArticle(id, dto);
  }

  @Delete('articles/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete an article' })
  @ApiResponse({ status: 200, description: 'Article deleted successfully' })
  @ApiResponse({ status: 404, description: 'Article not found' })
  async removeArticle(@Param('id') id: string) {
    return this.pulseService.removeArticle(id);
  }

  // ─── Authors ───────────────────────────────────────────────

  @Post('authors')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new author' })
  @ApiResponse({ status: 201, description: 'Author created successfully' })
  async createAuthor(@Body() dto: CreateAuthorDto) {
    return this.pulseService.createAuthor(dto);
  }

  @Get('authors')
  @ApiOperation({ summary: 'Get all authors' })
  @ApiResponse({ status: 200, description: 'Authors retrieved successfully' })
  async findAllAuthors() {
    return this.pulseService.findAllAuthors();
  }

  @Get('authors/slug/:slug')
  @ApiOperation({ summary: 'Get author by slug with articles' })
  @ApiResponse({ status: 200, description: 'Author retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Author not found' })
  async findAuthorBySlug(@Param('slug') slug: string) {
    return this.pulseService.findAuthorBySlug(slug);
  }

  @Get('authors/:id')
  @ApiOperation({ summary: 'Get author by ID' })
  @ApiResponse({ status: 200, description: 'Author retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Author not found' })
  async findAuthorById(@Param('id') id: string) {
    return this.pulseService.findAuthorById(id);
  }

  @Patch('authors/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update an author' })
  @ApiResponse({ status: 200, description: 'Author updated successfully' })
  @ApiResponse({ status: 404, description: 'Author not found' })
  async updateAuthor(
    @Param('id') id: string,
    @Body() dto: UpdateAuthorDto,
  ) {
    return this.pulseService.updateAuthor(id, dto);
  }

  @Delete('authors/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete an author' })
  @ApiResponse({ status: 200, description: 'Author deleted successfully' })
  @ApiResponse({ status: 404, description: 'Author not found' })
  async removeAuthor(@Param('id') id: string) {
    return this.pulseService.removeAuthor(id);
  }

  // ─── Keywords ──────────────────────────────────────────────

  @Post('keywords')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new keyword' })
  @ApiResponse({ status: 201, description: 'Keyword created successfully' })
  async createKeyword(@Body() dto: CreateKeywordDto) {
    return this.pulseService.createKeyword(dto);
  }

  @Get('keywords')
  @ApiOperation({ summary: 'Get all keywords' })
  @ApiResponse({ status: 200, description: 'Keywords retrieved successfully' })
  async findAllKeywords() {
    return this.pulseService.findAllKeywords();
  }

  @Patch('keywords/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a keyword' })
  @ApiResponse({ status: 200, description: 'Keyword updated successfully' })
  @ApiResponse({ status: 404, description: 'Keyword not found' })
  async updateKeyword(
    @Param('id') id: string,
    @Body() dto: UpdateKeywordDto,
  ) {
    return this.pulseService.updateKeyword(id, dto);
  }

  @Delete('keywords/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a keyword' })
  @ApiResponse({ status: 200, description: 'Keyword deleted successfully' })
  @ApiResponse({ status: 404, description: 'Keyword not found' })
  async removeKeyword(@Param('id') id: string) {
    return this.pulseService.removeKeyword(id);
  }
}
