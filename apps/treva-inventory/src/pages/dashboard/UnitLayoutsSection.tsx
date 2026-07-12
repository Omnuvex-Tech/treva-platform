import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { unitLayoutsApi, type UnitLayout, type UnitLayoutFilters } from "../../api/unit-layouts";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { useMessageCenter } from "../../components/MessageCenter";
import { RowActions } from "../../components/RowActions";
import { buildUnitLayoutDuplicatePayload } from "../../utils/entityDuplicatePayloads";
import { getApiErrorMessage } from "../../utils/apiError";

const statusColors: Record<string, string> = {
    available: "bg-green-100 text-green-700",
    sold: "bg-red-100 text-red-700",
    reserved: "bg-yellow-100 text-yellow-700",
};

export function UnitLayoutsSection() {
    const qc = useQueryClient();
    const navigate = useNavigate();
    const { showError, showSuccess } = useMessageCenter();
    const [filters, setFilters] = useState<UnitLayoutFilters>({ page: 1, limit: 12 });
    const [search, setSearch] = useState("");

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

    const handlePageChange = (page: number) => setFilters(f => ({ ...f, page }));

    const layouts = Array.isArray(response?.data?.data) ? response.data.data : [];
    const pagination = response?.data?.pagination;

    const formatPrices = (prices: Record<string, number> | undefined) => {
        if (!prices || Object.keys(prices).length === 0) return "—";
        return Object.entries(prices).map(([c, p]) => `${c} ${Number(p).toLocaleString()}`).join(" / ");
    };

    return (
        <main className="flex-1 p-8 overflow-y-auto" style={{ background: "var(--background-primary-50, #FFFFFF80)" }}>
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <h4 className="m-0 text-[#1A1A1A]" style={{ fontWeight: 600, fontSize: 16 }}>Unit Layouts</h4>
                    <button onClick={() => navigate("/unit-layouts/new")}
                        className="px-4 py-2 rounded-xl text-sm font-medium text-white transition-colors"
                        style={{ background: "#4E525D" }}>
                        + New Unit Layout
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
                    <LoadingSpinner label="Loading unit layouts" />
                ) : (
                    <>
                        <div className="overflow-hidden rounded-xl border border-gray-100">
                            <table className="w-full text-left text-sm">
                                <thead className="border-b border-gray-100 bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 font-medium text-[#4E525D]">Title</th>
                                        <th className="px-4 py-3 font-medium text-[#4E525D]">Category</th>
                                        <th className="px-4 py-3 font-medium text-[#4E525D]">Floor</th>
                                        <th className="px-4 py-3 font-medium text-[#4E525D]">Area</th>
                                        <th className="px-4 py-3 font-medium text-[#4E525D]">Prices</th>
                                        <th className="px-4 py-3 font-medium text-[#4E525D]">Status</th>
                                        <th className="px-4 py-3 font-medium text-[#4E525D] text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {layouts.length === 0 ? (
                                        <tr><td colSpan={7} className="px-4 py-8 text-center text-[#666666]">No unit layouts yet</td></tr>
                                    ) : layouts.map((layout: UnitLayout) => (
                                        <tr key={layout.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                                            <td className="px-4 py-3 text-[#1A1A1A]">{layout.title}</td>
                                            <td className="px-4 py-3 text-[#666666]">{layout.category?.title || "—"}</td>
                                            <td className="px-4 py-3 text-[#666666]">{layout.floor}</td>
                                            <td className="px-4 py-3 text-[#666666]">{Number(layout.totalArea)} m²</td>
                                            <td className="px-4 py-3 text-[#666666] max-w-[200px] truncate">{formatPrices(layout.prices)}</td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[layout.statusOption?.value?.toLowerCase() || ""] || "bg-gray-100 text-gray-600"}`}>
                                                    {layout.statusOption?.value || "—"}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <RowActions
                                                    onEdit={() => navigate(`/unit-layouts/${layout.id}/edit`)}
                                                    onDuplicate={() => duplicateMut.mutate(layout)}
                                                    onDelete={() => deleteMut.mutate(layout.id)}
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {pagination && pagination.totalPages > 1 && (
                            <div className="mt-4 flex items-center justify-center gap-2">
                                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(p => (
                                    <button key={p} onClick={() => handlePageChange(p)}
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
