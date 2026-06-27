import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { authorsApi, CreateAuthorData } from "../../api/authors";
import { Layout } from "../../components/Layout";

function slugify(text: string) {
    return text
        .toLowerCase()
        .replace(/[ə]/g, "e")
        .replace(/[ü]/g, "u")
        .replace(/[ı]/g, "i")
        .replace(/[ö]/g, "o")
        .replace(/[ç]/g, "c")
        .replace(/[ş]/g, "s")
        .replace(/[ğ]/g, "g")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
}

export function AuthorForm() {
    const { id } = useParams();
    const isEdit = Boolean(id);
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data: existing } = useQuery({
        queryKey: ["author", id],
        queryFn: () => authorsApi.getById(id!),
        enabled: isEdit,
    });

    const [form, setForm] = useState<CreateAuthorData>({
        name: "",
        slug: "",
        title: "",
        avatar: "",
        description: "",
    });

    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (existing?.data) {
            const a = existing.data;
            setForm({
                name: a.name,
                slug: a.slug,
                title: a.title ?? "",
                avatar: a.avatar ?? "",
                description: a.description ?? "",
            });
        }
    }, [existing?.data]);

    const mutation = useMutation({
        mutationFn: (data: CreateAuthorData) =>
            isEdit ? authorsApi.update(id!, data) : authorsApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["authors"] });
            navigate("/pulse/authors");
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        mutation.mutate(form);
    };

    const handleAvatarUpload = async (file: File) => {
        setUploading(true);
        try {
            const res = await authorsApi.uploadFile(file);
            setForm((f) => ({ ...f, avatar: res.data.url }));
        } catch {
            alert("Upload failed");
        } finally {
            setUploading(false);
        }
    };

    const inputClass =
        "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-white/30 placeholder:text-white/30";

    return (
        <Layout>
            <div className="mb-4">
                <h2 className="text-lg font-semibold">
                    {isEdit ? "Edit Author" : "New Author"}
                </h2>
            </div>

            <form onSubmit={handleSubmit} className="max-w-xl space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="mb-1 block text-xs text-white/60">Name</label>
                        <input
                            className={inputClass}
                            value={form.name}
                            onChange={(e) => {
                                const name = e.target.value;
                                setForm((f) => ({
                                    ...f,
                                    name,
                                    slug: f.slug || slugify(name),
                                }));
                            }}
                            placeholder="e.g. Emil Qurbanov"
                            required
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-xs text-white/60">Slug</label>
                        <input
                            className={inputClass}
                            value={form.slug}
                            onChange={(e) =>
                                setForm((f) => ({ ...f, slug: e.target.value }))
                            }
                            placeholder="e.g. emil-qurbanov"
                            required
                        />
                    </div>
                </div>
                <div>
                    <label className="mb-1 block text-xs text-white/60">Title / Position</label>
                    <input
                        className={inputClass}
                        value={form.title ?? ""}
                        onChange={(e) =>
                            setForm((f) => ({ ...f, title: e.target.value }))
                        }
                        placeholder="e.g. Satış üzrə Menecer"
                    />
                </div>
                <div>
                    <label className="mb-1 block text-xs text-white/60">Description</label>
                    <textarea
                        className={inputClass}
                        rows={3}
                        value={form.description ?? ""}
                        onChange={(e) =>
                            setForm((f) => ({ ...f, description: e.target.value }))
                        }
                        placeholder="Short bio..."
                    />
                </div>

                {/* Avatar */}
                <div>
                    <label className="mb-1 block text-xs text-white/60">Avatar</label>
                    {form.avatar ? (
                        <div className="relative inline-block">
                            <img
                                src={form.avatar}
                                alt="Avatar"
                                className="h-20 w-20 rounded-full object-cover"
                            />
                            <button
                                type="button"
                                onClick={() => setForm((f) => ({ ...f, avatar: "" }))}
                                className="absolute right-0 top-0 rounded-full bg-black/60 px-1.5 py-0.5 text-xs text-white hover:bg-black/80"
                            >
                                X
                            </button>
                        </div>
                    ) : (
                        <label className="flex h-24 cursor-pointer items-center justify-center rounded-lg border border-dashed border-white/20 text-sm text-white/40 hover:border-white/40">
                            {uploading ? "Uploading..." : "Click to upload avatar"}
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleAvatarUpload(file);
                                }}
                            />
                        </label>
                    )}
                </div>

                <div className="flex gap-3 pt-2">
                    <button
                        type="submit"
                        disabled={mutation.isPending}
                        className="rounded-lg bg-white/10 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-white/20 disabled:opacity-50"
                    >
                        {mutation.isPending ? "Saving..." : isEdit ? "Update" : "Create"}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate("/pulse/authors")}
                        className="rounded-lg border border-white/10 px-5 py-2 text-sm text-white/70 hover:bg-white/5"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </Layout>
    );
}
