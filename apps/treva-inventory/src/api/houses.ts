import apiClient from "./client";

export interface Location {
    title: string;
    url?: string;
    type: string;
}

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

export type HouseStatus = "available" | "reserved" | "sold";

export type HouseTagIcon = "star" | "tag" | "refresh" | "gift" | "clock";

export interface HouseTag {
    id: string;
    text: string;
    color: string;
    icon: HouseTagIcon;
    enabled: boolean;
}

export const HOUSE_STATUS_OPTIONS: Array<{ id: HouseStatus; label: string }> = [
    { id: "available", label: "Available" },
    { id: "reserved", label: "Reserved" },
    { id: "sold", label: "Sold" },
];

export interface House {
    id: string;
    title: string;
    name: string;
    slug: string;
    seoTitle?: string;
    seoDescription?: string;
    seoKeywords?: string;
    canonicalUrl?: string;
    seoImage?: string;
    status: HouseStatus;
    archived?: boolean;
    floor: number;
    number?: number;
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
    location?: Location;
    categoryId: string;
    category: Category;
    ownerId?: string;
    owner?: { id: string; firstName: string; lastName: string; phoneNumber: string };
    _count?: { unitLayouts: number };
    heatingTypeIds?: string[];
    attributeIds?: string[];
    locationTitle?: string;
    locationUrl?: string;
    locationGoogleMapsUrl?: string;
    street?: string;
    houseNumber?: string;
    deadlineForCommissioning?: string;
    salesOffice?: string;
    landCadastralNumber?: string;
    contractAddress?: string;
    secondContractAddress?: string;
    showroomAvailability?: string;
    secondShowroomAvailability?: string;
    typeOfBuilding?: string;
    constructionStage?: string;
    description?: string;
    // Profitbase house id; set on synced houses, whose Profitbase fields are read-only.
    externalId?: string | null;
    editedInInventoryAt?: string | null;
    tags?: HouseTag[];
    // Distinct entrances across the house's units (houses list only).
    entranceCount?: number;
    createdAt: string;
    updatedAt: string;
}

export interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface HouseListResponse {
    data: House[];
    pagination: Pagination;
}

export interface HouseStats {
    available: number;
    sold: number;
    reserved: number;
    total: number;
}

export interface CreateHouseData {
    title: string;
    name: string;
    slug: string;
    seoTitle?: string;
    seoDescription?: string;
    seoKeywords?: string;
    canonicalUrl?: string;
    seoImage?: string;
    status?: HouseStatus;
    archived?: boolean;
    categoryId: string;
    floor: number;
    number: number;
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
    location?: Location;
    ownerId?: string;
    heatingTypeIds?: string[];
    attributeIds?: string[];
    locationTitle?: string;
    locationUrl?: string;
    locationGoogleMapsUrl?: string;
    street?: string;
    houseNumber?: string;
    deadlineForCommissioning?: string;
    salesOffice?: string;
    landCadastralNumber?: string;
    contractAddress?: string;
    secondContractAddress?: string;
    showroomAvailability?: string;
    secondShowroomAvailability?: string;
    typeOfBuilding?: string;
    constructionStage?: string;
    description?: string;
    tags?: HouseTag[];
}

export interface HouseFilters {
    page?: number;
    limit?: number;
    categoryId?: string;
    categorySlug?: string;
    status?: HouseStatus;
    archived?: boolean;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    minArea?: number;
    maxArea?: number;
    floor?: number;
    summary?: boolean;
}

export interface HouseSummary {
    id: string;
    title: string;
    name: string;
    slug: string;
    status: HouseStatus;
    mainImage?: MainImage;
    prices: Record<string, number>;
    categoryId: string;
    category: Category;
    _count?: { unitLayouts: number };
}

export interface HouseSummaryListResponse {
    data: HouseSummary[];
    pagination: Pagination;
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

// Edits may send null to clear an optional field.
export type UpdateHouseData = {
    [K in keyof CreateHouseData]?: CreateHouseData[K] | null;
};

// Optional text fields. A cleared one is dropped on create and sent as null on
// edit, so the API actually clears it instead of keeping the old value.
const OPTIONAL_TEXT_KEYS = [
    "seoTitle",
    "seoDescription",
    "seoKeywords",
    "canonicalUrl",
    "seoImage",
    "ownerId",
    "locationTitle",
    "locationUrl",
    "locationGoogleMapsUrl",
    "street",
    "houseNumber",
    "deadlineForCommissioning",
    "salesOffice",
    "landCadastralNumber",
    "contractAddress",
    "secondContractAddress",
    "showroomAvailability",
    "secondShowroomAvailability",
    "typeOfBuilding",
    "constructionStage",
] as const;

const cleanImage = (image: MainImage | null | undefined) => {
    const url = cleanString(image?.url);
    return url ? { url, alt: cleanString(image?.alt) } : undefined;
};

/**
 * Tidies a payload without adding anything to it: only the keys the caller
 * sent go out, so a partial edit (archive toggle, house form) leaves the
 * house's status, attributes and everything else alone.
 */
const sanitizeHouseData = (data: UpdateHouseData, emptyAs: undefined | null): UpdateHouseData => {
    const out: UpdateHouseData = { ...data };
    const has = (key: keyof UpdateHouseData) => key in data;

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
    if (has("location")) {
        const title = cleanString(data.location?.title);
        const type = cleanString(data.location?.type);
        out.location = title && type ? { title, type, url: cleanString(data.location?.url) } : undefined;
    }
    return out;
};

export const housesApi = {
    getAll: (filters?: HouseFilters) => {
        const params = new URLSearchParams();
        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== "" && value !== null) {
                    params.append(key, String(value));
                }
            });
        }
        return apiClient.get<HouseListResponse>(
            `/houses?${params.toString()}`
        );
    },

    getAllSummary: (filters?: Omit<HouseFilters, "summary">) => {
        const params = new URLSearchParams();
        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== "" && value !== null) {
                    params.append(key, String(value));
                }
            });
        }
        params.append("summary", "true");
        return apiClient.get<HouseSummaryListResponse>(
            `/houses?${params.toString()}`
        );
    },

    getById: (id: string) =>
        apiClient.get<House>(`/houses/${id}`),

    create: (data: CreateHouseData) =>
        apiClient.post<House>("/houses", {
            status: "available",
            ...sanitizeHouseData(data, undefined),
        }),

    update: (id: string, data: UpdateHouseData) =>
        apiClient.patch<House>(
            `/houses/${id}`,
            sanitizeHouseData(data, null)
        ),

    delete: (id: string) =>
        apiClient.delete(`/houses/${id}`),

    getStats: () =>
        apiClient.get<HouseStats>("/houses/stats"),

    uploadFile: (file: File) => {
        const formData = new FormData();
        formData.append("file", file);
        return apiClient.post<UploadResponse>("/upload", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
    },
};
