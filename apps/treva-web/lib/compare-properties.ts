const STORAGE_KEY = 'treva_compare';
const EVENT_NAME = 'treva-compare-changed';

export type CompareProperty = {
  id: string;
  slug: string;
  type: 'resale' | 'off-plan';
  image: string;
  price: number;
  currency: string;
  rooms: string;
  area: string;
  floor: string;
  /** Complex/project name (off-plan) or listing location (resale). */
  project: string;
  building?: string;
  title: string;
};

function readAll(): CompareProperty[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeAll(items: CompareProperty[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { count: items.length } }));
}

export function onCompareChange(callback: (count: number) => void): () => void {
  const handler = (e: Event) => callback((e as CustomEvent).detail.count);
  window.addEventListener(EVENT_NAME, handler);
  return () => window.removeEventListener(EVENT_NAME, handler);
}

export function getCompared(): CompareProperty[] {
  return readAll();
}

export function getComparedByType(type: CompareProperty['type']): CompareProperty[] {
  return readAll().filter(p => p.type === type);
}

export function isCompared(id: string): boolean {
  return readAll().some(p => p.id === id);
}

export function addCompared(property: CompareProperty): void {
  const all = readAll();
  if (all.some(p => p.id === property.id)) return;
  all.push(property);
  writeAll(all);
}

export function removeCompared(id: string): void {
  writeAll(readAll().filter(p => p.id !== id));
}

export function getComparedCount(): number {
  return readAll().length;
}
