import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { unitLayoutsApi, type UnitLayoutStats } from "../api/unit-layouts";
import { categoriesApi, type Category } from "../api/categories";
import { apartmentsApi, type Apartment } from "../api/apartments";
import { apartmentTypesApi, type ApartmentType } from "../api/apartment-types";
import { CategoriesSection } from "./dashboard/CategoriesSection";
import { UnitLayoutsSection } from "./dashboard/UnitLayoutsSection";
import { ViewOptionsSection } from "./dashboard/ViewOptionsSection";
import { StatusOptionsSection } from "./dashboard/StatusOptionsSection";
import { RoomOptionsSection } from "./dashboard/RoomOptionsSection";
import { CurrenciesSection } from "./dashboard/CurrenciesSection";
import { ResaleApartmentsCardSection } from "./dashboard/ResaleApartmentsCardSection";
import { ApartmentForm } from "./resale/ApartmentForm";
import { ApartmentTypesSection } from "./dashboard/ApartmentTypesSection";
import { OwnersSection } from "./dashboard/OwnersSection";
import { AttributesSection } from "./dashboard/AttributesSection";
import { RequestsSection } from "./dashboard/RequestsSection";
import { LoadingSpinner } from "../components/LoadingSpinner";

type MenuKey = "offplan" | "resale"
    | "categories" | "unitLayouts" | "viewOptions" | "statusOptions"
    | "roomOptions" | "currencies"
    | "apartments" | "apartmentTypes" | "owners" | "attributes" | "requests";

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
};

type SectionKey = "offplan" | "resale";

