import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { statusOptionsApi, StatusOption } from "../../api/status-options";
import { Layout } from "../../components/Layout";

export function StatusOptionList() {
    const queryClient = useQueryClient();
    const [showForm, setShowForm] = useState(false);
    const [editItem, setEditItem] = useState<StatusOption | null>(null);
    const [value, setValue] = useState("");
    const [order, setOrder] = useState<number>(0);
    const [error, setError] = useState("");

    const { data: statusOptions, isLoading } = useQuery({
        queryKey: ["status-options"],
        queryFn: () => statusOptionsApi.getAll(),
    });

    const createMutation = useMutation({
        mutationFn: () => statusOptionsApi.create({ value: value.trim(), order }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["status-options"] });
            resetForm();
        },
        onError: (err: any) => {
            setError(err?.response?.data?.message || "An error occurred");
        },
    });

    const updateMutation = useMutation({
        mutationFn: () =>
            statusOptionsApi.update(editItem!.id, { value: value.trim(), order }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["status-options"] });
            resetForm();
        },
        onError: (err: any) => {
            setError(err?.response?.data?.message || "An error occurred");
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => statusOptionsApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["status-options"] });
        },
    });

    const resetForm = () => {
        setShowForm(false);
        setEditItem(null);
        setValue("");
        setOrder(0);
        setError("");
    };

    const handleEdit = (item: StatusOption) => {
        setEditItem(item);
        setValue(item.value);
        setOrder(item.order);
        setError("");
        setShowForm(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        if (!value.trim()) {
            setError("Value is required");
            return;
        }
        if (editItem) {
            updateMutation.mutate();
        } else {
            createMutation.mutate();
        }
    };

    const handleDelete = (id: string, val: string) => {
        if (window.confirm(`Delete status option "${val}"?`)) {
            deleteMutation.mutate(id);
        }
    };

    const items = Array.isArray(statusOptions?.data) ? (statusOptions.data as StatusOption[]) : [];

    return (
        <Layout>
            <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Status Options</h2>
                <button
                    onClick={() => { resetForm(); setShowForm(true); }}
                    className="rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/20"
                >
                    + New Status Option
                </button>
            </div>

            {showForm && (
                <div className="mb-6 rounded-xl border border-white/10 bg-white/3 p-5">
                    <h3 className="mb-4 text-sm font-semibold text-white/80">
                        {editItem ? "Edit Status Option" : "New Status Option"}
                    </h3>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        {error && (
                            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-400">
                                {error}
                            </div>
                        )}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="mb-1.5 block text-xs font-medium text-white/70">
                                    Value <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={value}
                                    onChange={(e) => setValue(e.target.value)}
                                    placeholder="e.g. Available, Sold, Reserved"
                                    className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/40 focus:border-white/30 focus:outline-none"
                                    required
                                    autoFocus
                                />
                                <p className="mt-1 text-xs text-white/40">
                                    The status label shown in the filter (e.g. "Available")
                                </p>
                            </div>
                            <div>
                                <label className="mb-1.5 block text-xs font-medium text-white/70">
                                    Order
                                </label>
                                <input
                                    type="number"
                                    value={order}
                                    onChange={(e) => setOrder(parseInt(e.target.value) || 0)}
                                    placeholder="e.g. 0"
                                    className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/40 focus:border-white/30 focus:outline-none"
                                    min={0}
                                />
                                <p className="mt-1 text-xs text-white/40">
                                    Sort order (lower = shown first)
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button
                                type="submit"
                                disabled={createMutation.isPending || updateMutation.isPending}
                                className="rounded-lg bg-white/15 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/25 disabled:opacity-50"
                            >
                                {createMutation.isPending || updateMutation.isPending
                                    ? "Saving..."
                                    : editItem ? "Save Changes" : "Create"}
                            </button>
                            <button
                                type="button"
                                onClick={resetForm}
                                className="rounded-lg px-5 py-2.5 text-sm text-white/50 hover:text-white"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {isLoading ? (
                <div className="py-8 text-center text-white/50">Loading...</div>
            ) : (
                <div className="overflow-hidden rounded-xl border border-white/10">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b border-white/10 bg-white/5">
                            <tr>
                                <th className="px-4 py-3 font-medium">Value</th>
                                <th className="px-4 py-3 font-medium">Order</th>
                                <th className="px-4 py-3 font-medium">Created</th>
                                <th className="px-4 py-3 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item) => (
                                <tr
                                    key={item.id}
                                    className="border-b border-white/5 transition-colors hover:bg-white/3"
                                >
                                    <td className="px-4 py-3">
                                        <span className="inline-flex items-center justify-center rounded-md border border-white/20 bg-white/10 px-2.5 py-1 text-xs font-bold tracking-wider">
                                            {item.value}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-white/70">{item.order}</td>
                                    <td className="px-4 py-3 text-white/50">
                                        {new Date(item.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <button
                                            onClick={() => handleEdit(item)}
                                            className="mr-3 text-blue-400 hover:text-blue-300"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(item.id, item.value)}
                                            className="text-red-400 hover:text-red-300"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {items.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-4 py-8 text-center text-white/50">
                                        No status options yet. Add "Available", "Sold", "Reserved" to get started.
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
