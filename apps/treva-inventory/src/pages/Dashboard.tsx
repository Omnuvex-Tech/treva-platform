import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { unitLayoutsApi, type UnitLayoutStats, type UnitLayout } from "../api/unit-layouts";
import { categoriesApi, type Category } from "../api/categories";
import { apartmentsApi, type Apartment } from "../api/apartments";
import { apartmentTypesApi, type ApartmentType } from "../api/apartment-types";
import { ownersApi, type Owner } from "../api/owners";
import { attributesApi, type Attribute } from "../api/attributes";
import { requestsApi, type Request } from "../api/requests";
import { locationOptionsApi, type LocationOption } from "../api/location-options";
import { viewOptionsApi, type ViewOption as ResaleViewOption } from "../api/view-options";
import { heatingTypeOptionsApi, type HeatingTypeOption } from "../api/heating-type-options";
import { roomOptionsApi, type RoomOption } from "../api/room-options";
import { currenciesApi, type Currency } from "../api/currencies";
import { CategoriesSection } from "./dashboard/CategoriesSection";
import { UnitLayoutsSection } from "./dashboard/UnitLayoutsSection";
import { ViewOptionsSection } from "./dashboard/ViewOptionsSection";
import { StatusOptionsSection } from "./dashboard/StatusOptionsSection";
import { RoomOptionsSection } from "./dashboard/RoomOptionsSection";
import { CurrenciesSection } from "./dashboard/CurrenciesSection";
import { LocationOptionsSection } from "./dashboard/LocationOptionsSection";
import { HeatingTypeOptionsSection } from "./dashboard/HeatingTypeOptionsSection";
import { ResaleApartmentsCardSection } from "./dashboard/ResaleApartmentsCardSection";
import { ApartmentForm } from "./resale/ApartmentForm";
import { ApartmentTypesSection } from "./dashboard/ApartmentTypesSection";
import { OwnersSection } from "./dashboard/OwnersSection";
import { AttributesSection } from "./dashboard/AttributesSection";
import { RequestsSection } from "./dashboard/RequestsSection";
import { SalesOfficeOptionsSection } from "./dashboard/SalesOfficeOptionsSection";
import { PropertyTypeOptionsSection } from "./dashboard/PropertyTypeOptionsSection";
import { HouseMaterialOptionsSection } from "./dashboard/HouseMaterialOptionsSection";
import { OffPlanObjectsSection } from "./dashboard/OffPlanObjectsSection";
import { CategoryEdit } from "./categories/CategoryEdit";
import { CategoryCreate } from "./categories/CategoryCreate";
import { ObjectEditPage } from "./dashboard/ObjectEditPage";
import { ObjectCreatePage } from "./dashboard/ObjectCreatePage";
import { ObjectTypesSection } from "./dashboard/ObjectTypesSection";

import { LoadingSpinner } from "../components/LoadingSpinner";

type MenuKey = "offplan" | "resale"
    | "categories" | "unitLayouts" | "viewOptions" | "statusOptions"
    | "roomOptions" | "currencies"
    | "apartments" | "apartmentTypes" | "owners" | "attributes" | "requests" | "locationOptions" | "resaleViewOptions" | "heatingTypeOptions"
    | "objects" | "objectTypes"
    | "offplanLocationOptions" | "offplanHeatingTypeOptions" | "offplanOwners" | "offplanAttributes"
    | "salesOfficeOptions" | "propertyTypeOptions" | "houseMaterialOptions";

const pageNames: Record<MenuKey, string> = {
    offplan: "Off-plan",
    resale: "Resale",
    categories: "Categories",
    unitLayouts: "Unit Layouts",
    viewOptions: "View Options",
    statusOptions: "Status Options",
    roomOptions: "Room Options",
    currencies: "Currencies",
    apartments: "Apartments",
    apartmentTypes: "Apartment Types",
    owners: "Owners",
    attributes: "Attributes",
    requests: "Requests",
    locationOptions: "Location Options",
    resaleViewOptions: "Views",
    heatingTypeOptions: "Heating Types",
    objects: "Objects",
    objectTypes: "Object Types",
    offplanLocationOptions: "Location Options",
    offplanHeatingTypeOptions: "Heating Types",
    offplanOwners: "Owners",
    offplanAttributes: "Attributes",
    salesOfficeOptions: "Sales Offices",
    propertyTypeOptions: "Property Types",
    houseMaterialOptions: "House Materials",
};

const pageSubtitles: Record<MenuKey, string> = {
    offplan: "Pre-construction project pipeline",
    resale: "Secondary market listings",
    categories: "Manage property categories",
    unitLayouts: "Manage off-plan unit layouts",
    viewOptions: "Manage view options",
    statusOptions: "Manage status options",
    roomOptions: "Manage room options",
    currencies: "Manage currencies",
    apartments: "Manage resale apartments",
    apartmentTypes: "Manage apartment types",
    owners: "Manage apartment owners",
    attributes: "Manage apartment attributes",
    requests: "View buyer requests",
    locationOptions: "Manage city and region options",
    resaleViewOptions: "Manage apartment view options",
    heatingTypeOptions: "Manage heating type options",
    objects: "Manage off-plan project objects",
    objectTypes: "Manage object types",
    offplanLocationOptions: "Manage city and region options",
    offplanHeatingTypeOptions: "Manage heating type options",
    offplanOwners: "Manage property owners",
    offplanAttributes: "Manage property attributes",
    salesOfficeOptions: "Manage sales office options",
    propertyTypeOptions: "Manage property type options",
    houseMaterialOptions: "Manage house material options",
};

type SectionKey = "offplan" | "resale";

