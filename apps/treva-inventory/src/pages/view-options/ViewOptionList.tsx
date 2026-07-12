import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { viewOptionsApi, ViewOption } from "../../api/view-options";
import { Layout } from "../../components/Layout";

export function ViewOptionList() {
    const queryClient = useQueryClient();
    const [showForm, setShowForm] = useState(false);
    const [editItem, setEditItem] = useState<ViewOption | null>(null);
    const [name, setName] = useState("");
    const [title, setTitle] = useState("");
    const [error, setError] = useState("");

    const { data: viewOptions, isLoading } = useQuery({
        queryKey: ["view-options"],
        queryFn: () => viewOptionsApi.getAll(),
    });

    const createMutation = useMutation({
        mutationFn: () => viewOptionsApi.create({ name: name.trim(), title: title.trim() }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["view-options"] });
            resetForm();
        },
        onError: (err: any) => {
            setError(err?.response?.data?.message || "An error occurred");
        },
    });

    const updateMutation = useMutation({
        mutationFn: () =>
            viewOptionsApi.update(editItem!.id, { name: name.trim(), title: title.trim() }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["view-options"] });
            resetForm();
        },
        onError: (err: any) => {
            setError(err?.response?.data?.message || "An error occurred");
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => viewOptionsApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["view-options"] });
        },
    });

    const resetForm = () => {
        setShowForm(false);
        setEditItem(null);
        setName("");
        setTitle("");
        setError("");
    };

    const handleEdit = (item: ViewOption) => {
        setEditItem(item);
        setName(item.name);
        setTitle(item.title);
        setError("");
        setShowForm(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        if (!name.trim()) {
            setError("Name is required");
            return;
        }
        if (!title.trim()) {
            setError("Title is required");
            return;
        }
        if (editItem) {
            updateMutation.mutate();
        } else {
            createMutation.mutate();
        }
    };

    const handleDelete = (id: string) => {
        deleteMutation.mutate(id);
    };

    const items = Array.isArray(viewOptions?.data) ? viewOptions.data as ViewOption[] : [];

    return (
        <Layout>
            <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">View Options</h2>
                <button
                    onClick={() => { resetForm(); setShowForm(true); }}
                    className="rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/20"
                >
                    + New View Option
                </button>
            </div>

            {showForm && (
                <div className="mb-6 rounded-xl border border-white/10 bg-white/3 p-5">
                    <h3 className="mb-4 text-sm font-semibold text-white/80">
                        {editItem ? "Edit View Option" : "New View Option"}
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
                                    Name <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="sea-view"
                                    className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/40 focus:border-white/30 focus:outline-none"
                                    required
                                    autoFocus
                                />
                                <p className="mt-1 text-xs text-white/40">
                                    Internal unique name used in the system.
                                </p>
                            </div>
                            <div>
                                <label className="mb-1.5 block text-xs font-medium text-white/70">
                                    Title <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Sea View"
                                    className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/40 focus:border-white/30 focus:outline-none"
                                    required
                                />
                                <p className="mt-1 text-xs text-white/40">
                                    Label shown in dropdowns and filters.
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
                                <th className="px-4 py-3 font-medium">Name</th>
                                <th className="px-4 py-3 font-medium">Title</th>
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
                                            {item.name}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-white/80">{item.title}</td>
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
                                            onClick={() => handleDelete(item.id)}
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
                                        No view options yet. Add "sea-view / Sea View" to get started.
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
