import type en from "./dictionaries/en.json";

/**
 * English is the source of truth for the dictionary shape — az.json and ru.json
 * are type-checked against it in get-dictionary.ts, so a key added to en.json
 * that is missing elsewhere fails `check-types` instead of rendering blank.
 */
export type Dictionary = typeof en;

export type DictionarySection = keyof Dictionary;
