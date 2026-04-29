import { isPlainObject } from "./guards";

export const normalizer = {
    number(value: unknown, defaultValue: number = 0): number {
        const num = Number(value);
        if (Number.isNaN(num)) {
            return defaultValue;
        }
        return num;
    },

    string(value: unknown, defaultValue: string = ""): string {
        if (value === null || value === undefined) {
            return defaultValue;
        }
        return String(value).trim();
    },

    boolean(value: unknown, defaultValue: boolean = false): boolean {
        if (value === "true" || value === "1" || value === true) return true;
        if (value === "false" || value === "0" || value === false) return false;
        return defaultValue;
    },

    array<T>(value: unknown, defaultValue: T[] = []): T[] {
        if (Array.isArray(value)) return value as T[];
        if (typeof value === "string") {
            try {
                const parsed = JSON.parse(value);
                if (Array.isArray(parsed)) return parsed as T[];
            } catch {}
        }
        return defaultValue;
    },

    object<T extends Record<string, unknown>>(value: unknown, defaultValue: T = {} as T): T {
        if (isPlainObject(value)) return value as T;
        if (typeof value === "string") {
            try {
                const parsed = JSON.parse(value);
                if (isPlainObject(parsed)) return parsed as T;
            } catch {}
        }
        return defaultValue;
    },
} as const;
