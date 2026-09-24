import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface ProfitbaseHouse {
  id: number;
  projectId: number;
  projectName: string;
  title: string;
  type: string | null; // 'RESIDENTIAL' | 'PARKING'
  isArchive: boolean;
  // e.g. "UNFINISHED"
  buildingState: string | null;
  // Free-text finishing for the whole house, e.g. "Без Ремонта".
  facing: string | null;
  street: string | null;
  number: string | null;
  minFloor: number | null;
  maxFloor: number | null;
  // Always null on our account; the real handover date lives in
  // `developmentEndQuarter`.
  commissioningDate: string | null;
  developmentEndQuarter: { year: string; quarter: number } | null;
  currency: { code: string } | null;
  address: {
    full: string | null;
    street: string | null;
    number: string | null;
  } | null;
  contractAddress: string | null;
  minPrice: number | null;
  // Lowest price per m² in the house - not an area.
  minPriceArea: number | null;
  image: string | null;
  fullImage: string | null;
}

export interface ProfitbasePlanImage {
  source: string;
  big: string;
  preview: string;
  small: string;
  technical: boolean;
  imageName: string;
}

export interface ProfitbaseRange {
  min: string | null;
  max: string | null;
}

export interface ProfitbasePlan {
  id: number;
  code: string | null;
  projectId: number;
  projectName: string;
  houseId: number;
  houseName: string;
  isHouseArchive: boolean;
  isWithoutLayout: boolean;
  isStudio: boolean;
  isEuroLayout: boolean;
  isFreeLayout: boolean;
  roomsAmount: number;
  priceRange: ProfitbaseRange | null;
  areaRange: ProfitbaseRange | null;
  properties: string[];
  propertyTypeAliases: string[];
  image: ProfitbasePlanImage | null;
  planImages: ProfitbasePlanImage[];
}

export interface ProfitbaseProperty {
  id: number;
  house_id: number;
  houseName: string;
  projectId: number;
  projectName: string;
  number: string | null;
  rooms_amount: number | null;
  studio: boolean;
  floor: number | null;
  // Building entrance / block, e.g. "C".
  sectionName: string | null;
  propertyType: string | null;
  typePurpose: string | null; // 'residential' | 'parking' | 'commercial'
  area: {
    area_total: number | null;
    area_living: number | null;
    area_balcony: number | null;
  } | null;
  price: { value: number | null } | null;
  status: string; // 'AVAILABLE' | 'SOLD' | 'BOOKED' | 'UNAVAILABLE'
  // Only on `full=true` requests.
  attributes?: { facing: string | null } | null;
  custom_fields?: ProfitbaseCustomField[];
}

export interface ProfitbaseCustomField {
  id: string;
  name: string;
  value: string | number | boolean | null;
}

export interface ProfitbaseProject {
  id: number;
  title: string;
  archiveState: string; // 'NOT_ARCHIVED' | 'ARCHIVED' | 'PARTIALLY_ARCHIVED'
  locality: string | null;
  developer_brand: string | null;
  currency: string | null;
  location: {
    latitude: string | null;
    longitude: string | null;
  } | null;
  images: { url: string }[] | null;
}

const PROPERTY_PAGE_SIZE = 1000;
// Profitbase caps `full=true` property pages at 100 records.
const FULL_PROPERTY_PAGE_SIZE = 100;

@Injectable()
export class ProfitbaseClientService {
  constructor(private readonly config: ConfigService) {}

  private cachedAccessToken: string | null = null;
  private tokenExpiresAt: number = 0;

  private get baseUrl(): string {
    const url = this.config.get<string>('PROFITBASE_BASE_URL');
    if (!url) throw new Error('PROFITBASE_BASE_URL is not configured');
    return url;
  }

  private get apiKey(): string | null {
    return this.config.get<string>('PROFITBASE_API_KEY') ?? null;
  }

  private get staticAccessToken(): string | null {
    return this.config.get<string>('PROFITBASE_ACCESS_TOKEN') ?? null;
  }

