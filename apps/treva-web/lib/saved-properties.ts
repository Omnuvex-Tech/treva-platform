const STORAGE_KEY = 'treva_saved';
const EVENT_NAME = 'treva-saved-changed';

export type SavedProperty = {
  id: string;
  slug: string;
  type: 'resale';
  image: string;
  price: number;
  currency: string;
  rooms: string;
  area: string;
  floor: string;
  location: string;
  title: string;
};

function readAll(): SavedProperty[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeAll(items: SavedProperty[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { count: items.length } }));
}

export function onSavedChange(callback: (count: number) => void): () => void {
  const handler = (e: Event) => callback((e as CustomEvent).detail.count);
  window.addEventListener(EVENT_NAME, handler);
  return () => window.removeEventListener(EVENT_NAME, handler);
}

export function getSaved(): SavedProperty[] {
  return readAll();
}

export function getSavedByType(type: SavedProperty['type']): SavedProperty[] {
  return readAll().filter(p => p.type === type);
}

export function isSaved(id: string): boolean {
  return readAll().some(p => p.id === id);
}

export function addSaved(property: SavedProperty): void {
  const all = readAll();
  if (all.some(p => p.id === property.id)) return;
  all.push(property);
  writeAll(all);
}

export function removeSaved(id: string): void {
  writeAll(readAll().filter(p => p.id !== id));
}

export function getSavedCount(): number {
  return readAll().length;
}
