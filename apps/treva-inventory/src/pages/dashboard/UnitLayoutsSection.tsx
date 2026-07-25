import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { unitLayoutsApi, type UnitLayout, type UnitLayoutFilters } from "../../api/unit-layouts";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { useMessageCenter } from "../../components/MessageCenter";
import { buildUnitLayoutDuplicatePayload } from "../../utils/entityDuplicatePayloads";
import { getApiErrorMessage } from "../../utils/apiError";
import { HouseForm as UnitLayoutInlineForm } from "./HouseForm";

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

function formatPriceValue(value: number) {
    return value.toLocaleString();
}

function formatPricePreview(prices: Record<string, number> | undefined) {
    if (!prices || Object.keys(prices).length === 0) return "No price";

    const [currency, amount] = Object.entries(prices)[0] || [];
    if (!currency || amount === undefined) return "No price";
    return `${currency} ${formatPriceValue(Number(amount))}`;
}

export function UnitLayoutsSection() {
    const qc = useQueryClient();
    const { showError, showSuccess } = useMessageCenter();
    const [filters, setFilters] = useState<UnitLayoutFilters>({ page: 1, limit: 12 });
    const [search, setSearch] = useState("");
    const [activeTab, setActiveTab] = useState<"Active" | "Archive">("Active");
    const [showHouseForm, setShowHouseForm] = useState(false);
    const [editingHouseId, setEditingHouseId] = useState<string | null>(null);

    const { data: response, isLoading } = useQuery({
        queryKey: ["unit-layouts", filters],
        queryFn: () => unitLayoutsApi.getAll(filters),
    });

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

    const handlePageChange = (page: number) => setFilters((prev) => ({ ...prev, page }));

    const layouts = Array.isArray(response?.data?.data) ? response.data.data : [];
    const pagination = response?.data?.pagination;
    const filteredLayouts = layouts.filter((layout) =>
        activeTab === "Active" ? !layout.archived : !!layout.archived
    );

    return (
        <main className="flex-1 overflow-y-auto p-8 font-sans antialiased selection:bg-[#4A4E5A]/10" style={{ background: "var(--background-primary-50, #FFFFFF80)" }}>
            <div className="mb-8 flex w-full flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className="flex h-[46px] items-center rounded-full border border-[#E2E8F0] bg-white p-1 shadow-sm">
                        {(["Active", "Archive"] as const).map((tab) => (
                            <button
                                key={tab}
                                type="button"
                                onClick={() => setActiveTab(tab)}
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
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    setFilters((prev) => ({ ...prev, search: search.trim() || undefined, page: 1 }));
                                }
                            }}
                            placeholder="Search unit layouts"
                            className="h-10 w-[240px] border-0 bg-transparent text-sm text-[#1A1A1A] outline-none placeholder:text-[#999]"
                        />
                        <button
                            type="button"
                            onClick={() => setFilters((prev) => ({ ...prev, search: search.trim() || undefined, page: 1 }))}
                            className="rounded-[12px] bg-[#EBEBEB] px-3 py-1.5 text-[13px] font-medium text-[#4E525D] transition-colors hover:bg-[#E0E0E0] cursor-pointer"
                        >
                            Search
                        </button>
                    </div>
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
            </div>

            {(showHouseForm || editingHouseId) ? (
                <div className="mb-6 rounded-[28px] border border-[#E9ECF2] bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.03)]">
                    <UnitLayoutInlineForm
                        embedded
                        inline
                        houseId={editingHouseId ?? undefined}
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
            ) : filteredLayouts.length === 0 ? (
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
                    <div className="flex flex-wrap gap-4">
                        {filteredLayouts.map((layout) => {
                            const imageUrl = layout.mainImage?.url || layout.gallery?.[0]?.url;
                            return (
                                <div key={layout.id} className="flex w-[220px] shrink-0 flex-col gap-2 rounded-[16px] border border-[#EBEBEB] bg-white p-2">
                                    <div className="relative h-[140px] w-full overflow-hidden rounded-[12px] bg-[#F3F4F6]">
                                        {imageUrl ? (
                                            <img src={imageUrl} alt={layout.title} className="h-full w-full object-cover" loading="lazy" />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center text-xs text-[#999]">No Image</div>
                                        )}

                                        <div className="absolute left-2 top-2">
                                            <span className={`inline-flex items-center rounded-full px-2 py-1 text-[11px] font-medium ${statusBadgeMap[layout.status || ""] || "bg-[#F4F5F6] text-[#718096]"}`}>
                                                {statusLabelMap[layout.status || ""] || "Status"}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="px-1 pb-1">
                                        <p className="truncate text-sm font-semibold text-[#1A1A1A]">{layout.title}</p>
                                        <p className="text-xs text-[#999]">
                                            {layout.totalArea} m² · {layout.roomOption?.title || `${layout.number || 0} rooms`}
                                        </p>
                                        <p className="mt-1 truncate text-xs text-[#718096]">
                                            {layout.category?.title || "No object"} · Floor {layout.floor}
                                        </p>
                                    </div>

                                    <div className="rounded-[12px] bg-[#F4F5F6] px-3 py-2">
                                        <p className="text-[11px] font-medium text-[#808191]">Price</p>
                                        <p className="truncate text-sm font-semibold text-[#1A1A1A]">
                                            {formatPricePreview(layout.prices)}
                                        </p>
                                    </div>

                                    <div className="flex gap-1 px-1 pb-1">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setEditingHouseId(layout.id);
                                                setShowHouseForm(true);
                                            }}
                                            className="flex-1 rounded-lg border border-[#E2E8F0] py-1.5 text-[12px] font-medium text-[#4E525D] transition-colors hover:bg-gray-50 cursor-pointer"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => archiveMut.mutate({ id: layout.id, archived: !layout.archived })}
                                            disabled={archiveMut.isPending}
                                            className="flex-1 rounded-lg border border-[#E2E8F0] py-1.5 text-[12px] font-medium text-[#4E525D] transition-colors hover:bg-gray-50 cursor-pointer disabled:opacity-50"
                                        >
                                            {layout.archived ? "Restore" : "Archive"}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => deleteMut.mutate(layout.id)}
                                            className="flex-1 rounded-lg border border-[#FECACA] py-1.5 text-[12px] font-medium text-[#C3362B] transition-colors hover:bg-red-50 cursor-pointer"
                                        >
                                            Delete
                                        </button>
                                    </div>

                                    <div className="flex gap-1 px-1">
                                        <button
                                            type="button"
                                            onClick={() => duplicateMut.mutate(layout)}
                                            disabled={duplicateMut.isPending}
                                            className="flex-1 rounded-lg border border-[#E2E8F0] py-1.5 text-[12px] font-medium text-[#4E525D] transition-colors hover:bg-gray-50 cursor-pointer disabled:opacity-50"
                                        >
                                            Duplicate
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {pagination && pagination.totalPages > 1 ? (
                        <div className="mt-6 flex items-center justify-center gap-2">
                            {Array.from({ length: pagination.totalPages }, (_, index) => index + 1).map((page) => (
                                <button
                                    key={page}
                                    type="button"
                                    onClick={() => handlePageChange(page)}
                                    className={`rounded-lg px-3 py-1.5 text-sm ${
                                        page === (filters.page || 1)
                                            ? "bg-[#4E525D] text-white"
                                            : "text-[#666666] hover:bg-gray-100"
                                    }`}
                                >
                                    {page}
                                </button>
                            ))}
                        </div>
                    ) : null}
                </>
            )}
        </main>
    );
}
