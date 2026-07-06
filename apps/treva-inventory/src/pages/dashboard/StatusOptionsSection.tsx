import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { statusOptionsApi, type StatusOption } from "../../api/status-options";

export function StatusOptionsSection() {
    const qc = useQueryClient();
    const [show, setShow] = useState(false);
    const [edit, setEdit] = useState<StatusOption | null>(null);
    const [value, setValue] = useState("");
    const [order, setOrder] = useState("");

    const { data, isLoading } = useQuery({ queryKey: ["status-options"], queryFn: () => statusOptionsApi.getAll() });

    const createMut = useMutation({
        mutationFn: (d: { value: string; order?: number }) => statusOptionsApi.create(d),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ["status-options"] }); close(); },
    });
    const updateMut = useMutation({
        mutationFn: (d: { id: string; data: { value?: string; order?: number } }) => statusOptionsApi.update(d.id, d.data),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ["status-options"] }); close(); },
    });
    const deleteMut = useMutation({
        mutationFn: (id: string) => statusOptionsApi.delete(id),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["status-options"] }),
    });

    const close = () => { setShow(false); setEdit(null); setValue(""); setOrder(""); };

    const items = Array.isArray(data?.data) ? data.data : [];

    return (
        <main className="flex-1 p-8 overflow-y-auto" style={{ background: "var(--background-primary-50, #FFFFFF80)" }}>
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <h4 className="m-0 text-[#1A1A1A]" style={{ fontWeight: 600, fontSize: 16 }}>Status Options</h4>
                    <button onClick={() => { close(); setShow(true); }} className="px-4 py-2 rounded-xl text-sm font-medium text-white" style={{ background: "#4E525D" }}>+ New Status Option</button>
                </div>

                {show && (
                    <form onSubmit={(e) => { e.preventDefault(); const p = { value, order: order ? Number(order) : undefined }; if (edit) updateMut.mutate({ id: edit.id, data: p }); else createMut.mutate(p); }} className="mb-6 p-4 rounded-xl border border-gray-200 bg-gray-50">
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-xs text-[#666666] mb-1">Value</label>
                                <input value={value} onChange={e => setValue(e.target.value)} className="w-full h-10 px-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-gray-400" required />
                            </div>
                            <div>
                                <label className="block text-xs text-[#666666] mb-1">Order</label>
                                <input type="number" value={order} onChange={e => setOrder(e.target.value)} className="w-full h-10 px-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-gray-400" />
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button type="submit" className="px-4 py-2 rounded-xl text-sm font-medium text-white" style={{ background: "#4E525D" }}>{edit ? "Update" : "Create"}</button>
                            <button type="button" onClick={close} className="px-4 py-2 rounded-xl text-sm font-medium text-[#666666] border border-gray-200">Cancel</button>
                        </div>
                    </form>
                )}

                {isLoading ? (
                    <div className="py-8 text-center text-[#666666]">Loading...</div>
                ) : (
                    <div className="overflow-hidden rounded-xl border border-gray-100">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b border-gray-100 bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 font-medium text-[#4E525D]">Value</th>
                                    <th className="px-4 py-3 font-medium text-[#4E525D]">Order</th>
                                    <th className="px-4 py-3 font-medium text-[#4E525D] text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.length === 0 ? (
                                    <tr><td colSpan={3} className="px-4 py-8 text-center text-[#666666]">No status options yet</td></tr>
                                ) : items.map((item: StatusOption) => (
                                    <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                                        <td className="px-4 py-3 text-[#1A1A1A]">{item.value}</td>
                                        <td className="px-4 py-3 text-[#666666]">{item.order}</td>
                                        <td className="px-4 py-3 text-right">
                                            <button onClick={() => { setValue(item.value); setOrder(String(item.order)); setEdit(item); setShow(true); }} className="mr-3 text-sm text-[#4E525D] hover:underline">Edit</button>
                                            <button onClick={() => { if (window.confirm(`Delete "${item.value}"?`)) deleteMut.mutate(item.id); }} className="text-sm text-[#C3362B] hover:underline">Delete</button>
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
