import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { apartmentTypesApi, ApartmentType } from "../../api/apartment-types";
import { Layout } from "../../components/Layout";

export function ApartmentTypesList() {
    const queryClient = useQueryClient();

    const { data: types, isLoading } = useQuery({
        queryKey: ["apartment-types"],
        queryFn: () => apartmentTypesApi.getAll(),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => apartmentTypesApi.delete(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["apartment-types"] }),
    });

    const handleDelete = (id: string, title: string) => {
        if (window.confirm(`Delete "${title}"?`)) deleteMutation.mutate(id);
    };

    return (
        <Layout>
            <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Apartment Types</h2>
                <Link
                    to="/resale/apartment-types/new"
                    className="rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/20"
                >
                    + New Type
                </Link>
            </div>

            {isLoading ? (
                <div className="py-8 text-center text-white/50">Loading...</div>
            ) : (
                <div className="overflow-hidden rounded-xl border border-white/10">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b border-white/10 bg-white/5">
                            <tr>
                                <th className="px-4 py-3 font-medium">Title</th>
                                <th className="px-4 py-3 font-medium">Slug</th>
                                <th className="px-4 py-3 font-medium">Order</th>
                                <th className="px-4 py-3 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {types?.data?.map((type: ApartmentType) => (
                                <tr
                                    key={type.id}
                                    className="border-b border-white/5 transition-colors hover:bg-white/3"
                                >
                                    <td className="px-4 py-3 font-medium">{type.title}</td>
                                    <td className="px-4 py-3 text-white/70">{type.slug}</td>
                                    <td className="px-4 py-3 text-white/70">{type.order}</td>
                                    <td className="px-4 py-3 text-right">
                                        <Link
                                            to={`/resale/apartment-types/${type.id}/edit`}
                                            className="mr-2 text-blue-400 hover:text-blue-300"
                                        >
                                            Edit
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(type.id, type.title)}
                                            className="text-red-400 hover:text-red-300"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {types?.data?.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-4 py-8 text-center text-white/50">
                                        No types yet
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
