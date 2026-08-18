import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface ProfitbaseHouse {
  id: number;
  projectId: number;
  projectName: string;
  title: string;
  type: string | null;
  isArchive: boolean;
  street: string | null;
  number: string | null;
  minFloor: number | null;
  maxFloor: number | null;
  commissioningDate: string | null;
  currency: { code: string } | null;
  address: {
    full: string | null;
    street: string | null;
    number: string | null;
  } | null;
  contractAddress: string | null;
  minPrice: number | null;
  minPriceArea: number | null;
  image: string | null;
  fullImage: string | null;
}

export interface ProfitbasePlanImage {
  source: string;
  big: string;
  preview: string;
  imageName: string;
}

export interface ProfitbasePlan {
  id: number;
  projectId: number;
  projectName: string;
  houseId: number;
  houseName: string;
  isStudio: boolean;
  roomsAmount: number;
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
  floor: number | null;
  propertyType: string | null;
  typePurpose: string | null;
  area: {
    area_total: number | null;
    area_living: number | null;
    area_balcony: number | null;
  } | null;
  price: { value: number | null } | null;
  status: 'AVAILABLE' | 'SOLD' | 'BOOKED' | 'UNAVAILABLE' | string;
}

const PROPERTY_PAGE_SIZE = 1000;

@Injectable()
export class ProfitbaseClientService {
  constructor(private readonly config: ConfigService) {}

  private get baseUrl(): string {
    const url = this.config.get<string>('PROFITBASE_BASE_URL');
    if (!url) throw new Error('PROFITBASE_BASE_URL is not configured');
    return url;
  }

  private get accessToken(): string {
    const token = this.config.get<string>('PROFITBASE_ACCESS_TOKEN');
    if (!token) throw new Error('PROFITBASE_ACCESS_TOKEN is not configured');
    return token;
  }

  private async request<T>(
    path: string,
    params: Record<string, string | number> = {},
  ): Promise<T> {
    const url = new URL(`${this.baseUrl}/${path}`);
    url.searchParams.set('access_token', this.accessToken);
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, String(value));
    }

    const res = await fetch(url.toString());
    if (!res.ok) {
      throw new Error(
        `Profitbase request to "${path}" failed with status ${res.status}`,
      );
    }
    return (await res.json()) as T;
  }

  async getHouses(): Promise<ProfitbaseHouse[]> {
    const res = await this.request<{ data: ProfitbaseHouse[] }>('house');
    return res.data;
  }

  async getPlans(): Promise<ProfitbasePlan[]> {
    const res = await this.request<{ data: ProfitbasePlan[] }>('plan');
    return res.data;
  }

  async getProperties(): Promise<ProfitbaseProperty[]> {
    const all: ProfitbaseProperty[] = [];
    let offset = 0;

    while (true) {
      const res = await this.request<{ data: ProfitbaseProperty[] }>(
        'property',
        {
          limit: PROPERTY_PAGE_SIZE,
          offset,
        },
      );
      if (!res.data.length) break;
      all.push(...res.data);
      if (res.data.length < PROPERTY_PAGE_SIZE) break;
      offset += PROPERTY_PAGE_SIZE;
    }

    return all;
  }
}
