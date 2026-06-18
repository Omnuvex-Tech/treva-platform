import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import {
    unitLayoutsApi,
    UnitLayout,
    UnitLayoutFilters,
} from "../../api/unit-layouts";
import { Layout } from "../../components/Layout";

const statusColors: Record<string, string> = {
    available: "bg-green-500/20 text-green-300",
    sold: "bg-red-500/20 text-red-300",
    reserved: "bg-yellow-500/20 text-yellow-300",
};

export function UnitLayoutList() {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const [filters, setFilters] = useState<UnitLayoutFilters>({
        page: 1,
        limit: 12,
    });
    const [search, setSearch] = useState("");

    const { data: response, isLoading, isError, error } = useQuery({
        queryKey: ["unit-layouts", filters],
        queryFn: () => unitLayoutsApi.getAll(filters),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => unitLayoutsApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["unit-layouts"] });
        },
    });

    const handleDelete = (id: string, title: string) => {
        if (window.confirm(`Delete "${title}"?`)) {
            deleteMutation.mutate(id);
        }
    };

    const handleSearch = () => {
        setFilters((prev) => ({ ...prev, search, page: 1 }));
    };

    const handlePageChange = (page: number) => {
        setFilters((prev) => ({ ...prev, page }));
    };

    const layouts = Array.isArray(response?.data?.data) ? response.data.data : [];
    const pagination = response?.data?.pagination;
    const formatPrices = (prices: Record<string, number> | undefined) => {
        if (!prices || Object.keys(prices).length === 0) return "-";
        return Object.entries(prices).map(([curr, price]) => `${curr} ${Number(price).toLocaleString()}`).join(' / ');
    };
    const formatArea = (value: UnitLayout["totalArea"]) => {
        const amount = Number(value);
        return Number.isFinite(amount) ? `${amount} m²` : "-";
    };

    return (
        <Layout>
            <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Unit Layouts</h2>
                <Link
                    to="/unit-layouts/new"
                    className="rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/20"
                >
                    + New Unit Layout
                </Link>
            </div>

            <div className="mb-4 flex gap-3">
                <input
                    type="text"
                    placeholder="Search..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder-white/40 focus:border-white/30 focus:outline-none"
                />
                <button
                    onClick={handleSearch}
                    className="rounded-lg bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/20"
                >
                    Search
                </button>
            </div>

            {isLoading ? (
                <div className="py-8 text-center text-white/50">Loading...</div>
            ) : isError ? (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-6 text-center">
                    <div className="text-sm font-medium text-red-200">
                        Failed to load unit layouts
                    </div>
                    <div className="mt-1 text-xs text-red-200/70">
                        {(error as Error)?.message || "Please try again."}
                    </div>
                </div>
            ) : (
                <>
                    <div className="overflow-hidden rounded-xl border border-white/10">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b border-white/10 bg-white/5">
                                <tr>
                                    <th className="px-4 py-3 font-medium">Title</th>
                                    <th className="px-4 py-3 font-medium">Category</th>
                                    <th className="px-4 py-3 font-medium">Floor</th>
                                    <th className="px-4 py-3 font-medium">Area</th>
                                    <th className="px-4 py-3 font-medium">Prices</th>
                                    <th className="px-4 py-3 font-medium">Status</th>
                                    <th className="px-4 py-3 font-medium text-right">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {layouts.map((layout: UnitLayout) => (
                                    <tr
                                        key={layout.id}
                                        className="border-b border-white/5 transition-colors hover:bg-white/3"
                                    >
                                        <td className="px-4 py-3">{layout.title}</td>
                                        <td className="px-4 py-3 text-white/70">
                                            {layout.category?.title || "-"}
                                        </td>
                                        <td className="px-4 py-3 text-white/70">
                                            {layout.floor}
                                        </td>
                                        <td className="px-4 py-3 text-white/70">
                                            {formatArea(layout.totalArea)}
                                        </td>
                                        <td className="px-4 py-3 text-white/70">
                                            {formatPrices(layout.prices)}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span
                                                className={`inline-block rounded-full px-2 py-0.5 text-xs ${
                                                    statusColors[layout.statusOption?.value?.toLowerCase() || ""] || "bg-white/10 text-white/70"
                                                }`}
                                            >
                                                {layout.statusOption?.value || "—"}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <Link
                                                to={`/unit-layouts/${layout.id}/edit`}
                                                className="mr-2 text-blue-400 hover:text-blue-300"
                                            >
                                                Edit
                                            </Link>
                                            <button
                                                onClick={() =>
                                                    handleDelete(layout.id, layout.title)
                                                }
                                                className="text-red-400 hover:text-red-300"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {layouts.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={7}
                                            className="px-4 py-8 text-center text-white/50"
                                        >
                                            No unit layouts yet
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {pagination && pagination.totalPages > 1 && (
                        <div className="mt-4 flex items-center justify-center gap-2">
                            {Array.from(
                                { length: pagination.totalPages },
                                (_, i) => i + 1
                            ).map((page) => (
                                <button
                                    key={page}
                                    onClick={() => handlePageChange(page)}
                                    className={`rounded-lg px-3 py-1.5 text-sm ${
                                        page === pagination.page
                                            ? "bg-white/20 text-white"
                                            : "text-white/50 hover:bg-white/10"
                                    }`}
                                >
                                    {page}
                                </button>
                            ))}
                        </div>
                    )}
                </>
            )}
        </Layout>
    );
}
