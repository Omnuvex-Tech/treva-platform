import { useEffect, useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { unitLayoutsApi, UNIT_LAYOUT_STATUS_OPTIONS, type UnitLayout, type UnitLayoutFilters } from "../../api/unit-layouts";
import { categoriesApi } from "../../api/categories";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { Pagination } from "../../components/Pagination";
import { useMessageCenter } from "../../components/MessageCenter";
import { buildUnitLayoutDuplicatePayload } from "../../utils/entityDuplicatePayloads";
import { getApiErrorMessage } from "../../utils/apiError";
import { HouseForm as UnitLayoutInlineForm } from "./UnitLayoutInlineForm";
import { IoClose } from "react-icons/io5";

export function FilterSelect({
    label,
    value,
    options,
    placeholder,
    onChange,
}: {
    label: string;
    value: string;
    options: { id: string; label: string }[];
    placeholder: string;
    onChange: (value: string) => void;
}) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const selected = options.find((option) => option.id === value);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    return (
        <div ref={ref} className="relative">
            <label className="mb-1.5 block text-xs font-medium text-[#4E525D]">{label}</label>
            <button
                type="button"
                onClick={() => setOpen((prev) => !prev)}
                className="flex h-11 w-full items-center justify-between rounded-2xl border border-[#E7E9EE] bg-[#F8F9FB] px-4 text-sm text-[#1A1A1A] outline-none transition-colors focus:border-[#C8CDD8]"
            >
                <span className={`truncate text-left ${selected ? "text-[#1A1A1A]" : "text-[#999]"}`}>
                    {selected?.label || placeholder}
                </span>
                <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    className={open ? "rotate-180 transition-transform" : "transition-transform"}
                >
                    <path d="M6 9l6 6 6-6" />
                </svg>
            </button>

            {open ? (
                <div className="absolute left-0 top-full z-50 mt-2 w-full overflow-hidden rounded-2xl border border-[#E7E9EE] bg-white shadow-lg">
                    <button
                        type="button"
                        className="w-full px-4 py-2.5 text-left text-sm text-[#666666] transition-colors hover:bg-gray-50 hover:text-[#1A1A1A]"
                        onClick={() => {
                            onChange("");
                            setOpen(false);
                        }}
                    >
                        -- None
                    </button>
                    {options.map((option) => {
                        const isSelected = value === option.id;
                        return (
                            <button
                                key={option.id}
                                type="button"
                                className={`flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-sm transition-colors ${
                                    isSelected
                                        ? "bg-[#4E525D]/10 font-medium text-[#1A1A1A]"
                                        : "text-[#666666] hover:bg-gray-50 hover:text-[#1A1A1A]"
                                }`}
                                onClick={() => {
                                    onChange(option.id);
                                    setOpen(false);
                                }}
                            >
                                <span>{option.label}</span>
                                {isSelected ? (
                                    <span className="text-xs font-semibold text-[#4E525D]">Selected</span>
                                ) : null}
                            </button>
                        );
                    })}
                    {options.length === 0 ? (
                        <div className="px-4 py-2.5 text-sm text-[#999]">No options yet</div>
                    ) : null}
                </div>
            ) : null}
        </div>
    );
}

const statusBadgeMap: Record<string, string> = {
    available: "bg-emerald-50 text-emerald-700",
    reserved: "bg-amber-50 text-amber-700",
    sold: "bg-rose-50 text-rose-700",
};

const statusLabelMap: Record<string, string> = {
    available: "Active",
    reserved: "Reserved",
    sold: "Sold",
};

