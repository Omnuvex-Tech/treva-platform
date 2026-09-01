export class ApiError extends Error {
    readonly status: number;
    readonly code: string;
    readonly details: unknown;

    constructor(message: string, status: number, code = "unknown_error", details: unknown = null) {
        super(message);
        this.name = "ApiError";
        this.status = status;
        this.code = code;
        this.details = details;
    }

    get isUnauthorized(): boolean {
        return this.status === 401;
    }

    get isForbidden(): boolean {
        return this.status === 403;
    }

    get isNotFound(): boolean {
        return this.status === 404;
    }
}

export function isApiError(error: unknown): error is ApiError {
    return error instanceof ApiError;
}
