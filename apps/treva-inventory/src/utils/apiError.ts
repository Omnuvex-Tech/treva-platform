export function getApiErrorMessage(
    error: unknown,
    fallback = "Something went wrong"
) {
    const apiError = error as {
        response?: {
            data?: {
                message?: string | string[];
            };
        };
        message?: string;
    };

    const message = apiError?.response?.data?.message;

    if (Array.isArray(message)) {
        return message.join(", ");
    }

    if (typeof message === "string" && message.trim()) {
        return message;
    }

    if (typeof apiError?.message === "string" && apiError.message.trim()) {
        return apiError.message;
    }

    return fallback;
}
