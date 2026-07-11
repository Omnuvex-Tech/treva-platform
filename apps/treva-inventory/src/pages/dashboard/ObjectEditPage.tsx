import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { categoriesApi, type CategoryDocument } from "../../api/categories";
import { unitLayoutsApi, type UnitLayout } from "../../api/unit-layouts";
import { objectTypesApi, type ObjectType } from "../../api/object-types";
import { FormButton, FormTabSwitcher, FormAddButton, FormDropdown, FormTextField, FormImageField } from "@repo/ui";
import { HouseForm } from "./HouseForm";
import { useMessageCenter } from "../../components/MessageCenter";
import { getApiErrorMessage } from "../../utils/apiError";

export function ObjectEditPage({ embedded = false }: { embedded?: boolean } = {}) {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { showError, showSuccess } = useMessageCenter();

    const [activeHouseTab, setActiveHouseTab] = useState<"Active" | "Archive">("Active");
    const [docUploading, setDocUploading] = useState(false);
    const docInputRef = useRef<HTMLInputElement>(null);
    const houseFormRef = useRef<HTMLDivElement>(null);
    const [editingHouseId, setEditingHouseId] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        objectType: "",
        propertyName: "",
        slug: "",
        currency: "Rubels",
        region: "",
        area: "",
        city: "",
        developerBrand: "",
        website: "",
        banks: "",
        infrastructure: "",
        salesDepartment: "",
        fedLaw214: false,
        image: "",
    });

    const { data: response, isLoading } = useQuery({
        queryKey: ["category", slug],
        queryFn: () => categoriesApi.getBySlug(slug!),
        enabled: !!slug,
    });

    const category = response?.data;
    const documents: CategoryDocument[] = category?.documents || [];

    const { data: objectTypesResponse } = useQuery({
        queryKey: ["object-types"],
        queryFn: () => objectTypesApi.getAll(),
    });
    const objectTypes: ObjectType[] = Array.isArray(objectTypesResponse?.data) ? objectTypesResponse.data : [];

    const { data: layoutsRes } = useQuery({
        queryKey: ["unit-layouts", slug],
        queryFn: () => unitLayoutsApi.getAll({ categorySlug: slug! }),
        enabled: !!slug,
    });

    const allHouses: UnitLayout[] = layoutsRes?.data?.data || [];
    const filteredHouses = activeHouseTab === "Active"
        ? allHouses.filter((h) => h.statusOption?.value !== "Sold")
        : allHouses.filter((h) => h.statusOption?.value === "Sold");

    useEffect(() => {
        if (category) {
            setFormData({
                objectType: category.objectType || "",
                propertyName: category.propertyName || "",
                slug: category.slug || "",
                currency: category.currency || "Rubels",
                region: category.region || "",
                area: category.area || "",
                city: category.city || "",
                developerBrand: category.developerBrand || "",
                website: category.website || "",
                banks: category.banks || "",
                infrastructure: category.infrastructure || "",
                salesDepartment: category.salesDepartment || "",
                fedLaw214: category.fedLaw214 || false,
                image: category.image || "",
            });
        }
    }, [category]);

    const updateMutation = useMutation({
        mutationFn: (data: typeof formData) => {
            return categoriesApi.update(category!.id, {
                objectType: data.objectType,
                propertyName: data.propertyName,
                slug: data.slug,
                currency: data.currency,
                region: data.region,
                area: data.area,
                city: data.city,
                developerBrand: data.developerBrand,
                website: data.website,
                banks: data.banks,
                infrastructure: data.infrastructure,
                salesDepartment: data.salesDepartment,
                fedLaw214: data.fedLaw214,
                image: data.image,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["category", slug] });
            showSuccess({ title: "Object updated" });
        },
        onError: (error) => {
            showError({ title: "Could not update object", description: getApiErrorMessage(error, "Please try again.") });
        },
    });

    const updateDocsMutation = useMutation({
        mutationFn: (docs: CategoryDocument[]) => {
            return categoriesApi.update(category!.id, { documents: docs });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["category", slug] });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (houseId: string) => unitLayoutsApi.delete(houseId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["unit-layouts", slug] });
        },
    });

    const updateField = (field: string, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateMutation.mutate(formData);
    };

    const handleDocUpload = async (files: FileList | File[]) => {
        const arr = Array.from(files);
        if (arr.length === 0) return;
        setDocUploading(true);
        try {
            const newDocs: CategoryDocument[] = [];
            for (const file of arr) {
                const res = await unitLayoutsApi.uploadFile(file);
                const docType = file.type === "application/pdf" ? "pdf" : "image";
                newDocs.push({ type: docType, url: res.data.url });
            }
            updateDocsMutation.mutate([...documents, ...newDocs]);
        } catch {
            // silent
        } finally {
            setDocUploading(false);
            if (docInputRef.current) docInputRef.current.value = "";
        }
    };

    const handleRemoveDoc = (index: number) => {
        updateDocsMutation.mutate(documents.filter((_, i) => i !== index));
    };

    const inputClass =
        "w-full h-10 px-3 rounded-xl border border-gray-200 bg-[#F4F5F6] text-sm text-[#1A1A1A] placeholder-[#999] outline-none focus:bg-white focus:border-gray-400";

    const formContent = (
        <div className="w-full min-h-full p-6 antialiased font-sans">
            <div className="w-full max-w-[1000px] mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-[16px] font-bold text-[#333333]" style={{ lineHeight: "20px" }}>
                        Edit Object
                    </h2>
                    <button
                        type="button"
                        onClick={() => navigate("/dashboard/offplan/objects")}
                        className="text-[#718096] hover:text-[#1A1C1E] transition-colors p-1 cursor-pointer"
                        aria-label="Close form"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* ── Section 1: Edit Object Form ── */}
                    <div className="bg-white border border-[#EAECEF] rounded-[16px] p-5 mb-6 shadow-xs">
                        <div className="flex items-center gap-1.5 pb-4">
                            <h2 style={{ fontWeight: 500, fontSize: 14, lineHeight: "20px" }} className="text-[#1A1A1A]">Object information</h2>
                            <img src="/images/inv-dashboard/question.svg" alt="" className="w-[14px] h-[14px] cursor-help flex-shrink-0 mt-[3px]" title="Object details" />
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <FormDropdown
                                    label="Object type"
                                    value={formData.objectType}
                                    options={objectTypes.map((t) => ({ id: t.name, label: t.title || t.name }))}
                                    placeholder="Select object type"
                                    onChange={(val) => updateField("objectType", val)}
                                />
                                <div>
                                    <label className="mb-1 block text-xs text-[#4E525D]">Name</label>
                                    <input
                                        className={inputClass}
                                        value={formData.propertyName || ""}
                                        onChange={(e) => updateField("propertyName", e.target.value)}
                                        placeholder="e.g. Sea Breeze Residence"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="mb-1 block text-xs text-[#4E525D]">Slug</label>
                                    <input
                                        className={inputClass}
                                        value={formData.slug || ""}
                                        onChange={(e) => updateField("slug", e.target.value)}
                                        placeholder="e.g. sea-breeze-residence"
                                    />
                                </div>
                                <FormDropdown
                                    label="Currency"
                                    value={formData.currency || "Rubels"}
                                    options={[
                                        { id: "Rubels", label: "Rubels" },
                                        { id: "USD", label: "USD" },
                                        { id: "AZN", label: "AZN" },
                                        { id: "EUR", label: "EUR" },
                                    ]}
                                    placeholder="Select currency"
                                    onChange={(val) => updateField("currency", val)}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="mb-1 block text-xs text-[#4E525D]">Region</label>
                                    <input
                                        className={inputClass}
                                        value={formData.region || ""}
                                        onChange={(e) => updateField("region", e.target.value)}
                                        placeholder="e.g. Dubai Marina"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs text-[#4E525D]">Area</label>
                                    <input
                                        className={inputClass}
                                        value={formData.area || ""}
                                        onChange={(e) => updateField("area", e.target.value)}
                                        placeholder="e.g. 2500 m²"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="mb-1 block text-xs text-[#4E525D]">City</label>
                                    <input
                                        className={inputClass}
                                        value={formData.city || ""}
                                        onChange={(e) => updateField("city", e.target.value)}
                                        placeholder="e.g. Baku"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs text-[#4E525D]">Developer Brand</label>
                                    <input
                                        className={inputClass}
                                        value={formData.developerBrand || ""}
                                        onChange={(e) => updateField("developerBrand", e.target.value)}
                                        placeholder="e.g. ABC Development"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="mb-1 block text-xs text-[#4E525D]">Website</label>
                                <input
                                    className={inputClass}
                                    value={formData.website || ""}
                                    onChange={(e) => updateField("website", e.target.value)}
                                    placeholder="e.g. https://example.com"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-xs text-[#4E525D]">Banks</label>
                                <input
                                    className={inputClass}
                                    value={formData.banks || ""}
                                    onChange={(e) => updateField("banks", e.target.value)}
                                    placeholder="e.g. Kapital Bank, PASHA Bank"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-xs text-[#4E525D]">Infrastructure</label>
                                <input
                                    className={inputClass}
                                    value={formData.infrastructure || ""}
                                    onChange={(e) => updateField("infrastructure", e.target.value)}
                                    placeholder="e.g. Swimming pool, Gym, Parking"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-xs text-[#4E525D]">Sales department</label>
                                <input
                                    className={inputClass}
                                    value={formData.salesDepartment || ""}
                                    onChange={(e) => updateField("salesDepartment", e.target.value)}
                                    placeholder="e.g. sales@example.com"
                                />
                            </div>

                            <div>
                                <FormImageField
                                    label="Object Image"
                                    value={formData.image}
                                    onChange={(url) => updateField("image", url)}
                                    uploadFn={async (file) => {
                                        const res = await categoriesApi.uploadFile(file);
                                        return { url: res.data.url };
                                    }}
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="fedLaw214"
                                    checked={formData.fedLaw214 || false}
                                    onChange={(e) => updateField("fedLaw214", e.target.checked)}
                                    className="h-4 w-4 rounded border-gray-300 accent-[#4E525D] cursor-pointer"
                                />
                                <label htmlFor="fedLaw214" className="text-xs text-[#4E525D] cursor-pointer">FedLaw 214</label>
                            </div>
                        </div>
                    </div>

                    {/* ── Section 2: Property Information (read-only) ── */}
                    <div className="bg-white border border-[#EAECEF] rounded-[16px] p-5 mb-6 shadow-xs">
                        <div className="flex items-center gap-1.5 pb-4">
                            <h2 style={{ fontWeight: 500, fontSize: 14, lineHeight: "20px" }} className="text-[#1A1A1A]">Property Information</h2>
                            <img src="/images/inv-dashboard/question.svg" alt="" className="w-[14px] h-[14px] cursor-help flex-shrink-0 mt-[3px]" title="Property stats" />
                        </div>
                        <div className="grid grid-cols-4 gap-4">
                            <div className="rounded-xl border border-[#EAECEF] p-4 text-center">
                                <p className="text-[24px] font-bold text-[#1A1A1A]">{category?.housesCount || 0}</p>
                                <p className="text-[12px] text-[#999]">Houses</p>
                            </div>
                            <div className="rounded-xl border border-[#EAECEF] p-4 text-center">
                                <p className="text-[24px] font-bold text-[#1A1A1A]">{category?.propertiesCount || 0}</p>
                                <p className="text-[12px] text-[#999]">Properties</p>
                            </div>
                            <div className="rounded-xl border border-[#EAECEF] p-4 text-center">
                                <p className="text-[24px] font-bold text-[#1A1A1A]">{category?.reservedCount || 0}</p>
                                <p className="text-[12px] text-[#999]">Reserved</p>
                            </div>
                            <div className="rounded-xl border border-[#EAECEF] p-4 text-center">
                                <p className="text-[24px] font-bold text-[#1A1A1A]">{category?.soldCount || 0}</p>
                                <p className="text-[12px] text-[#999]">Sold</p>
                            </div>
                        </div>
                    </div>

                    {/* Save / Cancel */}
                    <div className="flex gap-3 mb-6">
                        <button
                            type="submit"
                            disabled={updateMutation.isPending}
                            className="rounded-xl bg-[#4E525D] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {updateMutation.isPending ? "Saving..." : "Save"}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate("/dashboard/offplan/objects")}
                            className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm text-[#666666] transition-colors hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                    </div>
                </form>

                {/* ── Section 3: General Plans ── */}
                <div className="bg-white border border-[#EAECEF] rounded-[16px] p-5 mb-6 shadow-xs min-h-[200px]">
                    <div className="flex items-center gap-1.5 pb-4">
                        <h2 style={{ fontWeight: 500, fontSize: 14, lineHeight: "20px" }} className="text-[#1A1A1A]">General plans</h2>
                        <img src="/images/inv-dashboard/question.svg" alt="" className="w-[14px] h-[14px] cursor-help flex-shrink-0 mt-[3px]" title="Information about master plans" />
                    </div>

                    <input ref={docInputRef} type="file" accept=".pdf,image/jpeg,image/png,image/webp" multiple className="hidden"
                        onChange={(e) => { if (e.target.files && e.target.files.length > 0) handleDocUpload(e.target.files); }} />

                    {documents.length > 0 ? (
                        <div>
                            <div className="space-y-2 mb-4">
                                {documents.map((doc, idx) => (
                                    <div key={idx} className="flex items-center justify-between rounded-lg border border-[#EAECEF] px-3 py-2.5 group">
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            <div style={{ width: 32, height: 32, background: doc.type === "pdf" ? "#FEE2E2" : "#DBEAFE", borderRadius: 8 }} className="flex items-center justify-center flex-shrink-0">
                                                {doc.type === "pdf" ? (
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                                        <polyline points="14 2 14 8 20 8" />
                                                        <line x1="16" y1="13" x2="8" y2="13" />
                                                        <line x1="16" y1="17" x2="8" y2="17" />
                                                    </svg>
                                                ) : (
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                                        <circle cx="8.5" cy="8.5" r="1.5" />
                                                        <polyline points="21 15 16 10 5 21" />
                                                    </svg>
                                                )}
                                            </div>
                                            <span style={{ fontWeight: 400, fontSize: 13, lineHeight: "18px" }} className="text-[#1A1A1A] truncate">
                                                {doc.url.split("/").pop() || `Plan ${idx + 1}`}
                                            </span>
                                        </div>
                                        <button type="button" onClick={() => handleRemoveDoc(idx)}
                                            className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-red-50 cursor-pointer">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C3362B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                                            </svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <FormAddButton icon={<span className="text-sm font-light">+</span>}
                                className="!bg-white !border !border-[#CBD5E1] !text-[#1A1C1E] hover:!bg-gray-50"
                                onClick={() => docInputRef.current?.click()} disabled={docUploading}>
                                {docUploading ? "Uploading..." : "Add master plan"}
                            </FormAddButton>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center text-center pb-4">
                            <div style={{ width: 41.25, height: 41.25, background: "#EBEBEB", borderRadius: "16777200px" }} className="flex items-center justify-center mb-3">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#718096" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                    <circle cx="12" cy="10" r="3"></circle>
                                </svg>
                            </div>
                            <p style={{ fontWeight: 500, fontSize: 13, lineHeight: "20px" }} className="text-[#718096] mb-4">General plans are not uploaded</p>
                            <FormAddButton icon={<span className="text-sm font-light">+</span>}
                                className="!bg-white !border !border-[#CBD5E1] !text-[#1A1C1E] hover:!bg-gray-50"
                                onClick={() => docInputRef.current?.click()} disabled={docUploading}>
                                {docUploading ? "Uploading..." : "Add master plan"}
                            </FormAddButton>
                        </div>
                    )}
                </div>

                {/* ── Section 4: Make a home (inline HouseForm) ── */}
                <div ref={houseFormRef}>
                    <HouseForm
                        inline
                        houseId={editingHouseId ?? undefined}
                        key={editingHouseId ?? "new"}
                        onSuccess={() => {
                            setEditingHouseId(null);
                            queryClient.invalidateQueries({ queryKey: ["unit-layouts", slug] });
                        }}
                    />
                </div>

                {/* ── Section 5: List of Houses ── */}
                <div className="bg-white border border-[#EAECEF] rounded-[16px] p-5 mb-6 shadow-xs">
                    <div className="w-full flex items-center justify-between mb-4">
                        <h2 style={{ fontWeight: 500, fontSize: 16, lineHeight: "20px" }} className="text-[#1A1A1A]">List of houses</h2>
                        <FormAddButton
                            icon={<span className="text-base font-light mr-0.5">+</span>}
                            onClick={() => {
                                setEditingHouseId(null);
                                setTimeout(() => houseFormRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
                            }}
                        >
                            Add a houses
                        </FormAddButton>
                    </div>

                    <FormTabSwitcher
                        tabs={[
                            { id: "Active", label: "Active houses" },
                            { id: "Archive", label: "Archive of houses" },
                        ]}
                        activeTab={activeHouseTab}
                        onChange={(id) => setActiveHouseTab(id as "Active" | "Archive")}
                        size="md"
                    />

                    <div className="mt-6">
                        {filteredHouses.length === 0 ? (
                            <div className="py-8 text-center text-[#999] text-sm">
                                {activeHouseTab === "Active" ? "No active houses yet" : "No archived houses"}
                            </div>
                        ) : (
                            <div className="flex flex-wrap gap-4">
                                {filteredHouses.map((house) => {
                                    const imageUrl = house.mainImage?.url || house.gallery?.[0]?.url;
                                    return (
                                        <div key={house.id} className="bg-white border border-[#EBEBEB] rounded-[16px] p-2 flex flex-col gap-2 w-[220px] shrink-0">
                                            <div className="relative w-full h-[140px] rounded-[12px] overflow-hidden bg-[#F3F4F6]">
                                                {imageUrl ? (
                                                    <img src={imageUrl} alt={house.title} className="w-full h-full object-cover" loading="lazy" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-[#999] text-xs">No Image</div>
                                                )}
                                            </div>
                                            <div className="px-1 pb-1">
                                                <p className="text-[14px] font-semibold text-[#1A1A1A] truncate">{house.title}</p>
                                                <p className="text-[12px] text-[#999]">{house.totalArea} m² · {house.roomOption?.value || `${house.number || 0} rooms`}</p>
                                            </div>
                                            <div className="flex gap-1 px-1 pb-1">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setEditingHouseId(house.id);
                                                        setTimeout(() => houseFormRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
                                                    }}
                                                    className="flex-1 rounded-lg border border-[#E2E8F0] py-1.5 text-[12px] font-medium text-[#4E525D] hover:bg-gray-50 transition-colors cursor-pointer"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => deleteMutation.mutate(house.id)}
                                                    className="flex-1 rounded-lg border border-[#FECACA] py-1.5 text-[12px] font-medium text-[#C3362B] hover:bg-red-50 transition-colors cursor-pointer"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
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
