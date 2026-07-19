import { useEffect, useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
    apartmentsApi,
    type Apartment,
    type ApartmentFilters,
} from "../../api/apartments";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { useMessageCenter } from "../../components/MessageCenter";
import { RowActions } from "../../components/RowActions";
import { PropertyCard } from "../resale/PropertyCard";
import { buildApartmentDuplicatePayload } from "../../utils/entityDuplicatePayloads";
import { getApiErrorMessage } from "../../utils/apiError";
import { IoClose } from "react-icons/io5";

export function ResaleApartmentsCardSection() {
    const navigate = useNavigate();
    const qc = useQueryClient();
    const { showError, showSuccess } = useMessageCenter();
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [filters, setFilters] = useState<ApartmentFilters>({
        page: 1,
        limit: 12,
    });
    const [filterOpen, setFilterOpen] = useState(false);
    const filterPanelRef = useRef<HTMLDivElement>(null);
    const [draftFilters, setDraftFilters] = useState({
        minPrice: "",
        maxPrice: "",
        minArea: "",
        maxArea: "",
        minGrossArea: "",
        maxGrossArea: "",
        roomCount: "",
    });

    const { data: response, isLoading } = useQuery({
        queryKey: ["apartments", filters],
        queryFn: () => apartmentsApi.getAll(filters),
    });

    const deleteMut = useMutation({
        mutationFn: (id: string) => apartmentsApi.delete(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["apartments"] });
            showSuccess({ title: "Apartment deleted" });
        },
        onError: (error) => {
            showError({
                title: "Apartment could not be deleted",
                description: getApiErrorMessage(error, "Please try again."),
            });
        },
    });

    const duplicateMut = useMutation({
        mutationFn: (apartment: Apartment) =>
            apartmentsApi.create(buildApartmentDuplicatePayload(apartment)),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["apartments"] });
            showSuccess({ title: "Apartment duplicated" });
        },
        onError: (error) => {
            showError({
                title: "Apartment could not be duplicated",
                description: getApiErrorMessage(error, "Please try again."),
            });
        },
    });

    const apartments = Array.isArray(response?.data?.data)
        ? response.data.data
        : [];
    const pagination = response?.data?.pagination;
    const formatPrice = (value: number) =>
        value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    const toNumberOrUndefined = (value: string) => {
        const trimmed = value.trim();
        if (!trimmed) return undefined;
        const parsed = Number(trimmed);
        return Number.isFinite(parsed) ? parsed : undefined;
    };
    const activeFilterCount = [
        filters.minPrice,
        filters.maxPrice,
        filters.minArea,
        filters.maxArea,
        filters.minGrossArea,
        filters.maxGrossArea,
        filters.roomCount,
    ].filter((value) => value !== undefined).length;

    const applyFilters = () => {
        setFilters((prev) => ({
            ...prev,
            page: 1,
            minPrice: toNumberOrUndefined(draftFilters.minPrice),
            maxPrice: toNumberOrUndefined(draftFilters.maxPrice),
            minArea: toNumberOrUndefined(draftFilters.minArea),
            maxArea: toNumberOrUndefined(draftFilters.maxArea),
            minGrossArea: toNumberOrUndefined(draftFilters.minGrossArea),
            maxGrossArea: toNumberOrUndefined(draftFilters.maxGrossArea),
            roomCount: toNumberOrUndefined(draftFilters.roomCount),
        }));
        setFilterOpen(false);
    };

    const clearFilters = () => {
        setDraftFilters({
            minPrice: "",
            maxPrice: "",
            minArea: "",
            maxArea: "",
            minGrossArea: "",
            maxGrossArea: "",
            roomCount: "",
        });
        setFilters((prev) => ({
            ...prev,
            page: 1,
            minPrice: undefined,
            maxPrice: undefined,
            minArea: undefined,
            maxArea: undefined,
            minGrossArea: undefined,
            maxGrossArea: undefined,
            roomCount: undefined,
        }));
        setFilterOpen(false);
    };

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

    const filterInputClass = "h-11 w-full rounded-2xl border border-[#E7E9EE] bg-[#F8F9FB] px-4 text-sm text-[#1A1A1A] outline-none transition-colors focus:border-[#C8CDD8] focus:bg-white";

    return (
        <main
            className="flex-1 p-8 overflow-y-auto font-sans antialiased selection:bg-[#4A4E5A]/10"
            style={{ background: "var(--background-primary-50, #FFFFFF80)" }}
        >
            {/* Action Bar */}
            <div className="relative mb-8 flex w-full items-center justify-end gap-3">
                {/* Filter Pill Button */}
                <button
                    type="button"
                    onClick={() => setFilterOpen((prev) => !prev)}
                    className="flex items-center justify-center gap-2 w-[85px] h-[44px] bg-[#EBEBEB] border border-white rounded-[16px] py-2 px-3.5 text-[14px] font-medium leading-[20px] tracking-[0px] text-[#4E525D] hover:bg-[#E0E0E0] transition-colors cursor-pointer"
                >
                    <img src="/images/inv-resale/filter.svg" alt="" className="w-4 h-4" />
                    <span>Filter</span>
                    {activeFilterCount > 0 ? (
                        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#4E525D] px-1 text-[11px] font-semibold text-white">
                            {activeFilterCount}
                        </span>
                    ) : null}
                </button>

                {/* Segmented Layout Selector Toggle */}
                <div className="flex items-center bg-white border border-[#E2E8F0] rounded-full h-[46px] p-1 shadow-sm">
                    <button
                        onClick={() => setViewMode("grid")}
                        className={`flex items-center justify-center gap-2 w-[80px] h-[40px] rounded-[24px] py-2 px-3.5 text-[14px] font-medium leading-[20px] tracking-[0px] transition-all cursor-pointer ${
                            viewMode === "grid"
                                ? "bg-[#EBEBEB] text-[#4E525D] border border-white"
                                : "bg-transparent text-[#718096] border border-transparent hover:bg-[#F1F5F9]"
                        }`}
                    >
                        <img src="/images/inv-resale/grid.svg" alt="" className="w-4 h-4" />
                        <span>Grid</span>
                    </button>

                    <button
                        onClick={() => setViewMode("list")}
                        className={`flex items-center justify-center gap-2 w-[80px] h-[40px] rounded-[24px] py-2 px-3.5 text-[14px] font-medium leading-[20px] tracking-[0px] transition-all cursor-pointer ${
                            viewMode === "list"
                                ? "bg-[#EBEBEB] text-[#4E525D] border border-white"
                                : "bg-transparent text-[#718096] border border-transparent hover:bg-[#F1F5F9]"
                        }`}
                    >
                        <img src="/images/inv-resale/list.svg" alt="" className="w-4 h-4" />
                        <span>List</span>
                    </button>
                </div>

                {/* Global Blueprint Action Button */}
                <button
                    onClick={() => navigate("/dashboard/resale/apartments/create")}
                    className="flex items-center justify-center gap-2 w-[124px] h-[44px] bg-[#4E525D] border border-white rounded-[16px] py-2 px-3.5 text-[13px] font-medium leading-[20px] tracking-[0px] text-white hover:bg-[#3D404A] transition-colors cursor-pointer"
                >
                    <img src="/images/inv-resale/plus.svg" alt="" className="w-4 h-4" />
                    <span>Add Listing</span>
                </button>

                {filterOpen ? (
                    <div
                        ref={filterPanelRef}
                        className="absolute right-0 top-[56px] z-20 w-full max-w-[440px] rounded-[28px] border border-[#E7E9EE] bg-white p-5 shadow-[0_20px_50px_rgba(17,24,39,0.12)]"
                    >
                        <div className="mb-4 flex items-center justify-between">
                            <div>
                                <h4 className="text-[16px] font-semibold text-[#1A1A1A]">Filter Listings</h4>
                                <p className="mt-1 text-[13px] text-[#808191]">Price, area, gross area and room count</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setFilterOpen(false)}
                                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F4F5F6] text-[#4E525D] transition-colors hover:bg-[#E9ECF2]"
                            >
                                <IoClose size={18} />
                            </button>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <label className="mb-1.5 block text-xs font-medium text-[#4E525D]">Min Price</label>
                                <input
                                    type="number"
                                    min={0}
                                    value={draftFilters.minPrice}
                                    onChange={(e) => setDraftFilters((prev) => ({ ...prev, minPrice: e.target.value }))}
                                    className={filterInputClass}
                                    placeholder="50000"
                                />
                            </div>
                            <div>
                                <label className="mb-1.5 block text-xs font-medium text-[#4E525D]">Max Price</label>
                                <input
                                    type="number"
                                    min={0}
                                    value={draftFilters.maxPrice}
                                    onChange={(e) => setDraftFilters((prev) => ({ ...prev, maxPrice: e.target.value }))}
                                    className={filterInputClass}
                                    placeholder="250000"
                                />
                            </div>
                            <div>
                                <label className="mb-1.5 block text-xs font-medium text-[#4E525D]">Min Area</label>
                                <input
                                    type="number"
                                    min={0}
                                    value={draftFilters.minArea}
                                    onChange={(e) => setDraftFilters((prev) => ({ ...prev, minArea: e.target.value }))}
                                    className={filterInputClass}
                                    placeholder="50"
                                />
                            </div>
                            <div>
                                <label className="mb-1.5 block text-xs font-medium text-[#4E525D]">Max Area</label>
                                <input
                                    type="number"
                                    min={0}
                                    value={draftFilters.maxArea}
                                    onChange={(e) => setDraftFilters((prev) => ({ ...prev, maxArea: e.target.value }))}
                                    className={filterInputClass}
                                    placeholder="180"
                                />
                            </div>
                            <div>
                                <label className="mb-1.5 block text-xs font-medium text-[#4E525D]">Min Gross Area</label>
                                <input
                                    type="number"
                                    min={0}
                                    value={draftFilters.minGrossArea}
                                    onChange={(e) => setDraftFilters((prev) => ({ ...prev, minGrossArea: e.target.value }))}
                                    className={filterInputClass}
                                    placeholder="60"
                                />
                            </div>
                            <div>
                                <label className="mb-1.5 block text-xs font-medium text-[#4E525D]">Max Gross Area</label>
                                <input
                                    type="number"
                                    min={0}
                                    value={draftFilters.maxGrossArea}
                                    onChange={(e) => setDraftFilters((prev) => ({ ...prev, maxGrossArea: e.target.value }))}
                                    className={filterInputClass}
                                    placeholder="220"
                                />
                            </div>
                            <div className="sm:col-span-2">
                                <label className="mb-1.5 block text-xs font-medium text-[#4E525D]">Room Count</label>
                                <input
                                    type="number"
                                    min={1}
                                    value={draftFilters.roomCount}
                                    onChange={(e) => setDraftFilters((prev) => ({ ...prev, roomCount: e.target.value }))}
                                    className={filterInputClass}
                                    placeholder="3"
                                />
                            </div>
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

            {/* Card Grid */}
            {isLoading ? (
                <LoadingSpinner label="Loading listings" className="min-h-[320px]" />
            ) : apartments.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-[#666666]">
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
                    <p className="text-[16px] font-medium mb-1">
                        No apartments found
                    </p>
                    <p className="text-[14px] text-[#999]">
                        Try adjusting your search or filters
                    </p>
                </div>
            ) : (
                viewMode === "grid" ? (
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-3 w-full">
                        {apartments.map((apt: Apartment) => (
                            <PropertyCard
                                key={apt.id}
                                apartment={apt}
                                onDuplicate={(apartment) => duplicateMut.mutate(apartment)}
                                onDelete={(apartment) => {
                                    if (window.confirm(`Delete "${apartment.title}"?`)) {
                                        deleteMut.mutate(apartment.id);
                                    }
                                }}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-[24px] border border-[#EBEBEB] bg-white">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[980px] text-left text-sm">
                                <thead className="border-b border-[#EBEBEB] bg-[#F8F9FA]">
                                    <tr>
                                        <th className="px-5 py-4 font-medium text-[#4E525D]">Listing</th>
                                        <th className="px-4 py-4 font-medium text-[#4E525D]">Type</th>
                                        <th className="px-4 py-4 font-medium text-[#4E525D]">Price</th>
                                        <th className="px-4 py-4 font-medium text-[#4E525D]">Area</th>
                                        <th className="px-4 py-4 font-medium text-[#4E525D]">Rooms</th>
                                        <th className="px-4 py-4 font-medium text-[#4E525D]">Owner</th>
                                        <th className="px-4 py-4 font-medium text-[#4E525D]">Status</th>
                                        <th className="px-5 py-4 text-right font-medium text-[#4E525D]">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {apartments.map((apt: Apartment) => {
                                        const primaryPrice = apt.prices?.[0];
                                        const price = primaryPrice?.priceTotal ?? apt.priceTotal ?? 0;
                                        const currencyCode = primaryPrice?.currency?.value || apt.currency?.value || "";
                                        const status = apt.status || "active";

                                        return (
                                            <tr
                                                key={apt.id}
                                                className="border-b border-[#F1F2F4] align-middle transition-colors hover:bg-[#FAFAFB]"
                                            >
                                                <td className="px-5 py-4">
                                                    <button
                                                        type="button"
                                                        onClick={() => navigate(`/dashboard/resale/apartments/${apt.id}`)}
                                                        className="flex items-center gap-3 text-left cursor-pointer"
                                                    >
                                                        <div className="h-14 w-14 overflow-hidden rounded-2xl bg-[#F4F5F6] flex-shrink-0">
                                                            {apt.image ? (
                                                                <img
                                                                    src={apt.image}
                                                                    alt={apt.title}
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
                                                            <div className="truncate font-semibold text-[#1A1A1A]">
                                                                {apt.title}
                                                            </div>
                                                            <div className="mt-1 truncate text-xs text-[#808191]">
                                                                {apt.locationTitle || "—"}
                                                            </div>
                                                        </div>
                                                    </button>
                                                </td>
                                                <td className="px-4 py-4 text-[#4E525D]">
                                                    {apt.apartmentType?.title || "—"}
                                                </td>
                                                <td className="px-4 py-4 font-medium text-[#1A1A1A]">
                                                    {formatPrice(price)}{currencyCode ? ` ${currencyCode}` : ""}
                                                </td>
                                                <td className="px-4 py-4 text-[#4E525D]">
                                                    {apt.area} m²
                                                </td>
                                                <td className="px-4 py-4 text-[#4E525D]">
                                                    {apt.roomCount}
                                                </td>
                                                <td className="px-4 py-4 text-[#4E525D]">
                                                    {apt.owner ? `${apt.owner.firstName} ${apt.owner.lastName}` : "—"}
                                                </td>
                                                <td className="px-4 py-4">
                                                    <span
                                                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                                                            status === "active"
                                                                ? "bg-[#E7F6ED] text-[#2D9A5B]"
                                                                : status === "reserved"
                                                                    ? "bg-[#FDF4E0] text-[#967B38]"
                                                                    : "bg-[#FDECEC] text-[#C3362B]"
                                                        }`}
                                                    >
                                                        {status.charAt(0).toUpperCase() + status.slice(1)}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <RowActions
                                                        onEdit={() => navigate(`/dashboard/resale/apartments/${apt.id}`)}
                                                        onDuplicate={() => duplicateMut.mutate(apt)}
                                                        onDelete={() => {
                                                            if (window.confirm(`Delete "${apt.title}"?`)) {
                                                                deleteMut.mutate(apt.id);
                                                            }
                                                        }}
                                                    />
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )
            )}

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
                <div className="mt-6 flex items-center justify-center gap-2">
                    {Array.from(
                        { length: pagination.totalPages },
                        (_, i) => i + 1
                    ).map((p) => (
                        <button
                            key={p}
                            onClick={() =>
                                setFilters((f) => ({ ...f, page: p }))
                            }
                            className={`px-3 py-1.5 rounded-lg text-sm cursor-pointer ${
                                p === (filters.page || 1)
                                    ? "bg-[#4E525D] text-white"
                                    : "text-[#666666] hover:bg-gray-100"
                            }`}
                        >
                            {p}
                        </button>
                    ))}
                </div>
            )}
        </main>
    );
}
