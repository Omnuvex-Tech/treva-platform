import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { pulseCategoriesApi, PulseCategory } from "../../api/pulse-categories";
import { Layout } from "../../components/Layout";

export function PulseCategoryList() {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState("");

    const { data: result, isLoading } = useQuery({
        queryKey: ["pulse-categories"],
        queryFn: () => pulseCategoriesApi.getAll(),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => pulseCategoriesApi.delete(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["pulse-categories"] }),
    });

    const handleDelete = (id: string, name: string) => {
        if (window.confirm(`Delete "${name}"?`)) deleteMutation.mutate(id);
    };

    const categories = (result?.data ?? []) as PulseCategory[];
    const filtered = categories.filter((c) =>
        !search || c.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <Layout>
            <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Pulse Categories</h2>
                <Link
                    to="/pulse/categories/new"
                    className="rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/20"
                >
                    + New Category
                </Link>
            </div>

            <div className="mb-4">
                <input
                    className="w-full max-w-xs rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-white/30 placeholder:text-white/30"
                    placeholder="Search by name..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {isLoading ? (
                <div className="py-8 text-center text-white/50">Loading...</div>
            ) : (
                <div className="overflow-hidden rounded-xl border border-white/10">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b border-white/10 bg-white/5">
                            <tr>
                                <th className="px-4 py-3 font-medium">Name</th>
                                <th className="px-4 py-3 font-medium">Slug</th>
                                <th className="px-4 py-3 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((category) => (
                                <tr
                                    key={category.id}
                                    className="border-b border-white/5 transition-colors hover:bg-white/3"
                                >
                                    <td className="px-4 py-3 font-medium">{category.name}</td>
                                    <td className="px-4 py-3 text-white/50">{category.slug}</td>
                                    <td className="px-4 py-3 text-right">
                                        <Link
                                            to={`/pulse/categories/${category.id}/edit`}
                                            className="mr-3 text-blue-400 hover:text-blue-300"
                                        >
                                            Edit
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(category.id, category.name)}
                                            className="text-red-400 hover:text-red-300"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filtered.length === 0 && (
                                <tr>
                                    <td colSpan={3} className="px-4 py-8 text-center text-white/30">
                                        No categories found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </Layout>
    );
}
