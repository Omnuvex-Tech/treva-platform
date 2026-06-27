import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { CreateAuthorDto } from './dto/create-author.dto';
import { UpdateAuthorDto } from './dto/update-author.dto';
import { CreateKeywordDto } from './dto/create-keyword.dto';
import { UpdateKeywordDto } from './dto/update-keyword.dto';

@Injectable()
export class PulseService {
  constructor(private prisma: PrismaService) {}

  // ─── Articles ──────────────────────────────────────────────

  async createArticle(dto: CreateArticleDto) {
    const existing = await this.prisma.article.findUnique({
      where: { slug: dto.slug },
    });
    if (existing) {
      throw new ConflictException('Article with this slug already exists');
    }

    const data: any = {
      slug: dto.slug,
      title: dto.title,
      category: dto.category,
      blocks: dto.blocks ?? [],
      featured: dto.featured ?? false,
      published: dto.published ?? false,
    };

    if (dto.date) data.date = new Date(dto.date);
    if (dto.coverImage) data.coverImage = dto.coverImage;
    if (dto.excerpt) data.excerpt = dto.excerpt;
    if (dto.authorId) data.authorId = dto.authorId;
    if (dto.metaTitle) data.metaTitle = dto.metaTitle;
    if (dto.metaDescription) data.metaDescription = dto.metaDescription;
    if (dto.headerPosition) data.headerPosition = dto.headerPosition;
    if (dto.headerOrder !== undefined) data.headerOrder = dto.headerOrder;

    if (dto.keywordIds && dto.keywordIds.length > 0) {
      data.keywords = {
        connect: dto.keywordIds.map((id) => ({ id })),
      };
    }

    return this.prisma.article.create({
      data,
      include: { author: true, keywords: true },
    });
  }

  async findAllArticles(query: {
    page?: number;
    limit?: number;
    category?: string;
  }) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: any = { published: true };
    if (query.category) where.category = query.category;

    const [data, total] = await Promise.all([
      this.prisma.article.findMany({
        where,
        include: { author: true, keywords: true },
        orderBy: { date: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.article.count({ where }),
    ]);

    return {
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findAllArticlesAdmin() {
    return this.prisma.article.findMany({
      include: { author: true, keywords: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findFeaturedArticles() {
    return this.prisma.article.findMany({
      where: { published: true, featured: true },
      include: { author: true, keywords: true },
      orderBy: { date: 'desc' },
      take: 6,
    });
  }

  async findHeaderArticles(position: 'left' | 'center' | 'right') {
    return this.prisma.article.findMany({
      where: { published: true, headerPosition: position },
      include: { author: true, keywords: true },
      orderBy: { headerOrder: 'asc' },
    });
  }

  async findArticleBySlug(slug: string) {
    const article = await this.prisma.article.findUnique({
      where: { slug },
      include: { author: true, keywords: true },
    });
    if (!article) {
      throw new NotFoundException('Article not found');
    }
    return article;
  }

  async findArticleById(id: string) {
    const article = await this.prisma.article.findUnique({
      where: { id },
      include: { author: true, keywords: true },
    });
    if (!article) {
      throw new NotFoundException('Article not found');
    }
    return article;
  }

  async updateArticle(id: string, dto: UpdateArticleDto) {
    const article = await this.prisma.article.findUnique({ where: { id } });
    if (!article) {
      throw new NotFoundException('Article not found');
    }

    if (dto.slug && dto.slug !== article.slug) {
      const existing = await this.prisma.article.findUnique({
        where: { slug: dto.slug },
      });
      if (existing) {
        throw new ConflictException('Article with this slug already exists');
      }
    }

    const data: any = { ...dto };
    if (dto.date) data.date = new Date(dto.date);

    if (dto.keywordIds) {
      data.keywords = {
        set: dto.keywordIds.map((kid) => ({ id: kid })),
      };
    }

    delete data.keywordIds;

    return this.prisma.article.update({
      where: { id },
      data,
      include: { author: true, keywords: true },
    });
  }

  async removeArticle(id: string) {
    const article = await this.prisma.article.findUnique({ where: { id } });
    if (!article) {
      throw new NotFoundException('Article not found');
    }
    return this.prisma.article.delete({ where: { id } });
  }

  // ─── Authors ───────────────────────────────────────────────

  async createAuthor(dto: CreateAuthorDto) {
    const existing = await this.prisma.author.findUnique({
      where: { slug: dto.slug },
    });
    if (existing) {
      throw new ConflictException('Author with this slug already exists');
    }
    return this.prisma.author.create({ data: dto });
  }

  async findAllAuthors() {
    return this.prisma.author.findMany({
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { articles: true } } },
    });
  }

  async findAuthorBySlug(slug: string) {
    const author = await this.prisma.author.findUnique({
      where: { slug },
      include: {
        articles: {
          where: { published: true },
          include: { author: true, keywords: true },
          orderBy: { date: 'desc' },
        },
      },
    });
    if (!author) {
      throw new NotFoundException('Author not found');
    }
    return author;
  }

  async findAuthorById(id: string) {
    const author = await this.prisma.author.findUnique({
      where: { id },
      include: { _count: { select: { articles: true } } },
    });
    if (!author) {
      throw new NotFoundException('Author not found');
    }
    return author;
  }

  async updateAuthor(id: string, dto: UpdateAuthorDto) {
    const author = await this.prisma.author.findUnique({ where: { id } });
    if (!author) {
      throw new NotFoundException('Author not found');
    }

    if (dto.slug && dto.slug !== author.slug) {
      const existing = await this.prisma.author.findUnique({
        where: { slug: dto.slug },
      });
      if (existing) {
        throw new ConflictException('Author with this slug already exists');
      }
    }

    return this.prisma.author.update({
      where: { id },
      data: dto,
    });
  }

  async removeAuthor(id: string) {
    const author = await this.prisma.author.findUnique({ where: { id } });
    if (!author) {
      throw new NotFoundException('Author not found');
    }
    return this.prisma.author.delete({ where: { id } });
  }

  // ─── Keywords ──────────────────────────────────────────────

  async createKeyword(dto: CreateKeywordDto) {
    const existing = await this.prisma.keyword.findUnique({
      where: { slug: dto.slug },
    });
    if (existing) {
      throw new ConflictException('Keyword with this slug already exists');
    }
    return this.prisma.keyword.create({ data: dto });
  }

  async findAllKeywords() {
    return this.prisma.keyword.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { articles: true } } },
    });
  }

  async updateKeyword(id: string, dto: UpdateKeywordDto) {
    const keyword = await this.prisma.keyword.findUnique({ where: { id } });
    if (!keyword) {
      throw new NotFoundException('Keyword not found');
    }

    if (dto.slug && dto.slug !== keyword.slug) {
      const existing = await this.prisma.keyword.findUnique({
        where: { slug: dto.slug },
      });
      if (existing) {
        throw new ConflictException('Keyword with this slug already exists');
      }
    }

    return this.prisma.keyword.update({ where: { id }, data: dto });
  }

  async removeKeyword(id: string) {
    const keyword = await this.prisma.keyword.findUnique({ where: { id } });
    if (!keyword) {
      throw new NotFoundException('Keyword not found');
    }
    return this.prisma.keyword.delete({ where: { id } });
  }
}
