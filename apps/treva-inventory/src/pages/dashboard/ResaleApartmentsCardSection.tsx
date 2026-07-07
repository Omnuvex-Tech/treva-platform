import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
    apartmentsApi,
    type Apartment,
    type ApartmentFilters,
} from "../../api/apartments";
import { PropertyCard } from "../resale/PropertyCard";

export function ResaleApartmentsCardSection() {
    const navigate = useNavigate();
    const qc = useQueryClient();
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [filters, setFilters] = useState<ApartmentFilters>({
        page: 1,
        limit: 12,
    });

    const { data: response, isLoading } = useQuery({
        queryKey: ["apartments", filters],
        queryFn: () => apartmentsApi.getAll(filters),
    });

    const deleteMut = useMutation({
        mutationFn: (id: string) => apartmentsApi.delete(id),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["apartments"] }),
    });

    const apartments = Array.isArray(response?.data?.data)
        ? response.data.data
        : [];
    const pagination = response?.data?.pagination;

    return (
        <main
            className="flex-1 p-8 overflow-y-auto font-sans antialiased selection:bg-[#4A4E5A]/10"
            style={{ background: "var(--background-primary-50, #FFFFFF80)" }}
        >
            {/* Action Bar */}
            <div className="w-full flex items-center justify-end gap-3 mb-8">
                {/* Filter Pill Button */}
                <button className="flex items-center justify-center gap-2 w-[85px] h-[44px] bg-[#EBEBEB] border border-white rounded-[16px] py-2 px-3.5 text-[14px] font-medium leading-[20px] tracking-[0px] text-[#4E525D] hover:bg-[#E0E0E0] transition-colors cursor-pointer">
                    <img src="/images/inv-resale/filter.svg" alt="" className="w-4 h-4" />
                    <span>Filter</span>
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
            </div>

            {/* Card Grid */}
            {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div
                            key={i}
                            className="bg-white border border-[#E2E8F0] rounded-[24px] p-4 shadow-sm overflow-hidden animate-pulse"
                        >
                            <div className="aspect-[4/3] bg-[#F8F9FA] rounded-[18px] mb-4" />
                            <div className="px-1">
                                <div className="h-5 bg-gray-100 rounded w-3/4 mb-3" />
                                <div className="h-4 bg-gray-100 rounded w-1/2 mb-3" />
                                <div className="h-4 bg-gray-100 rounded w-full mb-4" />
                                <div className="flex justify-between items-center pt-2 border-t border-[#F1F5F9]">
                                    <div className="h-8 bg-gray-100 rounded-full w-1/3" />
                                    <div className="h-8 bg-gray-100 rounded-full w-1/4" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
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
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full">
                    {apartments.map((apt: Apartment) => (
                        <PropertyCard key={apt.id} apartment={apt} />
                    ))}
                </div>
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
