import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUnitLayoutDto } from './dto/create-unit-layout.dto';
import { UpdateUnitLayoutDto } from './dto/update-unit-layout.dto';

@Injectable()
export class UnitLayoutsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Search helpers.
   *
   * Unit layout labels are composed as `<house> · <unit code>` by the
   * Profitbase sync (e.g. `Tower 5 · B5-705`), so search has to work on the
   * pieces of that label in any order: "tower 5", "b5 705", "b5 tower 5",
   * "b5-705" and "tower5" all have to reach the same unit.
   */
  private normalizeSearchText(value: string): string {
    return value
      .toLowerCase()
      .replace(/[^\p{L}\p{N}]+/gu, ' ')
      .trim();
  }

  private tokenizeSearch(term: string): string[] {
    const normalized = this.normalizeSearchText(term);
    return normalized ? normalized.split(' ') : [];
  }

  /**
   * Splits glued tokens like "tower5" into ["tower", "5"]. Short prefixes such
   * as "b5" are deliberately left whole - splitting them into "b" + "5" would
   * match almost every unit.
   */
  private splitGluedToken(token: string): string[] | null {
    const parts = token.match(/\p{L}+|\p{N}+/gu) ?? [];
    if (parts.length < 2) return null;
    const hasWord = parts.some(
      (part) => part.length >= 3 && /\p{L}/u.test(part),
    );
    return hasWord ? parts : null;
  }

  private searchFieldMatchers(token: string) {
    const like = { contains: token, mode: 'insensitive' as const };
    // NOTE: `slug` is intentionally excluded. Profitbase-synced slugs end with
    // the numeric external id (e.g. `c-tower-parking-97-17883547`), so short
    // numeric tokens like "5" would match unrelated units through that id.
    return [
      { title: like },
      { name: like },
      { unitCode: like },
      { house: { is: { title: like } } },
      { house: { is: { name: like } } },
      { category: { is: { title: like } } },
      { category: { is: { name: like } } },
    ];
  }

  private searchTokenMatchers(token: string) {
    const matchers: any[] = this.searchFieldMatchers(token);
    const parts = this.splitGluedToken(token);
    if (parts) {
      matchers.push({
        AND: parts.map((part) => ({ OR: this.searchFieldMatchers(part) })),
      });
    }
    return matchers;
  }

  /**
   * Relevance score for one candidate row. Higher is better: an exact unit
   * code or a full label match always outranks a row that merely shares a
   * couple of tokens.
   */
  private scoreSearchCandidate(
    candidate: {
      title: string;
      name: string;
      unitCode?: string | null;
      house?: { title?: string | null; name?: string | null } | null;
      category?: { title?: string | null; name?: string | null } | null;
    },
    tokens: string[],
    squashedTerm: string,
  ): number {
    const squash = (value: string) => value.split(' ').join('');
    const fields = [
      { value: candidate.unitCode, weight: 6 },
      { value: candidate.title, weight: 5 },
      { value: candidate.name, weight: 5 },
      { value: candidate.house?.title, weight: 3 },
      { value: candidate.house?.name, weight: 3 },
      { value: candidate.category?.title, weight: 2 },
      { value: candidate.category?.name, weight: 2 },
    ]
      .map((field) => ({
        weight: field.weight,
        normalized: field.value
          ? this.normalizeSearchText(String(field.value))
          : '',
      }))
      .filter((field) => field.normalized.length > 0);

    let score = 0;

    if (squashedTerm) {
      for (const field of fields) {
        const squashed = squash(field.normalized);
        if (squashed === squashedTerm) score += field.weight * 100;
        else if (squashed.startsWith(squashedTerm)) score += field.weight * 40;
        else if (squashed.includes(squashedTerm)) score += field.weight * 25;
      }
    }

    for (const token of tokens) {
      let best = 0;
      for (const field of fields) {
        const words = field.normalized.split(' ');
        let hit = 0;
        if (words.includes(token)) hit = field.weight * 10;
        else if (words.some((word) => word.startsWith(token)))
          hit = field.weight * 6;
        else if (field.normalized.includes(token)) hit = field.weight * 3;
        else if (squash(field.normalized).includes(token)) hit = field.weight * 2;
        if (hit > best) best = hit;
      }
      score += best;
    }

    return score;
  }

  /**
   * Profitbase-synced categories have slugs like `${slug}-${externalId}`.
   * Callers (the homepage hero, the CMS project cards, bookmarked links) may
   * only know the clean slug, so fall back to a prefix/name match before
   * giving up.
   */
  private async resolveCategoryIdBySlug(slug: string): Promise<string | null> {
    const category =
      (await this.prisma.category.findUnique({ where: { slug } })) ??
      (await this.prisma.category.findFirst({
        where: {
          OR: [
            { slug: { startsWith: `${slug}-` } },
            { name: slug },
            { propertyName: slug },
          ],
        },
      }));
    return category?.id ?? null;
  }

  private async syncCategoryMetrics(categoryId: string) {
    const [housesCount, propertiesCount, reservedCount, soldCount] =
      await Promise.all([
        this.prisma.house.count({ where: { categoryId, archived: false } }),
        this.prisma.unitLayout.count({
          where: { categoryId, archived: false },
        }),
        this.prisma.unitLayout.count({
          where: { categoryId, archived: false, status: 'reserved' },
        }),
        this.prisma.unitLayout.count({
          where: { categoryId, archived: false, status: 'sold' },
        }),
      ]);

    await this.prisma.category.update({
      where: { id: categoryId },
      data: { housesCount, propertiesCount, reservedCount, soldCount },
    });
  }

  async create(createDto: CreateUnitLayoutDto) {
    const existingSlug = await this.prisma.unitLayout.findUnique({
      where: { slug: createDto.slug },
    });

    if (existingSlug) {
      throw new ConflictException('Unit layout with this slug already exists');
    }

    const layout = await this.prisma.unitLayout.create({
      data: {
        title: createDto.title,
        name: createDto.name,
        slug: createDto.slug,
        seoTitle: createDto.seoTitle,
        seoDescription: createDto.seoDescription,
        seoKeywords: createDto.seoKeywords,
        canonicalUrl: createDto.canonicalUrl,
        seoImage: createDto.seoImage,
        status: createDto.status || 'available',
        categoryId: createDto.categoryId,
        unitTypeOptionId: createDto.unitTypeOptionId,
        realEstateType: createDto.realEstateType,
        floor: createDto.floor,
        number: createDto.number,
        entrance: createDto.entrance,
        totalArea: createDto.totalArea,
        internalArea: createDto.internalArea,
        balconyArea: createDto.balconyArea,
        prices: (createDto.prices as any) || {},
        completionYear: createDto.completionYear,
        numberOfFloors: createDto.numberOfFloors as any,
        similarApartmentIds: createDto.similarApartmentIds || [],
        mainImage: createDto.mainImage as any,
        coverImage: createDto.coverImage as any,
        gallery: (createDto.gallery as any[]) || [],
        documents: (createDto.documents as any[]) || [],
        houseId: createDto.houseId,
        typeOfBuilding: createDto.typeOfBuilding,
        constructionStage: createDto.constructionStage,
        description: createDto.description,
        heatingTypeIds: createDto.heatingTypeIds || [],
        attributeIds: createDto.attributeIds || [],
      },
      include: { category: true, house: true, unitTypeOption: true },
    });

    await this.syncCategoryMetrics(createDto.categoryId);
    return layout;
  }

  async findAll(query: {
    page?: number;
    limit?: number;
    categoryId?: string;
    categorySlug?: string;
    status?: 'available' | 'reserved' | 'sold';
    statusOptionId?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    currency?: string;
    minArea?: number;
    maxArea?: number;
    floor?: number;
    unitTypeOptionId?: string;
    rooms?: string;
    houseId?: string;
    houseSlug?: string;
    archived?: boolean;
  }) {
    const page = query.page || 1;
    const limit = query.limit || 12;
    const skip = (page - 1) * limit;
    const currency = query.currency || 'USD';

    const where: any = {};

    if (query.categoryId) {
      where.categoryId = query.categoryId;
    }

    if (query.categorySlug) {
      where.categoryId =
        (await this.resolveCategoryIdBySlug(query.categorySlug)) ??
        '__missing__';
    }

    if (query.houseId) {
      where.houseId = query.houseId;
    }

    if (query.houseSlug) {
      const house = await this.prisma.house.findUnique({
        where: { slug: query.houseSlug },
      });
      if (house) {
        where.houseId = house.id;
      }
    }

    if (query.statusOptionId) {
      where.statusOptionId = query.statusOptionId;
    } else if (query.status) {
      where.status = query.status;
    }

    if (query.archived !== undefined) {
      where.archived = query.archived;
    }

    const searchTokens = query.search ? this.tokenizeSearch(query.search) : [];

    if (searchTokens.length > 0) {
      // Every token has to match somewhere, but not necessarily in the same
      // field - that is what makes "b5 tower 5" find `Tower 5 · B5-705`.
      where.AND = [
        ...(where.AND ?? []),
        ...searchTokens.map((token) => ({ OR: this.searchTokenMatchers(token) })),
      ];
    }

    if (query.minPrice || query.maxPrice) {
      where.prices = {
        path: [currency],
        ...(query.minPrice ? { gte: query.minPrice } : {}),
        ...(query.maxPrice ? { lte: query.maxPrice } : {}),
      };
    }

    if (query.minArea || query.maxArea) {
      where.totalArea = {};
      if (query.minArea) where.totalArea.gte = query.minArea;
      if (query.maxArea) where.totalArea.lte = query.maxArea;
    }

    if (query.floor) {
      where.floor = query.floor;
    }

    if (query.unitTypeOptionId) {
      where.unitTypeOptionId = query.unitTypeOptionId;
    }

    if (query.rooms) {
      const raw = String(query.rooms).trim().toLowerCase();
      if (raw === '4plus' || raw === '4+' || raw === '4 ') {
        where.number = { gte: 4 };
      } else {
        const parsed = parseInt(raw, 10);
        if (Number.isFinite(parsed)) {
          where.number = parsed;
        }
      }
    }

    const include = {
      category: true,
      house: true,
      unitTypeOption: true,
    };

    if (searchTokens.length > 0) {
      // Ranked search: score every match on the label the UI shows, then
      // paginate the ranked list instead of falling back to `createdAt`.
      const candidates = await this.prisma.unitLayout.findMany({
        where,
        select: {
          id: true,
          title: true,
          name: true,
          unitCode: true,
          createdAt: true,
          house: { select: { title: true, name: true } },
          category: { select: { title: true, name: true } },
        },
      });

      const squashedTerm = searchTokens.join('');
      const ranked = candidates
        .map((candidate) => ({
          id: candidate.id,
          createdAt: candidate.createdAt,
          titleLength: candidate.title.length,
          score: this.scoreSearchCandidate(
            candidate,
            searchTokens,
            squashedTerm,
          ),
        }))
        .sort(
          (a, b) =>
            b.score - a.score ||
            a.titleLength - b.titleLength ||
            b.createdAt.getTime() - a.createdAt.getTime(),
        );

      // A token-AND match can still drag in unrelated units (the "5" of
      // "Tower 5" also lives inside "Tower 4 · D-1405"), so drop rows that
      // score far below the best hit.
      const minScore = ranked.length > 0 ? ranked[0].score * 0.5 : 0;
      const results = ranked.filter((item) => item.score >= minScore);

      const pageIds = results.slice(skip, skip + limit).map((item) => item.id);
      const rows = pageIds.length
        ? await this.prisma.unitLayout.findMany({
            where: { id: { in: pageIds } },
            include,
          })
        : [];
      const byId = new Map(rows.map((row) => [row.id, row]));

      return {
        data: pageIds
          .map((id) => byId.get(id))
          .filter((row): row is (typeof rows)[number] => Boolean(row)),
        pagination: {
          page,
          limit,
          total: results.length,
          totalPages: Math.ceil(results.length / limit),
        },
      };
    }

    const [data, total] = await Promise.all([
      this.prisma.unitLayout.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include,
      }),
      this.prisma.unitLayout.count({ where }),
    ]);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const unitLayout = await this.prisma.unitLayout.findUnique({
      where: { id },
      include: { category: true, unitTypeOption: true, house: true },
    });

    if (!unitLayout) {
      throw new NotFoundException('Unit layout not found');
    }

    let similarApartments: any[] = [];
    if (
      unitLayout.similarApartmentIds &&
      unitLayout.similarApartmentIds.length > 0
    ) {
      similarApartments = await this.prisma.unitLayout.findMany({
        where: { id: { in: unitLayout.similarApartmentIds } },
        include: { category: true, house: true },
      });
    }

    return { ...unitLayout, similarApartments };
  }

  async findBySlug(slug: string) {
    const unitLayout = await this.prisma.unitLayout.findUnique({
      where: { slug },
      include: { category: true, unitTypeOption: true, house: true },
    });

    if (!unitLayout) {
      throw new NotFoundException('Unit layout not found');
    }

    let similarApartments: any[] = [];
    if (
      unitLayout.similarApartmentIds &&
      unitLayout.similarApartmentIds.length > 0
    ) {
      similarApartments = await this.prisma.unitLayout.findMany({
        where: { id: { in: unitLayout.similarApartmentIds } },
        include: { category: true, house: true },
      });
    }

    return { ...unitLayout, similarApartments };
  }

  async update(id: string, updateDto: UpdateUnitLayoutDto) {
    const existing = await this.prisma.unitLayout.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Unit layout not found');
    }

    if (updateDto.slug && updateDto.slug !== existing.slug) {
      const slugExists = await this.prisma.unitLayout.findUnique({
        where: { slug: updateDto.slug },
      });
      if (slugExists) {
        throw new ConflictException(
          'Unit layout with this slug already exists',
        );
      }
    }

    const data: any = {};
    if (updateDto.title !== undefined) data.title = updateDto.title;
    if (updateDto.name !== undefined) data.name = updateDto.name;
    if (updateDto.slug !== undefined) data.slug = updateDto.slug;
    if (updateDto.seoTitle !== undefined) data.seoTitle = updateDto.seoTitle;
    if (updateDto.seoDescription !== undefined)
      data.seoDescription = updateDto.seoDescription;
    if (updateDto.seoKeywords !== undefined)
      data.seoKeywords = updateDto.seoKeywords;
    if (updateDto.canonicalUrl !== undefined)
      data.canonicalUrl = updateDto.canonicalUrl;
    if (updateDto.seoImage !== undefined) data.seoImage = updateDto.seoImage;
    if (updateDto.status !== undefined) data.status = updateDto.status;
    if (updateDto.archived !== undefined) data.archived = updateDto.archived;
    if (updateDto.categoryId !== undefined)
      data.categoryId = updateDto.categoryId;
    if (updateDto.houseId !== undefined) data.houseId = updateDto.houseId;
    if (updateDto.unitTypeOptionId !== undefined)
      data.unitTypeOptionId = updateDto.unitTypeOptionId;
    if (updateDto.realEstateType !== undefined)
      data.realEstateType = updateDto.realEstateType;
    if (updateDto.floor !== undefined) data.floor = updateDto.floor;
    if (updateDto.number !== undefined) data.number = updateDto.number;
    if (updateDto.entrance !== undefined) data.entrance = updateDto.entrance;
    if (updateDto.totalArea !== undefined) data.totalArea = updateDto.totalArea;
    if (updateDto.internalArea !== undefined)
      data.internalArea = updateDto.internalArea;
    if (updateDto.balconyArea !== undefined)
      data.balconyArea = updateDto.balconyArea;
    if (updateDto.prices !== undefined) data.prices = updateDto.prices;
    if (updateDto.completionYear !== undefined)
      data.completionYear = updateDto.completionYear;
    if (updateDto.numberOfFloors)
      data.numberOfFloors = updateDto.numberOfFloors;
    if (updateDto.similarApartmentIds)
      data.similarApartmentIds = updateDto.similarApartmentIds;
    if (updateDto.mainImage !== undefined) data.mainImage = updateDto.mainImage;
    if (updateDto.coverImage !== undefined)
      data.coverImage = updateDto.coverImage;
    if (updateDto.gallery !== undefined) data.gallery = updateDto.gallery;
    if (updateDto.documents !== undefined) data.documents = updateDto.documents;
    if (updateDto.typeOfBuilding !== undefined)
      data.typeOfBuilding = updateDto.typeOfBuilding;
    if (updateDto.constructionStage !== undefined)
      data.constructionStage = updateDto.constructionStage;
    if (updateDto.description !== undefined)
      data.description = updateDto.description;
    if (updateDto.heatingTypeIds !== undefined)
      data.heatingTypeIds = updateDto.heatingTypeIds;
    if (updateDto.attributeIds !== undefined)
      data.attributeIds = updateDto.attributeIds;

    const layout = await this.prisma.unitLayout.update({
      where: { id },
      data,
      include: { category: true, unitTypeOption: true, house: true },
    });

    await this.syncCategoryMetrics(layout.categoryId);
    if (existing.categoryId !== layout.categoryId) {
      await this.syncCategoryMetrics(existing.categoryId);
    }

    return layout;
  }

  async remove(id: string) {
    const existing = await this.prisma.unitLayout.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Unit layout not found');
    }

    const result = await this.prisma.unitLayout.delete({
      where: { id },
    });

    await this.syncCategoryMetrics(existing.categoryId);
    return result;
  }

  async count() {
    return this.prisma.unitLayout.count();
  }

  async findFloors() {
    const result = await this.prisma.unitLayout.findMany({
      select: { floor: true },
      distinct: ['floor'],
      orderBy: { floor: 'asc' },
    });
    return result.map((r) => r.floor);
  }

  /**
   * Price/area extremes. Without `categorySlug` this stays the global range
   * the filter sliders ask for. With one it is scoped to that project and
   * skips archived units — what the home page cards need for their
   * "starting from" line.
   */
  async findRange(currency: string = 'USD', categorySlug?: string) {
    const where: any = {};
    if (categorySlug) {
      where.categoryId =
        (await this.resolveCategoryIdBySlug(categorySlug)) ?? '__missing__';
      where.archived = false;
    }

    const layouts = await this.prisma.unitLayout.findMany({
      where,
      select: { prices: true, totalArea: true },
    });

    let maxPrice = 0;
    let minPrice = Infinity;
    let maxTotalArea = 0;
    let minTotalArea = Infinity;

    for (const layout of layouts) {
      const prices = layout.prices as Record<string, number>;
      const price = prices?.[currency] || 0;
      if (price > maxPrice) maxPrice = price;
      if (price < minPrice && price > 0) minPrice = price;
      if (layout.totalArea > maxTotalArea) maxTotalArea = layout.totalArea;
      if (layout.totalArea < minTotalArea) minTotalArea = layout.totalArea;
    }

    return {
      maxPrice: maxPrice || 0,
      minPrice: minPrice === Infinity ? 0 : minPrice,
      maxTotalArea: maxTotalArea || 0,
      minTotalArea: minTotalArea === Infinity ? 0 : minTotalArea,
    };
  }

  async countByStatus() {
    const [available, sold, reserved] = await Promise.all([
      this.prisma.unitLayout.count({ where: { status: 'available' } }),
      this.prisma.unitLayout.count({ where: { status: 'sold' } }),
      this.prisma.unitLayout.count({ where: { status: 'reserved' } }),
    ]);
    return { available, sold, reserved, total: available + sold + reserved };
  }
}
