import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { requestsApi, Request } from "../../api/requests";
import { Layout } from "../../components/Layout";

export function RequestsList() {
    const queryClient = useQueryClient();

    const { data: requests, isLoading } = useQuery({
        queryKey: ["requests"],
        queryFn: () => requestsApi.getAll(),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => requestsApi.delete(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["requests"] }),
    });

    const handleDelete = (id: string, name: string) => {
        if (window.confirm(`Delete "${name}"?`)) deleteMutation.mutate(id);
    };

    return (
        <Layout>
            <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Requests</h2>
            </div>

            {isLoading ? (
                <div className="py-8 text-center text-white/50">Loading...</div>
            ) : (
                <div className="overflow-hidden rounded-xl border border-white/10">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b border-white/10 bg-white/5">
                            <tr>
                                <th className="px-4 py-3 font-medium">Full Name</th>
                                <th className="px-4 py-3 font-medium">Phone Number</th>
                                <th className="px-4 py-3 font-medium">Date</th>
                                <th className="px-4 py-3 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {requests?.data?.map((req: Request) => (
                                <tr
                                    key={req.id}
                                    className="border-b border-white/5 transition-colors hover:bg-white/3"
                                >
                                    <td className="px-4 py-3 font-medium">{req.fullName}</td>
                                    <td className="px-4 py-3 text-white/70">{req.phoneNumber}</td>
                                    <td className="px-4 py-3 text-white/50">
                                        {new Date(req.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <button
                                            onClick={() => handleDelete(req.id, req.fullName)}
                                            className="text-red-400 hover:text-red-300"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {requests?.data?.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-4 py-8 text-center text-white/50">
                                        No requests yet
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