  private async authenticate(): Promise<string> {
    const apiKey = this.apiKey;
    if (!apiKey) {
      const staticToken = this.staticAccessToken;
      if (staticToken) return staticToken;
      throw new Error(
        'Neither PROFITBASE_API_KEY nor PROFITBASE_ACCESS_TOKEN is configured',
      );
    }

    const url = new URL(`${this.baseUrl}/authentication`);
    const res = await fetch(url.toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'api-app',
        credentials: { pb_api_key: apiKey },
      }),
    });

    if (!res.ok) {
      let errorBody = '';
      try {
        errorBody = await res.text();
      } catch {
        errorBody = '<could not read response body>';
      }
      throw new Error(
        `Profitbase authentication failed with status ${res.status}. Response: ${errorBody}`,
      );
    }

    const data = (await res.json()) as {
      access_token: string;
      remaining_time?: number;
    };
    this.cachedAccessToken = data.access_token;
    this.tokenExpiresAt =
      Date.now() + (data.remaining_time ?? 82800) * 1000 - 300_000;
    return this.cachedAccessToken;
  }

  private async getAccessToken(): Promise<string> {
    if (this.apiKey) {
      if (this.cachedAccessToken && Date.now() < this.tokenExpiresAt) {
        return this.cachedAccessToken;
      }
      return this.authenticate();
    }
    return this.authenticate();
  }

  private async request<T>(
    path: string,
    params: Record<string, string | number> = {},
    retryOnAuthError = true,
  ): Promise<T> {
    const token = await this.getAccessToken();
    const url = new URL(`${this.baseUrl}/${path}`);
    url.searchParams.set('access_token', token);
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, String(value));
    }

    const res = await fetch(url.toString());
    if (!res.ok) {
      let errorBody = '';
      try {
        errorBody = await res.text();
      } catch {
        errorBody = '<could not read response body>';
      }

      if (
        retryOnAuthError &&
        (res.status === 401 || res.status === 403) &&
        this.apiKey
      ) {
        this.cachedAccessToken = null;
        this.tokenExpiresAt = 0;
        return this.request<T>(path, params, false);
      }

      throw new Error(
        `Profitbase request to "${path}" failed with status ${res.status}. Response: ${errorBody}`,
      );
    }
    return (await res.json()) as T;
  }

  async getHouses(): Promise<ProfitbaseHouse[]> {
    const res = await this.request<{ data: ProfitbaseHouse[] }>('house');
    return res.data;
  }

  async getPlans(): Promise<ProfitbasePlan[]> {
    const all: ProfitbasePlan[] = [];
    let offset = 0;

    while (true) {
      const res = await this.request<{ data: ProfitbasePlan[] }>('plan', {
        limit: PROPERTY_PAGE_SIZE,
        offset,
      });
      if (!res.data.length) break;
      all.push(...res.data);
      if (res.data.length < PROPERTY_PAGE_SIZE) break;
      offset += PROPERTY_PAGE_SIZE;
    }

    return all;
  }

  async getProjects(): Promise<ProfitbaseProject[]> {
    // Unlike the other endpoints, `projects` returns a bare array.
    return this.request<ProfitbaseProject[]>('projects');
  }

  /**
   * Every property with its custom fields and attributes (`full=true`), which
   * carry details the plain list lacks: external area, renovation, handover
   * state, construction stage.
   */
  async getProperties(): Promise<ProfitbaseProperty[]> {
    const all: ProfitbaseProperty[] = [];
    let offset = 0;

    while (true) {
      const res = await this.request<{ data: ProfitbaseProperty[] }>(
        'property',
        {
          full: 'true',
          limit: FULL_PROPERTY_PAGE_SIZE,
          offset,
        },
      );
      if (!res.data.length) break;
      all.push(...res.data);
      if (res.data.length < FULL_PROPERTY_PAGE_SIZE) break;
      offset += FULL_PROPERTY_PAGE_SIZE;
    }

    return all;
  }
}
