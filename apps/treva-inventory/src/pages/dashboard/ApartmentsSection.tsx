import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { apartmentsApi, type Apartment, type ApartmentFilters } from "../../api/apartments";

export function ApartmentsSection() {
    const qc = useQueryClient();
    const navigate = useNavigate();
    const [filters, setFilters] = useState<ApartmentFilters>({ page: 1, limit: 12 });
    const [search, setSearch] = useState("");

    const { data: response, isLoading } = useQuery({
        queryKey: ["apartments", filters],
        queryFn: () => apartmentsApi.getAll(filters),
    });

    const deleteMut = useMutation({
        mutationFn: (id: string) => apartmentsApi.delete(id),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["apartments"] }),
    });

    const formatPrice = (p: number) => p.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    const pagination = response?.data?.pagination;

    const items = Array.isArray(response?.data?.data) ? response.data.data : [];

    return (
        <main className="flex-1 p-8 overflow-y-auto" style={{ background: "var(--background-primary-50, #FFFFFF80)" }}>
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <h4 className="m-0 text-[#1A1A1A]" style={{ fontWeight: 600, fontSize: 16 }}>
                        Apartments {pagination ? `(${pagination.total})` : ""}
                    </h4>
                    <button onClick={() => navigate("/resale/apartments/new")}
                        className="px-4 py-2 rounded-xl text-sm font-medium text-white"
                        style={{ background: "#4E525D" }}>
                        + New Apartment
                    </button>
                </div>

                <div className="flex gap-2 mb-4">
                    <input value={search} onChange={e => setSearch(e.target.value)}
                        onKeyDown={e => { if (e.key === "Enter") setFilters(f => ({ ...f, search: search || undefined, page: 1 })); }}
                        placeholder="Search..."
                        className="flex-1 h-10 px-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-gray-400" />
                    <button onClick={() => setFilters(f => ({ ...f, search: search || undefined, page: 1 }))}
                        className="px-4 py-2 rounded-xl text-sm font-medium text-white"
                        style={{ background: "#4E525D" }}>Search</button>
                </div>

                {isLoading ? (
                    <div className="py-8 text-center text-[#666666]">Loading...</div>
                ) : (
                    <>
                        <div className="overflow-hidden rounded-xl border border-gray-100">
                            <table className="w-full text-left text-sm">
                                <thead className="border-b border-gray-100 bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 font-medium text-[#4E525D]">Title</th>
                                        <th className="px-4 py-3 font-medium text-[#4E525D]">Type</th>
                                        <th className="px-4 py-3 font-medium text-[#4E525D]">Price</th>
                                        <th className="px-4 py-3 font-medium text-[#4E525D]">Area</th>
                                        <th className="px-4 py-3 font-medium text-[#4E525D]">Rooms</th>
                                        <th className="px-4 py-3 font-medium text-[#4E525D]">Floor</th>
                                        <th className="px-4 py-3 font-medium text-[#4E525D]">Owner</th>
                                        <th className="px-4 py-3 font-medium text-[#4E525D] text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.length === 0 ? (
                                        <tr><td colSpan={8} className="px-4 py-8 text-center text-[#666666]">No apartments yet</td></tr>
                                    ) : items.map((apt: Apartment) => (
                                        <tr key={apt.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                                            <td className="px-4 py-3 font-medium text-[#1A1A1A]">{apt.title}</td>
                                            <td className="px-4 py-3">
                                                <span className="inline-block rounded bg-gray-100 px-2 py-0.5 text-xs text-[#666666]">
                                                    {apt.apartmentType?.title || "—"}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-[#1A1A1A]">{formatPrice(apt.priceTotal)} AZN</td>
                                            <td className="px-4 py-3 text-[#666666]">{apt.area} m²</td>
                                            <td className="px-4 py-3 text-[#666666]">{apt.roomCount}</td>
                                            <td className="px-4 py-3 text-[#666666]">{apt.floorFrom}/{apt.floorTo}</td>
                                            <td className="px-4 py-3 text-[#666666]">
                                                {apt.owner ? `${apt.owner.firstName} ${apt.owner.lastName}` : "—"}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <button onClick={() => navigate(`/resale/apartments/${apt.id}/edit`)}
                                                    className="mr-3 text-sm text-[#4E525D] hover:underline">Edit</button>
                                                <button onClick={() => { if (window.confirm(`Delete "${apt.title}"?`)) deleteMut.mutate(apt.id); }}
                                                    className="text-sm text-[#C3362B] hover:underline">Delete</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {pagination && pagination.totalPages > 1 && (
                            <div className="mt-4 flex items-center justify-center gap-2">
                                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(p => (
                                    <button key={p} onClick={() => setFilters(f => ({ ...f, page: p }))}
                                        className={`px-3 py-1.5 rounded-lg text-sm ${p === (filters.page || 1) ? "bg-[#4E525D] text-white" : "text-[#666666] hover:bg-gray-100"}`}>
                                        {p}
                                    </button>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </main>
    );
}
