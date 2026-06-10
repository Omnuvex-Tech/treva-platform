import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { categoriesApi } from "../../api/categories";
import { Layout } from "../../components/Layout";

export function CategoryEdit() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [title, setTitle] = useState("");
    const [name, setName] = useState("");
    const [slug, setSlug] = useState("");

    const { data: category, isLoading } = useQuery({
        queryKey: ["category", id],
        queryFn: () => categoriesApi.getById(id!),
        enabled: !!id,
    });

    useEffect(() => {
        if (category?.data) {
            setTitle(category.data.title);
            setName(category.data.name);
            setSlug(category.data.slug);
        }
    }, [category]);

    const updateMutation = useMutation({
        mutationFn: () => categoriesApi.update(id!, { title, name, slug }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["categories"] });
            navigate("/categories");
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateMutation.mutate();
    };

    if (isLoading) {
        return (
            <Layout>
                <div className="py-8 text-center text-white/50">Loading...</div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="mx-auto max-w-lg">
                <div className="mb-4">
                    <h2 className="text-lg font-semibold">Edit Category</h2>
                    <p className="text-sm text-white/50">Update category details</p>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="rounded-xl border border-white/10 bg-white/3 p-6"
                >
                    <div className="flex flex-col gap-4">
                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-white/70">
                                Title
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/40 focus:border-white/30 focus:outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-white/70">
                                Name
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/40 focus:border-white/30 focus:outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-white/70">
                                Slug
                            </label>
                            <input
                                type="text"
                                value={slug}
                                onChange={(e) => setSlug(e.target.value)}
                                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/40 focus:border-white/30 focus:outline-none"
                                required
                            />
                        </div>
                    </div>

                    {updateMutation.isError && (
                        <div className="mt-4 rounded-lg bg-red-500/20 p-3 text-center text-sm text-red-300">
                            {(updateMutation.error as Error)?.message || "Failed to update category"}
                        </div>
                    )}

                    <div className="mt-6 flex gap-3">
                        <button
                            type="submit"
                            disabled={updateMutation.isPending}
                            className="rounded-lg bg-white/10 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/20 disabled:opacity-50"
                        >
                            {updateMutation.isPending ? "Saving..." : "Save"}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate("/categories")}
                            className="rounded-lg border border-white/10 px-5 py-2.5 text-sm text-white/70 transition-colors hover:bg-white/5"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </Layout>
    );
}
