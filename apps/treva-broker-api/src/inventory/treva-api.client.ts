import { BadGatewayException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * The slices of treva-api's responses the synchronisation reads. treva-api
 * sends far more (SEO, owners, attribute ids…); nothing else is relied on, so
 * a change to the rest of its shape cannot break the sync.
 */
export interface TrevaImage {
  url?: string | null;
}

export interface TrevaObject {
  id: string;
  title: string;
  type: string;
  image: string | null;
  coverImage: string | null;
  bannerImage: string | null;
  developerBrand: string | null;
  region: string | null;
  area: string | null;
  city: string | null;
  locationTitle: string | null;
}

export interface TrevaHouse {
  id: string;
  title: string;
  categoryId: string;
  completionYear: number | null;
  numberOfFloors: { start?: number; end?: number } | null;
  mainImage: TrevaImage | null;
}

export interface TrevaUnit {
  id: string;
  title: string;
  categoryId: string;
  houseId: string | null;
  floor: number;
  number: number | null;
  unitCode: string | null;
  rooms: number | null;
  totalArea: number | null;
  internalArea: number | null;
  balconyArea: number | null;
  prices: Record<string, number | null> | null;
  completionYear: number | null;
  mainImage: TrevaImage | null;
  realEstateType: string | null;
  status: string;
  archived: boolean;
}

interface Paginated<T> {
  data: T[];
  pagination: { page: number; totalPages: number };
}

/** Big pages keep a 1,600-unit object to a handful of requests. */
const PAGE_SIZE = 500;
const REQUEST_TIMEOUT_MS = 60_000;

/**
 * Read-only client for treva-api's public catalogue endpoints — the source the
 * broker's own project inventory is copied from. The broker never serves these
 * responses; `InventorySyncService` writes them into this API's database.
 */
@Injectable()
export class TrevaApiClient {
  private readonly baseUrl: string;

  constructor(config: ConfigService) {
    this.baseUrl = (
      config.get<string>('TREVA_API_URL') ?? 'http://localhost:10011/api/v1'
    ).replace(/\/+$/, '');
  }

  /** treva-api's own origin, for turning its root-relative uploads absolute. */
  get origin() {
    return new URL(this.baseUrl).origin;
  }

  private async get<T>(
    path: string,
    params: Record<string, string | number> = {},
  ) {
    const url = new URL(`${this.baseUrl}${path}`);
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, String(value));
    }

    let response: Response;
    try {
      response = await fetch(url, {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
    } catch {
      throw new BadGatewayException({
        message: 'treva-api could not be reached',
        code: 'treva_api_unreachable',
      });
    }

    if (!response.ok) {
      throw new BadGatewayException({
        message: `treva-api answered ${response.status} for ${path}`,
        code: 'treva_api_error',
      });
    }

    return (await response.json()) as T;
  }

  private async all<T>(path: string, params: Record<string, string>) {
    const rows: T[] = [];

    for (let page = 1; ; page += 1) {
      const result = await this.get<Paginated<T>>(path, {
        ...params,
        page,
        limit: PAGE_SIZE,
      });
      rows.push(...result.data);
      if (page >= result.pagination.totalPages) break;
    }

    return rows;
  }

  /** The residential complexes — categories of type "object". */
  objects() {
    return this.get<TrevaObject[]>('/categories', { type: 'object' });
  }

  houses(objectId: string) {
    return this.all<TrevaHouse>('/houses', { categoryId: objectId });
  }

  /** Every unit of an object, archived ones included — they sync as blocked. */
  units(objectId: string) {
    return this.all<TrevaUnit>('/unit-layouts', { categoryId: objectId });
  }
}
