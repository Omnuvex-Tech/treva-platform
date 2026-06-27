import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { pulseCategoriesApi } from "../../api/pulse-categories";
import { Layout } from "../../components/Layout";

export function PulseCategoryForm() {
    const { id } = useParams<{ id: string }>();
    const isEdit = Boolean(id);
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [name, setName] = useState("");
    const [error, setError] = useState("");

    const { data: existing } = useQuery({
        queryKey: ["pulse-category", id],
        queryFn: () => pulseCategoriesApi.getById(id!),
        enabled: isEdit,
    });

    useEffect(() => {
        if (existing?.data) {
            setName(existing.data.name);
        }
    }, [existing?.data]);

    const saveMutation = useMutation({
        mutationFn: () => {
            if (isEdit) {
                return pulseCategoriesApi.update(id!, { name });
            }
            return pulseCategoriesApi.create({ name });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["pulse-categories"] });
            navigate("/pulse/categories");
        },
        onError: (err: any) => {
            setError(err?.response?.data?.message || "An error occurred");
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        if (!name.trim()) {
            setError("Name is required");
            return;
        }
        saveMutation.mutate();
    };

    const inputClass =
        "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-white/30 placeholder:text-white/30";

    return (
        <Layout>
            <div className="mb-4">
                <h2 className="text-lg font-semibold">
                    {isEdit ? "Edit Category" : "New Category"}
                </h2>
            </div>

            <form onSubmit={handleSubmit} className="max-w-md space-y-4">
                {error && (
                    <div className="rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-400">
                        {error}
                    </div>
                )}

                <div>
                    <label className="mb-1 block text-xs text-white/60">Category Name</label>
                    <input
                        className={inputClass}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Bloq, Kampaniya..."
                        autoFocus
                    />
                    <p className="mt-1 text-xs text-white/30">
                        Slug will be auto-generated from the name
                    </p>
                </div>

                <div className="flex gap-3">
                    <button
                        type="submit"
                        disabled={saveMutation.isPending}
                        className="rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/20 disabled:opacity-50"
                    >
                        {saveMutation.isPending ? "Saving..." : isEdit ? "Update" : "Create"}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate("/pulse/categories")}
                        className="rounded-lg border border-white/10 px-4 py-2 text-sm text-white/70 hover:bg-white/5"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </Layout>
    );
}
