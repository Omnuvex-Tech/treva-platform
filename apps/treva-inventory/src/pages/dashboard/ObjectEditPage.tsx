import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { categoriesApi, type CategoryDocument } from "../../api/categories";
import { unitLayoutsApi, type UnitLayout } from "../../api/unit-layouts";
import { objectTypesApi, type ObjectType } from "../../api/object-types";
import { FormDropdown, FormTextField, FormButton, FormTabSwitcher, FormAddButton, FormImageField } from "@repo/ui";

export function ObjectEditPage({ embedded = false }: { embedded?: boolean } = {}) {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [activeHouseTab, setActiveHouseTab] = useState<"Active" | "Archive">("Active");
    const [docUploading, setDocUploading] = useState(false);
    const docInputRef = useRef<HTMLInputElement>(null);

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

    const { data: objectTypesResponse } = useQuery({
        queryKey: ["object-types"],
        queryFn: () => objectTypesApi.getAll(),
    });

    const objectTypes: ObjectType[] = Array.isArray(objectTypesResponse?.data)
        ? objectTypesResponse.data
        : [];

    const { data: response, isLoading } = useQuery({
        queryKey: ["category", slug],
        queryFn: () => categoriesApi.getBySlug(slug!),
        enabled: !!slug,
    });

    const category = response?.data;
    const documents: CategoryDocument[] = category?.documents || [];

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
        mutationFn: () => {
            const selectedType = objectTypes.find((t) => t.title === formData.objectType || t.id === formData.objectType);
            return categoriesApi.update(category!.id, {
                title: formData.propertyName || category!.title,
                name: formData.propertyName || category!.name,
                slug: formData.slug,
                image: formData.image || undefined,
                objectType: selectedType?.title || formData.objectType,
                propertyName: formData.propertyName,
                currency: formData.currency,
                region: formData.region,
                area: formData.area,
                city: formData.city,
                developerBrand: formData.developerBrand,
                website: formData.website,
                banks: formData.banks,
                infrastructure: formData.infrastructure,
                salesDepartment: formData.salesDepartment,
                fedLaw214: formData.fedLaw214,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["categories"] });
            queryClient.invalidateQueries({ queryKey: ["category", slug] });
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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!category) return;
        updateMutation.mutate();
    };

    const updateField = (field: string, value: string | boolean) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

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

                {/* ── Section 1: Editable Form ── */}
                <div className="bg-white rounded-[24px] border border-[#E2E8F0] shadow-xs p-5 mb-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
                            <div>
                                <FormDropdown
                                    label="Object type"
                                    value={formData.objectType}
                                    options={objectTypes.map((t) => ({ id: t.id, label: t.title }))}
                                    placeholder="Select object type"
                                    onChange={(id) => updateField("objectType", id)}
                                    required
                                    noOptionsLabel="Create Object Type"
                                    onNoOptionsClick={() => navigate("/dashboard/offplan/object-types")}
                                />
                            </div>
                            <div>
                                <FormTextField
                                    label="Name of property"
                                    value={formData.propertyName}
                                    onChange={(v) => updateField("propertyName", v)}
                                    placeholder="Placeholder"
                                    required
                                />
                            </div>
                            <FormTextField
                                label="Slug"
                                value={formData.slug}
                                onChange={(v) => updateField("slug", v)}
                                placeholder="auto-generated-from-name"
                            />
                            <div>
                                <FormDropdown
                                    label="Currency"
                                    value={formData.currency}
                                    options={[
                                        { id: "Rubels", label: "Rubels" },
                                        { id: "Manat", label: "Manat" },
                                        { id: "USD", label: "USD ($)" },
                                    ]}
                                    placeholder="Select currency"
                                    onChange={(id) => updateField("currency", id)}
                                    required
                                />
                            </div>
                            <div>
                                <FormTextField label="Region" value={formData.region} onChange={(v) => updateField("region", v)} placeholder="Placeholder" required />
                            </div>
                            <div>
                                <FormTextField label="Area" value={formData.area} onChange={(v) => updateField("area", v)} placeholder="Placeholder" required />
                            </div>
                            <div>
                                <FormTextField label="City" value={formData.city} onChange={(v) => updateField("city", v)} placeholder="Placeholder" required />
                            </div>
                            <div>
                                <FormTextField label="Developer Brand" value={formData.developerBrand} onChange={(v) => updateField("developerBrand", v)} placeholder="Placeholder" required />
                            </div>
                            <div>
                                <FormTextField label="Website" value={formData.website} onChange={(v) => updateField("website", v)} placeholder="Placeholder" required />
                            </div>
                            <div>
                                <FormTextField label="Banks" value={formData.banks} onChange={(v) => updateField("banks", v)} placeholder="Placeholder" required />
                            </div>
                            <div>
                                <FormTextField label="Infrastructure" value={formData.infrastructure} onChange={(v) => updateField("infrastructure", v)} placeholder="Placeholder" required />
                            </div>
                            <div>
                                <FormTextField label="Sales department" value={formData.salesDepartment} onChange={(v) => updateField("salesDepartment", v)} placeholder="Placeholder" required />
                            </div>
                        </div>

                        <FormImageField
                            label="Object Image"
                            value={formData.image}
                            onChange={(url) => updateField("image", url)}
                            uploadFn={(file) => categoriesApi.uploadFile(file).then((res) => res.data)}
                            accept="image/jpeg,image/png,image/webp"
                        />

                        {/* Federal Law */}
                        <label className="flex items-center gap-3 cursor-pointer select-none">
                            <div className="relative">
                                <input type="checkbox" checked={formData.fedLaw214} onChange={(e) => updateField("fedLaw214", e.target.checked)} className="sr-only" />
                                {formData.fedLaw214 ? (
                                    <img src="/images/inv-dashboard/inv-offplan/checkbox-checked.svg" alt="" className="w-5 h-5" />
                                ) : (
                                    <img src="/images/inv-dashboard/inv-offplan/checkbox.svg" alt="" className="w-5 h-5 opacity-60" />
                                )}
                            </div>
                            <span className="text-[14px] font-normal text-[#333333]" style={{ lineHeight: "20px" }}>
                                Possibility of Purchase under Federal Law No. 214
                            </span>
                        </label>

                        {updateMutation.isError && (
                            <div className="rounded-xl bg-red-50 p-3 text-center text-sm text-[#C3362B]">
                                {(updateMutation.error as Error)?.message || "Failed to update"}
                            </div>
                        )}
                    </form>
                </div>

                {/* ── Section 2: Property Information (read-only) ── */}
                {category && (
                    <div className="bg-white border border-[#EAECEF] rounded-[16px] p-5 mb-6 shadow-xs">
                        <div className="flex items-center justify-between border-b border-[#F4F5F7] pb-4 mb-4">
                            <h2 style={{ fontWeight: 500, fontSize: 14, lineHeight: "20px" }} className="text-[#1A1A1A]">Property information</h2>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3.5 pt-1">
                            <div className="space-y-3.5">
                                {[
                                    { label: "Object type", value: category.objectType },
                                    { label: "Name", value: category.propertyName || category.title },
                                    { label: "Address", value: category.region },
                                    { label: "Developer", value: category.developerBrand },
                                    { label: "Banks", value: formData.banks },
                                ].map((item) => (
                                    <div key={item.label} className="flex items-start">
                                        <span style={{ fontWeight: 400, fontSize: 12, lineHeight: "18px" }} className="w-[100px] text-[#4E525D] shrink-0">{item.label}</span>
                                        <span style={{ fontWeight: 500, fontSize: 14, lineHeight: "20px" }} className="text-[#1A1A1A]">{item.value || "not specified"}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="space-y-3.5">
                                {[
                                    { label: "Currency", value: category.currency },
                                    { label: "Infrastructure", value: formData.infrastructure },
                                    { label: "Website", value: category.website },
                                    { label: "Sales department", value: formData.salesDepartment },
                                ].map((item) => (
                                    <div key={item.label} className="flex items-start">
                                        <span style={{ fontWeight: 400, fontSize: 12, lineHeight: "18px" }} className="w-[110px] text-[#4E525D] shrink-0">{item.label}</span>
                                        <span style={{ fontWeight: 500, fontSize: 14, lineHeight: "20px" }} className="text-[#1A1A1A]">{item.value || "not specified"}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

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

                {/* ── Section 4: List of Houses ── */}
                <div className="bg-white border border-[#EAECEF] rounded-[16px] p-5 mb-6 shadow-xs">
                    <div className="w-full flex items-center justify-between mb-4">
                        <h2 style={{ fontWeight: 500, fontSize: 16, lineHeight: "20px" }} className="text-[#1A1A1A]">List of houses</h2>
                        <FormAddButton
                            icon={<span className="text-base font-light mr-0.5">+</span>}
                            onClick={() => navigate(`/dashboard/offplan/objects/${slug}/config/properties/houses/create`)}
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
                                                    onClick={() => navigate(`/dashboard/offplan/objects/${slug}/config/properties/houses/${house.id}/edit`)}
                                                    className="flex-1 rounded-lg border border-[#E2E8F0] py-1.5 text-[12px] font-medium text-[#4E525D] hover:bg-gray-50 transition-colors cursor-pointer"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => { if (window.confirm("Delete this house?")) deleteMutation.mutate(house.id); }}
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

                {/* ── Save / Cancel Buttons ── */}
                <div className="flex gap-3 mb-8">
                    <FormButton type="button" disabled={updateMutation.isPending}
                        onClick={() => updateMutation.mutate()}>
                        {updateMutation.isPending ? "Saving..." : "Save"}
                    </FormButton>
                    <FormButton type="button" variant="secondary"
                        onClick={() => navigate("/dashboard/offplan/objects")}>
                        Cancel
                    </FormButton>
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
