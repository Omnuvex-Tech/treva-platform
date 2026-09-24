import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Prisma } from '../generated/prisma/client';
import type { AuthUser } from '../auth/jwt.strategy';
import { PrismaService } from '../prisma/prisma.service';
import type {
  CreateNewsDto,
  NewsListQueryDto,
  UpdateNewsDto,
} from './dto/news.dto';

const DEFAULT_VISIBILITY = {
  featured: false,
  showOnDashboard: true,
  pushNotification: false,
  emailNotification: false,
};

const NEWS_NOT_FOUND = {
  message: 'News post not found',
  code: 'not_found',
} as const;

const withAuthor = {
  author: { select: { fullName: true } },
} satisfies Prisma.NewsPostInclude;

type NewsRow = Prisma.NewsPostGetPayload<{ include: typeof withAuthor }>;

/**
 * treva-broker's `NewsPost` (apps/treva-broker/src/features/news/types.ts):
 * dates as ISO strings, and "" rather than null wherever the client expects a
 * string. Change both together.
 */
function toNewsPost(row: NewsRow) {
  return {
    id: row.id,
    title: row.title,
    excerpt: row.excerpt,
    body: row.body,
    category: row.category,
    coverImageUrl: row.coverImageUrl,
    // A draft has not been published; its last edit is the date the card shows.
    publishedAt: (row.publishedAt ?? row.updatedAt).toISOString(),
    pinned: row.pinned,
    authorName: row.author.fullName,
    status: row.status,
    attachments: Array.isArray(row.attachments) ? row.attachments : [],
    visibility: {
      ...DEFAULT_VISIBILITY,
      ...(row.visibility as Record<string, boolean>),
    },
    language: row.language,
    publishAt: row.publishAt?.toISOString() ?? '',
    expiresAt: row.expiresAt?.toISOString() ?? '',
  };
}

export type NewsPostResponse = ReturnType<typeof toNewsPost>;

const isAuthor = (user: AuthUser) => user.role === 'admin';

