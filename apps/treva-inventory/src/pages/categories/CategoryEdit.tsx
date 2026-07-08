import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { categoriesApi } from "../../api/categories";

export function CategoryEdit({ embedded = false }: { embedded?: boolean } = {}) {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [title, setTitle] = useState("");
    const [name, setName] = useState("");
    const [slug, setSlug] = useState("");
    const [image, setImage] = useState("");
    const [uploading, setUploading] = useState(false);

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
            setImage(category.data.image || "");
        }
    }, [category]);

    const updateMutation = useMutation({
        mutationFn: () => categoriesApi.update(id!, { title, name, slug, image }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["categories"] });
            navigate("/dashboard/offplan/objects");
        },
    });

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        try {
            const res = await categoriesApi.uploadFile(file);
            setImage(res.data.url);
        } catch {
            alert("Image upload failed");
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateMutation.mutate();
    };

    const formContent = (
        <div className="mx-auto max-w-lg">
            <div className="mb-6">
                <h2 className="text-[20px] font-semibold text-[#1A1A1A]">Edit Category</h2>
                <p className="text-[14px] text-[#666666] mt-0.5">Update category details</p>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex flex-col gap-4">
                    {/* Image Upload */}
                    <div>
                        <label className="mb-1.5 block text-xs font-medium text-[#666666]">Image</label>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                        />
                        {image ? (
                            <div className="relative w-full h-[180px] rounded-xl overflow-hidden bg-[#F4F5F6]">
                                <img src={image} alt={title} className="w-full h-full object-cover" />
                                <button
                                    type="button"
                                    onClick={() => setImage("")}
                                    className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/50 text-white flex items-center justify-center text-xs hover:bg-black/70 cursor-pointer"
                                >
                                    ✕
                                </button>
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploading}
                                className="w-full h-[180px] rounded-xl border-2 border-dashed border-gray-200 bg-[#F4F5F6] flex flex-col items-center justify-center gap-2 hover:border-gray-300 transition-colors cursor-pointer"
                            >
                                {uploading ? (
                                    <span className="text-sm text-[#666666]">Uploading...</span>
                                ) : (
                                    <>
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                            <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                                            <circle cx="9" cy="9" r="2" />
                                            <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                                        </svg>
                                        <span className="text-sm text-[#999]">Click to upload image</span>
                                    </>
                                )}
                            </button>
                        )}
                    </div>

                    <div>
                        <label className="mb-1.5 block text-xs font-medium text-[#666666]">Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full h-10 rounded-xl border border-gray-200 px-3 text-sm text-[#1A1A1A] outline-none focus:border-gray-400"
                            required
                        />
                    </div>
                    <div>
                        <label className="mb-1.5 block text-xs font-medium text-[#666666]">Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full h-10 rounded-xl border border-gray-200 px-3 text-sm text-[#1A1A1A] outline-none focus:border-gray-400"
                            required
                        />
                    </div>
                    <div>
                        <label className="mb-1.5 block text-xs font-medium text-[#666666]">Slug</label>
                        <input
                            type="text"
                            value={slug}
                            onChange={(e) => setSlug(e.target.value)}
                            className="w-full h-10 rounded-xl border border-gray-200 px-3 text-sm text-[#1A1A1A] outline-none focus:border-gray-400"
                            required
                        />
                    </div>
                </div>

                {updateMutation.isError && (
                    <div className="mt-4 rounded-xl bg-red-50 p-3 text-center text-sm text-[#C3362B]">
                        {(updateMutation.error as Error)?.message || "Failed to update category"}
                    </div>
                )}

                <div className="mt-6 flex gap-3">
                    <button
                        type="submit"
                        disabled={updateMutation.isPending || uploading}
                        className="rounded-xl px-5 py-2.5 text-sm font-medium text-white bg-[#4E525D] hover:bg-[#3D404A] transition-colors disabled:opacity-50 cursor-pointer"
                    >
                        {updateMutation.isPending ? "Saving..." : "Save"}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate("/dashboard/offplan/objects")}
                        className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-medium text-[#666666] hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );

    if (isLoading) {
        return (
            <main className="flex-1 p-8 overflow-y-auto" style={{ background: "var(--background-primary-50, #FFFFFF80)" }}>
                <div className="py-8 text-center text-[#666666]">Loading...</div>
            </main>
        );
    }

    if (embedded) {
        return (
            <main className="flex-1 p-8 overflow-y-auto" style={{ background: "var(--background-primary-50, #FFFFFF80)" }}>
                {formContent}
            </main>
        );
    }

    return (
        <main
            className="flex-1 p-8 overflow-y-auto"
            style={{ background: "var(--background-primary-50, #FFFFFF80)" }}
        >
            {formContent}
        </main>
    );
}