const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}.${d.getFullYear()}`;
};

function formatPriceValue(value: number) {
    return value.toLocaleString();
}

function formatPricePreview(prices: Record<string, number> | undefined) {
    if (!prices || Object.keys(prices).length === 0) return "No price";

    const [currency, amount] = Object.entries(prices)[0] || [];
    if (!currency || amount === undefined) return "No price";
    return `${currency} ${formatPriceValue(Number(amount))}`;
}

export function UnitLayoutsSection({ houseId, embedded, minimal }: { houseId?: string; embedded?: boolean; minimal?: boolean } = {}) {
    const Wrapper = embedded ? "div" : "main";
    const qc = useQueryClient();
    const { showError, showSuccess } = useMessageCenter();
    const [filters, setFilters] = useState<UnitLayoutFilters>({ page: 1, limit: 12 });
    const [search, setSearch] = useState("");
    const [activeTab, setActiveTab] = useState<"Active" | "Archive">("Active");
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [showHouseForm, setShowHouseForm] = useState(false);
    const [editingHouseId, setEditingHouseId] = useState<string | null>(null);
    const [filterOpen, setFilterOpen] = useState(false);
    const filterPanelRef = useRef<HTMLDivElement>(null);
    const [appliedFilters, setAppliedFilters] = useState({ categorySlug: "", status: "" });
    const [draftFilters, setDraftFilters] = useState({ categorySlug: "", status: "" });

    const effectiveFilters: UnitLayoutFilters = {
        ...filters,
        archived: activeTab === "Archive",
        houseId: houseId || undefined,
        categorySlug: appliedFilters.categorySlug || undefined,
        status: (appliedFilters.status || undefined) as UnitLayoutFilters["status"],
    };

    const { data: response, isLoading } = useQuery({
        queryKey: ["unit-layouts", effectiveFilters],
        queryFn: () => unitLayoutsApi.getAll(effectiveFilters),
    });

    const { data: categoriesResponse } = useQuery({
        queryKey: ["categories", "object"],
        queryFn: () => categoriesApi.getAll("object"),
    });
    const categoryOptions = (categoriesResponse?.data || []).map((category) => ({
        id: category.slug,
        label: category.title,
    }));

    const deleteMut = useMutation({
        mutationFn: (id: string) => unitLayoutsApi.delete(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["unit-layouts"] });
            showSuccess({ title: "Unit layout deleted" });
        },
        onError: (error) => {
            showError({
                title: "Unit layout could not be deleted",
                description: getApiErrorMessage(error, "Please try again."),
            });
        },
    });

    const duplicateMut = useMutation({
        mutationFn: (layout: UnitLayout) => unitLayoutsApi.create(buildUnitLayoutDuplicatePayload(layout)),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["unit-layouts"] });
            showSuccess({ title: "Unit layout duplicated" });
        },
        onError: (error) => {
            showError({
                title: "Unit layout could not be duplicated",
                description: getApiErrorMessage(error, "Please try again."),
            });
        },
    });

    const archiveMut = useMutation({
        mutationFn: ({ id, archived }: { id: string; archived: boolean }) => unitLayoutsApi.update(id, { archived }),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["unit-layouts"] });
            showSuccess({ title: "Unit layout updated" });
        },
        onError: (error) => {
            showError({
                title: "Unit layout could not be updated",
                description: getApiErrorMessage(error, "Please try again."),
            });
        },
    });

    useEffect(() => {
        const timeout = setTimeout(() => {
            setFilters((prev) => ({ ...prev, search: search.trim() || undefined, page: 1 }));
        }, 400);
        return () => clearTimeout(timeout);
    }, [search]);

    useEffect(() => {
        if (!filterOpen) return;
        const handleOutsideClick = (event: MouseEvent) => {
            if (filterPanelRef.current && !filterPanelRef.current.contains(event.target as Node)) {
                setFilterOpen(false);
            }
        };
        document.addEventListener("mousedown", handleOutsideClick);
        return () => document.removeEventListener("mousedown", handleOutsideClick);
    }, [filterOpen]);

    const handlePageChange = (page: number) => setFilters((prev) => ({ ...prev, page }));
    const handleTabChange = (tab: "Active" | "Archive") => {
        setActiveTab(tab);
        setFilters((prev) => ({ ...prev, page: 1 }));
    };

    const applyFilters = () => {
        setAppliedFilters(draftFilters);
        setFilters((prev) => ({ ...prev, page: 1 }));
        setFilterOpen(false);
    };

    const clearFilters = () => {
        const empty = { categorySlug: "", status: "" };
        setDraftFilters(empty);
        setAppliedFilters(empty);
        setFilters((prev) => ({ ...prev, page: 1 }));
        setFilterOpen(false);
    };

    const activeFilterCount = Object.values(appliedFilters).filter((value) => value.trim() !== "").length;

    const layouts = Array.isArray(response?.data?.data) ? response.data.data : [];
    const pagination = response?.data?.pagination;

    return (
        <Wrapper
            className={`font-sans antialiased selection:bg-[#4A4E5A]/10 ${embedded ? "" : "flex-1 overflow-y-auto p-8"}`}
            style={embedded ? undefined : { background: "var(--background-primary-50, #FFFFFF80)" }}
        >
            <div className="relative mb-8 flex w-full flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className="flex h-[46px] items-center rounded-full border border-[#E2E8F0] bg-white p-1 shadow-sm">
                        {(["Active", "Archive"] as const).map((tab) => (
                            <button
                                key={tab}
                                type="button"
                                onClick={() => handleTabChange(tab)}
                                className={`flex h-[40px] min-w-[108px] items-center justify-center rounded-[24px] px-4 text-[14px] font-medium leading-[20px] transition-all cursor-pointer ${
                                    activeTab === tab
                                        ? "border border-white bg-[#EBEBEB] text-[#4E525D]"
                                        : "border border-transparent bg-transparent text-[#718096] hover:bg-[#F1F5F9]"
                                }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    <div className="flex h-[44px] items-center gap-2 rounded-[16px] border border-[#E2E8F0] bg-white px-3 shadow-sm">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#718096]">
                            <circle cx="11" cy="11" r="7" />
                            <path d="m20 20-3.5-3.5" />
                        </svg>
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search unit layouts"
                            className="h-10 w-[240px] border-0 bg-transparent text-sm text-[#1A1A1A] outline-none placeholder:text-[#999]"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => setFilterOpen((prev) => !prev)}
                            className="flex h-[44px] w-auto min-w-[85px] items-center justify-center gap-2 rounded-[16px] border border-white bg-[#EBEBEB] px-4 py-2 text-[14px] font-medium leading-[20px] text-[#4E525D] transition-colors hover:bg-[#E0E0E0] cursor-pointer"
                        >
                            <img src="/images/inv-resale/filter.svg" alt="" className="h-4 w-4" />
                            <span>Filter</span>
                            {activeFilterCount > 0 ? (
                                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#4E525D] px-1 text-[11px] font-semibold text-white">
                                    {activeFilterCount}
                                </span>
                            ) : null}
                        </button>

                        {filterOpen ? (
                            <div
                                ref={filterPanelRef}
                                className="absolute right-0 top-full z-20 mt-2 w-[380px] max-w-[90vw] rounded-[28px] border border-[#E7E9EE] bg-white p-5 shadow-[0_20px_50px_rgba(17,24,39,0.12)]"
                            >
                                <div className="mb-4 flex items-center justify-between">
                                    <div>
                                        <h4 className="text-[16px] font-semibold text-[#1A1A1A]">Filter Unit Layouts</h4>
                                        <p className="mt-1 text-[13px] text-[#808191]">{houseId ? "Narrow down by status" : "Narrow down by object and status"}</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setFilterOpen(false)}
                                        className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F4F5F6] text-[#4E525D] transition-colors hover:bg-[#E9ECF2]"
                                    >
                                        <IoClose size={18} />
                                    </button>
                                </div>

                                <div className="grid gap-4">
                                    {!houseId ? (
                                        <FilterSelect
                                            label="Object"
                                            value={draftFilters.categorySlug}
                                            options={categoryOptions}
                                            placeholder="All objects"
                                            onChange={(value) => setDraftFilters((prev) => ({ ...prev, categorySlug: value }))}
                                        />
                                    ) : null}
                                    <FilterSelect
                                        label="Status"
                                        value={draftFilters.status}
                                        options={UNIT_LAYOUT_STATUS_OPTIONS}
                                        placeholder="All statuses"
                                        onChange={(value) => setDraftFilters((prev) => ({ ...prev, status: value }))}
                                    />
                                </div>

                                <div className="mt-5 flex items-center justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={clearFilters}
                                        className="rounded-2xl border border-[#E7E9EE] px-4 py-2.5 text-sm font-medium text-[#4E525D] transition-colors hover:bg-[#F8F9FB]"
                                    >
                                        Clear
                                    </button>
                                    <button
                                        type="button"
                                        onClick={applyFilters}
                                        className="rounded-2xl bg-[#4E525D] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#3D404A]"
                                    >
                                        Apply Filters
                                    </button>
                                </div>
                            </div>
                        ) : null}
                    </div>

                    {!minimal ? (
                    <>
                    <div className="flex h-[46px] items-center rounded-full border border-[#E2E8F0] bg-white p-1 shadow-sm">
                        <button
                            type="button"
                            onClick={() => setViewMode("grid")}
                            className={`flex h-[40px] w-[80px] items-center justify-center gap-2 rounded-[24px] px-3.5 text-[14px] font-medium leading-[20px] transition-all cursor-pointer ${
                                viewMode === "grid"
                                    ? "border border-white bg-[#EBEBEB] text-[#4E525D]"
                                    : "border border-transparent bg-transparent text-[#718096] hover:bg-[#F1F5F9]"
                            }`}
                        >
                            <img src="/images/inv-resale/grid.svg" alt="" className="h-4 w-4" />
                            <span>Grid</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setViewMode("list")}
                            className={`flex h-[40px] w-[80px] items-center justify-center gap-2 rounded-[24px] px-3.5 text-[14px] font-medium leading-[20px] transition-all cursor-pointer ${
                                viewMode === "list"
                                    ? "border border-white bg-[#EBEBEB] text-[#4E525D]"
                                    : "border border-transparent bg-transparent text-[#718096] hover:bg-[#F1F5F9]"
                            }`}
                        >
                            <img src="/images/inv-resale/list.svg" alt="" className="h-4 w-4" />
                            <span>List</span>
                        </button>
                    </div>

                    <button
                        type="button"
                        onClick={() => {
                            setEditingHouseId(null);
                            setShowHouseForm(true);
                        }}
                        className="flex h-[44px] items-center justify-center gap-2 rounded-[16px] border border-white bg-[#4E525D] px-4 py-2 text-[13px] font-medium leading-[20px] text-white transition-colors hover:bg-[#3D404A] cursor-pointer"
                    >
                        <img src="/images/inv-resale/plus.svg" alt="" className="h-4 w-4" />
                        <span>Add Unit Layout</span>
                    </button>
                    </>
                    ) : null}
                </div>
            </div>

            {(showHouseForm || editingHouseId) ? (
                <div className="mb-6 rounded-[28px] border border-[#E9ECF2] bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.03)]">
                    <UnitLayoutInlineForm
                        embedded
                        inline
                        houseId={editingHouseId ?? undefined}
                        parentHouseId={houseId}
                        key={editingHouseId ?? "new"}
                        onSuccess={() => {
                            setShowHouseForm(false);
                            setEditingHouseId(null);
                            qc.invalidateQueries({ queryKey: ["unit-layouts"] });
                        }}
                    />
                </div>
            ) : null}

            {isLoading ? (
                <LoadingSpinner label="Loading unit layouts" className="min-h-[320px]" />
            ) : layouts.length === 0 ? (
                <div className="flex h-64 flex-col items-center justify-center text-[#666666]">
                    <svg
                        width="48"
                        height="48"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="mb-4 text-[#999]"
                    >
                        <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                        <circle cx="9" cy="9" r="2" />
                        <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                    </svg>
                    <p className="mb-1 text-[16px] font-medium">No unit layouts found</p>
                    <p className="text-[14px] text-[#999]">
                        {activeTab === "Active" ? "Create your first unit layout" : "No archived unit layouts"}
                    </p>
                </div>
            ) : (
                <>
                    {viewMode === "grid" ? (
                    <div className="flex w-full flex-wrap gap-5">
                        {layouts.map((layout) => {
                            const imageUrl = layout.mainImage?.url || layout.gallery?.[0]?.url;
                            const openEdit = () => {
                                setEditingHouseId(layout.id);
                                setShowHouseForm(true);
                            };
                            return (
                                <div key={layout.id} className="group flex w-[280px] shrink-0 flex-col gap-3 rounded-[28px] border border-[#EBEBEB] bg-white p-2 pb-3 transition-shadow hover:shadow-md">
                                    <div
                                        className="relative h-[200px] w-full shrink-0 cursor-pointer overflow-hidden rounded-[24px] bg-[#F8F9FA]"
                                        onClick={openEdit}
                                    >
                                        {imageUrl ? (
                                            <img
                                                src={imageUrl}
                                                alt={layout.title}
                                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                                                loading="lazy"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center bg-gray-100 text-sm text-[#999]">
                                                No Image
                                            </div>
                                        )}

                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                archiveMut.mutate({ id: layout.id, archived: !layout.archived });
                                            }}
                                            disabled={archiveMut.isPending}
                                            aria-label={layout.archived ? "Restore" : "Archive"}
                                            title={layout.archived ? "Restore" : "Archive"}
                                            className="absolute left-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#EBEBEB] text-[#4E525D] transition-colors hover:bg-[#E0E0E0] disabled:opacity-50"
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
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                deleteMut.mutate(layout.id);
                                            }}
                                            aria-label="Delete"
                                            title="Delete"
                                            className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#FDECEC] text-[#C3362B] transition-colors hover:bg-[#F8DDD9]"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14zM10 11v6M14 11v6" />
                                            </svg>
                                        </button>
                                    </div>

                                    <div className="flex flex-1 flex-col justify-between px-1.5 pb-1">
                                        <div>
                                            <p className="truncate text-sm font-semibold text-[#1A1A1A]">{layout.title}</p>
                                            <p className="text-xs text-[#999]">
                                                {layout.totalArea} m² · {layout.unitTypeOption?.title || `${layout.number || 0} rooms`}
                                            </p>
                                            <p className="mt-1 truncate text-xs text-[#718096]">
                                                {layout.category?.title || "No object"} · Floor {layout.floor}
                                            </p>

                                            <div className="mt-3 rounded-[12px] bg-[#F4F5F6] px-3 py-2">
                                                <p className="text-[11px] font-medium text-[#808191]">Price</p>
                                                <p className="truncate text-sm font-semibold text-[#1A1A1A]">
                                                    {formatPricePreview(layout.prices)}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mt-3 flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => duplicateMut.mutate(layout)}
                                                disabled={duplicateMut.isPending}
                                                className="flex h-10 flex-1 items-center justify-center rounded-[14px] border border-[#E2E8F0] px-4 text-[14px] font-medium leading-[20px] text-[#4E525D] transition-colors hover:bg-gray-50 cursor-pointer disabled:opacity-50"
                                            >
                                                Copy
                                            </button>
                                            <button
                                                type="button"
                                                onClick={openEdit}
                                                className="flex h-10 flex-1 items-center justify-center rounded-[14px] bg-[#4E525D] px-4 text-[14px] font-medium leading-[20px] text-white transition-colors hover:bg-[#3A3D46] cursor-pointer"
                                            >
                                                Edit
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    ) : (
                    <div className="overflow-hidden rounded-[24px] border border-[#EBEBEB] bg-white">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[980px] text-left text-sm">
                                <thead className="border-b border-[#EBEBEB] bg-[#F8F9FA]">
                                    <tr>
                                        <th className="px-5 py-4 font-medium text-[#4E525D]">Unit Layout</th>
                                        <th className="px-4 py-4 font-medium text-[#4E525D]">Object</th>
                                        <th className="px-4 py-4 font-medium text-[#4E525D]">Floor</th>
                                        <th className="px-4 py-4 font-medium text-[#4E525D]">Area</th>
                                        <th className="px-4 py-4 font-medium text-[#4E525D]">Price</th>
                                        <th className="px-4 py-4 font-medium text-[#4E525D]">Status</th>
                                        <th className="px-5 py-4 text-right font-medium text-[#4E525D]">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {layouts.map((layout) => {
                                        const imageUrl = layout.mainImage?.url || layout.gallery?.[0]?.url;
                                        const openEdit = () => {
                                            setEditingHouseId(layout.id);
                                            setShowHouseForm(true);
                                        };
                                        return (
                                            <tr
                                                key={layout.id}
                                                className="border-b border-[#F1F2F4] align-middle transition-colors hover:bg-[#FAFAFB]"
                                            >
                                                <td className="px-5 py-4">
                                                    <button
                                                        type="button"
                                                        onClick={openEdit}
                                                        className="flex items-center gap-3 text-left cursor-pointer"
                                                    >
                                                        <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[#F4F5F6]">
                                                            {imageUrl ? (
                                                                <img
                                                                    src={imageUrl}
                                                                    alt={layout.title}
                                                                    className="h-full w-full object-cover"
                                                                    loading="lazy"
                                                                />
                                                            ) : (
                                                                <div className="flex h-full w-full items-center justify-center text-[11px] text-[#999999]">
                                                                    No Image
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <div className="truncate font-semibold text-[#1A1A1A]">{layout.title}</div>
                                                            <div className="mt-1 truncate text-xs text-[#808191]">{formatDate(layout.createdAt)}</div>
                                                        </div>
                                                    </button>
                                                </td>
                                                <td className="px-4 py-4 text-[#4E525D]">{layout.category?.title || "—"}</td>
                                                <td className="px-4 py-4 text-[#4E525D]">{layout.floor}</td>
                                                <td className="px-4 py-4 text-[#4E525D]">{layout.totalArea} m²</td>
                                                <td className="px-4 py-4 text-[#4E525D]">{formatPricePreview(layout.prices)}</td>
                                                <td className="px-4 py-4">
                                                    <span
                                                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                                                            statusBadgeMap[layout.status] || "bg-[#F4F5F6] text-[#718096]"
                                                        }`}
                                                    >
                                                        {statusLabelMap[layout.status] || layout.status}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => archiveMut.mutate({ id: layout.id, archived: !layout.archived })}
                                                            disabled={archiveMut.isPending}
                                                            aria-label={layout.archived ? "Restore" : "Archive"}
                                                            title={layout.archived ? "Restore" : "Archive"}
                                                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-[#4E525D] transition-colors hover:bg-gray-100 disabled:opacity-50"
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
                                                            onClick={() => duplicateMut.mutate(layout)}
                                                            disabled={duplicateMut.isPending}
                                                            aria-label="Copy"
                                                            title="Copy"
                                                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-[#4E525D] transition-colors hover:bg-gray-100 disabled:opacity-50"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
                                                                <rect x="9" y="9" width="10" height="10" rx="2" />
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 9V7a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
                                                            </svg>
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => deleteMut.mutate(layout.id)}
                                                            aria-label="Delete"
                                                            title="Delete"
                                                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-[#C3362B] transition-colors hover:bg-[#FCEDEA]"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 7.5h15" />
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.75h4.5A1.5 1.5 0 0 1 15.75 5.25V7.5h-7.5V5.25a1.5 1.5 0 0 1 1.5-1.5Z" />
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 7.5l.675 10.125A1.5 1.5 0 0 0 8.922 19.5h6.156a1.5 1.5 0 0 0 1.497-1.875L17.25 7.5" />
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 10.5v5.25M13.5 10.5v5.25" />
                                                            </svg>
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={openEdit}
                                                            className="inline-flex h-9 items-center justify-center rounded-lg px-3 text-sm font-medium text-[#4E525D] transition-colors hover:bg-gray-100"
                                                        >
                                                            Edit
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    )}

                    {pagination ? (
                        <Pagination
                            page={filters.page || 1}
                            totalPages={pagination.totalPages}
                            onPageChange={handlePageChange}
                        />
                    ) : null}
                </>
            )}
        </Wrapper>
    );
}