const accordionConfig: { key: SectionKey; label: string; icon: React.ReactNode; children: { key: MenuKey; icon: React.ReactNode }[] }[] = [
    {
        key: "resale",
        label: "Resale",
        icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12L5 10M5 10L7 12M5 10V14C5 16.5 7 18 9.5 18" /><path d="M21 12L19 14M19 14L17 12M19 14V10C19 7.5 17 6 14.5 6" /><path d="M9 16C9 17.5 10.5 19 12 19C13.5 19 15 17.5 15 16C15 14.5 13.5 13 12 13C10.5 13 9 14.5 9 16Z" /></svg>,
        children: [
            { key: "resale", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg> },
            { key: "apartments", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg> },
            { key: "apartmentTypes", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg> },
            { key: "roomOptions", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg> },
            { key: "attributes", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="4" y1="21" x2="4" y2="14" /><line x1="4" y1="10" x2="4" y2="3" /><line x1="12" y1="21" x2="12" y2="12" /><line x1="12" y1="8" x2="12" y2="3" /><line x1="20" y1="21" x2="20" y2="16" /><line x1="20" y1="12" x2="20" y2="3" /><line x1="1" y1="14" x2="7" y2="14" /><line x1="9" y1="8" x2="15" y2="8" /><line x1="17" y1="16" x2="23" y2="16" /></svg> },
            { key: "owners", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg> },
            { key: "requests", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg> },
            { key: "currencies", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" /><path d="M12 18V6" /></svg> },
        ],
    },
    {
        key: "offplan",
        label: "Off-plan",
        icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21H21M12 3L3 10V21H9V14H15V21H21V10L12 3Z" /><rect x="10" y="14" width="4" height="7" /><path d="M8 7L16 7" /><path d="M9 5L12 3L15 5" /></svg>,
        children: [
            { key: "offplan", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg> },
            { key: "categories", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></svg> },
            { key: "unitLayouts", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="2" width="16" height="20" rx="2" ry="2" /><line x1="9" y1="22" x2="9" y2="2" /><line x1="15" y1="22" x2="15" y2="2" /></svg> },
            { key: "viewOptions", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /></svg> },
            { key: "statusOptions", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg> },
            { key: "roomOptions", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg> },
            { key: "currencies", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" /><path d="M12 18V6" /></svg> },
        ],
    },
];

const getParentSection = (key: MenuKey): SectionKey | null => {
    if (key === "offplan" || key === "categories" || key === "unitLayouts" || key === "viewOptions" || key === "statusOptions") return "offplan";
    return "resale";
};

function getRouteForMenu(key: MenuKey, parent: SectionKey): string {
    if (key === "resale") return "/dashboard/resale";
    if (key === "offplan") return "/dashboard/offplan";

    if (key === "apartments") return "/dashboard/resale/apartments";
    if (key === "apartmentTypes") return "/dashboard/resale/apartment-types";
    if (key === "owners") return "/dashboard/resale/owners";
    if (key === "attributes") return "/dashboard/resale/attributes";
    if (key === "requests") return "/dashboard/resale/requests";

    if (key === "categories") return "/dashboard/offplan/categories";
    if (key === "unitLayouts") return "/dashboard/offplan/unit-layouts";
    if (key === "viewOptions") return "/dashboard/offplan/view-options";
    if (key === "statusOptions") return "/dashboard/offplan/status-options";

    if (key === "roomOptions") return `/dashboard/${parent}/room-options`;
    if (key === "currencies") return `/dashboard/${parent}/currencies`;

    return "/";
}

function getMenuKeyFromPath(path: string): MenuKey | null {
    const routeMatchers: Array<[MenuKey, (value: string) => boolean]> = [
        ["apartments", (value) => value === "/dashboard/resale/apartments" || value.startsWith("/dashboard/resale/apartments/")],
        ["apartmentTypes", (value) => value === "/dashboard/resale/apartment-types"],
        ["roomOptions", (value) => value === "/dashboard/resale/room-options" || value === "/dashboard/offplan/room-options"],
        ["attributes", (value) => value === "/dashboard/resale/attributes"],
        ["owners", (value) => value === "/dashboard/resale/owners"],
        ["requests", (value) => value === "/dashboard/resale/requests"],
        ["currencies", (value) => value === "/dashboard/resale/currencies" || value === "/dashboard/offplan/currencies"],
        ["categories", (value) => value === "/dashboard/offplan/categories"],
        ["unitLayouts", (value) => value === "/dashboard/offplan/unit-layouts"],
        ["viewOptions", (value) => value === "/dashboard/offplan/view-options"],
        ["statusOptions", (value) => value === "/dashboard/offplan/status-options"],
        ["resale", (value) => value === "/dashboard/resale"],
        ["offplan", (value) => value === "/dashboard/offplan"],
    ];

    return routeMatchers.find(([, matches]) => matches(path))?.[0] ?? null;
}

export function Dashboard() {
    const location = useLocation();
    const navigate = useNavigate();
    const { id: apartmentId } = useParams();
    const isCreatingApartment = location.pathname === "/dashboard/resale/apartments/create";
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
    const [apartments, setApartments] = useState<Apartment[]>([]);
    const [apartmentTypes, setApartmentTypes] = useState<ApartmentType[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (activeMenu === "offplan") {
            setLoading(true);
            Promise.all([
                unitLayoutsApi.getStats(),
                categoriesApi.getAll(),
            ]).then(([statsRes, catsRes]) => {
                setUnitStats(statsRes.data);
                setCategories(catsRes.data);
            }).catch(() => {
                setUnitStats(null);
                setCategories([]);
            }).finally(() => setLoading(false));
        } else if (activeMenu === "resale") {
            setLoading(true);
            Promise.all([
                apartmentsApi.getAll({ limit: 100 }),
                apartmentTypesApi.getAll(),
            ]).then(([aptsRes, typesRes]) => {
                setApartments(aptsRes.data.data);
                setApartmentTypes(typesRes.data);
            }).catch(() => {
                setApartments([]);
                setApartmentTypes([]);
            }).finally(() => setLoading(false));
        }
    }, [activeMenu]);

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
                                {isOpen && (
                                    <div className="flex flex-col gap-0.5 ml-2">
                                        {section.children.map((item) => {
                                            const to = getRouteForMenu(item.key, section.key);
                                            const isActive = location.pathname === to;

                                            return (
                                                <button
                                                    key={item.key}
                                                    type="button"
                                                    onClick={() => handleMenuClick(item.key, section.key)}
                                                    className="relative flex items-center gap-3 px-4 h-9 rounded-xl font-medium text-[12px] transition-colors cursor-pointer"
                                                    style={{
                                                        background: isActive ? "#4C525E" : "transparent",
                                                        color: isActive ? "#FFFFFF" : "#808191"
                                                    }}
                                                >
                                                    {item.icon}
                                                    {pageNames[item.key]}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
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
                                <h4 className="m-0 text-[#1A1A1A]" style={{ fontWeight: 600, fontSize: 16, lineHeight: "20px", letterSpacing: 0 }}>Revenue Overview</h4>
                                <span className="text-[#4E525D]" style={{ fontWeight: 400, fontSize: 14, lineHeight: "20px", letterSpacing: 0 }}>Last 6 months performance</span>
                            </div>
                            <div className="relative w-full flex-1 min-h-[260px]">
                                <div className="absolute left-0 top-0 text-right pr-3" style={{ width: 72, bottom: 32 }}>
                                    <span className="absolute w-full right-0 pr-3 text-[#1A1A1A]" style={{ top: "0%", transform: "translateY(-50%)", fontWeight: 400, fontSize: 12, lineHeight: "18px", letterSpacing: 0 }}>2200000</span>
                                    <span className="absolute w-full right-0 pr-3 text-[#1A1A1A]" style={{ top: "20%", transform: "translateY(-50%)", fontWeight: 400, fontSize: 12, lineHeight: "18px", letterSpacing: 0 }}>1650000</span>
                                    <span className="absolute w-full right-0 pr-3 text-[#1A1A1A]" style={{ top: "40%", transform: "translateY(-50%)", fontWeight: 400, fontSize: 12, lineHeight: "18px", letterSpacing: 0 }}>1100000</span>
                                    <span className="absolute w-full right-0 pr-3 text-[#1A1A1A]" style={{ top: "60%", transform: "translateY(-50%)", fontWeight: 400, fontSize: 12, lineHeight: "18px", letterSpacing: 0 }}>550000</span>
                                    <span className="absolute w-full right-0 pr-3 text-[#1A1A1A]" style={{ top: "80%", transform: "translateY(-50%)", fontWeight: 400, fontSize: 12, lineHeight: "18px", letterSpacing: 0 }}>100</span>
                                    <span className="absolute w-full right-0 pr-3 text-[#1A1A1A]" style={{ top: "100%", transform: "translateY(-50%)", fontWeight: 400, fontSize: 12, lineHeight: "18px", letterSpacing: 0 }}>0</span>
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
                                            <linearGradient id="revenueAreaFill" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#4E525D" stopOpacity="0.35" />
                                                <stop offset="100%" stopColor="#4E525D" stopOpacity="0" />
                                            </linearGradient>
                                        </defs>
                                        <path d="M 0 55 C 2 53, 3 52, 5 51 C 9 45, 13 38, 16 38 C 19 38, 20 42, 22 46 C 26 54, 33 65, 38 73 C 42 80, 45 82, 48 82 C 51 82, 53 74, 55 69 C 59 59, 65 53, 68 53 C 70 53, 71 54, 72 55 C 75 58, 78 59, 80 59 C 84 59, 87 48, 90 40 C 94 30, 98 20, 100 15 L 100 100 L 0 100 Z" fill="url(#revenueAreaFill)" stroke="none" vectorEffect="non-scaling-stroke" />
                                        <path d="M 0 55 C 2 53, 3 52, 5 51 C 9 45, 13 38, 16 38 C 19 38, 20 42, 22 46 C 26 54, 33 65, 38 73 C 42 80, 45 82, 48 82 C 51 82, 53 74, 55 69 C 59 59, 65 53, 68 53 C 70 53, 71 54, 72 55 C 75 58, 78 59, 80 59 C 84 59, 87 48, 90 40 C 94 30, 98 20, 100 15" fill="none" stroke="#4E525D" strokeWidth="1.4" vectorEffect="non-scaling-stroke" strokeLinecap="round" />
                                    </svg>

                                    <div className="absolute flex items-center justify-center" style={{ left: "5%", top: "51%" }}>
                                        <div className="w-[14px] h-[14px] rounded-full bg-white" style={{ border: "2px solid #4E525D", transform: "translate(-50%, -50%)" }} />
                                    </div>
                                    <div className="absolute flex items-center justify-center" style={{ left: "22%", top: "46%" }}>
                                        <div className="w-[14px] h-[14px] rounded-full bg-white" style={{ border: "2px solid #4E525D", transform: "translate(-50%, -50%)" }} />
                                    </div>
                                    <div className="absolute" style={{ left: "38%", top: "73%", width: 0, height: 0 }}>
                                        <div className="absolute w-[14px] h-[14px] rounded-full bg-[#4E525D]" style={{ left: "50%", top: "50%", transform: "translate(-50%, -50%)", boxShadow: "0px 0px 1px 0px #00000040, 0px 2px 1px 0px #0000000D" }} />
                                        <div className="absolute" style={{ left: "50%", bottom: 26, transform: "translateX(-50%)" }}>
                                            <div className="relative">
                                                <div className="flex items-center justify-center text-white" style={{ width: 45, height: 42, padding: "12px 16px", borderRadius: 8, background: "#00000080", opacity: 0.8 }}>
                                                    <span style={{ fontWeight: 500, fontSize: 14, lineHeight: "18px" }}>10</span>
                                                </div>
                                                <div className="absolute left-1/2 -translate-x-1/2 -bottom-[5px] w-0 h-0" style={{ borderLeft: "5px solid transparent", borderRight: "5px solid transparent", borderTop: "6px solid #00000080" }} />
                                            </div>
                                        </div>
                                        <div className="absolute" style={{ left: "50%", top: 0, height: 60, borderLeft: "2px dashed #4E525D", transform: "translateX(-50%)" }} />
                                    </div>
                                    <div className="absolute flex items-center justify-center" style={{ left: "55%", top: "69%" }}>
                                        <div className="w-[14px] h-[14px] rounded-full bg-white" style={{ border: "2px solid #4E525D", transform: "translate(-50%, -50%)" }} />
                                    </div>
                                    <div className="absolute flex items-center justify-center" style={{ left: "72%", top: "55%" }}>
                                        <div className="w-[14px] h-[14px] rounded-full bg-white" style={{ border: "2px solid #4E525D", transform: "translate(-50%, -50%)" }} />
                                    </div>
                                    <div className="absolute flex items-center justify-center" style={{ left: "90%", top: "40%" }}>
                                        <div className="w-[14px] h-[14px] rounded-full bg-white" style={{ border: "2px solid #4E525D", transform: "translate(-50%, -50%)" }} />
                                    </div>
                                </div>

                                <div className="absolute bottom-0 left-[72px] right-0 px-2" style={{ height: 18 }}>
                                    <span className="absolute text-[#1A1A1A]" style={{ left: "5%", transform: "translateX(-50%)", fontWeight: 400, fontSize: 12, lineHeight: "18px", letterSpacing: 0 }}>Jan</span>
                                    <span className="absolute text-[#1A1A1A]" style={{ left: "22%", transform: "translateX(-50%)", fontWeight: 400, fontSize: 12, lineHeight: "18px", letterSpacing: 0 }}>Feb</span>
                                    <span className="absolute text-[#1A1A1A]" style={{ left: "38%", transform: "translateX(-50%)", fontWeight: 400, fontSize: 12, lineHeight: "18px", letterSpacing: 0 }}>Mar</span>
                                    <span className="absolute text-[#1A1A1A]" style={{ left: "55%", transform: "translateX(-50%)", fontWeight: 400, fontSize: 12, lineHeight: "18px", letterSpacing: 0 }}>Apr</span>
                                    <span className="absolute text-[#1A1A1A]" style={{ left: "72%", transform: "translateX(-50%)", fontWeight: 400, fontSize: 12, lineHeight: "18px", letterSpacing: 0 }}>May</span>
                                    <span className="absolute text-[#1A1A1A]" style={{ left: "90%", transform: "translateX(-50%)", fontWeight: 400, fontSize: 12, lineHeight: "18px", letterSpacing: 0 }}>Jun</span>
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
                                    <circle cx="64" cy="64" r="50" fill="none" stroke="#00C377" strokeWidth="13"
                                        strokeDasharray="150.1 164.1" strokeLinecap="butt" transform="rotate(184 64 64)" />
                                    <circle cx="64" cy="64" r="50" fill="none" stroke="#FFBB00" strokeWidth="13"
                                        strokeDasharray="57.6 256.6" strokeLinecap="butt" transform="rotate(4 64 64)" />
                                    <circle cx="64" cy="64" r="50" fill="none" stroke="#0075E3" strokeWidth="13"
                                        strokeDasharray="68.1 246.1" strokeLinecap="butt" transform="rotate(76 64 64)" />
                                    <circle cx="64" cy="64" r="50" fill="none" stroke="#E6211B" strokeWidth="13"
                                        strokeDasharray="15.7 298.5" strokeLinecap="butt" transform="rotate(160 64 64)" />
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
                                    <span>Active <span className="font-semibold text-[#2C3E50] ml-0.5">{categories.length}</span></span>
                                </div>
                                <div className="flex items-center gap-2.5 text-[#555555]">
                                    <span className="w-3.5 h-3.5 rounded-full bg-[#E6211B] flex-shrink-0" />
                                    <span>Reserved <span className="font-semibold text-[#2C3E50] ml-0.5">{unitStats?.reserved ?? 0}</span></span>
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
                        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                            <div>
                                <p className="m-0 text-[#4E525D]" style={{ fontWeight: 500, fontSize: 14, lineHeight: "20px", letterSpacing: 0 }}>Resale Listings</p>
                                <h3 className="mt-2 mb-1 text-[#1A1A1A]" style={{ fontWeight: 600, fontSize: 32, lineHeight: "40px", letterSpacing: 0 }}>{apartments.length}</h3>
                                <span className="text-[#2D9A5B]" style={{ fontWeight: 400, fontSize: 14, lineHeight: "20px", letterSpacing: 0 }}>+9% from last month</span>
                            </div>
                            <img src="/images/pages/inv-dashboard/first-img.svg" alt="" className="h-10 w-10" />
                        </div>
                        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                            <div>
                                <p className="m-0 text-[#4E525D]" style={{ fontWeight: 500, fontSize: 14, lineHeight: "20px", letterSpacing: 0 }}>Apartment Types</p>
                                <h3 className="mt-2 mb-1 text-[#1A1A1A]" style={{ fontWeight: 600, fontSize: 32, lineHeight: "40px", letterSpacing: 0 }}>{apartmentTypes.length}</h3>
                                <span className="text-[#2D9A5B]" style={{ fontWeight: 400, fontSize: 14, lineHeight: "20px", letterSpacing: 0 }}>+5% from last month</span>
                            </div>
                            <img src="/images/pages/inv-dashboard/second-img.svg" alt="" className="h-10 w-10" />
                        </div>
                        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                            <div>
                                <p className="m-0 text-[#4E525D]" style={{ fontWeight: 500, fontSize: 14, lineHeight: "20px", letterSpacing: 0 }}>With Prices</p>
                                <h3 className="mt-2 mb-1 text-[#1A1A1A]" style={{ fontWeight: 600, fontSize: 32, lineHeight: "40px", letterSpacing: 0 }}>{apartments.filter(a => a.prices && a.prices.length > 0).length}</h3>
                                <span className="text-[#2D9A5B]" style={{ fontWeight: 400, fontSize: 14, lineHeight: "20px", letterSpacing: 0 }}>+18% from last month</span>
                            </div>
                            <img src="/images/pages/inv-dashboard/third-img.svg" alt="" className="h-10 w-10" />
                        </div>
                        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                            <div>
                                <p className="m-0 text-[#4E525D]" style={{ fontWeight: 500, fontSize: 14, lineHeight: "20px", letterSpacing: 0 }}>Avg Room Count</p>
                                <h3 className="mt-2 mb-1 text-[#1A1A1A]" style={{ fontWeight: 600, fontSize: 32, lineHeight: "40px", letterSpacing: 0 }}>
                                    {apartments.length > 0 ? (apartments.reduce((s, a) => s + a.roomCount, 0) / apartments.length).toFixed(1) : "0"}
                                </h3>
                                <span className="text-[#C3362B]" style={{ fontWeight: 400, fontSize: 14, lineHeight: "20px", letterSpacing: 0 }}>-1.8% from last month</span>
                            </div>
                            <img src="/images/pages/inv-dashboard/forth-img.svg" alt="" className="h-10 w-10" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
                            <div className="flex items-center justify-between mb-6">
                                <h4 className="m-0 text-[#1A1A1A]" style={{ fontWeight: 600, fontSize: 16, lineHeight: "20px", letterSpacing: 0 }}>Revenue Overview</h4>
                                <span className="text-[#4E525D]" style={{ fontWeight: 400, fontSize: 14, lineHeight: "20px", letterSpacing: 0 }}>Last 6 months performance</span>
                            </div>
                            <div className="relative w-full flex-1 min-h-[260px]">
                                <div className="absolute left-0 top-0 text-right pr-3" style={{ width: 72, bottom: 32 }}>
                                    <span className="absolute w-full right-0 pr-3 text-[#1A1A1A]" style={{ top: "0%", transform: "translateY(-50%)", fontWeight: 400, fontSize: 12, lineHeight: "18px", letterSpacing: 0 }}>2200000</span>
                                    <span className="absolute w-full right-0 pr-3 text-[#1A1A1A]" style={{ top: "20%", transform: "translateY(-50%)", fontWeight: 400, fontSize: 12, lineHeight: "18px", letterSpacing: 0 }}>1650000</span>
                                    <span className="absolute w-full right-0 pr-3 text-[#1A1A1A]" style={{ top: "40%", transform: "translateY(-50%)", fontWeight: 400, fontSize: 12, lineHeight: "18px", letterSpacing: 0 }}>1100000</span>
                                    <span className="absolute w-full right-0 pr-3 text-[#1A1A1A]" style={{ top: "60%", transform: "translateY(-50%)", fontWeight: 400, fontSize: 12, lineHeight: "18px", letterSpacing: 0 }}>550000</span>
                                    <span className="absolute w-full right-0 pr-3 text-[#1A1A1A]" style={{ top: "80%", transform: "translateY(-50%)", fontWeight: 400, fontSize: 12, lineHeight: "18px", letterSpacing: 0 }}>100</span>
                                    <span className="absolute w-full right-0 pr-3 text-[#1A1A1A]" style={{ top: "100%", transform: "translateY(-50%)", fontWeight: 400, fontSize: 12, lineHeight: "18px", letterSpacing: 0 }}>0</span>
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
                                        <path d="M 0 55 C 2 53, 3 52, 5 51 C 9 45, 13 38, 16 38 C 19 38, 20 42, 22 46 C 26 54, 33 65, 38 73 C 42 80, 45 82, 48 82 C 51 82, 53 74, 55 69 C 59 59, 65 53, 68 53 C 70 53, 71 54, 72 55 C 75 58, 78 59, 80 59 C 84 59, 87 48, 90 40 C 94 30, 98 20, 100 15 L 100 100 L 0 100 Z" fill="url(#revenueAreaFillResale)" stroke="none" vectorEffect="non-scaling-stroke" />
                                        <path d="M 0 55 C 2 53, 3 52, 5 51 C 9 45, 13 38, 16 38 C 19 38, 20 42, 22 46 C 26 54, 33 65, 38 73 C 42 80, 45 82, 48 82 C 51 82, 53 74, 55 69 C 59 59, 65 53, 68 53 C 70 53, 71 54, 72 55 C 75 58, 78 59, 80 59 C 84 59, 87 48, 90 40 C 94 30, 98 20, 100 15" fill="none" stroke="#4E525D" strokeWidth="1.4" vectorEffect="non-scaling-stroke" strokeLinecap="round" />
                                    </svg>

                                    <div className="absolute flex items-center justify-center" style={{ left: "5%", top: "51%" }}>
                                        <div className="w-[14px] h-[14px] rounded-full bg-white" style={{ border: "2px solid #4E525D", transform: "translate(-50%, -50%)" }} />
                                    </div>
                                    <div className="absolute flex items-center justify-center" style={{ left: "22%", top: "46%" }}>
                                        <div className="w-[14px] h-[14px] rounded-full bg-white" style={{ border: "2px solid #4E525D", transform: "translate(-50%, -50%)" }} />
                                    </div>
                                    <div className="absolute" style={{ left: "38%", top: "73%", width: 0, height: 0 }}>
                                        <div className="absolute w-[14px] h-[14px] rounded-full bg-[#4E525D]" style={{ left: "50%", top: "50%", transform: "translate(-50%, -50%)", boxShadow: "0px 0px 1px 0px #00000040, 0px 2px 1px 0px #0000000D" }} />
                                        <div className="absolute" style={{ left: "50%", bottom: 26, transform: "translateX(-50%)" }}>
                                            <div className="relative">
                                                <div className="flex items-center justify-center text-white" style={{ width: 45, height: 42, padding: "12px 16px", borderRadius: 8, background: "#00000080", opacity: 0.8 }}>
                                                    <span style={{ fontWeight: 500, fontSize: 14, lineHeight: "18px" }}>10</span>
                                                </div>
                                                <div className="absolute left-1/2 -translate-x-1/2 -bottom-[5px] w-0 h-0" style={{ borderLeft: "5px solid transparent", borderRight: "5px solid transparent", borderTop: "6px solid #00000080" }} />
                                            </div>
                                        </div>
                                        <div className="absolute" style={{ left: "50%", top: 0, height: 60, borderLeft: "2px dashed #4E525D", transform: "translateX(-50%)" }} />
                                    </div>
                                    <div className="absolute flex items-center justify-center" style={{ left: "55%", top: "69%" }}>
                                        <div className="w-[14px] h-[14px] rounded-full bg-white" style={{ border: "2px solid #4E525D", transform: "translate(-50%, -50%)" }} />
                                    </div>
                                    <div className="absolute flex items-center justify-center" style={{ left: "72%", top: "55%" }}>
                                        <div className="w-[14px] h-[14px] rounded-full bg-white" style={{ border: "2px solid #4E525D", transform: "translate(-50%, -50%)" }} />
                                    </div>
                                    <div className="absolute flex items-center justify-center" style={{ left: "90%", top: "40%" }}>
                                        <div className="w-[14px] h-[14px] rounded-full bg-white" style={{ border: "2px solid #4E525D", transform: "translate(-50%, -50%)" }} />
                                    </div>
                                </div>

                                <div className="absolute bottom-0 left-[72px] right-0 px-2" style={{ height: 18 }}>
                                    <span className="absolute text-[#1A1A1A]" style={{ left: "5%", transform: "translateX(-50%)", fontWeight: 400, fontSize: 12, lineHeight: "18px", letterSpacing: 0 }}>Jan</span>
                                    <span className="absolute text-[#1A1A1A]" style={{ left: "22%", transform: "translateX(-50%)", fontWeight: 400, fontSize: 12, lineHeight: "18px", letterSpacing: 0 }}>Feb</span>
                                    <span className="absolute text-[#1A1A1A]" style={{ left: "38%", transform: "translateX(-50%)", fontWeight: 400, fontSize: 12, lineHeight: "18px", letterSpacing: 0 }}>Mar</span>
                                    <span className="absolute text-[#1A1A1A]" style={{ left: "55%", transform: "translateX(-50%)", fontWeight: 400, fontSize: 12, lineHeight: "18px", letterSpacing: 0 }}>Apr</span>
                                    <span className="absolute text-[#1A1A1A]" style={{ left: "72%", transform: "translateX(-50%)", fontWeight: 400, fontSize: 12, lineHeight: "18px", letterSpacing: 0 }}>May</span>
                                    <span className="absolute text-[#1A1A1A]" style={{ left: "90%", transform: "translateX(-50%)", fontWeight: 400, fontSize: 12, lineHeight: "18px", letterSpacing: 0 }}>Jun</span>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
                            <div>
                                <h4 className="m-0 text-[#2C3E50]" style={{ fontWeight: 600, fontSize: 18, lineHeight: "24px" }}>Type Distribution</h4>
                                <p className="m-0 mt-1 text-[#7F8C8D]" style={{ fontWeight: 400, fontSize: 14, lineHeight: "20px" }}>By apartment type</p>
                            </div>
                            <div className="flex flex-1 items-center justify-center relative min-h-[180px] my-4">
                                <svg width="140" height="140" viewBox="0 0 128 128">
                                    <circle cx="64" cy="64" r="50" fill="none" stroke="#00C377" strokeWidth="13"
                                        strokeDasharray="150.1 164.1" strokeLinecap="butt" transform="rotate(184 64 64)" />
                                    <circle cx="64" cy="64" r="50" fill="none" stroke="#FFBB00" strokeWidth="13"
                                        strokeDasharray="57.6 256.6" strokeLinecap="butt" transform="rotate(4 64 64)" />
                                    <circle cx="64" cy="64" r="50" fill="none" stroke="#0075E3" strokeWidth="13"
                                        strokeDasharray="68.1 246.1" strokeLinecap="butt" transform="rotate(76 64 64)" />
                                    <circle cx="64" cy="64" r="50" fill="none" stroke="#E6211B" strokeWidth="13"
                                        strokeDasharray="15.7 298.5" strokeLinecap="butt" transform="rotate(160 64 64)" />
                                </svg>
                            </div>
                            <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-[14px] mt-2">
                                <div className="flex items-center gap-2.5 text-[#555555]">
                                    <span className="w-3.5 h-3.5 rounded-full bg-[#0075E3] flex-shrink-0" />
                                    <span>{apartmentTypes[0]?.title ?? "Type A"} <span className="font-semibold text-[#2C3E50] ml-0.5">{apartments.filter(a => a.apartmentType?.id === apartmentTypes[0]?.id).length}</span></span>
                                </div>
                                <div className="flex items-center gap-2.5 text-[#555555]">
                                    <span className="w-3.5 h-3.5 rounded-full bg-[#00C377] flex-shrink-0" />
                                    <span>{apartmentTypes[1]?.title ?? "Type B"} <span className="font-semibold text-[#2C3E50] ml-0.5">{apartments.filter(a => a.apartmentType?.id === apartmentTypes[1]?.id).length}</span></span>
                                </div>
                                <div className="flex items-center gap-2.5 text-[#555555]">
                                    <span className="w-3.5 h-3.5 rounded-full bg-[#FFBB00] flex-shrink-0" />
                                    <span>{apartmentTypes[2]?.title ?? "Type C"} <span className="font-semibold text-[#2C3E50] ml-0.5">{apartments.filter(a => a.apartmentType?.id === apartmentTypes[2]?.id).length}</span></span>
                                </div>
                                <div className="flex items-center gap-2.5 text-[#555555]">
                                    <span className="w-3.5 h-3.5 rounded-full bg-[#E6211B] flex-shrink-0" />
                                    <span>{apartmentTypes[3]?.title ?? "Other"} <span className="font-semibold text-[#2C3E50] ml-0.5">{apartments.filter(a => !apartmentTypes.slice(0, 3).some(t => t.id === a.apartmentType?.id)).length}</span></span>
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
                {activeMenu === "unitLayouts" && <UnitLayoutsSection />}
                {activeMenu === "viewOptions" && <ViewOptionsSection />}
                {activeMenu === "statusOptions" && <StatusOptionsSection />}
                {activeMenu === "roomOptions" && <RoomOptionsSection />}
                {activeMenu === "currencies" && <CurrenciesSection />}
                {activeMenu === "apartments" && (apartmentId || isCreatingApartment ? <ApartmentForm embedded /> : <ResaleApartmentsCardSection />)}
                {activeMenu === "apartmentTypes" && <ApartmentTypesSection />}
                {activeMenu === "owners" && <OwnersSection />}
                {activeMenu === "attributes" && <AttributesSection />}
                {activeMenu === "requests" && <RequestsSection />}
            </div>
        </div>
    );
}
