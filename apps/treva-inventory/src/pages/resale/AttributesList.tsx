import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { attributesApi, Attribute } from "../../api/attributes";
import { Layout } from "../../components/Layout";

export function AttributesList() {
    const queryClient = useQueryClient();

    const { data: attributes, isLoading } = useQuery({
        queryKey: ["attributes"],
        queryFn: () => attributesApi.getAll(),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => attributesApi.delete(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["attributes"] }),
    });

    const handleDelete = (id: string, name: string) => {
        if (window.confirm(`Delete "${name}"?`)) deleteMutation.mutate(id);
    };

    return (
        <Layout>
            <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Attributes</h2>
                <Link
                    to="/resale/attributes/new"
                    className="rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/20"
                >
                    + New Attribute
                </Link>
            </div>

            {isLoading ? (
                <div className="py-8 text-center text-white/50">Loading...</div>
            ) : (
                <div className="overflow-hidden rounded-xl border border-white/10">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b border-white/10 bg-white/5">
                            <tr>
                                <th className="px-4 py-3 font-medium">Icon</th>
                                <th className="px-4 py-3 font-medium">Name</th>
                                <th className="px-4 py-3 font-medium">Title</th>
                                <th className="px-4 py-3 font-medium">Value</th>
                                <th className="px-4 py-3 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {attributes?.data?.map((attr: Attribute) => (
                                <tr
                                    key={attr.id}
                                    className="border-b border-white/5 transition-colors hover:bg-white/3"
                                >
                                    <td className="px-4 py-3">
                                        {attr.icon ? (
                                            <img src={attr.icon} alt="" className="h-5 w-5 rounded object-cover" />
                                        ) : (
                                            <span className="text-white/40">—</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-white/70">
                                        <span className="rounded bg-white/10 px-2 py-0.5 text-xs">
                                            {attr.name}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 font-medium">{attr.title}</td>
                                    <td className="px-4 py-3 text-white/70">{attr.value}</td>
                                    <td className="px-4 py-3 text-right">
                                        <Link
                                            to={`/resale/attributes/${attr.id}/edit`}
                                            className="mr-2 text-blue-400 hover:text-blue-300"
                                        >
                                            Edit
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(attr.id, attr.name)}
                                            className="text-red-400 hover:text-red-300"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {attributes?.data?.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-4 py-8 text-center text-white/50">
                                        No attributes yet
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