const accordionConfig: { key: SectionKey; label: string; icon: React.ReactNode; children: { key: MenuKey; icon: React.ReactNode; label?: string }[] }[] = [
    {
        key: "resale",
        label: "Resale",
        icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12L5 10M5 10L7 12M5 10V14C5 16.5 7 18 9.5 18" /><path d="M21 12L19 14M19 14L17 12M19 14V10C19 7.5 17 6 14.5 6" /><path d="M9 16C9 17.5 10.5 19 12 19C13.5 19 15 17.5 15 16C15 14.5 13.5 13 12 13C10.5 13 9 14.5 9 16Z" /></svg>,
        children: [
            { key: "resale", label: "Dashboard", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg> },
            { key: "apartments", label: "Listings", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg> },
            { key: "apartmentTypes", label: "Listing Types", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg> },
            { key: "roomOptions", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg> },
            { key: "attributes", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="4" y1="21" x2="4" y2="14" /><line x1="4" y1="10" x2="4" y2="3" /><line x1="12" y1="21" x2="12" y2="12" /><line x1="12" y1="8" x2="12" y2="3" /><line x1="20" y1="21" x2="20" y2="16" /><line x1="20" y1="12" x2="20" y2="3" /><line x1="1" y1="14" x2="7" y2="14" /><line x1="9" y1="8" x2="15" y2="8" /><line x1="17" y1="16" x2="23" y2="16" /></svg> },
            { key: "owners", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg> },
            { key: "locationOptions", label: "Locations", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 21s-6-4.35-6-10a6 6 0 1 1 12 0c0 5.65-6 10-6 10Z" /><circle cx="12" cy="11" r="2.5" /></svg> },
            { key: "resaleViewOptions", label: "Views", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /></svg> },
            { key: "heatingTypeOptions", label: "Heating Types", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v12" /><path d="M9 7h6" /><path d="M12 14a4 4 0 1 0 4 4" /></svg> },
            { key: "requests", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg> },
            { key: "currencies", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" /><path d="M12 18V6" /></svg> },
        ],
    },
    {
        key: "offplan",
        label: "Off-plan",
        icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21H21M12 3L3 10V21H9V14H15V21H21V10L12 3Z" /><rect x="10" y="14" width="4" height="7" /><path d="M8 7L16 7" /><path d="M9 5L12 3L15 5" /></svg>,
        children: [
            { key: "offplan", label: "Dashboard", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg> },
            { key: "objects", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" /></svg> },
            { key: "objectTypes", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><path d="M12 6v3M12 15v3M6 12h3M15 12h3" /></svg> },
            { key: "categories", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" /></svg> },
            { key: "unitLayouts", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="2" width="16" height="20" rx="2" ry="2" /><line x1="9" y1="22" x2="9" y2="2" /><line x1="15" y1="22" x2="15" y2="2" /></svg> },
            { key: "viewOptions", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg> },
            { key: "statusOptions", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg> },
            { key: "roomOptions", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg> },
            { key: "locationOptions", label: "Locations", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 21s-6-4.35-6-10a6 6 0 1 1 12 0c0 5.65-6 10-6 10Z" /><circle cx="12" cy="11" r="2.5" /></svg> },
            { key: "heatingTypeOptions", label: "Heating Types", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v12" /><path d="M9 7h6" /><path d="M12 14a4 4 0 1 0 4 4" /></svg> },
            { key: "owners", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg> },
            { key: "attributes", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="4" y1="21" x2="4" y2="14" /><line x1="4" y1="10" x2="4" y2="3" /><line x1="12" y1="21" x2="12" y2="12" /><line x1="12" y1="8" x2="12" y2="3" /><line x1="20" y1="21" x2="20" y2="16" /><line x1="20" y1="12" x2="20" y2="3" /><line x1="1" y1="14" x2="7" y2="14" /><line x1="9" y1="8" x2="15" y2="8" /><line x1="17" y1="16" x2="23" y2="16" /></svg> },
            { key: "currencies", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" /><path d="M12 18V6" /></svg> },
            { key: "salesOfficeOptions", label: "Sales Offices", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg> },
            { key: "propertyTypeOptions", label: "Property Types", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg> },
            { key: "houseMaterialOptions", label: "House Materials", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="6" width="20" height="12" rx="2" /><path d="M12 12h.01" /><path d="M17 12h.01" /><path d="M7 12h.01" /></svg> },
        ],
    },
];

const getParentSection = (key: MenuKey): SectionKey | null => {
    if (key === "offplan" || key === "categories" || key === "unitLayouts" || key === "viewOptions" || key === "statusOptions" || key === "objects" || key === "objectTypes" || key === "offplanLocationOptions" || key === "offplanHeatingTypeOptions" || key === "offplanOwners" || key === "offplanAttributes" || key === "salesOfficeOptions" || key === "propertyTypeOptions" || key === "houseMaterialOptions") return "offplan";
    return "resale";
};

function getRouteForMenu(key: MenuKey, parent: SectionKey): string {
    if (key === "resale") return "/dashboard/resale";
    if (key === "offplan") return "/dashboard/offplan";

    if (key === "apartments") return "/dashboard/resale/apartments";
    if (key === "apartmentTypes") return "/dashboard/resale/apartment-types";
    if (key === "resaleViewOptions") return "/dashboard/resale/view-options";
    if (key === "requests") return "/dashboard/resale/requests";

    if (key === "locationOptions") return `/dashboard/${parent}/location-options`;
    if (key === "heatingTypeOptions") return `/dashboard/${parent}/heating-type-options`;
    if (key === "owners") return `/dashboard/${parent}/owners`;
    if (key === "attributes") return `/dashboard/${parent}/attributes`;

    if (key === "categories") return "/dashboard/offplan/categories";
    if (key === "objects") return "/dashboard/offplan/objects";
    if (key === "objectTypes") return "/dashboard/offplan/object-types";
    if (key === "unitLayouts") return "/dashboard/offplan/unit-layouts";
    if (key === "viewOptions") return "/dashboard/offplan/view-options";
    if (key === "statusOptions") return "/dashboard/offplan/status-options";

    if (key === "roomOptions") return `/dashboard/${parent}/room-options`;
    if (key === "currencies") return `/dashboard/${parent}/currencies`;

    if (key === "salesOfficeOptions") return `/dashboard/${parent}/sales-office-options`;
    if (key === "propertyTypeOptions") return `/dashboard/${parent}/property-type-options`;
    if (key === "houseMaterialOptions") return `/dashboard/${parent}/house-material-options`;

    return "/";
}

function getMenuKeyFromPath(path: string): MenuKey | null {
    const routeMatchers: Array<[MenuKey, (value: string) => boolean]> = [
        ["apartments", (value) => value === "/dashboard/resale/apartments" || value.startsWith("/dashboard/resale/apartments/")],
        ["apartmentTypes", (value) => value === "/dashboard/resale/apartment-types"],
        ["roomOptions", (value) => value === "/dashboard/resale/room-options" || value === "/dashboard/offplan/room-options"],
        ["attributes", (value) => value === "/dashboard/resale/attributes" || value === "/dashboard/offplan/attributes"],
        ["owners", (value) => value === "/dashboard/resale/owners" || value === "/dashboard/offplan/owners"],
        ["locationOptions", (value) => value === "/dashboard/resale/location-options" || value === "/dashboard/offplan/location-options"],
        ["resaleViewOptions", (value) => value === "/dashboard/resale/view-options"],
        ["heatingTypeOptions", (value) => value === "/dashboard/resale/heating-type-options" || value === "/dashboard/offplan/heating-type-options"],
        ["requests", (value) => value === "/dashboard/resale/requests"],
        ["currencies", (value) => value === "/dashboard/resale/currencies" || value === "/dashboard/offplan/currencies"],
        ["salesOfficeOptions", (value) => value === "/dashboard/offplan/sales-office-options" || value === "/dashboard/resale/sales-office-options"],
        ["propertyTypeOptions", (value) => value === "/dashboard/offplan/property-type-options" || value === "/dashboard/resale/property-type-options"],
        ["houseMaterialOptions", (value) => value === "/dashboard/offplan/house-material-options" || value === "/dashboard/resale/house-material-options"],
        ["categories", (value) => value === "/dashboard/offplan/categories"],
        ["objects", (value) => value === "/dashboard/offplan/objects" || /^\/dashboard\/offplan\/objects\/[^/]+\/edit$/.test(value) || value === "/dashboard/offplan/objects/create"],
        ["objectTypes", (value) => value === "/dashboard/offplan/object-types"],
        ["unitLayouts", (value) => value === "/dashboard/offplan/unit-layouts"],
        ["viewOptions", (value) => value === "/dashboard/offplan/view-options"],
        ["statusOptions", (value) => value === "/dashboard/offplan/status-options"],
        ["resale", (value) => value === "/dashboard/resale"],
        ["offplan", (value) => value === "/dashboard/offplan"],
    ];

    return routeMatchers.find(([, matches]) => matches(path))?.[0] ?? null;
}

const RESALE_DONUT_COLORS = ["#4E79FF", "#00C377", "#FFBB00", "#E95B5B", "#7C5CFC", "#14B8A6"];

const formatChartValue = (value: number) =>
    new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value);

const getPrimaryListingPrice = (apartment: Apartment) =>
    apartment.prices?.[0]?.priceTotal ?? apartment.priceTotal ?? 0;

const buildChartPoints = (values: number[]) => {
    const axisMax = Math.max(...values, 1);
    return values.map((value, index) => {
        const x = values.length === 1 ? 50 : (index / (values.length - 1)) * 100;
        const y = 92 - (value / axisMax) * 72;
        return { x, y };
    });
};

const buildLinePath = (points: { x: number; y: number }[]) =>
    points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");

const buildAreaPath = (points: { x: number; y: number }[]) => {
    if (points.length === 0) return "";

    const first = points[0]!;
    const last = points[points.length - 1]!;
    return `${buildLinePath(points)} L ${last.x} 100 L ${first.x} 100 Z`;
};

export function Dashboard() {
    const location = useLocation();
    const navigate = useNavigate();
    const routeParams = useParams<{ id?: string; slug?: string; houseId?: string }>();
    const apartmentId = routeParams.id;
    const isCreatingApartment = location.pathname === "/dashboard/resale/apartments/create";
    const isEditingObject = /^\/dashboard\/offplan\/objects\/[^/]+\/edit$/.test(location.pathname);
    const isCreatingObject = location.pathname === "/dashboard/offplan/objects/create";
    const objectId = isEditingObject ? location.pathname.split("/")[4] : null;
    const activeMenu = getMenuKeyFromPath(location.pathname) ?? "resale";
    const [expandedSections, setExpandedSections] = useState<Set<SectionKey>>(new Set());

    useEffect(() => {
        const parent =
            location.pathname.startsWith("/dashboard/resale") ? "resale" :
            location.pathname.startsWith("/dashboard/offplan") ? "offplan" :
            getParentSection(activeMenu);

        if (parent) {
            setExpandedSections(prev => {
                const next = new Set(prev);
                next.add(parent);
                return next;
            });
        }
    }, [activeMenu, location.pathname]);

    const toggleSection = (key: SectionKey) => {
        setExpandedSections(prev => {
            const next = new Set(prev);
            if (next.has(key)) next.delete(key);
            else next.add(key);
            return next;
        });
    };

    const handleMenuClick = (key: MenuKey, parent: SectionKey) => {
        navigate(getRouteForMenu(key, parent));
    };

    const [unitStats, setUnitStats] = useState<UnitLayoutStats | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [unitLayouts, setUnitLayouts] = useState<UnitLayout[]>([]);
    const [apartments, setApartments] = useState<Apartment[]>([]);
    const [apartmentTypes, setApartmentTypes] = useState<ApartmentType[]>([]);
    const [owners, setOwners] = useState<Owner[]>([]);
    const [attributes, setAttributes] = useState<Attribute[]>([]);
    const [requests, setRequests] = useState<Request[]>([]);
    const [locationOptions, setLocationOptions] = useState<LocationOption[]>([]);
    const [resaleViewOptions, setResaleViewOptions] = useState<ResaleViewOption[]>([]);
    const [heatingTypeOptions, setHeatingTypeOptions] = useState<HeatingTypeOption[]>([]);
    const [resaleRoomOptions, setResaleRoomOptions] = useState<RoomOption[]>([]);
    const [resaleCurrencies, setResaleCurrencies] = useState<Currency[]>([]);
    const [resaleListingsTotal, setResaleListingsTotal] = useState(0);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (activeMenu === "offplan") {
            setLoading(true);
            Promise.all([
                unitLayoutsApi.getStats(),
                categoriesApi.getAll(),
                unitLayoutsApi.getAll({ limit: 500 }),
            ]).then(([statsRes, catsRes, layoutsRes]) => {
                setUnitStats(statsRes.data);
                setCategories(catsRes.data);
                setUnitLayouts(layoutsRes.data.data);
            }).catch(() => {
                setUnitStats(null);
                setCategories([]);
                setUnitLayouts([]);
            }).finally(() => setLoading(false));
        } else if (activeMenu === "resale") {
            setLoading(true);
            Promise.all([
                apartmentsApi.getAll({ limit: 500 }),
                apartmentTypesApi.getAll(),
                ownersApi.getAll(),
                attributesApi.getAll(),
                requestsApi.getAll(),
                locationOptionsApi.getAll(),
                viewOptionsApi.getAll(),
                heatingTypeOptionsApi.getAll(),
                roomOptionsApi.getAll("resale"),
                currenciesApi.getAll(),
            ]).then(([aptsRes, typesRes, ownersRes, attributesRes, requestsRes, locationsRes, viewsRes, heatingRes, roomOptionsRes, currenciesRes]) => {
                setApartments(aptsRes.data.data);
                setResaleListingsTotal(aptsRes.data.pagination.total);
                setApartmentTypes(typesRes.data);
                setOwners(ownersRes.data);
                setAttributes(attributesRes.data);
                setRequests(requestsRes.data);
                setLocationOptions(locationsRes.data);
                setResaleViewOptions(viewsRes.data);
                setHeatingTypeOptions(heatingRes.data);
                setResaleRoomOptions(roomOptionsRes.data);
                setResaleCurrencies(currenciesRes.data);
            }).catch(() => {
                setApartments([]);
                setResaleListingsTotal(0);
                setApartmentTypes([]);
                setOwners([]);
                setAttributes([]);
                setRequests([]);
                setLocationOptions([]);
                setResaleViewOptions([]);
                setHeatingTypeOptions([]);
                setResaleRoomOptions([]);
                setResaleCurrencies([]);
            }).finally(() => setLoading(false));
        }
    }, [activeMenu]);

    const offplanDashboard = useMemo(() => {
        const now = new Date();
        const months: { label: string; count: number }[] = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const label = d.toLocaleString("en", { month: "short" });
            const year = d.getFullYear();
            const month = d.getMonth();
            const count = unitLayouts.filter((u) => {
                const cd = new Date(u.createdAt);
                return cd.getFullYear() === year && cd.getMonth() === month;
            }).length;
            months.push({ label, count });
        }
        const maxCount = Math.max(...months.map((m) => m.count), 1);
        const chartPoints = months.map((m, i) => {
            const x = (i / (months.length - 1)) * 100;
            const y = 100 - (m.count / maxCount) * 80;
            return { x, y, ...m };
        });
        let pathD = "";
        let areaD = "";
        chartPoints.forEach((pt, i) => {
            if (i === 0) {
                pathD += `M ${pt.x} ${pt.y}`;
                areaD += `M ${pt.x} 100 L ${pt.x} ${pt.y}`;
            } else {
                const prev = chartPoints[i - 1]!;
                const cpx1 = prev.x + (pt.x - prev.x) / 3;
                const cpx2 = pt.x - (pt.x - prev.x) / 3;
                pathD += ` C ${cpx1} ${prev.y}, ${cpx2} ${pt.y}, ${pt.x} ${pt.y}`;
                areaD += ` C ${cpx1} ${prev.y}, ${cpx2} ${pt.y}, ${pt.x} ${pt.y}`;
            }
        });
        areaD += ` L ${chartPoints[chartPoints.length - 1]!.x} 100 Z`;

        const total = unitStats?.total ?? 0;
        const available = unitStats?.available ?? 0;
        const sold = unitStats?.sold ?? 0;
        const reserved = unitStats?.reserved ?? 0;
        const circumference = 2 * Math.PI * 50;
        const donutAvailable = total > 0 ? (available / total) * circumference : 0;
        const donutSold = total > 0 ? (sold / total) * circumference : 0;
        const donutReserved = total > 0 ? (reserved / total) * circumference : 0;

        return { months, chartPoints, pathD, areaD, maxCount, donutAvailable, donutSold, donutReserved, total };
    }, [unitLayouts, unitStats]);

    const resaleDashboard = useMemo(() => {
        const totalListings = resaleListingsTotal || apartments.length;
        const activeListings = apartments.filter((apartment) => (apartment.status || "active") === "active").length;
        const pendingListings = apartments.filter((apartment) => apartment.status === "pending").length;
        const nonActiveListings = apartments.filter((apartment) => apartment.status === "non-active").length;
        const pricedListings = apartments.filter((apartment) => getPrimaryListingPrice(apartment) > 0);
        const apartmentsWithSeo = apartments.filter((apartment) =>
            Boolean(
                apartment.seoTitle ||
                apartment.seoDescription ||
                apartment.seoKeywords ||
                apartment.canonicalUrl ||
                apartment.seoImage,
            ),
        ).length;
        const apartmentsWithImages = apartments.filter((apartment) =>
            Boolean(apartment.image || apartment.coverImage || apartment.gallery?.length),
        ).length;
        const saleListings = apartments.filter((apartment) => apartment.purpose !== "rent").length;
        const rentListings = apartments.filter((apartment) => apartment.purpose === "rent").length;
        const averageRooms = apartments.length > 0
            ? apartments.reduce((sum, apartment) => sum + (apartment.roomCount || 0), 0) / apartments.length
            : 0;
        const averageArea = apartments.length > 0
            ? apartments.reduce((sum, apartment) => sum + (apartment.area || 0), 0) / apartments.length
            : 0;
        const listingsWithOwner = apartments.filter((apartment) => apartment.ownerId).length;
        const linkedRequestCount = apartments.reduce((sum, apartment) => sum + (apartment.requestIds?.length || 0), 0);
        const usedRegionCount = new Set(apartments.map((apartment) => apartment.region).filter(Boolean)).size;
        const usedCityCount = new Set(apartments.map((apartment) => apartment.city).filter(Boolean)).size;

        const monthDates = Array.from({ length: 6 }, (_, index) => {
            const date = new Date();
            date.setDate(1);
            date.setHours(0, 0, 0, 0);
            date.setMonth(date.getMonth() - (5 - index));
            return date;
        });

        const listingActivity = monthDates.map((date) => {
            const year = date.getFullYear();
            const month = date.getMonth();
            const count = apartments.filter((apartment) => {
                const createdAt = new Date(apartment.createdAt);
                return createdAt.getFullYear() === year && createdAt.getMonth() === month;
            }).length;

            return {
                label: date.toLocaleString("en-US", { month: "short" }),
                count,
            };
        });

        const chartValues = listingActivity.map((entry) => entry.count);
        const chartPoints = buildChartPoints(chartValues);
        const chartLinePath = buildLinePath(chartPoints);
        const chartAreaPath = buildAreaPath(chartPoints);
        const chartMax = Math.max(...chartValues, 1);
        const chartTicks = Array.from({ length: 6 }, (_, index) => {
            const ratio = (5 - index) / 5;
            return Math.round(chartMax * ratio);
        });
        const highlightedActivityIndex = chartValues.findIndex((value) => value === Math.max(...chartValues));

        const typeCountMap = new Map<string, number>();
        apartments.forEach((apartment) => {
            const label = apartment.apartmentType?.title || "Unassigned";
            typeCountMap.set(label, (typeCountMap.get(label) || 0) + 1);
        });

        const sortedTypeDistribution = Array.from(typeCountMap.entries())
            .map(([label, count]) => ({ label, count }))
            .sort((a, b) => b.count - a.count);

        const topTypes = sortedTypeDistribution.slice(0, 4);
        const remainingTypeCount = sortedTypeDistribution.slice(4).reduce((sum, item) => sum + item.count, 0);
        const typeDistribution = remainingTypeCount > 0
            ? [...topTypes, { label: "Other", count: remainingTypeCount }]
            : topTypes;
        const totalTypeCount = typeDistribution.reduce((sum, item) => sum + item.count, 0) || 1;

        let accumulatedLength = 0;
        const donutCircumference = 2 * Math.PI * 50;
        const donutSegments = typeDistribution.map((item, index) => {
            const segmentLength = (item.count / totalTypeCount) * donutCircumference;
            const segment = {
                ...item,
                color: RESALE_DONUT_COLORS[index % RESALE_DONUT_COLORS.length],
                dasharray: `${segmentLength} ${Math.max(donutCircumference - segmentLength, 0)}`,
                dashoffset: -accumulatedLength,
            };
            accumulatedLength += segmentLength;
            return segment;
        });

        const topCards = [
            {
                label: "Resale Listings",
                value: totalListings,
                hint: `${activeListings} active, ${pendingListings} pending`,
                accent: "text-[#2D9A5B]",
                icon: "/images/pages/inv-dashboard/first-img.svg",
            },
            {
                label: "Priced Listings",
                value: pricedListings.length,
                hint: `${apartmentsWithImages} with images, ${apartmentsWithSeo} with SEO`,
                accent: "text-[#4E525D]",
                icon: "/images/pages/inv-dashboard/third-img.svg",
            },
            {
                label: "Listing Mix",
                value: `${saleListings}/${rentListings}`,
                hint: "sale / rent",
                accent: "text-[#4E525D]",
                icon: "/images/pages/inv-dashboard/second-img.svg",
            },
            {
                label: "Average Footprint",
                value: apartments.length > 0 ? `${averageArea.toFixed(1)} m²` : "0 m²",
                hint: `${averageRooms.toFixed(1)} average rooms`,
                accent: "text-[#4E525D]",
                icon: "/images/pages/inv-dashboard/forth-img.svg",
            },
        ];

        const dataCoverage = [
            { label: "Owners", value: owners.length, hint: `${listingsWithOwner} linked to listings` },
            { label: "Attributes", value: attributes.length, hint: `${apartments.reduce((sum, apartment) => sum + (apartment.attributeIds?.length || 0), 0)} assigned` },
            { label: "Requests", value: requests.length, hint: `${linkedRequestCount} attached to listings` },
            { label: "Regions", value: locationOptions.filter((option) => option.type === "region").length, hint: `${usedRegionCount} already used` },
            { label: "Cities", value: locationOptions.filter((option) => option.type === "city").length, hint: `${usedCityCount} already used` },
            { label: "Views", value: resaleViewOptions.length, hint: `${apartments.reduce((sum, apartment) => sum + (apartment.viewOptionIds?.length || 0), 0)} linked` },
            { label: "Heating", value: heatingTypeOptions.length, hint: `${apartments.reduce((sum, apartment) => sum + (apartment.heatingTypeIds?.length || 0), 0)} linked` },
            { label: "Room Options", value: resaleRoomOptions.length, hint: "resale-specific options" },
            { label: "Currencies", value: resaleCurrencies.length, hint: `${pricedListings.length} listings carry price data` },
        ];

        return {
            topCards,
            chartTicks,
            chartLinePath,
            chartAreaPath,
            chartPoints,
            listingActivity,
            highlightedActivityIndex: highlightedActivityIndex >= 0 ? highlightedActivityIndex : listingActivity.length - 1,
            donutSegments,
            totalListings,
            activeListings,
            pendingListings,
            nonActiveListings,
            averageRooms,
            averageArea,
            dataCoverage,
        };
    }, [
        apartments,
        apartmentTypes,
        attributes,
        heatingTypeOptions,
        locationOptions,
        owners,
        requests,
        resaleCurrencies,
        resaleListingsTotal,
        resaleRoomOptions,
        resaleViewOptions,
    ]);

    return (
        <div className="flex min-h-screen w-full bg-white font-sans overflow-hidden">
            {/* Sidebar Navigation */}
            <div className="w-[240px] bg-white flex flex-col px-4 flex-shrink-0 relative">
                <div className="pointer-events-none absolute top-0 right-0 h-full w-px bg-[#EBEBEB]" />
                <div className="relative -mx-4 flex h-[80px] items-center px-8">
                    <svg width="100" height="22" viewBox="0 0 112 25" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                        <path d="M85.1527 0.458984L79.8945 19.2893H78.3652L73.1025 0.458984H67.9434L74.9692 24.0438H83.223L90.2534 0.458984H85.1527Z" fill="#111212" />
                        <path d="M106.476 24.0438H111.496L103.908 0.458984H96.2162L88.6641 24.0438H93.5579L99.2478 5.1822H100.71L106.476 24.0438Z" fill="#111212" />
                        <path d="M18.8967 4.54827H11.9428V24.6376H7.28285V4.54827H0.292969V0.458984H18.8967V4.54827Z" fill="#111212" />
                        <path d="M26.7537 24.6381H22.0938V0.455078H33.1633C34.4093 0.455078 35.5472 0.660436 36.5818 1.06669C37.6163 1.47294 38.4979 2.04883 39.2311 2.78544C39.9643 3.52204 40.5355 4.40597 40.9493 5.4283C41.3586 6.45062 41.5656 7.57115 41.5656 8.78097C41.5656 10.6113 41.1023 12.2051 40.1802 13.5712C39.2581 14.9372 38.0301 15.9149 36.4963 16.5131C38.5429 19.2006 40.567 21.9104 42.5641 24.6381H37.0046C36.033 23.3837 35.0795 22.1158 34.1529 20.839C33.2218 19.5622 32.2952 18.2631 31.3641 16.9417H26.7537V24.6381ZM26.7537 12.8479H33.1543C33.5726 12.8479 34.0134 12.7631 34.4632 12.5979C34.9175 12.4328 35.3178 12.1783 35.6732 11.839C36.0285 11.4997 36.3209 11.0756 36.5548 10.5667C36.7887 10.0622 36.9011 9.46401 36.9011 8.78097C36.9011 8.42829 36.8562 8.01312 36.7662 7.52651C36.6762 7.0399 36.5008 6.58008 36.2354 6.13812C35.9701 5.69615 35.5922 5.32115 35.1064 5.01312C34.6207 4.70508 33.9684 4.54883 33.1498 4.54883H26.7492V12.8479H26.7537Z" fill="#111212" />
                        <path d="M50.7205 4.54827V10.6018H62.5007V14.7938H50.7205V20.4724H64.003V24.6376H46.0605V0.458984H64.003V4.54827H50.7205Z" fill="#111212" />
                    </svg>
                    <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-px bg-[#EBEBEB]" />
                </div>
                
                <nav className="flex w-full flex-col pt-6">
                    {/* Accordion sections */}
                    {accordionConfig.map((section) => {
                        const isOpen = expandedSections.has(section.key);
                        return (
                            <div key={section.key} className="mb-1">
                                {/* Section header */}
                                <button onClick={() => toggleSection(section.key)}
                                    type="button"
                                    aria-expanded={isOpen}
                                    className="flex items-center gap-3 w-full px-4 h-10 rounded-xl font-medium text-[13px] transition-colors cursor-pointer"
                                    style={{ color: "#808191" }}>
                                    {section.icon}
                                    <span className="flex-1 text-left">{section.label}</span>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                                        style={{ transform: isOpen ? "rotate(0deg)" : "rotate(-90deg)", transition: "transform 0.2s" }}>
                                        <polyline points="6 9 12 15 18 9" />
                                    </svg>
                                </button>

                                {/* Children */}
                                <div
                                    className={`inventory-sidebar__submenu ${isOpen ? "inventory-sidebar__submenu--open" : ""}`}
                                    aria-hidden={!isOpen}
                                >
                                    <div className="inventory-sidebar__submenu-inner inventory-sidebar__submenu-list flex flex-col gap-1">
                                        {section.children.map((item) => {
                                            const to = getRouteForMenu(item.key, section.key);
                                            const isActive = location.pathname === to;

                                            return (
                                                <button
                                                    key={item.key}
                                                    type="button"
                                                    onClick={() => handleMenuClick(item.key, section.key)}
                                                    tabIndex={isOpen ? 0 : -1}
                                                    className="inventory-sidebar__submenu-item relative flex items-center gap-3 rounded-xl font-medium text-[12px] transition-colors cursor-pointer"
                                                    style={{
                                                        background: isActive ? "#4C525E" : "transparent",
                                                        color: isActive ? "#FFFFFF" : "#808191"
                                                    }}
                                                >
                                                    {item.icon}
                                                    {item.label ?? pageNames[item.key]}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </nav>
            </div>
 
            {/* Main Application Container */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header Navbar */}
                <header className="relative h-[80px] w-full bg-white flex items-center justify-between px-8 flex-shrink-0">
                    <div>
                        <h2 className="m-0 text-[#1A1A1A]" style={{ fontWeight: 500, fontSize: 24, lineHeight: "32px", letterSpacing: 0 }}>
                            {pageNames[activeMenu]}
                        </h2>
                        <p className="m-0 mt-0.5 text-[#666666]" style={{ fontWeight: 400, fontSize: 14, lineHeight: "20px", letterSpacing: 0 }}>
                            {pageSubtitles[activeMenu]}
                        </p>
                    </div>

                    <div className="ml-6 flex min-w-0 flex-1 items-center justify-end gap-4">
                        <div className="relative flex min-w-[180px] max-w-[392px] flex-1 items-center" style={{ height: 44 }}>
                            <span className="absolute left-4 pointer-events-none flex items-center justify-center w-5 h-5">
                                <img src="/images/pages/inv-dashboard/search.svg" alt="" className="h-5 w-5" />
                            </span>
                            <input 
                                type="text" 
                                placeholder="Search" 
                                className="w-full h-full pl-12 pr-4 bg-[#F4F5F6] border border-transparent rounded-xl outline-none focus:bg-white focus:border-gray-200"
                                style={{ fontWeight: 400, fontSize: 14, lineHeight: "20px", letterSpacing: 0, color: "#666666" }}
                            />
                        </div>
                        <button className="flex h-11 w-11 flex-shrink-0 items-center justify-center overflow-visible rounded-[16px] border border-white bg-[#EBEBEB] transition-colors">
                            <img src="/images/pages/inv-dashboard/notification.svg" alt="" className="h-4 w-4" />
                        </button>
                        <button className="flex h-11 w-11 flex-shrink-0 items-center justify-center overflow-visible rounded-[16px] border border-white bg-[#EBEBEB] transition-colors">
                            <img src="/images/pages/inv-dashboard/settings.svg" alt="" className="h-4 w-4" />
                        </button>
                    </div>
                    <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-px bg-[#EBEBEB]" />
                </header>

                {/* Off-plan Content */}
                {activeMenu === "offplan" && (
                <main 
                    className="flex-1 p-8 overflow-y-auto flex flex-col gap-6"
                    style={{ background: "var(--background-primary-50, #FFFFFF80)" }}
                >
                    {loading ? (
                        <LoadingSpinner label="Loading overview" className="min-h-[256px]" />
                    ) : (
                    <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                            <div>
                                <p className="m-0 text-[#4E525D]" style={{ fontWeight: 500, fontSize: 14, lineHeight: "20px", letterSpacing: 0 }}>Off-plan Sales</p>
                                <h3 className="mt-2 mb-1 text-[#1A1A1A]" style={{ fontWeight: 600, fontSize: 32, lineHeight: "40px", letterSpacing: 0 }}>{unitStats?.total ?? 0}</h3>
                                <span className="text-[#2D9A5B]" style={{ fontWeight: 400, fontSize: 14, lineHeight: "20px", letterSpacing: 0 }}>+15% from last month</span>
                            </div>
                            <img src="/images/pages/inv-dashboard/first-img.svg" alt="" className="h-10 w-10" />
                        </div>
                        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                            <div>
                                <p className="m-0 text-[#4E525D]" style={{ fontWeight: 500, fontSize: 14, lineHeight: "20px", letterSpacing: 0 }}>Active Projects</p>
                                <h3 className="mt-2 mb-1 text-[#1A1A1A]" style={{ fontWeight: 600, fontSize: 32, lineHeight: "40px", letterSpacing: 0 }}>{categories.length}</h3>
                                <span className="text-[#2D9A5B]" style={{ fontWeight: 400, fontSize: 14, lineHeight: "20px", letterSpacing: 0 }}>+22% from last month</span>
                            </div>
                            <img src="/images/pages/inv-dashboard/second-img.svg" alt="" className="h-10 w-10" />
                        </div>
                        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                            <div>
                                <p className="m-0 text-[#4E525D]" style={{ fontWeight: 500, fontSize: 14, lineHeight: "20px", letterSpacing: 0 }}>Units Sold</p>
                                <h3 className="mt-2 mb-1 text-[#1A1A1A]" style={{ fontWeight: 600, fontSize: 32, lineHeight: "40px", letterSpacing: 0 }}>{unitStats?.sold ?? 0}</h3>
                                <span className="text-[#2D9A5B]" style={{ fontWeight: 400, fontSize: 14, lineHeight: "20px", letterSpacing: 0 }}>+31% from last month</span>
                            </div>
                            <img src="/images/pages/inv-dashboard/third-img.svg" alt="" className="h-10 w-10" />
                        </div>
                        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                            <div>
                                <p className="m-0 text-[#4E525D]" style={{ fontWeight: 500, fontSize: 14, lineHeight: "20px", letterSpacing: 0 }}>Reserved Units</p>
                                <h3 className="mt-2 mb-1 text-[#1A1A1A]" style={{ fontWeight: 600, fontSize: 32, lineHeight: "40px", letterSpacing: 0 }}>{unitStats?.reserved ?? 0}</h3>
                                <span className="text-[#C3362B]" style={{ fontWeight: 400, fontSize: 14, lineHeight: "20px", letterSpacing: 0 }}>-3.2% from last month</span>
                            </div>
                            <img src="/images/pages/inv-dashboard/forth-img.svg" alt="" className="h-10 w-10" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
                            <div className="flex items-center justify-between mb-6">
                                <h4 className="m-0 text-[#1A1A1A]" style={{ fontWeight: 600, fontSize: 16, lineHeight: "20px", letterSpacing: 0 }}>Listing Activity</h4>
                                <span className="text-[#4E525D]" style={{ fontWeight: 400, fontSize: 14, lineHeight: "20px", letterSpacing: 0 }}>Last 6 months performance</span>
                            </div>
                            <div className="relative w-full flex-1 min-h-[260px]">
                                <div className="absolute left-0 top-0 text-right pr-3" style={{ width: 72, bottom: 32 }}>
                                    {[...Array(6)].map((_, i) => (
                                        <span key={i} className="absolute w-full right-0 pr-3 text-[#1A1A1A]" style={{ top: `${i * 20}%`, transform: "translateY(-50%)", fontWeight: 400, fontSize: 12, lineHeight: "18px", letterSpacing: 0 }}>
                                            {Math.round(offplanDashboard.maxCount * (1 - i / 5))}
                                        </span>
                                    ))}
                                </div>
                                <div className="ml-[72px] relative" style={{ height: "calc(100% - 32px)" }}>
                                    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                                        {[...Array(6)].map((_, i) => (
                                            <div key={i} className="border-b border-dotted w-full h-0" style={{ borderColor: "#D0D0D0" }} />
                                        ))}
                                    </div>

                                    <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                                        <defs>
                                            <linearGradient id="listingAreaFill" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#4E525D" stopOpacity="0.35" />
                                                <stop offset="100%" stopColor="#4E525D" stopOpacity="0" />
                                            </linearGradient>
                                        </defs>
                                        <path d={offplanDashboard.areaD} fill="url(#listingAreaFill)" stroke="none" vectorEffect="non-scaling-stroke" />
                                        <path d={offplanDashboard.pathD} fill="none" stroke="#4E525D" strokeWidth="1.4" vectorEffect="non-scaling-stroke" strokeLinecap="round" />
                                    </svg>

                                    {offplanDashboard.chartPoints.map((pt, i) => (
                                        <div key={i} className="absolute flex items-center justify-center" style={{ left: `${pt.x}%`, top: `${pt.y}%` }}>
                                            <div className="w-[14px] h-[14px] rounded-full bg-white" style={{ border: "2px solid #4E525D", transform: "translate(-50%, -50%)" }} />
                                        </div>
                                    ))}
                                </div>

                                <div className="absolute bottom-0 left-[72px] right-0 px-2" style={{ height: 18 }}>
                                    {offplanDashboard.months.map((m, i) => (
                                        <span key={i} className="absolute text-[#1A1A1A]" style={{ left: `${(i / (offplanDashboard.months.length - 1)) * 100}%`, transform: "translateX(-50%)", fontWeight: 400, fontSize: 12, lineHeight: "18px", letterSpacing: 0 }}>
                                            {m.label}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
                            <div>
                                <h4 className="m-0 text-[#2C3E50]" style={{ fontWeight: 600, fontSize: 18, lineHeight: "24px" }}>Unit Distribution</h4>
                                <p className="m-0 mt-1 text-[#7F8C8D]" style={{ fontWeight: 400, fontSize: 14, lineHeight: "20px" }}>Current inventory status</p>
                            </div>
                            <div className="flex flex-1 items-center justify-center relative min-h-[180px] my-4">
                                <svg width="140" height="140" viewBox="0 0 128 128">
                                    <circle cx="64" cy="64" r="50" fill="none" stroke="#0075E3" strokeWidth="13"
                                        strokeDasharray={`${offplanDashboard.donutAvailable} ${offplanDashboard.donutAvailable + offplanDashboard.donutSold + offplanDashboard.donutReserved}`}
                                        strokeLinecap="butt" transform="rotate(184 64 64)" />
                                    <circle cx="64" cy="64" r="50" fill="none" stroke="#00C377" strokeWidth="13"
                                        strokeDasharray={`${offplanDashboard.donutSold} ${offplanDashboard.donutAvailable + offplanDashboard.donutSold + offplanDashboard.donutReserved}`}
                                        strokeLinecap="butt" transform={`rotate(${184 + (offplanDashboard.donutAvailable / (2 * Math.PI * 50)) * 360} 64 64)`} />
                                    <circle cx="64" cy="64" r="50" fill="none" stroke="#FFBB00" strokeWidth="13"
                                        strokeDasharray={`${offplanDashboard.donutReserved} ${offplanDashboard.donutAvailable + offplanDashboard.donutSold + offplanDashboard.donutReserved}`}
                                        strokeLinecap="butt" transform={`rotate(${184 + ((offplanDashboard.donutAvailable + offplanDashboard.donutSold) / (2 * Math.PI * 50)) * 360} 64 64)`} />
                                </svg>
                            </div>
                            <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-[14px] mt-2">
                                <div className="flex items-center gap-2.5 text-[#555555]">
                                    <span className="w-3.5 h-3.5 rounded-full bg-[#0075E3] flex-shrink-0" />
                                    <span>Available <span className="font-semibold text-[#2C3E50] ml-0.5">{unitStats?.available ?? 0}</span></span>
                                </div>
                                <div className="flex items-center gap-2.5 text-[#555555]">
                                    <span className="w-3.5 h-3.5 rounded-full bg-[#00C377] flex-shrink-0" />
                                    <span>Sold <span className="font-semibold text-[#2C3E50] ml-0.5">{unitStats?.sold ?? 0}</span></span>
                                </div>
                                <div className="flex items-center gap-2.5 text-[#555555]">
                                    <span className="w-3.5 h-3.5 rounded-full bg-[#FFBB00] flex-shrink-0" />
                                    <span>Reserved <span className="font-semibold text-[#2C3E50] ml-0.5">{unitStats?.reserved ?? 0}</span></span>
                                </div>
                                <div className="flex items-center gap-2.5 text-[#555555]">
                                    <span className="w-3.5 h-3.5 rounded-full bg-[#E6211B] flex-shrink-0" />
                                    <span>Total <span className="font-semibold text-[#2C3E50] ml-0.5">{offplanDashboard.total}</span></span>
                                </div>
                            </div>
                        </div>
                    </div>
                    </>
                    )}
                </main>
                )}

                {/* Resale Content */}
                {activeMenu === "resale" && (
                <main 
                    className="flex-1 p-8 overflow-y-auto flex flex-col gap-6"
                    style={{ background: "var(--background-primary-50, #FFFFFF80)" }}
                >
                    {loading ? (
                        <LoadingSpinner label="Loading overview" className="min-h-[256px]" />
                    ) : (
                    <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {resaleDashboard.topCards.map((card) => (
                            <div key={card.label} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                                <div>
                                    <p className="m-0 text-[#4E525D]" style={{ fontWeight: 500, fontSize: 14, lineHeight: "20px", letterSpacing: 0 }}>{card.label}</p>
                                    <h3 className="mt-2 mb-1 text-[#1A1A1A]" style={{ fontWeight: 600, fontSize: 32, lineHeight: "40px", letterSpacing: 0 }}>{card.value}</h3>
                                    <span className={card.accent} style={{ fontWeight: 400, fontSize: 14, lineHeight: "20px", letterSpacing: 0 }}>{card.hint}</span>
                                </div>
                                <img src={card.icon} alt="" className="h-10 w-10" />
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h4 className="m-0 text-[#1A1A1A]" style={{ fontWeight: 600, fontSize: 16, lineHeight: "20px", letterSpacing: 0 }}>Listing Activity</h4>
                                    <span className="text-[#4E525D]" style={{ fontWeight: 400, fontSize: 14, lineHeight: "20px", letterSpacing: 0 }}>Listings created in the last 6 months</span>
                                </div>
                                <div className="flex flex-wrap items-center justify-end gap-2 text-xs">
                                    <span className="rounded-full bg-[#E7F6ED] px-3 py-1 font-medium text-[#2D9A5B]">{resaleDashboard.activeListings} active</span>
                                    <span className="rounded-full bg-[#FDF4E0] px-3 py-1 font-medium text-[#967B38]">{resaleDashboard.pendingListings} pending</span>
                                    <span className="rounded-full bg-[#FDECEC] px-3 py-1 font-medium text-[#C3362B]">{resaleDashboard.nonActiveListings} non-active</span>
                                </div>
                            </div>
                            <div className="relative w-full flex-1 min-h-[260px]">
                                <div className="absolute left-0 top-0 text-right pr-3" style={{ width: 72, bottom: 32 }}>
                                    {resaleDashboard.chartTicks.map((tick, index) => (
                                        <span
                                            key={index}
                                            className="absolute w-full right-0 pr-3 text-[#1A1A1A]"
                                            style={{ top: `${index * 20}%`, transform: "translateY(-50%)", fontWeight: 400, fontSize: 12, lineHeight: "18px", letterSpacing: 0 }}
                                        >
                                            {formatChartValue(tick)}
                                        </span>
                                    ))}
                                </div>
                                <div className="ml-[72px] relative" style={{ height: "calc(100% - 32px)" }}>
                                    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                                        <div className="border-b border-dotted w-full h-0" style={{ borderColor: "#D0D0D0" }} />
                                        <div className="border-b border-dotted w-full h-0" style={{ borderColor: "#D0D0D0" }} />
                                        <div className="border-b border-dotted w-full h-0" style={{ borderColor: "#D0D0D0" }} />
                                        <div className="border-b border-dotted w-full h-0" style={{ borderColor: "#D0D0D0" }} />
                                        <div className="border-b border-dotted w-full h-0" style={{ borderColor: "#D0D0D0" }} />
                                        <div className="border-b border-dotted w-full h-0" style={{ borderColor: "#D0D0D0" }} />
                                    </div>

                                    <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                                        <defs>
                                            <linearGradient id="revenueAreaFillResale" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#4E525D" stopOpacity="0.35" />
                                                <stop offset="100%" stopColor="#4E525D" stopOpacity="0" />
                                            </linearGradient>
                                        </defs>
                                        <path d={resaleDashboard.chartAreaPath} fill="url(#revenueAreaFillResale)" stroke="none" vectorEffect="non-scaling-stroke" />
                                        <path d={resaleDashboard.chartLinePath} fill="none" stroke="#4E525D" strokeWidth="1.6" vectorEffect="non-scaling-stroke" strokeLinecap="round" />
                                    </svg>

                                    {resaleDashboard.chartPoints.map((point, index) => {
                                        const isHighlighted = index === resaleDashboard.highlightedActivityIndex;
                                        const activity = resaleDashboard.listingActivity[index]!;

                                        return (
                                            <div key={activity.label} className="absolute" style={{ left: `${point.x}%`, top: `${point.y}%`, width: 0, height: 0 }}>
                                                <div
                                                    className={`absolute rounded-full ${isHighlighted ? "bg-[#4E525D]" : "bg-white"}`}
                                                    style={{
                                                        left: "50%",
                                                        top: "50%",
                                                        width: 14,
                                                        height: 14,
                                                        border: "2px solid #4E525D",
                                                        transform: "translate(-50%, -50%)",
                                                        boxShadow: isHighlighted ? "0px 0px 1px 0px #00000040, 0px 2px 1px 0px #0000000D" : "none",
                                                    }}
                                                />
                                                {isHighlighted ? (
                                                    <>
                                                        <div className="absolute" style={{ left: "50%", bottom: 26, transform: "translateX(-50%)" }}>
                                                            <div className="relative">
                                                                <div className="flex min-w-[54px] items-center justify-center text-white" style={{ height: 42, padding: "12px 16px", borderRadius: 8, background: "#00000080", opacity: 0.8 }}>
                                                                    <span style={{ fontWeight: 500, fontSize: 14, lineHeight: "18px" }}>{activity.count}</span>
                                                                </div>
                                                                <div className="absolute left-1/2 -translate-x-1/2 -bottom-[5px] w-0 h-0" style={{ borderLeft: "5px solid transparent", borderRight: "5px solid transparent", borderTop: "6px solid #00000080" }} />
                                                            </div>
                                                        </div>
                                                        <div className="absolute" style={{ left: "50%", top: 0, height: 60, borderLeft: "2px dashed #4E525D", transform: "translateX(-50%)" }} />
                                                    </>
                                                ) : null}
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="absolute bottom-0 left-[72px] right-0 px-2" style={{ height: 18 }}>
                                    {resaleDashboard.chartPoints.map((point, index) => (
                                        <span
                                            key={resaleDashboard.listingActivity[index]!.label}
                                            className="absolute text-[#1A1A1A]"
                                            style={{ left: `${point.x}%`, transform: "translateX(-50%)", fontWeight: 400, fontSize: 12, lineHeight: "18px", letterSpacing: 0 }}
                                        >
                                            {resaleDashboard.listingActivity[index]!.label}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
                            <div>
                                <h4 className="m-0 text-[#2C3E50]" style={{ fontWeight: 600, fontSize: 18, lineHeight: "24px" }}>Type Distribution</h4>
                                <p className="m-0 mt-1 text-[#7F8C8D]" style={{ fontWeight: 400, fontSize: 14, lineHeight: "20px" }}>Live mix from current resale listings</p>
                            </div>
                            <div className="flex flex-1 items-center justify-center relative min-h-[180px] my-4">
                                <svg width="140" height="140" viewBox="0 0 128 128">
                                    <circle cx="64" cy="64" r="50" fill="none" stroke="#EEF1F4" strokeWidth="13" />
                                    {resaleDashboard.donutSegments.map((segment) => (
                                        <circle
                                            key={segment.label}
                                            cx="64"
                                            cy="64"
                                            r="50"
                                            fill="none"
                                            stroke={segment.color}
                                            strokeWidth="13"
                                            strokeDasharray={segment.dasharray}
                                            strokeDashoffset={segment.dashoffset}
                                            strokeLinecap="butt"
                                            transform="rotate(-90 64 64)"
                                        />
                                    ))}
                                </svg>
                                <div className="absolute flex flex-col items-center justify-center">
                                    <span className="text-[28px] font-semibold leading-none text-[#1A1A1A]">{resaleDashboard.totalListings}</span>
                                    <span className="mt-1 text-[12px] text-[#7F8C8D]">listings</span>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-[14px] mt-2">
                                {resaleDashboard.donutSegments.length > 0 ? resaleDashboard.donutSegments.map((segment) => (
                                    <div key={segment.label} className="flex items-center gap-2.5 text-[#555555]">
                                        <span className="w-3.5 h-3.5 rounded-full flex-shrink-0" style={{ backgroundColor: segment.color }} />
                                        <span>{segment.label} <span className="font-semibold text-[#2C3E50] ml-0.5">{segment.count}</span></span>
                                    </div>
                                )) : (
                                    <div className="col-span-2 rounded-2xl bg-[#F8F9FA] px-4 py-5 text-center text-sm text-[#7F8C8D]">
                                        No listing types are in use yet.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-6">
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <h4 className="m-0 text-[#1A1A1A]" style={{ fontWeight: 600, fontSize: 16, lineHeight: "20px" }}>Data Coverage</h4>
                                    <p className="m-0 mt-1 text-[#7F8C8D]" style={{ fontWeight: 400, fontSize: 14, lineHeight: "20px" }}>Everything already configured for the resale module</p>
                                </div>
                                <div className="rounded-full bg-[#F4F5F6] px-3 py-1 text-xs font-medium text-[#4E525D]">
                                    live inventory snapshot
                                </div>
                            </div>

                            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                                {resaleDashboard.dataCoverage.map((item) => (
                                    <div key={item.label} className="rounded-2xl border border-[#EEF1F4] bg-[#FBFCFD] px-4 py-4">
                                        <div className="text-sm font-medium text-[#4E525D]">{item.label}</div>
                                        <div className="mt-2 text-[28px] font-semibold leading-none text-[#1A1A1A]">{item.value}</div>
                                        <div className="mt-2 text-xs text-[#808191]">{item.hint}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                            <h4 className="m-0 text-[#1A1A1A]" style={{ fontWeight: 600, fontSize: 16, lineHeight: "20px" }}>Listing Quality</h4>
                            <p className="m-0 mt-1 text-[#7F8C8D]" style={{ fontWeight: 400, fontSize: 14, lineHeight: "20px" }}>How complete the current resale inventory looks</p>

                            <div className="mt-5 space-y-4">
                                <div className="rounded-2xl bg-[#F8F9FA] px-4 py-4">
                                    <div className="flex items-center justify-between text-sm text-[#4E525D]">
                                        <span>Average rooms</span>
                                        <span className="font-semibold text-[#1A1A1A]">{resaleDashboard.averageRooms.toFixed(1)}</span>
                                    </div>
                                </div>
                                <div className="rounded-2xl bg-[#F8F9FA] px-4 py-4">
                                    <div className="flex items-center justify-between text-sm text-[#4E525D]">
                                        <span>Average area</span>
                                        <span className="font-semibold text-[#1A1A1A]">{resaleDashboard.averageArea.toFixed(1)} m²</span>
                                    </div>
                                </div>
                                <div className="rounded-2xl bg-[#F8F9FA] px-4 py-4">
                                    <div className="flex items-center justify-between text-sm text-[#4E525D]">
                                        <span>Configured apartment types</span>
                                        <span className="font-semibold text-[#1A1A1A]">{apartmentTypes.length}</span>
                                    </div>
                                </div>
                                <div className="rounded-2xl bg-[#F8F9FA] px-4 py-4">
                                    <div className="flex items-center justify-between text-sm text-[#4E525D]">
                                        <span>Listings with price data</span>
                                        <span className="font-semibold text-[#1A1A1A]">{apartments.filter((apartment) => getPrimaryListingPrice(apartment) > 0).length}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    </>
                    )}
                </main>
                )}

                {/* Management Content Sections */}
                {activeMenu === "categories" && <CategoriesSection />}
                {activeMenu === "objects" && (isCreatingObject ? <ObjectCreatePage embedded /> : objectId ? <ObjectEditPage embedded key={objectId} /> : <OffPlanObjectsSection />)}
                {activeMenu === "objectTypes" && <ObjectTypesSection />}
                {activeMenu === "unitLayouts" && <UnitLayoutsSection />}
                {activeMenu === "viewOptions" && <ViewOptionsSection />}
                {activeMenu === "statusOptions" && <StatusOptionsSection />}
                {activeMenu === "roomOptions" && <RoomOptionsSection />}
                {activeMenu === "currencies" && <CurrenciesSection />}
                {activeMenu === "apartments" && (apartmentId || isCreatingApartment ? <ApartmentForm embedded /> : <ResaleApartmentsCardSection />)}
                {activeMenu === "apartmentTypes" && <ApartmentTypesSection />}
                {activeMenu === "owners" && <OwnersSection />}
                {activeMenu === "locationOptions" && <LocationOptionsSection />}
                {activeMenu === "resaleViewOptions" && <ViewOptionsSection />}
                {activeMenu === "heatingTypeOptions" && <HeatingTypeOptionsSection />}
                {activeMenu === "salesOfficeOptions" && <SalesOfficeOptionsSection />}
                {activeMenu === "propertyTypeOptions" && <PropertyTypeOptionsSection />}
                {activeMenu === "houseMaterialOptions" && <HouseMaterialOptionsSection />}
                {activeMenu === "attributes" && <AttributesSection />}
                {activeMenu === "requests" && <RequestsSection />}
            </div>
        </div>
    );
}
