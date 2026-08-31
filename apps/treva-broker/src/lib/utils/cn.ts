import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges conditional class names and resolves Tailwind conflicts, so a caller
 * can always override a component's own utilities via `className`.
 */
export function cn(...inputs: ClassValue[]): string {
    return twMerge(clsx(inputs));
}
