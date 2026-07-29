import apiClient from "./client";

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
    house?: { id: string; title: string; name: string; slug: string };
    unitTypeOptionId?: string;
    unitTypeOption?: UnitTypeOption;
    heatingTypeIds?: string[];
    attributeIds?: string[];
    typeOfBuilding?: string;
    constructionStage?: string;
    description?: string;
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
    floor: number;
    number: number;
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
    constructionStage?: string;
    description?: string;
}

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

const cleanString = (value: string | undefined) => {
    const trimmed = value?.trim();
    return trimmed ? trimmed : undefined;
};

const sanitizeUnitLayoutData = (
    data: Partial<CreateUnitLayoutData>
): Partial<CreateUnitLayoutData> => {
    const mainImageUrl = cleanString(data.mainImage?.url);
    const coverImageUrl = cleanString(data.coverImage?.url);

    return {
        ...data,
        title: data.title?.trim(),
        name: data.name?.trim(),
        slug: data.slug?.trim(),
        seoTitle: cleanString(data.seoTitle),
        seoDescription: cleanString(data.seoDescription),
        seoKeywords: cleanString(data.seoKeywords),
        canonicalUrl: cleanString(data.canonicalUrl),
        seoImage: cleanString(data.seoImage),
        entrance: cleanString(data.entrance),
            status: data.status || "available",
        number: data.number,
        balconyArea: data.balconyArea,
        similarApartmentIds: data.similarApartmentIds?.filter(Boolean),
        heatingTypeIds: data.heatingTypeIds?.filter(Boolean) || [],
        attributeIds: data.attributeIds?.filter(Boolean) || [],
        mainImage: mainImageUrl
            ? {
                  url: mainImageUrl,
                  alt: cleanString(data.mainImage?.alt),
              }
            : undefined,
            coverImage: coverImageUrl
                ? {
                      url: coverImageUrl,
                      alt: cleanString(data.coverImage?.alt),
                  }
                : undefined,
        gallery: data.gallery
            ?.map((image) => ({
                url: cleanString(image.url) || "",
                alt: cleanString(image.alt),
            }))
            .filter((image) => image.url),
        documents: data.documents
            ?.map((document) => ({
                type: cleanString(document.type) || "",
                url: cleanString(document.url) || "",
            }))
            .filter((document) => document.type && document.url),
    };
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
        apiClient.post<UnitLayout>("/unit-layouts", sanitizeUnitLayoutData(data)),

    update: (id: string, data: Partial<CreateUnitLayoutData>) =>
        apiClient.patch<UnitLayout>(
            `/unit-layouts/${id}`,
            sanitizeUnitLayoutData(data)
        ),

    delete: (id: string) =>
        apiClient.delete(`/unit-layouts/${id}`),

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
