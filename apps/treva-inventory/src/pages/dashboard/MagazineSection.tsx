import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { housesApi, type House } from "../../api/houses";
import { unitLayoutsApi, UNIT_LAYOUT_STATUS_OPTIONS, type UnitLayout } from "../../api/unit-layouts";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { useMessageCenter } from "../../components/MessageCenter";
import { UnitLayoutsSection, FilterSelect } from "./UnitLayoutsSection";
import { HouseForm as UnitLayoutInlineForm } from "./UnitLayoutInlineForm";
import { ImageLightbox } from "../../components/ImageLightbox";
import { IoClose, IoEyeOutline } from "react-icons/io5";

const statusTextMap: Record<string, string> = {
    available: "text-[#2D9A5B]",
    reserved: "text-[#C98A00]",
    sold: "text-[#C3362B]",
};

const statusLabelMap: Record<string, string> = {
    available: "Available",
    reserved: "Reserved",
    sold: "Sold",
};

function formatPrice(prices: Record<string, number> | undefined) {
    if (!prices || Object.keys(prices).length === 0) return null;
    const [currency, amount] = Object.entries(prices)[0] || [];
    if (!currency || amount === undefined) return null;
    return currency === "USD" ? `$${Number(amount).toLocaleString()}` : `${currency} ${Number(amount).toLocaleString()}`;
}

const GRID_LEGEND = {
    available: { label: "Available", dot: "bg-emerald-400", cell: "bg-emerald-100" },
    reserved: { label: "Reserved", dot: "bg-amber-400", cell: "bg-amber-100" },
    sold: { label: "Sold", dot: "bg-rose-400", cell: "bg-rose-100" },
    blocked: { label: "Blocked", dot: "bg-gray-400", cell: "bg-gray-200" },
} as const;

const GRID_LEGEND_ORDER: Array<keyof typeof GRID_LEGEND> = ["available", "reserved", "sold", "blocked"];

const FILL_CARDS = [
    { key: "grid" as const, label: "Grid", icon: "/images/inv-dashboard/inv-offplan/properties.svg" },
    { key: "property-layouts" as const, label: "Property layouts", icon: "/images/inv-dashboard/inv-offplan/properties.svg" },
    { key: "floor-plans" as const, label: "Floor plans", icon: "/images/inv-dashboard/inv-offplan/properties.svg" },
    { key: "facades" as const, label: "Facades", icon: "/images/inv-dashboard/inv-offplan/properties.svg" },
];

