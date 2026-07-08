import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { categoriesApi } from "../../api/categories";
import { objectTypesApi, type ObjectType } from "../../api/object-types";

const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}.${d.getFullYear()}`;
};

export function ObjectEditPage({ embedded = false }: { embedded?: boolean } = {}) {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [title, setTitle] = useState("");
    const [name, setName] = useState("");
    const [slug, setSlug] = useState("");
    const [image, setImage] = useState("");
    const [status, setStatus] = useState("active");
    const [objectType, setObjectType] = useState("");
    const [propertyName, setPropertyName] = useState("");
    const [currency, setCurrency] = useState("Rubels");
    const [region, setRegion] = useState("");
    const [area, setArea] = useState("");
    const [city, setCity] = useState("");
    const [developerBrand, setDeveloperBrand] = useState("");
    const [website, setWebsite] = useState("");
    const [fedLaw214, setFedLaw214] = useState(false);
    const [housesCount, setHousesCount] = useState(0);
    const [propertiesCount, setPropertiesCount] = useState(0);
    const [reservedCount, setReservedCount] = useState(0);
    const [soldCount, setSoldCount] = useState(0);
    const [uploading, setUploading] = useState(false);

    const { data: categoriesResponse } = useQuery({
        queryKey: ["categories"],
        queryFn: () => categoriesApi.getAll(),
    });

    const categoriesList = Array.isArray(categoriesResponse?.data) ? categoriesResponse.data : [];

    const { data: objectTypesResponse } = useQuery({
        queryKey: ["object-types"],
        queryFn: () => objectTypesApi.getAll(),
    });

    const objectTypesList: ObjectType[] = Array.isArray(objectTypesResponse?.data) ? objectTypesResponse.data : [];

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
            setObjectType(cat.objectType || "");
            setPropertyName(cat.propertyName || "");
            setCurrency(cat.currency || "Rubels");
            setRegion(cat.region || "");
            setArea(cat.area || "");
            setCity(cat.city || "");
            setDeveloperBrand(cat.developerBrand || "");
            setWebsite(cat.website || "");
            setFedLaw214(cat.fedLaw214 || false);
            setHousesCount(cat.housesCount ?? 0);
            setPropertiesCount(cat.propertiesCount ?? 0);
            setReservedCount(cat.reservedCount ?? 0);
            setSoldCount(cat.soldCount ?? 0);
        }
    }, [response]);

    const updateMutation = useMutation({
        mutationFn: () => {
            const selectedType = objectTypesList.find((t) => t.id === objectType);
            return categoriesApi.update(id!, {
                title,
                name,
                slug,
                image,
                status,
                objectType: selectedType?.title || objectType,
                propertyName,
                currency,
                region,
                area,
                city,
                developerBrand,
                website,
                fedLaw214,
                housesCount,
                propertiesCount,
                reservedCount,
                soldCount,
            });
        },
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
        <div className="mx-auto max-w-[800px]">
            <div className="mb-6">
                <h2 className="text-[20px] font-semibold text-[#1A1A1A]">Edit Object</h2>
                <p className="text-[14px] text-[#666666] mt-0.5">Update object details</p>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
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
                        <div className="relative w-full h-[200px] rounded-xl overflow-hidden bg-[#F4F5F6]">
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

                {/* 2-Column Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mb-5">
                    {/* Object Type - Dynamic from ObjectTypes */}
                    <div>
                        <label className="mb-1.5 block text-xs font-medium text-[#666666]">Object type<span className="text-[#C3362B] ml-0.5">*</span></label>
                        <div className="relative">
                            <select
                                value={objectType}
                                onChange={(e) => setObjectType(e.target.value)}
                                className="w-full h-10 rounded-xl border border-gray-200 px-3 text-sm text-[#1A1A1A] outline-none focus:border-gray-400 bg-white cursor-pointer appearance-none"
                                required
                            >
                                <option value="" disabled>Select object type</option>
                                {objectTypesList.map((type) => (
                                    <option key={type.id} value={type.id}>{type.title}</option>
                                ))}
                            </select>
                            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-[#999]">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="6 9 12 15 18 9" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Title */}
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

                    {/* Property Name */}
                    <div>
                        <label className="mb-1.5 block text-xs font-medium text-[#666666]">Name of property</label>
                        <input
                            type="text"
                            value={propertyName}
                            onChange={(e) => setPropertyName(e.target.value)}
                            className="w-full h-10 rounded-xl border border-gray-200 px-3 text-sm text-[#1A1A1A] outline-none focus:border-gray-400"
                        />
                    </div>

                    {/* Currency */}
                    <div>
                        <label className="mb-1.5 block text-xs font-medium text-[#666666]">Currency<span className="text-[#C3362B] ml-0.5">*</span></label>
                        <div className="relative">
                            <select
                                value={currency}
                                onChange={(e) => setCurrency(e.target.value)}
                                className="w-full h-10 rounded-xl border border-gray-200 px-3 text-sm text-[#1A1A1A] outline-none focus:border-gray-400 bg-white cursor-pointer appearance-none"
                            >
                                <option value="Rubels">Rubels</option>
                                <option value="Manat">Manat (₼)</option>
                                <option value="USD">USD ($)</option>
                            </select>
                            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-[#999]">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="6 9 12 15 18 9" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Region */}
                    <div>
                        <label className="mb-1.5 block text-xs font-medium text-[#666666]">Region</label>
                        <input
                            type="text"
                            value={region}
                            onChange={(e) => setRegion(e.target.value)}
                            className="w-full h-10 rounded-xl border border-gray-200 px-3 text-sm text-[#1A1A1A] outline-none focus:border-gray-400"
                        />
                    </div>

                    {/* Area */}
                    <div>
                        <label className="mb-1.5 block text-xs font-medium text-[#666666]">Area</label>
                        <input
                            type="text"
                            value={area}
                            onChange={(e) => setArea(e.target.value)}
                            className="w-full h-10 rounded-xl border border-gray-200 px-3 text-sm text-[#1A1A1A] outline-none focus:border-gray-400"
                        />
                    </div>

                    {/* City */}
                    <div>
                        <label className="mb-1.5 block text-xs font-medium text-[#666666]">City</label>
                        <input
                            type="text"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            className="w-full h-10 rounded-xl border border-gray-200 px-3 text-sm text-[#1A1A1A] outline-none focus:border-gray-400"
                        />
                    </div>

                    {/* Developer Brand */}
                    <div>
                        <label className="mb-1.5 block text-xs font-medium text-[#666666]">Developer Brand</label>
                        <input
                            type="text"
                            value={developerBrand}
                            onChange={(e) => setDeveloperBrand(e.target.value)}
                            className="w-full h-10 rounded-xl border border-gray-200 px-3 text-sm text-[#1A1A1A] outline-none focus:border-gray-400"
                        />
                    </div>

                    {/* Website */}
                    <div>
                        <label className="mb-1.5 block text-xs font-medium text-[#666666]">Website</label>
                        <input
                            type="url"
                            value={website}
                            onChange={(e) => setWebsite(e.target.value)}
                            className="w-full h-10 rounded-xl border border-gray-200 px-3 text-sm text-[#1A1A1A] outline-none focus:border-gray-400"
                        />
                    </div>

                    {/* Status */}
                    <div>
                        <label className="mb-1.5 block text-xs font-medium text-[#666666]">Status</label>
                        <div className="relative">
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="w-full h-10 rounded-xl border border-gray-200 px-3 text-sm text-[#1A1A1A] outline-none focus:border-gray-400 bg-white cursor-pointer appearance-none"
                            >
                                <option value="active">Active</option>
                                <option value="archive">Archive</option>
                            </select>
                            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-[#999]">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="6 9 12 15 18 9" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Date (read-only) */}
                    <div>
                        <label className="mb-1.5 block text-xs font-medium text-[#666666]">Date</label>
                        <input
                            type="text"
                            value={response?.data ? formatDate(response.data.createdAt) : ""}
                            readOnly
                            className="w-full h-10 rounded-xl border border-gray-200 px-3 text-sm text-[#999] bg-[#F4F5F6] cursor-not-allowed"
                        />
                    </div>
                </div>

                {/* Federal Law Checkbox */}
                <div className="mb-5">
                    <label className="flex items-center gap-3 cursor-pointer select-none">
                        <div className="relative">
                            <input
                                type="checkbox"
                                checked={fedLaw214}
                                onChange={(e) => setFedLaw214(e.target.checked)}
                                className="sr-only"
                            />
                            <div className={`w-5 h-5 border-2 rounded-md transition-all flex items-center justify-center ${
                                fedLaw214
                                    ? "bg-[#4E525D] border-[#4E525D]"
                                    : "bg-white border-[#A0AEC0] hover:border-[#4E525D]"
                            }`}>
                                {fedLaw214 && (
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                )}
                            </div>
                        </div>
                        <span className="text-sm font-medium text-[#1A1A1A]">
                            Possibility of Purchase under Federal Law No. 214
                        </span>
                    </label>
                </div>

                {/* Metrics Section */}
                <div className="border-t border-gray-100 pt-5 mb-5">
                    <h3 className="text-sm font-semibold text-[#1A1A1A] mb-4">Metrics</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-[#666666]">Houses</label>
                            <input
                                type="number"
                                min={0}
                                value={housesCount}
                                onChange={(e) => setHousesCount(Number(e.target.value))}
                                className="w-full h-10 rounded-xl border border-gray-200 px-3 text-sm text-[#1A1A1A] outline-none focus:border-gray-400"
                            />
                        </div>
                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-[#666666]">Properties</label>
                            <input
                                type="number"
                                min={0}
                                value={propertiesCount}
                                onChange={(e) => setPropertiesCount(Number(e.target.value))}
                                className="w-full h-10 rounded-xl border border-gray-200 px-3 text-sm text-[#1A1A1A] outline-none focus:border-gray-400"
                            />
                        </div>
                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-[#666666]">Reserved</label>
                            <input
                                type="number"
                                min={0}
                                value={reservedCount}
                                onChange={(e) => setReservedCount(Number(e.target.value))}
                                className="w-full h-10 rounded-xl border border-gray-200 px-3 text-sm text-[#1A1A1A] outline-none focus:border-gray-400"
                            />
                        </div>
                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-[#666666]">Sold</label>
                            <input
                                type="number"
                                min={0}
                                value={soldCount}
                                onChange={(e) => setSoldCount(Number(e.target.value))}
                                className="w-full h-10 rounded-xl border border-gray-200 px-3 text-sm text-[#1A1A1A] outline-none focus:border-gray-400"
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
        <main className="flex-1 p-8 overflow-y-auto" style={{ background: "var(--background-primary-50, #FFFFFF80)" }}>
            {formContent}
        </main>
    );
}
