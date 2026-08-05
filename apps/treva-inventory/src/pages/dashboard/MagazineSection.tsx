import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { housesApi, type House } from "../../api/houses";
import { unitLayoutsApi, type UnitLayout } from "../../api/unit-layouts";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { useMessageCenter } from "../../components/MessageCenter";
import { getApiErrorMessage } from "../../utils/apiError";
import { buildUnitLayoutDuplicatePayload } from "../../utils/entityDuplicatePayloads";
import { FormTabSwitcher, FormAddButton } from "@repo/ui";
import { HouseForm as UnitLayoutInlineForm } from "./UnitLayoutInlineForm";

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

function formatPricePreview(prices: Record<string, number> | undefined) {
    if (!prices || Object.keys(prices).length === 0) return "No price";
    const [currency, amount] = Object.entries(prices)[0] || [];
    if (!currency || amount === undefined) return "No price";
    return `${currency} ${Number(amount).toLocaleString()}`;
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
    const { showError, showSuccess } = useMessageCenter();
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [selectedHouseId, setSelectedHouseId] = useState<string | null>(null);
    const [activeUnitTab, setActiveUnitTab] = useState<"Active" | "Archive">("Active");
    const [showUnitForm, setShowUnitForm] = useState(false);
    const [editingUnitId, setEditingUnitId] = useState<string | null>(null);
    const [selectedPostPlanCard, setSelectedPostPlanCard] = useState<"grid" | "property-layouts" | "floor-plans" | "facades" | null>(null);
    const [showGridView, setShowGridView] = useState(false);

    useEffect(() => {
        const timeout = setTimeout(() => setDebouncedSearch(search.trim()), 400);
        return () => clearTimeout(timeout);
    }, [search]);

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

    const { data: unitLayoutsResponse, isLoading: unitsLoading } = useQuery({
        queryKey: ["unit-layouts", "magazine", selectedHouseId, activeUnitTab],
        queryFn: () => unitLayoutsApi.getAll({ houseId: selectedHouseId!, archived: activeUnitTab === "Archive", limit: 100 }),
        enabled: !!selectedHouseId,
    });
    const unitLayouts: UnitLayout[] = unitLayoutsResponse?.data?.data || [];

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

    const invalidateUnitLayouts = () => qc.invalidateQueries({ queryKey: ["unit-layouts", "magazine"] });

    const duplicateMut = useMutation({
        mutationFn: (layout: UnitLayout) => unitLayoutsApi.create(buildUnitLayoutDuplicatePayload(layout)),
        onSuccess: () => {
            invalidateUnitLayouts();
            showSuccess({ title: "Unit layout duplicated" });
        },
        onError: (error) => showError({ title: "Could not duplicate unit layout", description: getApiErrorMessage(error, "Please try again.") }),
    });

    const archiveMut = useMutation({
        mutationFn: ({ id, archived }: { id: string; archived: boolean }) => unitLayoutsApi.update(id, { archived }),
        onSuccess: () => {
            invalidateUnitLayouts();
            showSuccess({ title: "Unit layout updated" });
        },
        onError: (error) => showError({ title: "Could not update unit layout", description: getApiErrorMessage(error, "Please try again.") }),
    });

    const deleteMut = useMutation({
        mutationFn: (id: string) => unitLayoutsApi.delete(id),
        onSuccess: () => {
            invalidateUnitLayouts();
            showSuccess({ title: "Unit layout deleted" });
        },
        onError: (error) => showError({ title: "Could not delete unit layout", description: getApiErrorMessage(error, "Please try again.") }),
    });

    const notifyComingSoon = () =>
        showError({ title: "Coming soon", description: "This part of Magazine isn't wired up yet." });

    return (
        <main className="flex-1 overflow-y-auto p-8 font-sans antialiased selection:bg-[#4A4E5A]/10" style={{ background: "var(--background-primary-50, #FFFFFF80)" }}>
            <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-medium text-[#808191]">Selected Property</h3>
                <button type="button" onClick={notifyComingSoon} className="text-sm font-medium text-[#4E525D] transition-colors hover:opacity-80 cursor-pointer">
                    + Create new
                </button>
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
                    <div className="mb-8 grid gap-4 md:grid-cols-2">
                        <div className="rounded-[24px] border border-[#E9ECF2] bg-white p-5">
                            <p className="text-xs text-[#999]">Current Version</p>
                            <div className="mt-2 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="text-[15px] font-semibold text-[#1A1A1A]">Version No.6</span>
                                    <span className="rounded-full bg-[#E7F6ED] px-2.5 py-1 text-xs font-medium text-[#2D9A5B]">Published</span>
                                </div>
                                <button type="button" onClick={notifyComingSoon} className="text-sm font-medium text-[#4E525D] transition-colors hover:opacity-80 cursor-pointer">
                                    History
                                </button>
                            </div>
                            <p className="mt-1 text-xs text-[#999]">
                                {new Date(selectedHouse.updatedAt).toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" })}
                            </p>
                        </div>

                        <div className="rounded-[24px] border border-[#E9ECF2] bg-white p-5">
                            <p className="text-xs text-[#999]">Data Rules</p>
                            <div className="mt-2 flex items-center justify-between gap-3">
                                <div>
                                    <span className="text-[15px] font-semibold text-[#1A1A1A]">Auto-update on next load</span>
                                    <p className="mt-1 text-xs text-[#999]">Rules apply on next data import</p>
                                </div>
                                <button type="button" onClick={notifyComingSoon} className="flex-shrink-0 text-sm font-medium text-blue-600 transition-colors hover:opacity-80 cursor-pointer">
                                    Configure
                                </button>
                            </div>
                        </div>
                    </div>

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

                    {showGridView ? (
                    <div className="rounded-[28px] border border-[#E9ECF2] bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.03)]">
                        <div className="mb-4 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowGridView(false)}
                                    className="flex h-9 w-9 items-center justify-center rounded-full text-[#4E525D] transition-colors hover:bg-[#F4F5F6] cursor-pointer"
                                    aria-label="Back"
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="15 18 9 12 15 6" />
                                    </svg>
                                </button>
                                {(["Grid", "Grid+", "Properties", "Layouts"] as const).map((tab, index) => (
                                    <button
                                        key={tab}
                                        type="button"
                                        onClick={index === 0 ? undefined : notifyComingSoon}
                                        className={`rounded-full px-4 py-2 text-sm font-medium transition-colors cursor-pointer ${
                                            index === 0 ? "bg-[#EFEFF1] text-[#1A1A1A]" : "text-[#808191] hover:bg-gray-50"
                                        }`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>
                            <button
                                type="button"
                                onClick={notifyComingSoon}
                                className="flex items-center gap-2 rounded-full border border-[#E2E8F0] px-4 py-2 text-sm font-medium text-[#4E525D] transition-colors hover:bg-gray-50 cursor-pointer"
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M7 12h10M10 18h4" /></svg>
                                Filter
                            </button>
                        </div>

                        <div className="mb-5 flex flex-wrap items-center gap-4">
                            {GRID_LEGEND_ORDER.map((key) => (
                                <span key={key} className="flex items-center gap-1.5 text-xs font-medium text-[#4E525D]">
                                    <span className={`h-2.5 w-2.5 rounded-full ${GRID_LEGEND[key].dot}`} />
                                    {GRID_LEGEND[key].label} {gridLegendCounts[key]}
                                </span>
                            ))}
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
                                                        <div
                                                            title={`${layout.unitCode || layout.title} · ${GRID_LEGEND[gridCellStatus(layout)].label}`}
                                                            className={`h-7 w-7 rounded-md ${GRID_LEGEND[gridCellStatus(layout)].cell}`}
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
                    ) : (
                    <div className="space-y-6 rounded-[28px] border border-[#E9ECF2] bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.03)]">
                        <div className="flex items-center justify-between">
                            <FormTabSwitcher
                                tabs={[{ id: "Active", label: "Active unit layouts" }, { id: "Archive", label: "Archive" }]}
                                activeTab={activeUnitTab}
                                onChange={(id) => setActiveUnitTab(id as "Active" | "Archive")}
                                size="md"
                            />
                            <FormAddButton
                                icon={<span className="mr-0.5 text-base font-light">+</span>}
                                onClick={() => {
                                    setEditingUnitId(null);
                                    setShowUnitForm(true);
                                }}
                            >
                                Add Unit Layout
                            </FormAddButton>
                        </div>

                        {(showUnitForm || editingUnitId) ? (
                            <div className="rounded-[24px] border border-[#E9ECF2] bg-white p-5">
                                <UnitLayoutInlineForm
                                    embedded
                                    inline
                                    categorySlug={selectedHouse.category?.slug}
                                    parentHouseId={selectedHouse.id}
                                    houseId={editingUnitId ?? undefined}
                                    key={editingUnitId ?? `new-${selectedHouse.id}`}
                                    onSuccess={() => {
                                        setShowUnitForm(false);
                                        setEditingUnitId(null);
                                        invalidateUnitLayouts();
                                    }}
                                />
                            </div>
                        ) : null}

                        {unitsLoading ? (
                            <LoadingSpinner label="Loading unit layouts" className="min-h-[160px]" />
                        ) : unitLayouts.length === 0 ? (
                            <div className="rounded-[24px] border border-[#E9ECF2] bg-white px-6 py-12 text-center text-sm text-[#999]">
                                {activeUnitTab === "Active" ? "No active unit layouts yet. Click 'Add Unit Layout' to create one." : "No archived unit layouts"}
                            </div>
                        ) : (
                            <div className="flex flex-wrap gap-4">
                                {unitLayouts.map((layout) => {
                                    const imageUrl = layout.mainImage?.url || layout.gallery?.[0]?.url;
                                    const openEdit = () => {
                                        setEditingUnitId(layout.id);
                                        setShowUnitForm(true);
                                    };
                                    return (
                                        <div key={layout.id} className="group flex w-[240px] shrink-0 flex-col gap-2 rounded-[16px] border border-[#EBEBEB] bg-white p-2">
                                            <div className="relative h-[140px] w-full overflow-hidden rounded-[12px] bg-[#F3F4F6]">
                                                {imageUrl ? (
                                                    <img src={imageUrl} alt={layout.title} className="h-full w-full object-cover" loading="lazy" />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center text-xs text-[#999]">No Image</div>
                                                )}

                                                <button
                                                    type="button"
                                                    onClick={() => archiveMut.mutate({ id: layout.id, archived: !layout.archived })}
                                                    disabled={archiveMut.isPending}
                                                    aria-label={layout.archived ? "Restore" : "Archive"}
                                                    title={layout.archived ? "Restore" : "Archive"}
                                                    className="absolute left-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#EBEBEB] text-[#4E525D] transition-colors hover:bg-[#E0E0E0] disabled:opacity-50"
                                                >
                                                    {layout.archived ? (
                                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                                                        </svg>
                                                    ) : (
                                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                                                        </svg>
                                                    )}
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => deleteMut.mutate(layout.id)}
                                                    aria-label="Delete"
                                                    title="Delete"
                                                    className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#FDECEC] text-[#C3362B] transition-colors hover:bg-[#F8DDD9]"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14zM10 11v6M14 11v6" />
                                                    </svg>
                                                </button>
                                            </div>

                                            <div className="px-1 pb-1">
                                                <p className="truncate text-sm font-semibold text-[#1A1A1A]">{layout.title}</p>
                                                <p className="text-xs text-[#999]">
                                                    {layout.totalArea} m² · {layout.unitTypeOption?.title || `${layout.number || 0} rooms`}
                                                </p>
                                            </div>

                                            <div className="rounded-[12px] bg-[#F4F5F6] px-3 py-2">
                                                <p className="text-[11px] font-medium text-[#808191]">Price</p>
                                                <p className="truncate text-sm font-semibold text-[#1A1A1A]">{formatPricePreview(layout.prices)}</p>
                                            </div>

                                            <div className="flex gap-1 px-1 pb-1">
                                                <button
                                                    type="button"
                                                    onClick={() => duplicateMut.mutate(layout)}
                                                    disabled={duplicateMut.isPending}
                                                    className="flex-1 cursor-pointer rounded-full border border-[#E2E8F0] py-1.5 text-[12px] font-medium text-[#4E525D] transition-colors hover:bg-gray-50 disabled:opacity-50"
                                                >
                                                    Copy
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={openEdit}
                                                    className="flex-1 cursor-pointer rounded-full bg-[#4E525D] py-1.5 text-[12px] font-medium text-white transition-colors hover:bg-[#3A3D46]"
                                                >
                                                    Edit
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                    )}
                </>
            ) : null}
        </main>
    );
}
