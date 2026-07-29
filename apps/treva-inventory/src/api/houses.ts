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
    startOfConstruction?: { month: number; year: number };
    completionOfConstruction?: { month: number; year: number };
    startOfSales?: { month: number; year: number };
    endOfSales?: { month: number; year: number };
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
    startOfConstruction?: { month: number; year: number };
    completionOfConstruction?: { month: number; year: number };
    startOfSales?: { month: number; year: number };
    endOfSales?: { month: number; year: number };
    description?: string;
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

const sanitizeHouseData = (
    data: Partial<CreateHouseData>
): Partial<CreateHouseData> => {
    const locationTitle = cleanString(data.location?.title) || cleanString(data.locationTitle);
    const locationType = cleanString(data.location?.type);
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
            status: data.status || "available",
        number: data.number,
        balconyArea: data.balconyArea,
        similarApartmentIds: data.similarApartmentIds?.filter(Boolean),
        ownerId: cleanString(data.ownerId),
        heatingTypeIds: data.heatingTypeIds?.filter(Boolean) || [],
        attributeIds: data.attributeIds?.filter(Boolean) || [],
        locationTitle: cleanString(data.locationTitle) || cleanString(data.location?.title),
        locationUrl: cleanString(data.locationUrl) || cleanString(data.location?.url),
        locationGoogleMapsUrl: cleanString(data.locationGoogleMapsUrl),
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
        location:
            locationTitle && locationType
                ? {
                      title: locationTitle,
                      type: locationType,
                      url: cleanString(data.location?.url) || cleanString(data.locationUrl),
                  }
                : undefined,
    };
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

    getById: (id: string) =>
        apiClient.get<House>(`/houses/${id}`),

    create: (data: CreateHouseData) =>
        apiClient.post<House>("/houses", sanitizeHouseData(data)),

    update: (id: string, data: Partial<CreateHouseData>) =>
        apiClient.patch<House>(
            `/houses/${id}`,
            sanitizeHouseData(data)
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
