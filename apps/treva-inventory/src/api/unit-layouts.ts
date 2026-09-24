import apiClient from "./client";
import type { UnitFurnishing, UnitRenovation } from "../utils/offplanOptions";

export interface NumberOfFloors {
    start: number;
    end: number;
}

export interface MainImage {
    url: string;
    alt?: string;
}

export interface GalleryImage {
    url: string;
    alt?: string;
}

export interface Document {
    type: string;
    url: string;
}

export interface Category {
    id: string;
    title: string;
    name: string;
    slug: string;
}

export interface UnitTypeOption {
    id: string;
    name: string;
    title: string;
    createdAt: string;
    updatedAt: string;
}

export type UnitLayoutStatus = "available" | "reserved" | "sold";

export const UNIT_LAYOUT_STATUS_OPTIONS: Array<{ id: UnitLayoutStatus; label: string }> = [
    { id: "available", label: "Available" },
    { id: "reserved", label: "Reserved" },
    { id: "sold", label: "Sold" },
];

export interface UnitLayout {
    id: string;
    title: string;
    name: string;
    slug: string;
    seoTitle?: string;
    seoDescription?: string;
    seoKeywords?: string;
    canonicalUrl?: string;
    seoImage?: string;
    status: UnitLayoutStatus;
    archived?: boolean;
    floor: number;
    number?: number;
    unitCode?: string;
    rooms?: number;
    entrance?: string;
    totalArea: number;
    internalArea: number;
    balconyArea?: number;
    prices: Record<string, number>;
    completionYear: number;
    numberOfFloors: NumberOfFloors;
    similarApartmentIds: string[];
    mainImage?: MainImage;
    coverImage?: MainImage;
    gallery: GalleryImage[];
    documents: Document[];
    categoryId: string;
    category: Category;
    houseId?: string;
    house?: { id: string; title: string; name: string; slug: string; numberOfFloors?: NumberOfFloors };
    unitTypeOptionId?: string;
    unitTypeOption?: UnitTypeOption;
    realEstateType?: string;
    heatingTypeIds?: string[];
    attributeIds?: string[];
    typeOfBuilding?: string;
    constructionStage?: string;
    renovation?: UnitRenovation | null;
    furnishing?: UnitFurnishing | null;
    description?: string;
    // Profitbase property id; set on synced units, whose Profitbase fields are read-only.
    externalId?: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface UnitLayoutListResponse {
    data: UnitLayout[];
    pagination: Pagination;
}

export interface UnitLayoutStats {
    available: number;
    sold: number;
    reserved: number;
    total: number;
}

export interface CreateUnitLayoutData {
    title: string;
    name: string;
    slug: string;
    seoTitle?: string;
    seoDescription?: string;
    seoKeywords?: string;
    canonicalUrl?: string;
    seoImage?: string;
    status?: UnitLayoutStatus;
    archived?: boolean;
    categoryId: string;
    houseId?: string;
    unitTypeOptionId?: string;
    realEstateType?: string;
    floor: number;
    number?: number;
    entrance?: string;
    totalArea: number;
    internalArea: number;
    balconyArea: number;
    prices: Record<string, number>;
    completionYear: number;
    numberOfFloors: NumberOfFloors;
    similarApartmentIds: string[];
    mainImage?: MainImage;
    coverImage?: MainImage;
    gallery?: GalleryImage[];
    documents?: Document[];
    heatingTypeIds?: string[];
    attributeIds?: string[];
    typeOfBuilding?: string;
    constructionStage?: string | null;
    renovation?: UnitRenovation | null;
    furnishing?: UnitFurnishing | null;
    unitCode?: string | null;
    description?: string;
}

// Edits may send null to clear an optional field.
export type UpdateUnitLayoutData = {
    [K in keyof CreateUnitLayoutData]?: CreateUnitLayoutData[K] | null;
};

export interface UnitLayoutFilters {
    page?: number;
    limit?: number;
    categoryId?: string;
    categorySlug?: string;
    houseId?: string;
    houseSlug?: string;
    status?: UnitLayoutStatus;
    archived?: boolean;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    minArea?: number;
    maxArea?: number;
    floor?: number;
    unitTypeOptionId?: string;
}

export interface UploadResponse {
    url: string;
    alt: string;
    type: string;
    originalName: string;
    size: number;
    mimetype: string;
}

const cleanString = (value: string | null | undefined) => {
    const trimmed = value?.trim();
    return trimmed ? trimmed : undefined;
};

// Optional text fields. A cleared one is dropped on create and sent as null on
// edit, so the API actually clears it instead of keeping the old value.
const OPTIONAL_TEXT_KEYS = [
    "seoTitle",
    "seoDescription",
    "seoKeywords",
    "canonicalUrl",
    "seoImage",
    "entrance",
    "unitCode",
    "realEstateType",
    "constructionStage",
] as const;

const cleanImage = (image: MainImage | null | undefined) => {
    const url = cleanString(image?.url);
    return url ? { url, alt: cleanString(image?.alt) } : undefined;
};

/**
 * Tidies a payload without adding anything to it: only the keys the caller
 * sent go out, so a partial edit (archive toggle, brochure upload) leaves
 * the unit's status, attributes and everything else alone.
 */
const sanitizeUnitLayoutData = (data: UpdateUnitLayoutData, emptyAs: undefined | null): UpdateUnitLayoutData => {
    const out: UpdateUnitLayoutData = { ...data };
    const has = (key: keyof UpdateUnitLayoutData) => key in data;

    if (has("title")) out.title = data.title?.trim();
    if (has("name")) out.name = data.name?.trim();
    if (has("slug")) out.slug = data.slug?.trim();
    for (const key of OPTIONAL_TEXT_KEYS) {
        if (has(key)) out[key] = cleanString(data[key]) ?? emptyAs;
    }
    if (has("similarApartmentIds")) out.similarApartmentIds = data.similarApartmentIds?.filter(Boolean) ?? [];
    if (has("heatingTypeIds")) out.heatingTypeIds = data.heatingTypeIds?.filter(Boolean) ?? [];
    if (has("attributeIds")) out.attributeIds = data.attributeIds?.filter(Boolean) ?? [];
    if (has("mainImage")) out.mainImage = cleanImage(data.mainImage);
    if (has("coverImage")) out.coverImage = cleanImage(data.coverImage);
    if (has("gallery")) {
        out.gallery = data.gallery
            ?.map((image) => ({ url: cleanString(image.url) || "", alt: cleanString(image.alt) }))
            .filter((image) => image.url);
    }
    if (has("documents")) {
        out.documents = data.documents
            ?.map((document) => ({ type: cleanString(document.type) || "", url: cleanString(document.url) || "" }))
            .filter((document) => document.type && document.url);
    }
    return out;
};

export const unitLayoutsApi = {
    getAll: (filters?: UnitLayoutFilters) => {
        const params = new URLSearchParams();
        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== "" && value !== null) {
                    params.append(key, String(value));
                }
            });
        }
        return apiClient.get<UnitLayoutListResponse>(
            `/unit-layouts?${params.toString()}`
        );
    },

    getById: (id: string) =>
        apiClient.get<UnitLayout>(`/unit-layouts/${id}`),

    create: (data: CreateUnitLayoutData) =>
        apiClient.post<UnitLayout>("/unit-layouts", {
            status: "available",
            ...sanitizeUnitLayoutData(data, undefined),
        }),

    update: (id: string, data: UpdateUnitLayoutData) =>
        apiClient.patch<UnitLayout>(
            `/unit-layouts/${id}`,
            sanitizeUnitLayoutData(data, null)
        ),

    delete: (id: string) =>
        apiClient.delete(`/unit-layouts/${id}`),

    /** Fills in each unit's missing currencies from the one it is priced in. */
    syncCurrencies: () =>
        apiClient.post<{ scanned: number; updated: number }>(
            "/unit-layouts/sync-currencies"
        ),

    getStats: () =>
        apiClient.get<UnitLayoutStats>("/unit-layouts/stats"),

    uploadFile: (file: File) => {
        const formData = new FormData();
        formData.append("file", file);
        return apiClient.post<UploadResponse>("/upload", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
    },
};
