export function slugify(value: string): string {
    return value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
}

export function createDuplicateToken(): string {
    return Date.now().toString(36).slice(-5);
}

export function duplicateText(value: string, token: string): string {
    const base = value.trim();
    return base ? `${base} Copy ${token}` : `Copy ${token}`;
}

export function duplicateSlug(value: string, token: string): string {
    const base = slugify(value) || "item";
    return `${base}-copy-${token}`;
}

export function duplicateCode(value: string, token: string): string {
    const base = value.trim();
    return `${base || "copy"}-${token}`.toUpperCase();
}

export function duplicatePhone(value: string, token: string): string {
    const digitsOnly = token.replace(/\D/g, "");
    return `${value}${digitsOnly || token}`;
}
