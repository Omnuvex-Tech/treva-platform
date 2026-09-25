import {
  ProfitbaseHouse,
  ProfitbaseProperty,
} from './profitbase-client.service';

/**
 * Pure translations from Profitbase's values to the ones the panel and the
 * site use. Everything returns null when Profitbase has nothing usable, so the
 * sync can tell "unknown" apart from a real value.
 */

// Property type alias → the site's real estate type. `property` is the
// account's "Residential unit" type, used for ordinary apartments (Sabah
// Towers' Tower 2), so it is shown as one.
const REAL_ESTATE_TYPE_LABELS: Record<string, string> = {
  apartment: 'Apartment',
  property: 'Apartment',
  townhouse: 'Townhouse',
  villa: 'Villa',
  commercial_premises: 'Commercial',
  parking: 'Parking',
};

// Account-wide custom field keys (Settings → Custom fields in Profitbase).
export const CUSTOM_FIELD = {
  externalArea: 'pbcf_6720c399cf1df', // "External area, m²"
  constructionStage: 'pbcf_6853a91ad531d', // "Construction stage"
  handover: 'pbcf_68ee1f7538300', // "Handover", e.g. "Fully fit-out, partially furnished"
  renovation: 'pbcf_6a74608fb9249', // "Ремонт": "С ремонтом" / "Без ремонта"
} as const;

export type Renovation = 'renovated' | 'non-renovated';
export type Furnishing = 'furnished' | 'partially-furnished' | 'unfurnished';

export function realEstateTypeLabel(alias: string | null): string | null {
  if (!alias) return null;
  return REAL_ESTATE_TYPE_LABELS[alias] ?? alias;
}

export function isParking(property: ProfitbaseProperty): boolean {
  return (
    property.typePurpose === 'parking' || property.propertyType === 'parking'
  );
}

export function customFieldValue(
  property: ProfitbaseProperty,
  key: string,
): string | null {
  const value = property.custom_fields?.find(
    (field) => field.id === key,
  )?.value;
  if (value === null || value === undefined || typeof value === 'boolean') {
    return null;
  }
  const text = String(value).trim();
  return text.length > 0 ? text : null;
}

export function customFieldNumber(
  property: ProfitbaseProperty,
  key: string,
): number | null {
  const text = customFieldValue(property, key);
  if (text === null) return null;
  const parsed = Number(text.replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : null;
}

/**
 * Renovation from free text in Russian or English, e.g. "Без Ремонта",
 * "With renovation (without furniture and appliances).", "Fully fit-out".
 * The negative forms are checked first: "Without fit-out" contains "fit-out".
 */
export function parseRenovation(text: string | null): Renovation | null {
  if (!text) return null;
  const value = text.toLowerCase();
  if (
    /без\s+ремонт|without\s+(fit-?out|renovation|repair)|shell\s*(&|and)\s*core/.test(
      value,
    )
  ) {
    return 'non-renovated';
  }
  if (
    /с\s+ремонт|with\s+(ready\s+)?(renovation|repair)|ready\s+(with\s+)?repair|fit-?out|renovated/.test(
      value,
    )
  ) {
    return 'renovated';
  }
  return null;
}

/** Furnishing from the same kind of free text; null when it is not mentioned. */
export function parseFurnishing(text: string | null): Furnishing | null {
  if (!text) return null;
  const value = text.toLowerCase();
  if (/без\s+мебел|without\s+furniture|unfurnished/.test(value)) {
    return 'unfurnished';
  }
  if (/partially\s+furnished|частично\s+мебл/.test(value)) {
    return 'partially-furnished';
  }
  if (/furnished|с\s+мебел|with\s+furniture/.test(value)) {
    return 'furnished';
  }
  return null;
}

/**
 * Renovation and furnishing for a unit: its own fields first, then the house's
 * finishing note, which applies to every unit that says nothing itself.
 */
export function unitFinishing(
  property: ProfitbaseProperty,
  house: ProfitbaseHouse | null,
): { renovation: Renovation | null; furnishing: Furnishing | null } {
  const sources = [
    customFieldValue(property, CUSTOM_FIELD.renovation),
    customFieldValue(property, CUSTOM_FIELD.handover),
    property.attributes?.facing ?? null,
    house?.facing ?? null,
  ];
  const first = <T>(parse: (text: string | null) => T | null): T | null => {
    for (const source of sources) {
      const parsed = parse(source);
      if (parsed !== null) return parsed;
    }
    return null;
  };
  return {
    renovation: first(parseRenovation),
    furnishing: first(parseFurnishing),
  };
}

// Values match the panel's construction stage options.
export function constructionStageFromUnit(text: string | null): string | null {
  if (!text) return null;
  const value = text.toLowerCase();
  if (value.includes('under construction')) return 'Under construction';
  if (value.includes('completed')) return 'Ready';
  return null;
}

export function constructionStageFromHouse(
  house: ProfitbaseHouse | null,
): string | null {
  switch (house?.buildingState) {
    case 'UNFINISHED':
      return 'Under construction';
    case 'FINISHED':
    case 'HAND_OVER':
      return 'Ready';
    default:
      return null;
  }
}

// Values match the panel's type of building options.
export function typeOfBuildingLabel(type: string | null): string | null {
  switch (type) {
    case 'RESIDENTIAL':
      return 'Residential building';
    case 'PARKING':
      return 'Parking';
    default:
      return type || null;
  }
}

/**
 * Unit type from the layout: Studio, or "N Bedroom". Profitbase's own
 * "Unit-Type" field is filled on barely half the units and spelled five ways
 * (1BR, 1 Bedroom, 1BR-J...), while `studio` and `rooms_amount` are always
 * set. A residential unit with no bedrooms is a studio. Parking and
 * commercial units have no unit type.
 */
export function unitTypeFor(
  property: ProfitbaseProperty,
): { name: string; title: string; order: number } | null {
  if (property.typePurpose !== 'residential') return null;
  const bedrooms = property.rooms_amount ?? 0;
  if (property.studio || bedrooms === 0) {
    return { name: 'studio', title: 'Studio', order: 0 };
  }
  return {
    name: `${bedrooms}-bedroom`,
    title: `${bedrooms} Bedroom`,
    order: bedrooms,
  };
}
