import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { requestsApi, type Request } from "../../api/requests";

export function RequestsSection() {
    const qc = useQueryClient();

    const { data, isLoading } = useQuery({ queryKey: ["requests"], queryFn: () => requestsApi.getAll() });

    const deleteMut = useMutation({
        mutationFn: (id: string) => requestsApi.delete(id),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["requests"] }),
    });

    const items = Array.isArray(data?.data) ? data.data : [];

    return (
        <main className="flex-1 p-8 overflow-y-auto" style={{ background: "var(--background-primary-50, #FFFFFF80)" }}>
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <h4 className="m-0 text-[#1A1A1A]" style={{ fontWeight: 600, fontSize: 16 }}>Requests</h4>
                </div>

                {isLoading ? (
                    <div className="py-8 text-center text-[#666666]">Loading...</div>
                ) : (
                    <div className="overflow-hidden rounded-xl border border-gray-100">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b border-gray-100 bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 font-medium text-[#4E525D]">Full Name</th>
                                    <th className="px-4 py-3 font-medium text-[#4E525D]">Phone</th>
                                    <th className="px-4 py-3 font-medium text-[#4E525D]">Date</th>
                                    <th className="px-4 py-3 font-medium text-[#4E525D] text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.length === 0 ? (
                                    <tr><td colSpan={4} className="px-4 py-8 text-center text-[#666666]">No requests yet</td></tr>
                                ) : items.map((item: Request) => (
                                    <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                                        <td className="px-4 py-3 text-[#1A1A1A]">{item.fullName}</td>
                                        <td className="px-4 py-3 text-[#666666]">{item.phoneNumber}</td>
                                        <td className="px-4 py-3 text-[#666666]">{new Date(item.createdAt).toLocaleDateString()}</td>
                                        <td className="px-4 py-3 text-right">
                                            <button onClick={() => { if (window.confirm(`Delete request from "${item.fullName}"?`)) deleteMut.mutate(item.id); }} className="text-sm text-[#C3362B] hover:underline">Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </main>
    );
}
