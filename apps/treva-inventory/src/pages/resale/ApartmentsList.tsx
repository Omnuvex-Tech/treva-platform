import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { apartmentsApi, Apartment, ApartmentFilters } from "../../api/apartments";
import { apartmentTypesApi, ApartmentType } from "../../api/apartment-types";
import { Layout } from "../../components/Layout";

export function ApartmentsList() {
    const queryClient = useQueryClient();
    const [filters, setFilters] = useState<ApartmentFilters>({ page: 1, limit: 12 });
    const [search, setSearch] = useState("");

    const { data: response, isLoading, error } = useQuery({
        queryKey: ["apartments", filters],
        queryFn: () => apartmentsApi.getAll(filters),
    });

    const { data: types } = useQuery({
        queryKey: ["apartment-types"],
        queryFn: () => apartmentTypesApi.getAll(),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => apartmentsApi.delete(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["apartments"] }),
    });

    const copyMutation = useMutation({
        mutationFn: async (sourceId: string) => {
            const res = await apartmentsApi.getById(sourceId);
            const source = res.data;
            const newSlug = `${source.slug}-copy-${Math.random().toString(36).slice(2, 6)}`;
            return apartmentsApi.create({
                title: `${source.title} Copy`,
                slug: newSlug,
                description: source.description || undefined,
                image: source.image || undefined,
                gallery: source.gallery || [],
                priceTotal: source.priceTotal,
                priceByArea: source.priceByArea,
                roomCount: source.roomCount,
                area: source.area,
                floorFrom: source.floorFrom,
                floorTo: source.floorTo,
                locationTitle: source.locationTitle || undefined,
                locationUrl: source.locationUrl || undefined,
                apartmentTypeId: source.apartmentTypeId,
                ownerId: source.ownerId || undefined,
                attributeIds: source.attributeIds || [],
                requestIds: source.requestIds || [],
            });
        },
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: ["apartments"] });
            if (res?.data?.id) {
                window.location.href = `/resale/apartments/${res.data.id}/edit`;
            }
        },
    });

    const handleDelete = (id: string, title: string) => {
        if (window.confirm(`Delete "${title}"?`)) deleteMutation.mutate(id);
    };

    const handleSearch = () => {
        setFilters((f) => ({ ...f, search: search || undefined, page: 1 }));
    };

    const formatPrice = (p: number) =>
        p.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");

    const getTypeTitle = (typeId: string) =>
        types?.data?.find((t: ApartmentType) => t.id === typeId)?.title || "—";

    const pagination = response?.data?.pagination;

    return (
        <Layout>
            <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">
                    Apartments {pagination ? `(${pagination.total})` : ""}
                </h2>
                <Link
                    to="/resale/apartments/new"
                    className="rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/20"
                >
                    + New Apartment
                </Link>
            </div>

            {/* Search */}
            <div className="mb-4 flex gap-2">
                <input
                    className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-white/30 focus:border-white/30"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    placeholder="Search apartments..."
                />
                <button
                    onClick={handleSearch}
                    className="rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/20"
                >
                    Search
                </button>
            </div>

            {isLoading ? (
                <div className="py-8 text-center text-white/50">Loading...</div>
            ) : error ? (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-center text-sm text-red-300">
                    {(error as any)?.message || "Please try again."}
                </div>
            ) : (
                <div className="overflow-hidden rounded-xl border border-white/10">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b border-white/10 bg-white/5">
                            <tr>
                                <th className="px-4 py-3 font-medium">Title</th>
                                <th className="px-4 py-3 font-medium">Type</th>
                                <th className="px-4 py-3 font-medium">Price</th>
                                <th className="px-4 py-3 font-medium">Area</th>
                                <th className="px-4 py-3 font-medium">Rooms</th>
                                <th className="px-4 py-3 font-medium">Floor</th>
                                <th className="px-4 py-3 font-medium">Owner</th>
                                <th className="px-4 py-3 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Array.isArray(response?.data?.data) && response.data.data.length > 0 ? (
                                response.data.data.map((apt: Apartment) => (
                                    <tr
                                        key={apt.id}
                                        className="border-b border-white/5 transition-colors hover:bg-white/3"
                                    >
                                        <td className="px-4 py-3 font-medium">{apt.title}</td>
                                        <td className="px-4 py-3 text-white/70">
                                            <span className="rounded bg-white/10 px-2 py-0.5 text-xs">
                                                {apt.apartmentType?.title || getTypeTitle(apt.apartmentTypeId)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">{formatPrice(apt.priceTotal)} AZN</td>
                                        <td className="px-4 py-3 text-white/70">{apt.area} m²</td>
                                        <td className="px-4 py-3 text-white/70">{apt.roomCount}</td>
                                        <td className="px-4 py-3 text-white/70">
                                            {apt.floorFrom}/{apt.floorTo}
                                        </td>
                                        <td className="px-4 py-3 text-white/70">
                                            {apt.owner
                                                ? `${apt.owner.firstName} ${apt.owner.lastName}`
                                                : "—"}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <Link
                                                to={`/resale/apartments/${apt.id}/edit`}
                                                className="mr-2 text-blue-400 hover:text-blue-300"
                                            >
                                                Edit
                                            </Link>
                                            <button
                                                disabled={copyMutation.isPending}
                                                onClick={() => copyMutation.mutate(apt.id)}
                                                className="mr-2 text-white/70 hover:text-white disabled:opacity-50"
                                            >
                                                {copyMutation.isPending ? "Copying..." : "Copy"}
                                            </button>
                                            <button
                                                onClick={() => handleDelete(apt.id, apt.title)}
                                                className="text-red-400 hover:text-red-300"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={8} className="px-4 py-8 text-center text-white/50">
                                        No apartments yet
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {pagination && pagination.totalPages > 1 && (
                <div className="mt-4 flex items-center justify-center gap-2">
                    {Array.from({ length: pagination.totalPages }, (_, i) => (
                        <button
                            key={i + 1}
                            onClick={() => setFilters((f) => ({ ...f, page: i + 1 }))}
                            className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
                                (filters.page || 1) === i + 1
                                    ? "bg-white/20 text-white"
                                    : "text-white/50 hover:bg-white/10"
                            }`}
                        >
                            {i + 1}
                        </button>
                    ))}
                </div>
            )}
        </Layout>
    );
}
