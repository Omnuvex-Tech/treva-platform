export interface PageQuery {
    page?: number;
    perPage?: number;
    search?: string;
    sort?: string;
}

export interface Paginated<T> {
    items: T[];
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
}

/** Envelope the NestJS API is expected to return for single resources. */
export interface ApiEnvelope<T> {
    data: T;
    message?: string;
}
