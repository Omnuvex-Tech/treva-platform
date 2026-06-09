export interface PriceRange {
  min: number;
  max: number;
}

export interface AreaRange {
  min: number;
  max: number;
}

export interface FilterOptions {
  priceRange: PriceRange;
  currencyOptions: string[];
  defaultCurrency: string;
  areaRange: AreaRange;
  floorOptions: (string | number)[];
  viewOptions: string[];
  statusOptions: string[];
  roomOptions: string[];
  totalUnits: number;
}

export interface FilterState {
  priceFrom: number;
  priceTo: number;
  currency: string;
  areaFrom: number;
  areaTo: number;
  floor: string | number | "";
  view: string;
  status: string;
  selectedRooms: string[];
}

export interface UnitLayoutProps {
  filters: FilterOptions;
  foundUnits: number;
  onFilterChange: (state: FilterState) => void;
}
