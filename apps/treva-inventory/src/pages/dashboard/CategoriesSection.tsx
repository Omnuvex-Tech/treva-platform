import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { categoriesApi, type Category } from "../../api/categories";

export function CategoriesSection() {
    const queryClient = useQueryClient();
    const [showForm, setShowForm] = useState(false);
    const [editItem, setEditItem] = useState<Category | null>(null);
    const [form, setForm] = useState({ title: "", name: "", slug: "" });

    const { data, isLoading } = useQuery({
        queryKey: ["categories"],
        queryFn: () => categoriesApi.getAll(),
    });

    const createMutation = useMutation({
        mutationFn: (d: typeof form) => categoriesApi.create(d),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["categories"] }); setShowForm(false); resetForm(); },
    });

    const updateMutation = useMutation({
        mutationFn: (d: { id: string; data: typeof form }) => categoriesApi.update(d.id, d.data),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["categories"] }); setEditItem(null); setShowForm(false); resetForm(); },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => categoriesApi.delete(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["categories"] }),
    });

    const resetForm = () => setForm({ title: "", name: "", slug: "" });

    const openNew = () => { resetForm(); setEditItem(null); setShowForm(true); };

    const openEdit = (item: Category) => {
        setForm({ title: item.title, name: item.name, slug: item.slug });
        setEditItem(item);
        setShowForm(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editItem) updateMutation.mutate({ id: editItem.id, data: form });
        else createMutation.mutate(form);
    };

    const handleDelete = (id: string, title: string) => {
        if (window.confirm(`Delete "${title}"?`)) deleteMutation.mutate(id);
    };

    const categories = Array.isArray(data?.data) ? data.data : [];

    return (
        <main className="flex-1 p-8 overflow-y-auto flex flex-col gap-6"
            style={{ background: "var(--background-primary-50, #FFFFFF80)" }}>
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <h4 className="m-0 text-[#1A1A1A]" style={{ fontWeight: 600, fontSize: 16, lineHeight: "20px" }}>Categories</h4>
                    <button onClick={openNew}
                        className="px-4 py-2 rounded-xl text-sm font-medium text-white transition-colors"
                        style={{ background: "#4E525D" }}>
                        + New Category
                    </button>
                </div>

                {showForm && (
                    <form onSubmit={handleSubmit} className="mb-6 p-4 rounded-xl border border-gray-200 bg-gray-50">
                        <div className="grid grid-cols-3 gap-4 mb-4">
                            <div>
                                <label className="block text-xs text-[#666666] mb-1">Title</label>
                                <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                                    className="w-full h-10 px-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-gray-400" required />
                            </div>
                            <div>
                                <label className="block text-xs text-[#666666] mb-1">Name</label>
                                <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                                    className="w-full h-10 px-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-gray-400" required />
                            </div>
                            <div>
                                <label className="block text-xs text-[#666666] mb-1">Slug</label>
                                <input value={form.slug} onChange={e => setForm(p => ({ ...p, slug: e.target.value }))}
                                    className="w-full h-10 px-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-gray-400" required />
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button type="submit"
                                className="px-4 py-2 rounded-xl text-sm font-medium text-white"
                                style={{ background: "#4E525D" }}>
                                {editItem ? "Update" : "Create"}
                            </button>
                            <button type="button" onClick={() => { setShowForm(false); resetForm(); setEditItem(null); }}
                                className="px-4 py-2 rounded-xl text-sm font-medium text-[#666666] border border-gray-200">
                                Cancel
                            </button>
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
                                    <th className="px-4 py-3 font-medium text-[#4E525D]">Title</th>
                                    <th className="px-4 py-3 font-medium text-[#4E525D]">Name</th>
                                    <th className="px-4 py-3 font-medium text-[#4E525D]">Slug</th>
                                    <th className="px-4 py-3 font-medium text-[#4E525D] text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {categories.length === 0 ? (
                                    <tr><td colSpan={4} className="px-4 py-8 text-center text-[#666666]">No categories yet</td></tr>
                                ) : categories.map((cat: Category) => (
                                    <tr key={cat.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                                        <td className="px-4 py-3 text-[#1A1A1A]">{cat.title}</td>
                                        <td className="px-4 py-3 text-[#666666]">{cat.name}</td>
                                        <td className="px-4 py-3 text-[#666666]">{cat.slug}</td>
                                        <td className="px-4 py-3 text-right">
                                            <button onClick={() => openEdit(cat)} className="mr-3 text-sm text-[#4E525D] hover:underline">Edit</button>
                                            <button onClick={() => handleDelete(cat.id, cat.title)} className="text-sm text-[#C3362B] hover:underline">Delete</button>
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
