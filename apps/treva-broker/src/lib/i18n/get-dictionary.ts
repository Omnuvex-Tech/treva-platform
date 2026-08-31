import "server-only";

import type { Locale } from "./config";
import { DEFAULT_LOCALE } from "./config";
import type { Dictionary } from "./types";

/**
 * Dynamic imports, not a static map: each locale ends up in its own chunk, so a
 * request for /az never ships the Russian copy.
 *
 * The `Promise<Dictionary>` annotation is what enforces translation
 * completeness — a key present in en.json but missing from az.json/ru.json is a
 * type error here.
 */
const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
    en: () => import("./dictionaries/en.json").then((mod) => mod.default),
    az: () => import("./dictionaries/az.json").then((mod) => mod.default),
    ru: () => import("./dictionaries/ru.json").then((mod) => mod.default),
};

export async function getDictionary(locale: Locale): Promise<Dictionary> {
    const load = dictionaries[locale] ?? dictionaries[DEFAULT_LOCALE];
    return load();
}
