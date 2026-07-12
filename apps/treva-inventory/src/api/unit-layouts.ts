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

export interface UnitLayout {
    id: string;
    title: string;
    name: string;
    slug: string;
    statusOptionId?: string;
    statusOption?: { id: string; value: string };
    floor: number;
    number?: number;
    totalArea: number;
    internalArea: number;
    balconyArea?: number;
    prices: Record<string, number>;
    completionYear: number;
    numberOfFloors: NumberOfFloors;
    viewOptionId?: string;
    similarApartmentIds: string[];
    mainImage?: MainImage;
    gallery: GalleryImage[];
    documents: Document[];
    location?: Location;
    categoryId: string;
    category: Category;
    roomOptionId?: string;
    roomOption?: { id: string; name: string; title: string; type: string };
    viewOption?: { id: string; name: string; title: string };
    ownerId?: string;
    owner?: { id: string; firstName: string; lastName: string; phoneNumber: string };
    heatingTypeIds?: string[];
    attributeIds?: string[];
    locationTitle?: string;
    locationUrl?: string;
    lcd?: string;
    typeOfBuilding?: string;
    defaultPropertyType?: string;
    constructionStage?: string;
    startOfConstruction?: { month: number; year: number };
    completionOfConstruction?: { month: number; year: number };
    startOfSales?: { month: number; year: number };
    endOfSales?: { month: number; year: number };
    salesOffice?: string;
    contractAddress?: string;
    street?: string;
    houseNumber?: string;
    deadlineForCommissioning?: string;
    landCadastralNumber?: string;
    showroomAvailability?: string;
    renovation?: string;
    wallMaterial?: string;
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
    statusOptionId?: string;
    categoryId: string;
    floor: number;
    number: number;
    totalArea: number;
    internalArea: number;
    balconyArea: number;
    prices: Record<string, number>;
    completionYear: number;
    numberOfFloors: NumberOfFloors;
    viewOptionId?: string;
    similarApartmentIds: string[];
    mainImage?: MainImage;
    gallery?: GalleryImage[];
    documents?: Document[];
    location?: Location;
    roomOptionId?: string;
    ownerId?: string;
    heatingTypeIds?: string[];
    attributeIds?: string[];
    locationTitle?: string;
    locationUrl?: string;
    lcd?: string;
    typeOfBuilding?: string;
    defaultPropertyType?: string;
    constructionStage?: string;
    startOfConstruction?: { month: number; year: number };
    completionOfConstruction?: { month: number; year: number };
    startOfSales?: { month: number; year: number };
    endOfSales?: { month: number; year: number };
    salesOffice?: string;
    contractAddress?: string;
    street?: string;
    houseNumber?: string;
    deadlineForCommissioning?: string;
    landCadastralNumber?: string;
    showroomAvailability?: string;
    renovation?: string;
    wallMaterial?: string;
    description?: string;
}

export interface UnitLayoutFilters {
    page?: number;
    limit?: number;
    categoryId?: string;
    categorySlug?: string;
    statusOptionId?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    minArea?: number;
    maxArea?: number;
    floor?: number;
    viewOptionId?: string;
    roomOptionId?: string;
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
    const locationTitle = cleanString(data.location?.title) || cleanString(data.locationTitle);
    const locationType = cleanString(data.location?.type);
    const mainImageUrl = cleanString(data.mainImage?.url);

    return {
        ...data,
        title: data.title?.trim(),
        name: data.name?.trim(),
        slug: data.slug?.trim(),
        number: data.number,
        balconyArea: data.balconyArea,
        similarApartmentIds: data.similarApartmentIds?.filter(Boolean),
        ownerId: cleanString(data.ownerId),
        heatingTypeIds: data.heatingTypeIds?.filter(Boolean) || [],
        attributeIds: data.attributeIds?.filter(Boolean) || [],
        locationTitle: cleanString(data.locationTitle) || cleanString(data.location?.title),
        locationUrl: cleanString(data.locationUrl) || cleanString(data.location?.url),
        mainImage: mainImageUrl
            ? {
                  url: mainImageUrl,
                  alt: cleanString(data.mainImage?.alt),
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