export function MagazineSection() {
    const qc = useQueryClient();
    const { showError } = useMessageCenter();
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [selectedHouseId, setSelectedHouseId] = useState<string | null>(null);
    const [selectedPostPlanCard, setSelectedPostPlanCard] = useState<"grid" | "property-layouts" | "floor-plans" | "facades" | null>(null);
    const [showGridView, setShowGridView] = useState(false);
    const [gridViewTab, setGridViewTab] = useState<"Grid" | "Layouts">("Grid");
    const [gridFilterOpen, setGridFilterOpen] = useState(false);
    const [gridAppliedStatus, setGridAppliedStatus] = useState("");
    const [gridDraftStatus, setGridDraftStatus] = useState("");
    const gridFilterPanelRef = useRef<HTMLDivElement>(null);
    const [selectedGridLayout, setSelectedGridLayout] = useState<UnitLayout | null>(null);
    const [gridPanelOpen, setGridPanelOpen] = useState(false);
    const [editingGridLayoutId, setEditingGridLayoutId] = useState<string | null>(null);
    const [viewingFloorPlan, setViewingFloorPlan] = useState<string | null>(null);

    const openGridPanel = (layout: UnitLayout) => {
        const wasOpen = !!selectedGridLayout;
        setSelectedGridLayout(layout);
        if (wasOpen) {
            setGridPanelOpen(true);
        } else {
            setGridPanelOpen(false);
            requestAnimationFrame(() => requestAnimationFrame(() => setGridPanelOpen(true)));
        }
    };

    const closeGridPanel = () => {
        setGridPanelOpen(false);
        setTimeout(() => setSelectedGridLayout(null), 300);
    };

    useEffect(() => {
        const timeout = setTimeout(() => setDebouncedSearch(search.trim()), 400);
        return () => clearTimeout(timeout);
    }, [search]);

    useEffect(() => {
        if (!gridFilterOpen) return;
        const handleOutsideClick = (event: MouseEvent) => {
            if (gridFilterPanelRef.current && !gridFilterPanelRef.current.contains(event.target as Node)) {
                setGridFilterOpen(false);
            }
        };
        document.addEventListener("mousedown", handleOutsideClick);
        return () => document.removeEventListener("mousedown", handleOutsideClick);
    }, [gridFilterOpen]);

    const { data: housesResponse, isLoading: housesLoading } = useQuery({
        queryKey: ["houses", "magazine", debouncedSearch],
        queryFn: () => housesApi.getAll({ search: debouncedSearch || undefined, limit: 50, archived: false }),
    });
    const houses: House[] = housesResponse?.data?.data || [];

    useEffect(() => {
        if (!selectedHouseId && houses[0]) {
            setSelectedHouseId(houses[0].id);
        }
    }, [houses, selectedHouseId]);

    const selectedHouse = houses.find((h) => h.id === selectedHouseId) || null;

    useEffect(() => {
        setSelectedGridLayout(null);
        setGridPanelOpen(false);
        setEditingGridLayoutId(null);
    }, [selectedHouseId]);

    const { data: gridResponse, isLoading: gridLoading } = useQuery({
        queryKey: ["unit-layouts", "magazine-grid", selectedHouseId],
        queryFn: () => unitLayoutsApi.getAll({ houseId: selectedHouseId!, limit: 1000 }),
        enabled: !!selectedHouseId && showGridView,
    });
    const gridLayouts: UnitLayout[] = gridResponse?.data?.data || [];

    const gridCellStatus = (layout: UnitLayout): keyof typeof GRID_LEGEND => {
        if (layout.archived) return "blocked";
        return layout.status;
    };

    const gridLegendCounts = GRID_LEGEND_ORDER.reduce((acc, key) => {
        acc[key] = gridLayouts.filter((layout) => gridCellStatus(layout) === key).length;
        return acc;
    }, {} as Record<keyof typeof GRID_LEGEND, number>);

    const gridFloors = [...new Set(gridLayouts.map((layout) => layout.floor))].sort((a, b) => b - a);
    const gridByFloor = gridFloors.map((floor) => {
        const units = gridLayouts
            .filter((layout) => layout.floor === floor)
            .sort((a, b) => (a.unitCode || String(a.number || "")).localeCompare(b.unitCode || String(b.number || "")));
        return { floor, units };
    });
    const gridMaxColumns = Math.max(1, ...gridByFloor.map((row) => row.units.length));

    const notifyComingSoon = () =>
        showError({ title: "Coming soon", description: "This part of Magazine isn't wired up yet." });

    const applyGridFilter = () => {
        setGridAppliedStatus(gridDraftStatus);
        setGridFilterOpen(false);
    };

    const clearGridFilter = () => {
        setGridDraftStatus("");
        setGridAppliedStatus("");
        setGridFilterOpen(false);
    };

    return (
        <main className="flex-1 overflow-y-auto p-8 font-sans antialiased selection:bg-[#4A4E5A]/10" style={{ background: "var(--background-primary-50, #FFFFFF80)" }}>
            {showGridView && selectedHouse ? (
                <div className="rounded-[28px] border border-[#E9ECF2] bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.03)]">
                    <div className="mb-4 flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => {
                                setShowGridView(false);
                                setSelectedPostPlanCard(null);
                                setGridViewTab("Grid");
                                setSelectedGridLayout(null);
                                setGridPanelOpen(false);
                                setEditingGridLayoutId(null);
                            }}
                            className="flex h-9 w-9 items-center justify-center rounded-full text-[#4E525D] transition-colors hover:bg-[#F4F5F6] cursor-pointer"
                            aria-label="Back"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="15 18 9 12 15 6" />
                            </svg>
                        </button>
                        {(["Grid", "Layouts"] as const).map((tab) => (
                            <button
                                key={tab}
                                type="button"
                                onClick={() => setGridViewTab(tab)}
                                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors cursor-pointer ${
                                    gridViewTab === tab ? "bg-[#EFEFF1] text-[#1A1A1A]" : "text-[#808191] hover:bg-gray-50"
                                }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    {gridViewTab === "Grid" ? (
                    editingGridLayoutId ? (
                    <div>
                        <div className="mb-4 flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setEditingGridLayoutId(null)}
                                className="flex h-9 w-9 items-center justify-center rounded-full text-[#4E525D] transition-colors hover:bg-[#F4F5F6] cursor-pointer"
                                aria-label="Back to grid"
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="15 18 9 12 15 6" />
                                </svg>
                            </button>
                            <p className="text-sm font-medium text-[#1A1A1A]">Edit unit layout</p>
                        </div>
                        <UnitLayoutInlineForm
                            embedded
                            inline
                            houseId={editingGridLayoutId}
                            parentHouseId={selectedHouseId ?? undefined}
                            key={editingGridLayoutId}
                            onSuccess={() => {
                                setEditingGridLayoutId(null);
                                setSelectedGridLayout(null);
                                setGridPanelOpen(false);
                                qc.invalidateQueries({ queryKey: ["unit-layouts", "magazine-grid", selectedHouseId] });
                            }}
                        />
                    </div>
                    ) : (
                    <div className="flex items-stretch overflow-hidden">
                    <div className={`min-w-0 flex-1 transition-[padding] duration-300 ease-out ${selectedGridLayout ? "pr-5" : ""}`}>
                    <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
                        <div className="flex flex-wrap items-center gap-4">
                            {GRID_LEGEND_ORDER.map((key) => (
                                <span key={key} className="flex items-center gap-1.5 text-xs font-medium text-[#4E525D]">
                                    <span className={`h-2.5 w-2.5 rounded-full ${GRID_LEGEND[key].dot}`} />
                                    {GRID_LEGEND[key].label} {gridLegendCounts[key]}
                                </span>
                            ))}
                        </div>

                        <div ref={gridFilterPanelRef} className="relative">
                            <button
                                type="button"
                                onClick={() => {
                                    setGridDraftStatus(gridAppliedStatus);
                                    setGridFilterOpen((prev) => !prev);
                                }}
                                className="flex h-[44px] w-auto min-w-[85px] items-center justify-center gap-2 rounded-[16px] border border-white bg-[#EBEBEB] px-4 py-2 text-[14px] font-medium leading-[20px] text-[#4E525D] transition-colors hover:bg-[#E0E0E0] cursor-pointer"
                            >
                                <img src="/images/inv-resale/filter.svg" alt="" className="h-4 w-4" />
                                <span>Filter</span>
                                {gridAppliedStatus ? (
                                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#4E525D] px-1 text-[11px] font-semibold text-white">
                                        1
                                    </span>
                                ) : null}
                            </button>

                            {gridFilterOpen ? (
                                <div className="absolute right-0 top-full z-20 mt-2 w-[380px] max-w-[90vw] rounded-[28px] border border-[#E7E9EE] bg-white p-5 shadow-[0_20px_50px_rgba(17,24,39,0.12)]">
                                    <div className="mb-4 flex items-center justify-between">
                                        <div>
                                            <h4 className="text-[16px] font-semibold text-[#1A1A1A]">Filter Grid</h4>
                                            <p className="mt-1 text-[13px] text-[#808191]">Narrow down by status</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setGridFilterOpen(false)}
                                            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F4F5F6] text-[#4E525D] transition-colors hover:bg-[#E9ECF2]"
                                        >
                                            <IoClose size={18} />
                                        </button>
                                    </div>

                                    <div className="grid gap-4">
                                        <FilterSelect
                                            label="Status"
                                            value={gridDraftStatus}
                                            options={UNIT_LAYOUT_STATUS_OPTIONS}
                                            placeholder="All statuses"
                                            onChange={setGridDraftStatus}
                                        />
                                    </div>

                                    <div className="mt-5 flex items-center justify-end gap-3">
                                        <button
                                            type="button"
                                            onClick={clearGridFilter}
                                            className="rounded-2xl border border-[#E7E9EE] px-4 py-2.5 text-sm font-medium text-[#4E525D] transition-colors hover:bg-[#F8F9FB]"
                                        >
                                            Clear
                                        </button>
                                        <button
                                            type="button"
                                            onClick={applyGridFilter}
                                            className="rounded-2xl bg-[#4E525D] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#3D404A]"
                                        >
                                            Apply Filters
                                        </button>
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    </div>

                    {gridLoading ? (
                        <LoadingSpinner label="Loading grid" className="min-h-[240px]" />
                    ) : gridByFloor.length === 0 ? (
                        <div className="rounded-[24px] border border-[#E9ECF2] bg-white px-6 py-12 text-center text-sm text-[#999]">
                            No unit layouts yet for this property.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <div className="inline-block min-w-full">
                                <div className="flex">
                                    <div className="w-10 flex-shrink-0" />
                                    {Array.from({ length: gridMaxColumns }, (_, i) => i + 1).map((col) => (
                                        <div key={col} className="flex w-9 flex-shrink-0 items-center justify-center text-xs text-[#999]">
                                            {col}
                                        </div>
                                    ))}
                                </div>
                                {gridByFloor.map(({ floor, units }) => (
                                    <div key={floor} className="flex items-center">
                                        <div className="flex w-10 flex-shrink-0 items-center justify-center text-xs text-[#999]">{floor}</div>
                                        {Array.from({ length: gridMaxColumns }, (_, i) => units[i]).map((layout, i) => (
                                            <div key={layout?.id ?? `empty-${floor}-${i}`} className="flex w-9 flex-shrink-0 items-center justify-center p-0.5">
                                                {layout ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => openGridPanel(layout)}
                                                        title={`${layout.unitCode || layout.title} · ${GRID_LEGEND[gridCellStatus(layout)].label}`}
                                                        className={`relative h-7 w-7 rounded-md transition-all cursor-pointer ${
                                                            gridAppliedStatus && gridCellStatus(layout) !== gridAppliedStatus
                                                                ? "border border-[#C8CDD8] bg-transparent"
                                                                : GRID_LEGEND[gridCellStatus(layout)].cell
                                                        } ${
                                                            gridPanelOpen && selectedGridLayout?.id === layout.id
                                                                ? "z-10 ring-2 ring-[#4E525D] ring-offset-1"
                                                                : ""
                                                        }`}
                                                    />
                                                ) : null}
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    </div>

                    {selectedGridLayout ? (
                        <div
                            className={`w-[300px] flex-shrink-0 self-stretch border-l border-[#E9ECF2] bg-white pl-5 transition-all duration-300 ease-out ${
                                gridPanelOpen ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
                            }`}
                        >
                            <div className="mb-4 flex items-start justify-between gap-3">
                                <div>
                                    <p className="text-xs text-[#999]">Residential unit</p>
                                    <p className="mt-1 text-[15px] font-semibold text-[#1A1A1A]">
                                        №{selectedGridLayout.unitCode || selectedGridLayout.number || selectedGridLayout.title}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={closeGridPanel}
                                    className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#F4F5F6] text-[#4E525D] transition-colors hover:bg-[#E9ECF2] cursor-pointer"
                                    aria-label="Close"
                                >
                                    <IoClose size={16} />
                                </button>
                            </div>

                            <div className="mb-4 grid grid-cols-3 gap-2 rounded-2xl bg-[#F8F9FB] p-3">
                                <div>
                                    <p className="text-[11px] text-[#999]">Area</p>
                                    <p className="mt-0.5 text-sm font-semibold text-[#1A1A1A]">{selectedGridLayout.totalArea} m²</p>
                                </div>
                                <div>
                                    <p className="text-[11px] text-[#999]">Floor</p>
                                    <p className="mt-0.5 text-sm font-semibold text-[#1A1A1A]">
                                        {selectedGridLayout.floor}
                                        {selectedGridLayout.numberOfFloors?.end ? ` / ${selectedGridLayout.numberOfFloors.end}` : ""}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[11px] text-[#999]">Status</p>
                                    <p className={`mt-0.5 text-sm font-semibold ${statusTextMap[selectedGridLayout.status] || "text-[#1A1A1A]"}`}>
                                        {GRID_LEGEND[gridCellStatus(selectedGridLayout)].label}
                                    </p>
                                </div>
                            </div>

                            <p className="mb-2 text-xs text-[#999]">
                                Floor plan{selectedGridLayout.unitCode ? ` · ${selectedGridLayout.unitCode}` : ""}
                            </p>
                            <div className="group relative mb-4 flex h-[160px] w-full items-center justify-center overflow-hidden rounded-2xl bg-[#F8F9FA]">
                                {selectedGridLayout.mainImage?.url || selectedGridLayout.gallery?.[0]?.url ? (
                                    <>
                                        <img
                                            src={selectedGridLayout.mainImage?.url || selectedGridLayout.gallery?.[0]?.url}
                                            alt={selectedGridLayout.title}
                                            className="h-full w-full object-contain"
                                        />
                                        <button
                                            type="button"
                                            aria-label="View floor plan"
                                            onClick={() => setViewingFloorPlan(selectedGridLayout.mainImage?.url || selectedGridLayout.gallery?.[0]?.url || null)}
                                            className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all group-hover:bg-black/30 group-hover:opacity-100 cursor-pointer"
                                        >
                                            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-[#1A1A1A]">
                                                <IoEyeOutline size={18} />
                                            </span>
                                        </button>
                                    </>
                                ) : (
                                    <span className="text-xs text-[#999]">No floor plan</span>
                                )}
                            </div>

                            <button
                                type="button"
                                onClick={() => setEditingGridLayoutId(selectedGridLayout.id)}
                                className="mb-4 w-full rounded-2xl border border-[#4E525D] px-4 py-2.5 text-sm font-medium text-[#4E525D] transition-colors hover:bg-[#F8F9FB] cursor-pointer"
                            >
                                Select unit
                            </button>

                            <div className="mb-4 border-t border-[#F1F2F4] pt-4">
                                <p className="text-xs text-[#999]">Price according to the price list</p>
                                <p className="mt-1 text-lg font-semibold text-[#1A1A1A]">
                                    {formatPrice(selectedGridLayout.prices) || "No price"}
                                </p>
                                {selectedGridLayout.prices && Object.keys(selectedGridLayout.prices).length > 0 && selectedGridLayout.totalArea ? (
                                    <p className="mt-0.5 text-xs text-[#999]">
                                        {Math.round((Object.values(selectedGridLayout.prices)[0] || 0) / selectedGridLayout.totalArea).toLocaleString()}{" "}
                                        {Object.keys(selectedGridLayout.prices)[0]} / m²
                                    </p>
                                ) : null}
                            </div>

                            <div className="border-t border-[#F1F2F4] pt-4">
                                <p className="mb-3 text-sm font-semibold text-[#1A1A1A]">Property details</p>
                                <div className="space-y-2.5 text-sm">
                                    {[
                                        ["Apartment number", selectedGridLayout.unitCode || String(selectedGridLayout.number || "—")],
                                        ["Sub-Type", selectedGridLayout.unitTypeOption?.title || "—"],
                                        ["Building entrance", selectedGridLayout.entrance || "—"],
                                        ["Floor", String(selectedGridLayout.floor)],
                                        ["Name of building", selectedGridLayout.house?.title || selectedHouse?.title || "—"],
                                        ["Complex", selectedHouse?.category?.title || "—"],
                                        ["Total area, m²", String(selectedGridLayout.totalArea)],
                                    ].map(([label, value]) => (
                                        <div key={label} className="flex items-center justify-between gap-3">
                                            <span className="text-[#999]">{label}</span>
                                            <span className="truncate text-right font-medium text-[#1A1A1A]">{value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : null}
                    </div>
                    )
                    ) : (
                        <UnitLayoutsSection houseId={selectedHouseId ?? undefined} embedded minimal />
                    )}

                    {viewingFloorPlan ? (
                        <ImageLightbox src={viewingFloorPlan} alt="Floor plan" onClose={() => setViewingFloorPlan(null)} />
                    ) : null}
                </div>
            ) : (
            <>
            <div className="mb-3">
                <h3 className="text-sm font-medium text-[#808191]">Selected Property</h3>
            </div>

            {selectedHouse ? (
                <div className="mb-6 flex items-center gap-4 rounded-[20px] border border-[#4E525D]/30 bg-[#FAFAF9] p-4">
                    <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-2xl bg-[#F4F5F6]">
                        {selectedHouse.mainImage?.url ? (
                            <img src={selectedHouse.mainImage.url} alt={selectedHouse.title} className="h-full w-full object-cover" />
                        ) : null}
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="truncate font-semibold text-[#1A1A1A]">
                            {selectedHouse.category?.title} — {selectedHouse.title}
                        </div>
                        <div className="mt-1 text-sm text-[#808191]">
                            {(selectedHouse._count?.unitLayouts ?? 0).toLocaleString()} units
                            {" · "}
                            <span className={statusTextMap[selectedHouse.status] || ""}>
                                {statusLabelMap[selectedHouse.status] || selectedHouse.status}
                            </span>
                            {formatPrice(selectedHouse.prices) ? ` · from ${formatPrice(selectedHouse.prices)}` : ""}
                        </div>
                    </div>
                </div>
            ) : null}

            <div className="mb-2 flex h-11 items-center gap-2 rounded-2xl border border-[#E7E9EE] bg-white px-4">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#718096]">
                    <circle cx="11" cy="11" r="7" />
                    <path d="m20 20-3.5-3.5" />
                </svg>
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search properties"
                    className="h-full flex-1 border-0 bg-transparent text-sm text-[#1A1A1A] outline-none placeholder:text-[#999]"
                />
            </div>

            <div className="mb-8 max-h-[280px] overflow-y-auto rounded-2xl border border-[#E7E9EE] bg-white">
                {housesLoading ? (
                    <div className="p-4 text-sm text-[#999]">Loading properties...</div>
                ) : houses.length === 0 ? (
                    <div className="p-4 text-sm text-[#999]">No properties found</div>
                ) : (
                    houses.map((house) => {
                        const isSelected = house.id === selectedHouseId;
                        return (
                            <button
                                key={house.id}
                                type="button"
                                onClick={() => setSelectedHouseId(house.id)}
                                className={`flex w-full items-center gap-3 border-b border-[#F1F2F4] px-4 py-3 text-left transition-colors last:border-b-0 cursor-pointer ${
                                    isSelected ? "bg-[#4E525D]" : "hover:bg-gray-50"
                                }`}
                            >
                                <div className="h-9 w-9 flex-shrink-0 overflow-hidden rounded-xl bg-[#F4F5F6]">
                                    {house.mainImage?.url ? (
                                        <img src={house.mainImage.url} alt={house.title} className="h-full w-full object-cover" />
                                    ) : null}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className={`truncate text-sm font-semibold ${isSelected ? "text-white" : "text-[#1A1A1A]"}`}>
                                        {house.category?.title} — {house.title}
                                    </div>
                                    <div className={`truncate text-xs ${isSelected ? "text-white/80" : "text-[#999]"}`}>
                                        {(house._count?.unitLayouts ?? 0).toLocaleString()} units
                                        {" · "}
                                        <span className={isSelected ? "text-white/80" : statusTextMap[house.status] || ""}>
                                            {statusLabelMap[house.status] || house.status}
                                        </span>
                                    </div>
                                </div>
                                {formatPrice(house.prices) ? (
                                    <span className={`flex-shrink-0 text-sm ${isSelected ? "text-white" : "text-[#666666]"}`}>
                                        from {formatPrice(house.prices)}
                                    </span>
                                ) : null}
                                {isSelected ? (
                                    <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-white/20 text-white">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                    </span>
                                ) : null}
                            </button>
                        );
                    })
                )}
            </div>

            {selectedHouse ? (
                <>
                    <div className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        {FILL_CARDS.map((card) => {
                            const isActive = card.key === selectedPostPlanCard;
                            return (
                                <div
                                    key={card.key}
                                    className={`rounded-[20px] border bg-white p-4 transition-colors ${
                                        isActive ? "border-[#4E525D]" : "border-[#E5E7EB]"
                                    }`}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="text-sm font-medium text-[#1A1A1A]">{card.label}</p>
                                            <p className="mt-1 text-sm text-[#808191]">Filling 0%</p>
                                        </div>
                                        <img src={card.icon} alt="" className="h-10 w-10 object-contain opacity-70" />
                                    </div>

                                    <div className="mt-5">
                                        {card.key === "grid" ? (
                                            <div className="grid grid-cols-2 gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedPostPlanCard("grid");
                                                        setShowGridView(true);
                                                    }}
                                                    className="rounded-full bg-[#EFEFF1] px-4 py-2 text-sm font-medium text-[#666] cursor-pointer"
                                                >
                                                    View
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedPostPlanCard("grid");
                                                        notifyComingSoon();
                                                    }}
                                                    className="rounded-full bg-[#4E525D] px-4 py-2 text-sm font-medium text-white cursor-pointer"
                                                >
                                                    Upload File
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setSelectedPostPlanCard(card.key);
                                                    notifyComingSoon();
                                                }}
                                                className="w-full rounded-full bg-[#EFEFF1] px-4 py-2 text-sm font-medium text-[#666] cursor-pointer"
                                            >
                                                Fill
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </>
            ) : null}
            </>
            )}
        </main>
    );
}
