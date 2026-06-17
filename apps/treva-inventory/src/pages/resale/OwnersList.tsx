import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ownersApi, Owner } from "../../api/owners";
import { Layout } from "../../components/Layout";

export function OwnersList() {
    const queryClient = useQueryClient();

    const { data: owners, isLoading } = useQuery({
        queryKey: ["owners"],
        queryFn: () => ownersApi.getAll(),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => ownersApi.delete(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["owners"] }),
    });

    const handleDelete = (id: string, name: string) => {
        if (window.confirm(`Delete "${name}"?`)) deleteMutation.mutate(id);
    };

    return (
        <Layout>
            <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Owners</h2>
                <Link
                    to="/resale/owners/new"
                    className="rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/20"
                >
                    + New Owner
                </Link>
            </div>

            {isLoading ? (
                <div className="py-8 text-center text-white/50">Loading...</div>
            ) : (
                <div className="overflow-hidden rounded-xl border border-white/10">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b border-white/10 bg-white/5">
                            <tr>
                                <th className="px-4 py-3 font-medium">Name</th>
                                <th className="px-4 py-3 font-medium">Profession</th>
                                <th className="px-4 py-3 font-medium">Phone</th>
                                <th className="px-4 py-3 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {owners?.data?.map((owner: Owner) => (
                                <tr
                                    key={owner.id}
                                    className="border-b border-white/5 transition-colors hover:bg-white/3"
                                >
                                    <td className="px-4 py-3 font-medium">
                                        {owner.firstName} {owner.lastName}
                                    </td>
                                    <td className="px-4 py-3 text-white/70">
                                        {owner.profession || "—"}
                                    </td>
                                    <td className="px-4 py-3 text-white/70">{owner.phoneNumber}</td>
                                    <td className="px-4 py-3 text-right">
                                        <Link
                                            to={`/resale/owners/${owner.id}/edit`}
                                            className="mr-2 text-blue-400 hover:text-blue-300"
                                        >
                                            Edit
                                        </Link>
                                        <button
                                            onClick={() =>
                                                handleDelete(
                                                    owner.id,
                                                    `${owner.firstName} ${owner.lastName}`
                                                )
                                            }
                                            className="text-red-400 hover:text-red-300"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {owners?.data?.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-4 py-8 text-center text-white/50">
                                        No owners yet
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