@Injectable()
export class NewsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Published, already live, not yet expired. */
  private live(): Prisma.NewsPostWhereInput {
    const now = new Date();

    return {
      AND: [
        { status: { in: ['published', 'scheduled'] } },
        { OR: [{ publishAt: null }, { publishAt: { lte: now } }] },
        { OR: [{ expiresAt: null }, { expiresAt: { gt: now } }] },
      ],
    };
  }

  /**
   * Readers see live posts. Authors (admins) see every post, drafts included —
   * the feed is where they find a draft again to keep editing it.
   */
  private visibleTo(user: AuthUser): Prisma.NewsPostWhereInput {
    return isAuthor(user) ? {} : this.live();
  }

  async list(user: AuthUser, query: NewsListQueryDto) {
    const page = query.page ?? 1;
    const perPage = query.perPage ?? 6;

    const where: Prisma.NewsPostWhereInput = {
      AND: [
        this.visibleTo(user),
        query.category ? { category: query.category } : {},
        query.search
          ? {
              OR: [
                { title: { contains: query.search, mode: 'insensitive' } },
                { excerpt: { contains: query.search, mode: 'insensitive' } },
                {
                  author: {
                    fullName: { contains: query.search, mode: 'insensitive' },
                  },
                },
              ],
            }
          : {},
      ],
    };

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.newsPost.findMany({
        where,
        include: withAuthor,
        // Pinned first, then newest — the order the feed shows.
        orderBy: [
          { pinned: 'desc' },
          { publishedAt: { sort: 'desc', nulls: 'first' } },
          { updatedAt: 'desc' },
        ],
        skip: (page - 1) * perPage,
        take: perPage,
      }),
      this.prisma.newsPost.count({ where }),
    ]);

    return {
      items: rows.map(toNewsPost),
      page,
      perPage,
      total,
      totalPages: Math.max(1, Math.ceil(total / perPage)),
    };
  }

  async pinned(user: AuthUser) {
    const rows = await this.prisma.newsPost.findMany({
      where: { AND: [this.visibleTo(user), { pinned: true }] },
      include: withAuthor,
      orderBy: [{ publishedAt: { sort: 'desc', nulls: 'first' } }],
      take: 10,
    });

    return rows.map(toNewsPost);
  }

  async stats(user: AuthUser) {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    // Counted over live posts only, for authors too: a draft is not news yet.
    const live = this.live();

    const [postsThisWeek, newToday, unread] = await this.prisma.$transaction([
      this.prisma.newsPost.count({
        where: { AND: [live, { publishedAt: { gte: weekAgo } }] },
      }),
      this.prisma.newsPost.count({
        where: { AND: [live, { publishedAt: { gte: startOfToday } }] },
      }),
      this.prisma.newsPost.count({
        where: { AND: [live, { reads: { none: { userId: user.id } } }] },
      }),
    ]);

    return { postsThisWeek, unread, newToday };
  }

  async detail(user: AuthUser, id: string) {
    const row = await this.prisma.newsPost.findFirst({
      where: { AND: [this.visibleTo(user), { id }] },
      include: withAuthor,
    });

    if (!row) throw new NotFoundException(NEWS_NOT_FOUND);

    return toNewsPost(row);
  }

  /**
   * What marks a post read for the "Unread" count.
   *
   * Its own call rather than a side effect of `detail`, because that GET runs
   * inside a server component: Next.js is free to render it speculatively — a
   * link prefetch, a router-cache revalidation, a back/forward restore — and
   * every one of those would have silently marked the post read for a reader
   * who never opened it. Only a real view calls this.
   */
  async markRead(user: AuthUser, id: string) {
    const row = await this.prisma.newsPost.findFirst({
      where: { AND: [this.visibleTo(user), { id }] },
      select: { id: true },
    });

    if (!row) throw new NotFoundException(NEWS_NOT_FOUND);

    await this.prisma.newsRead.upsert({
      where: { userId_postId: { userId: user.id, postId: id } },
      create: { userId: user.id, postId: id },
      update: {},
    });
  }

  async create(user: AuthUser, dto: CreateNewsDto) {
    const data = this.toData(dto, null);

    const row = await this.prisma.newsPost.create({
      data: {
        title: dto.title,
        excerpt: dto.excerpt,
        body: dto.body,
        category: dto.category,
        ...data,
        authorId: user.id,
      },
      include: withAuthor,
    });

    return toNewsPost(row);
  }

  async update(id: string, dto: UpdateNewsDto) {
    const existing = await this.prisma.newsPost.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(NEWS_NOT_FOUND);

    const row = await this.prisma.newsPost.update({
      where: { id },
      data: {
        title: dto.title,
        excerpt: dto.excerpt,
        body: dto.body,
        category: dto.category,
        ...this.toData(dto, existing),
      },
      include: withAuthor,
    });

    return toNewsPost(row);
  }

  async remove(id: string) {
    const { count } = await this.prisma.newsPost.deleteMany({ where: { id } });
    if (!count) throw new NotFoundException(NEWS_NOT_FOUND);
  }

  /**
   * The fields shared by create and update, plus the publishing rules:
   *
   *  - publishing needs a title and a summary, the same check the editor makes;
   *  - "published" with a future publish date is stored as "scheduled";
   *  - `publishedAt` (what the feed sorts and dates by) is the chosen publish
   *    date when there is one, otherwise stamped once on first publish.
   */
  private toData(
    dto: UpdateNewsDto,
    existing: {
      status: string;
      publishAt: Date | null;
      publishedAt: Date | null;
      title: string;
      excerpt: string;
    } | null,
  ) {
    const { publishAt } = dto;
    // A PATCH that leaves the date out keeps the one already stored.
    const effectivePublishAt =
      publishAt === undefined ? (existing?.publishAt ?? null) : publishAt;
    let status = dto.status;

    if (status === 'published' || status === 'scheduled') {
      const title = dto.title ?? existing?.title ?? '';
      const excerpt = dto.excerpt ?? existing?.excerpt ?? '';

      if (!title.trim() || !excerpt.trim()) {
        throw new BadRequestException({
          message: 'A title and a summary are required to publish',
          code: 'news_incomplete',
        });
      }

      status =
        effectivePublishAt && effectivePublishAt > new Date()
          ? 'scheduled'
          : 'published';
    }

    const publishing = status === 'published' || status === 'scheduled';
    const publishedAt = publishing
      ? (effectivePublishAt ?? existing?.publishedAt ?? new Date())
      : undefined;

    return {
      coverImageUrl: dto.coverImageUrl,
      pinned: dto.pinned,
      status,
      attachments: dto.attachments as unknown as
        | Prisma.InputJsonValue
        | undefined,
      visibility: dto.visibility as unknown as
        | Prisma.InputJsonValue
        | undefined,
      language: dto.language,
      publishAt,
      expiresAt: dto.expiresAt,
      publishedAt,
    };
  }
}
