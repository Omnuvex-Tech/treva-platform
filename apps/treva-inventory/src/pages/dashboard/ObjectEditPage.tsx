import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { categoriesApi } from "../../api/categories";

const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}.${d.getFullYear()}`;
};

export function ObjectEditPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [title, setTitle] = useState("");
    const [name, setName] = useState("");
    const [slug, setSlug] = useState("");
    const [image, setImage] = useState("");
    const [status, setStatus] = useState("active");
    const [housesCount, setHousesCount] = useState(0);
    const [propertiesCount, setPropertiesCount] = useState(0);
    const [reservedCount, setReservedCount] = useState(0);
    const [soldCount, setSoldCount] = useState(0);
    const [uploading, setUploading] = useState(false);

    const { data: response, isLoading } = useQuery({
        queryKey: ["category", id],
        queryFn: () => categoriesApi.getById(id!),
        enabled: !!id,
    });

    useEffect(() => {
        if (response?.data) {
            const cat = response.data;
            setTitle(cat.title);
            setName(cat.name);
            setSlug(cat.slug);
            setImage(cat.image || "");
            setStatus(cat.status || "active");
            setHousesCount(cat.housesCount ?? 0);
            setPropertiesCount(cat.propertiesCount ?? 0);
            setReservedCount(cat.reservedCount ?? 0);
            setSoldCount(cat.soldCount ?? 0);
        }
    }, [response]);

    const updateMutation = useMutation({
        mutationFn: () =>
            categoriesApi.update(id!, {
                title,
                name,
                slug,
                image,
                status,
                housesCount,
                propertiesCount,
                reservedCount,
                soldCount,
            }),
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

    if (isLoading) {
        return (
            <div className="min-h-screen w-full bg-[#7C7F86] p-7 font-sans antialiased">
                <div className="py-8 text-center text-white">Loading...</div>
            </div>
        );
    }

    const category = response?.data;
    const dateStr = category ? formatDate(category.createdAt) : "";

    return (
        <div className="min-h-screen w-full bg-[#7C7F86] p-7 font-sans antialiased">
            {/* Header */}
            <div className="w-full flex items-center gap-3 mb-6">
                <button
                    onClick={() => navigate("/dashboard/offplan/objects")}
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 12H5"></path>
                        <path d="M12 19l-7-7 7-7"></path>
                    </svg>
                </button>
                <h1 className="text-white text-lg font-semibold">Edit Object</h1>
            </div>

            {/* Form Card */}
            <form onSubmit={handleSubmit} className="max-w-[600px]">
                <div className="bg-white rounded-[24px] p-6 shadow-xs">
                    {/* Image Upload */}
                    <div className="mb-5">
                        <label className="mb-1.5 block text-xs font-medium text-[#666666]">Image</label>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                        />
                        {image ? (
                            <div className="relative w-full h-[200px] rounded-[18px] overflow-hidden bg-[#F3F4F6]">
                                <img src={image} alt={title} className="w-full h-full object-cover" />
                                <button
                                    type="button"
                                    onClick={() => setImage("")}
                                    className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-black/50 text-white flex items-center justify-center text-xs hover:bg-black/70 cursor-pointer"
                                >
                                    ✕
                                </button>
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploading}
                                className="w-full h-[200px] rounded-[18px] border-2 border-dashed border-gray-200 bg-[#F3F4F6] flex flex-col items-center justify-center gap-2 hover:border-gray-300 transition-colors cursor-pointer"
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

                    {/* Title */}
                    <div className="mb-4">
                        <label className="mb-1.5 block text-xs font-medium text-[#666666]">Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full h-10 rounded-xl border border-gray-200 px-3 text-sm text-[#1A1A1A] outline-none focus:border-gray-400"
                            required
                        />
                    </div>

                    {/* Status */}
                    <div className="mb-4">
                        <label className="mb-1.5 block text-xs font-medium text-[#666666]">Status</label>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="w-full h-10 rounded-xl border border-gray-200 px-3 text-sm text-[#1A1A1A] outline-none focus:border-gray-400 bg-white cursor-pointer"
                        >
                            <option value="active">Active</option>
                            <option value="archive">Archive</option>
                        </select>
                    </div>

                    {/* Date (read-only) */}
                    <div className="mb-5">
                        <label className="mb-1.5 block text-xs font-medium text-[#666666]">Date</label>
                        <input
                            type="text"
                            value={dateStr}
                            readOnly
                            className="w-full h-10 rounded-xl border border-gray-200 px-3 text-sm text-[#999] bg-[#F3F4F6] cursor-not-allowed"
                        />
                    </div>

                    {/* Metrics Section */}
                    <div className="border-t border-gray-100 pt-5 mb-5">
                        <h3 className="text-sm font-semibold text-[#1A1A1A] mb-4">Metrics</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="mb-1.5 block text-[10px] font-medium text-[#9CA3AF]">Houses</label>
                                <input
                                    type="number"
                                    min={0}
                                    value={housesCount}
                                    onChange={(e) => setHousesCount(Number(e.target.value))}
                                    className="w-full h-10 rounded-xl border border-gray-200 px-3 text-sm text-[#1F2937] font-bold outline-none focus:border-gray-400"
                                />
                            </div>
                            <div>
                                <label className="mb-1.5 block text-[10px] font-medium text-[#9CA3AF]">Properties</label>
                                <input
                                    type="number"
                                    min={0}
                                    value={propertiesCount}
                                    onChange={(e) => setPropertiesCount(Number(e.target.value))}
                                    className="w-full h-10 rounded-xl border border-gray-200 px-3 text-sm text-[#219653] font-bold outline-none focus:border-gray-400"
                                />
                            </div>
                            <div>
                                <label className="mb-1.5 block text-[10px] font-medium text-[#9CA3AF]">Reserved</label>
                                <input
                                    type="number"
                                    min={0}
                                    value={reservedCount}
                                    onChange={(e) => setReservedCount(Number(e.target.value))}
                                    className="w-full h-10 rounded-xl border border-gray-200 px-3 text-sm text-[#F2C94C] font-bold outline-none focus:border-gray-400"
                                />
                            </div>
                            <div>
                                <label className="mb-1.5 block text-[10px] font-medium text-[#9CA3AF]">Sold</label>
                                <input
                                    type="number"
                                    min={0}
                                    value={soldCount}
                                    onChange={(e) => setSoldCount(Number(e.target.value))}
                                    className="w-full h-10 rounded-xl border border-gray-200 px-3 text-sm text-[#1F2937] font-bold outline-none focus:border-gray-400"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Error */}
                    {updateMutation.isError && (
                        <div className="mb-4 rounded-xl bg-red-50 p-3 text-center text-sm text-[#C3362B]">
                            {(updateMutation.error as Error)?.message || "Failed to update object"}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3">
                        <button
                            type="submit"
                            disabled={updateMutation.isPending || uploading}
                            className="rounded-xl px-6 py-2.5 text-sm font-medium text-white bg-[#4E525D] hover:bg-[#3D404A] transition-colors disabled:opacity-50 cursor-pointer"
                        >
                            {updateMutation.isPending ? "Saving..." : "Save"}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate("/dashboard/offplan/objects")}
                            className="rounded-xl border border-gray-200 px-6 py-2.5 text-sm font-medium text-[#666666] hover:bg-gray-50 transition-colors cursor-pointer"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
