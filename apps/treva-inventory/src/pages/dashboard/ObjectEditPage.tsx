import { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { categoriesApi, type CategoryDocument } from "../../api/categories";
import { unitLayoutsApi, type UnitLayout } from "../../api/unit-layouts";
import { objectTypesApi, type ObjectType } from "../../api/object-types";
import { currenciesApi, type Currency } from "../../api/currencies";
import { FormDropdown, FormTabSwitcher, FormAddButton } from "@repo/ui";
import { HouseForm } from "./HouseForm";
import { useMessageCenter } from "../../components/MessageCenter";
import { getApiErrorMessage } from "../../utils/apiError";
import { useFormDraft } from "../../hooks/useFormDraft";
import { ImageAssetCard } from "../../components/ImageAssetCard";

const SUPPORTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"] as const;
const IMAGE_ACCEPT = SUPPORTED_IMAGE_TYPES.join(",");

type TabKey = "info" | "property" | "houses";
type PropertySubTab = "properties" | "payments" | "options" | "stock";

const TABS: { key: TabKey; label: string }[] = [
    { key: "info", label: "Object Info" },
    { key: "property", label: "Property" },
    { key: "houses", label: "Houses" },
];

const PROPERTY_SUB_TABS: { key: PropertySubTab; label: string }[] = [
    { key: "properties", label: "Properties" },
    { key: "payments", label: "Payment Methods" },
    { key: "options", label: "Options" },
    { key: "stock", label: "Stock" },
];

const inputClass =
    "w-full h-11 rounded-2xl border border-[#E7E9EE] bg-[#F8F9FB] px-4 py-0 text-sm leading-5 text-[#1A1A1A] placeholder-[#999] outline-none transition-colors focus:border-[#C8CDD8] focus:bg-white";

const defaultFormData = {
    objectType: "",
    propertyName: "",
    slug: "",
    currency: "",
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
};

export function ObjectEditPage({ embedded = false }: { embedded?: boolean } = {}) {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { showError, showSuccess } = useMessageCenter();
    const [showHouseForm, setShowHouseForm] = useState(false);
    const [editingHouseId, setEditingHouseId] = useState<string | null>(null);
    const [docUploading, setDocUploading] = useState(false);
    const docInputRef = useRef<HTMLInputElement>(null);
    const houseFormRef = useRef<HTMLDivElement>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);
    const [imageUploading, setImageUploading] = useState(false);
    const [imageDrag, setImageDrag] = useState(false);

    const { state: draftState, setState: setDraftState, clearDraft } = useFormDraft({
        key: `treva-object-edit-${slug || "unknown"}`,
        initialState: {
            activeTab: "info" as TabKey,
            activeHouseTab: "Active" as "Active" | "Archive",
            formData: defaultFormData,
        },
    });

    const activeTab = draftState.activeTab;
    const setActiveTab = (tab: TabKey) => setDraftState((prev) => ({ ...prev, activeTab: tab }));
    const [activePropertySubTab, setActivePropertySubTab] = useState<PropertySubTab>("properties");
    const activeHouseTab = draftState.activeHouseTab;
    const setActiveHouseTab = (tab: "Active" | "Archive") => setDraftState((prev) => ({ ...prev, activeHouseTab: tab }));
    const formData = draftState.formData;
    const updateFormData = (field: string, value: string | boolean) =>
        setDraftState((prev) => ({ ...prev, formData: { ...prev.formData, [field]: value } }));

    const { data: response, isLoading } = useQuery({
        queryKey: ["category", slug],
        queryFn: () => categoriesApi.getBySlug(slug!),
        enabled: !!slug,
    });

    const category = response?.data;
    const documents: CategoryDocument[] = category?.documents || [];

    const { data: cmsData } = useQuery({
        queryKey: ["layihelerimiz-category", slug],
        queryFn: async () => {
            const res = await fetch(`/cms-api/layihelerimiz/categories/${slug}`);
            if (!res.ok) return null;
            return res.json();
        },
        enabled: !!slug,
    });

    const { data: objectTypesResponse } = useQuery({
        queryKey: ["object-types"],
        queryFn: () => objectTypesApi.getAll(),
    });
    const objectTypes: ObjectType[] = Array.isArray(objectTypesResponse?.data) ? objectTypesResponse.data : [];

    const { data: currenciesResponse } = useQuery({
        queryKey: ["currencies"],
        queryFn: () => currenciesApi.getAll(),
    });
    const currencies: Currency[] = Array.isArray(currenciesResponse?.data) ? currenciesResponse.data : [];

    const { data: layoutsRes } = useQuery({
        queryKey: ["unit-layouts", slug],
        queryFn: () => unitLayoutsApi.getAll({ categorySlug: slug! }),
        enabled: !!slug,
    });

    const allHouses: UnitLayout[] = layoutsRes?.data?.data || [];
    const filteredHouses = activeHouseTab === "Active"
        ? allHouses.filter((h) => h.statusOption?.value !== "Sold")
        : allHouses.filter((h) => h.statusOption?.value === "Sold");

    const restoredFromDraft = useRef(false);
    useEffect(() => {
        if (category && !restoredFromDraft.current) {
            restoredFromDraft.current = true;
            setDraftState((prev) => ({
                ...prev,
                formData: {
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
                },
            }));
        }
    }, [category]);

    const updateMutation = useMutation({
        mutationFn: (data: typeof formData) => {
            const selectedType = objectTypes.find((t) => t.id === data.objectType);
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
            queryClient.invalidateQueries({ queryKey: ["categories"] });
            showSuccess({ title: "Object updated" });
            clearDraft();
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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateMutation.mutate(formData);
    };

    const handleImageUpload = async (file: File) => {
        const items = [file];
        const hasUnsupported = items.some((f) => !SUPPORTED_IMAGE_TYPES.includes(f.type as typeof SUPPORTED_IMAGE_TYPES[number]));
        if (hasUnsupported) {
            showError({ title: "Unsupported file type", description: "Please upload JPG, PNG, WebP, or GIF images." });
            return;
        }
        setImageUploading(true);
        try {
            const res = await unitLayoutsApi.uploadFile(file);
            updateFormData("image", res.data.url);
        } catch (error) {
            showError({ title: "Upload failed", description: getApiErrorMessage(error, "Please try again.") });
        } finally {
            setImageUploading(false);
        }
    };

    const onImageDragOver = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); };
    const onImageDragEnter = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setImageDrag(true); };
    const onImageDragLeave = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setImageDrag(false); };
    const onImageDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setImageDrag(false);
        const file = e.dataTransfer.files?.[0];
        if (file) handleImageUpload(file);
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

    if (isLoading) {
        return (
            <main className="flex-1 p-8 overflow-y-auto" style={{ background: "var(--background-primary-50, #FFFFFF80)" }}>
                <div className="py-8 text-center text-[#666666]">Loading...</div>
            </main>
        );
    }

    if (!category) {
        return (
            <main className="flex-1 p-8 overflow-y-auto" style={{ background: "var(--background-primary-50, #FFFFFF80)" }}>
                <div className="py-8 text-center text-[#C3362B]">Object not found</div>
            </main>
        );
    }

    const formContent = (
        <div className="w-full max-w-[1000px] mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => navigate(`/dashboard/offplan/objects/${slug}/config`)}
                        className="text-[#718096] hover:text-[#1A1C1E] transition-colors p-1 cursor-pointer"
                        aria-label="Back to config"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="15 18 9 12 15 6"></polyline>
                        </svg>
                    </button>
                    <h2 className="text-[16px] font-bold text-[#333333]" style={{ lineHeight: "20px" }}>
                        {formData.propertyName || "Edit Object"}
                    </h2>
                </div>
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

            {/* Tab Bar */}
            <div className="rounded-[24px] border border-[#ECEEF2] bg-white p-2 mb-6">
                <div className="flex gap-1">
                    {TABS.map((tab) => (
                        <button
                            key={tab.key}
                            type="button"
                            onClick={() => setActiveTab(tab.key)}
                            className={`flex-1 rounded-2xl px-4 py-2.5 text-sm font-medium transition-all cursor-pointer ${
                                activeTab === tab.key
                                    ? "bg-[#4E525D] text-white shadow-sm"
                                    : "text-[#808191] hover:bg-[#F4F5F6] hover:text-[#4E525D]"
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tab: Object Info */}
            {activeTab === "info" && (
                <form onSubmit={handleSubmit}>
                    {/* Project Section */}
                    <div className="rounded-[28px] border border-[#E9ECF2] bg-white p-5 mb-5 shadow-[0_1px_2px_rgba(16,24,40,0.03)]">
                        <div className="mb-5 flex items-start justify-between gap-4 border-b border-[#F1F2F4] pb-4">
                            <div className="min-w-0">
                                <h5 className="text-[15px] font-semibold leading-5 text-[#1A1A1A]">Project</h5>
                                <p className="mt-1 text-xs leading-5 text-[#808191]">Core project details</p>
                            </div>
                            <span className="mt-1 h-2.5 w-2.5 flex-shrink-0 rounded-full bg-[#D8DCE5]" />
                        </div>
                        <div className="grid gap-5 lg:grid-cols-2">
                            <div>
                                <FormDropdown
                                    label="Object type *"
                                    value={formData.objectType}
                                    options={objectTypes.map((t) => ({ id: t.id, label: t.title }))}
                                    placeholder="Select object type"
                                    onChange={(id) => updateFormData("objectType", id)}
                                    onCreateClick={() => navigate("/dashboard/offplan/object-types")}
                                    createLabel="+ Create object type"
                                />
                            </div>
                            <div>
                                <label className="mb-1.5 block text-xs font-medium text-[#4E525D]">Property Name *</label>
                                <input className={inputClass} value={formData.propertyName} onChange={(e) => updateFormData("propertyName", e.target.value)} placeholder="Sea Breeze Residence" />
                            </div>
                            <div>
                                <label className="mb-1.5 block text-xs font-medium text-[#4E525D]">Slug</label>
                                <input className={inputClass} value={formData.slug} onChange={(e) => updateFormData("slug", e.target.value)} placeholder="auto-generated-from-name" />
                            </div>
                            <div>
                                <FormDropdown
                                    label="Currency *"
                                    value={formData.currency}
                                    options={currencies.map((c) => ({ id: c.value, label: c.title }))}
                                    placeholder="Select currency"
                                    onChange={(id) => updateFormData("currency", id)}
                                    onCreateClick={() => navigate("/dashboard/offplan/currencies")}
                                    createLabel="+ Create currency"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Location Section */}
                    <div className="rounded-[28px] border border-[#E9ECF2] bg-white p-5 mb-5 shadow-[0_1px_2px_rgba(16,24,40,0.03)]">
                        <div className="mb-5 flex items-start justify-between gap-4 border-b border-[#F1F2F4] pb-4">
                            <div className="min-w-0">
                                <h5 className="text-[15px] font-semibold leading-5 text-[#1A1A1A]">Location</h5>
                                <p className="mt-1 text-xs leading-5 text-[#808191]">Project location details</p>
                            </div>
                            <span className="mt-1 h-2.5 w-2.5 flex-shrink-0 rounded-full bg-[#D8DCE5]" />
                        </div>
                        <div className="grid gap-5 lg:grid-cols-3">
                            <div>
                                <label className="mb-1.5 block text-xs font-medium text-[#4E525D]">Region *</label>
                                <input className={inputClass} value={formData.region} onChange={(e) => updateFormData("region", e.target.value)} placeholder="Dubai Marina" />
                            </div>
                            <div>
                                <label className="mb-1.5 block text-xs font-medium text-[#4E525D]">City *</label>
                                <input className={inputClass} value={formData.city} onChange={(e) => updateFormData("city", e.target.value)} placeholder="Baku" />
                            </div>
                            <div>
                                <label className="mb-1.5 block text-xs font-medium text-[#4E525D]">Area *</label>
                                <input className={inputClass} value={formData.area} onChange={(e) => updateFormData("area", e.target.value)} placeholder="2500 m²" />
                            </div>
                        </div>
                    </div>

                    {/* Developer Section */}
                    <div className="rounded-[28px] border border-[#E9ECF2] bg-white p-5 mb-5 shadow-[0_1px_2px_rgba(16,24,40,0.03)]">
                        <div className="mb-5 flex items-start justify-between gap-4 border-b border-[#F1F2F4] pb-4">
                            <div className="min-w-0">
                                <h5 className="text-[15px] font-semibold leading-5 text-[#1A1A1A]">Developer</h5>
                                <p className="mt-1 text-xs leading-5 text-[#808191]">Developer and sales information</p>
                            </div>
                            <span className="mt-1 h-2.5 w-2.5 flex-shrink-0 rounded-full bg-[#D8DCE5]" />
                        </div>
                        <div className="space-y-4">
                            <div className="grid gap-5 lg:grid-cols-2">
                                <div>
                                    <label className="mb-1.5 block text-xs font-medium text-[#4E525D]">Developer Brand *</label>
                                    <input className={inputClass} value={formData.developerBrand} onChange={(e) => updateFormData("developerBrand", e.target.value)} placeholder="ABC Development" />
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-xs font-medium text-[#4E525D]">Website *</label>
                                    <input className={inputClass} value={formData.website} onChange={(e) => updateFormData("website", e.target.value)} placeholder="https://example.com" />
                                </div>
                            </div>
                            <div className="grid gap-5 lg:grid-cols-2">
                                <div>
                                    <label className="mb-1.5 block text-xs font-medium text-[#4E525D]">Banks *</label>
                                    <input className={inputClass} value={formData.banks} onChange={(e) => updateFormData("banks", e.target.value)} placeholder="Kapital Bank, PASHA Bank" />
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-xs font-medium text-[#4E525D]">Sales Department *</label>
                                    <input className={inputClass} value={formData.salesDepartment} onChange={(e) => updateFormData("salesDepartment", e.target.value)} placeholder="sales@example.com" />
                                </div>
                            </div>
                            <div>
                                <label className="mb-1.5 block text-xs font-medium text-[#4E525D]">Infrastructure *</label>
                                <input className={inputClass} value={formData.infrastructure} onChange={(e) => updateFormData("infrastructure", e.target.value)} placeholder="Swimming pool, Gym, Parking" />
                            </div>
                        </div>
                    </div>

                    {/* Media & Legal Section */}
                    <div className="rounded-[28px] border border-[#E9ECF2] bg-white p-5 mb-5 shadow-[0_1px_2px_rgba(16,24,40,0.03)]">
                        <div className="mb-5 flex items-start justify-between gap-4 border-b border-[#F1F2F4] pb-4">
                            <div className="min-w-0">
                                <h5 className="text-[15px] font-semibold leading-5 text-[#1A1A1A]">Media & Legal</h5>
                                <p className="mt-1 text-xs leading-5 text-[#808191]">Project image and legal status</p>
                            </div>
                            <span className="mt-1 h-2.5 w-2.5 flex-shrink-0 rounded-full bg-[#D8DCE5]" />
                        </div>
                        <div className="space-y-4">
                            <ImageAssetCard
                                label="Project Image"
                                description="Primary thumbnail used in cards and listing views."
                                alt="Project"
                                imageUrl={formData.image || null}
                                widthClass="w-[120px]"
                                previewClassName="h-[120px] w-[120px] rounded-[18px] border border-[#E5E7EC] bg-white p-1.5 shadow-[0_8px_20px_rgba(17,24,39,0.06)]"
                                emptyPreviewClassName={`flex h-[120px] w-[120px] items-center justify-center rounded-[18px] border-2 border-dashed bg-white ${imageDrag ? "border-blue-400 bg-blue-50" : imageUploading ? "pointer-events-none border-gray-200 bg-[#F4F5F6] opacity-50" : "border-gray-200 hover:border-gray-400"}`}
                                placeholderTitle="Upload"
                                isDragging={imageDrag}
                                uploading={imageUploading}
                                onOpen={() => imageInputRef.current?.click()}
                                onRemove={() => updateFormData("image", "")}
                                onDragOver={onImageDragOver}
                                onDragEnter={onImageDragEnter}
                                onDragLeave={onImageDragLeave}
                                onDrop={onImageDrop}
                            />
                            <input
                                ref={imageInputRef}
                                type="file"
                                accept={IMAGE_ACCEPT}
                                className="hidden"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleImageUpload(file);
                                    if (imageInputRef.current) imageInputRef.current.value = "";
                                }}
                            />
                            <label className="flex items-center gap-3 group cursor-pointer select-none">
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        checked={formData.fedLaw214}
                                        onChange={(e) => updateFormData("fedLaw214", e.target.checked)}
                                        className="sr-only"
                                    />
                                    {formData.fedLaw214 ? (
                                        <img src="/images/inv-dashboard/inv-offplan/checkbox-checked.svg" alt="" className="w-5 h-5" />
                                    ) : (
                                        <img src="/images/inv-dashboard/inv-offplan/checkbox.svg" alt="" className="w-5 h-5 opacity-60" />
                                    )}
                                </div>
                                <span className="text-sm text-[#4E525D]">Possibility of Purchase under Federal Law No. 214</span>
                            </label>
                        </div>
                    </div>

                    {/* Submit Bar */}
                    <div className="mt-6 flex gap-3 rounded-[24px] border border-[#ECEEF2] bg-white p-4">
                        <button
                            type="submit"
                            disabled={updateMutation.isPending}
                            className="rounded-xl bg-[#4E525D] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {updateMutation.isPending ? "Saving..." : "Save Changes"}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate("/dashboard/offplan/objects")}
                            className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm text-[#666666] transition-colors hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                    </div>

                    {updateMutation.isError && (
                        <div className="mt-4 rounded-xl bg-red-50 p-3 text-center text-sm text-[#C3362B]">
                            {(updateMutation.error as Error)?.message || "Failed to update object"}
                        </div>
                    )}
                </form>
            )}

            {/* Tab: Property */}
            {activeTab === "property" && (
                <div className="space-y-5">
                    {/* Sub-tabs */}
                    <div className="rounded-[24px] border border-[#ECEEF2] bg-white p-1.5">
                        <div className="flex gap-1">
                            {PROPERTY_SUB_TABS.map((tab) => (
                                <button
                                    key={tab.key}
                                    type="button"
                                    onClick={() => setActivePropertySubTab(tab.key)}
                                    className={`flex-1 rounded-2xl px-3 py-2 text-[13px] font-medium transition-all cursor-pointer ${
                                        activePropertySubTab === tab.key
                                            ? "bg-[#4E525D] text-white shadow-sm"
                                            : "text-[#667085] hover:bg-[#F8F9FB]"
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Sub-tab: Properties */}
                    {activePropertySubTab === "properties" && (
                        <div className="space-y-5">
                            {/* Property Information Card */}
                            <div className="rounded-[28px] border border-[#E9ECF2] bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.03)]">
                                <div className="mb-5 flex items-start justify-between gap-4 border-b border-[#F1F2F4] pb-4">
                                    <div className="min-w-0">
                                        <h5 className="text-[15px] font-semibold leading-5 text-[#1A1A1A]">Property information</h5>
                                        <p className="mt-1 text-xs leading-5 text-[#808191]">Key details about this object</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3.5 pt-1">
                                    <div className="space-y-3.5">
                                        <div className="flex items-start">
                                            <span className="w-[100px] text-xs text-[#4E525D] shrink-0">Object type</span>
                                            <span className="text-sm font-medium text-[#1A1A1A]">{category?.objectType || "not specified"}</span>
                                        </div>
                                        <div className="flex items-start">
                                            <span className="w-[100px] text-xs text-[#4E525D] shrink-0">Name</span>
                                            <span className="text-sm font-medium text-[#1A1A1A]">{category?.propertyName || category?.title || "not specified"}</span>
                                        </div>
                                        <div className="flex items-start">
                                            <span className="w-[100px] text-xs text-[#4E525D] shrink-0">Address</span>
                                            <span className="text-sm font-medium text-[#1A1A1A]">{category?.region || "not specified"}</span>
                                        </div>
                                        <div className="flex items-start">
                                            <span className="w-[100px] text-xs text-[#4E525D] shrink-0">Developer</span>
                                            <span className="text-sm font-medium text-[#1A1A1A]">{category?.developerBrand || "not specified"}</span>
                                        </div>
                                        <div className="flex items-start">
                                            <span className="w-[100px] text-xs text-[#4E525D] shrink-0">Banks</span>
                                            <span className="text-sm font-medium text-[#1A1A1A]">{cmsData?.banks || category?.banks || "not specified"}</span>
                                        </div>
                                    </div>
                                    <div className="space-y-3.5">
                                        <div className="flex items-start">
                                            <span className="w-[110px] text-xs text-[#4E525D] shrink-0">Currency</span>
                                            <span className="text-sm font-medium text-[#1A1A1A]">{category?.currency || "not specified"}</span>
                                        </div>
                                        <div className="flex items-start">
                                            <span className="w-[110px] text-xs text-[#4E525D] shrink-0">Infrastructure</span>
                                            <span className="text-sm font-medium text-[#1A1A1A]">{cmsData?.infrastructure || category?.infrastructure || "not specified"}</span>
                                        </div>
                                        <div className="flex items-start">
                                            <span className="w-[110px] text-xs text-[#4E525D] shrink-0">Website</span>
                                            <span className="text-sm font-medium text-[#1A1A1A]">{category?.website || "not specified"}</span>
                                        </div>
                                        <div className="flex items-start">
                                            <span className="w-[110px] text-xs text-[#4E525D] shrink-0">Sales department</span>
                                            <span className="text-sm font-medium text-[#1A1A1A]">{cmsData?.salesDepartment || category?.salesDepartment || "not specified"}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* General Plans */}
                            <div className="rounded-[28px] border border-[#E9ECF2] bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.03)]">
                                <div className="mb-5 flex items-start justify-between gap-4 border-b border-[#F1F2F4] pb-4">
                                    <div className="min-w-0">
                                        <h5 className="text-[15px] font-semibold leading-5 text-[#1A1A1A]">General Plans</h5>
                                        <p className="mt-1 text-xs leading-5 text-[#808191]">Upload master plans and documents</p>
                                    </div>
                                </div>
                                <input ref={docInputRef} type="file" accept=".pdf,image/jpeg,image/png,image/webp" multiple className="hidden"
                                    onChange={(e) => { if (e.target.files && e.target.files.length > 0) handleDocUpload(e.target.files); }} />
                                {documents.length > 0 ? (
                                    <div>
                                        <div className="space-y-2 mb-4">
                                            {documents.map((doc, idx) => (
                                                <div key={idx} className="flex items-center justify-between rounded-xl border border-[#ECEEF2] px-3 py-2.5 group">
                                                    <div className="flex items-center gap-2.5 min-w-0">
                                                        <div className="w-8 h-8 flex items-center justify-center flex-shrink-0 rounded-lg" style={{ background: doc.type === "pdf" ? "#FEE2E2" : "#DBEAFE" }}>
                                                            <span className="text-xs font-bold" style={{ color: doc.type === "pdf" ? "#DC2626" : "#2563EB" }}>
                                                                {doc.type === "pdf" ? "PDF" : "IMG"}
                                                            </span>
                                                        </div>
                                                        <span className="text-sm text-[#1A1A1A] truncate">{doc.url.split("/").pop() || `Plan ${idx + 1}`}</span>
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
                                    <div className="flex flex-col items-center justify-center text-center py-8">
                                        <div className="w-10 h-10 rounded-full bg-[#EBEBEB] flex items-center justify-center mb-3">
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#718096" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                                            </svg>
                                        </div>
                                        <p className="text-sm font-medium text-[#718096] mb-4">No plans uploaded yet</p>
                                        <FormAddButton icon={<span className="text-sm font-light">+</span>}
                                            className="!bg-white !border !border-[#CBD5E1] !text-[#1A1C1E] hover:!bg-gray-50"
                                            onClick={() => docInputRef.current?.click()} disabled={docUploading}>
                                            {docUploading ? "Uploading..." : "Add master plan"}
                                        </FormAddButton>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Sub-tab: Payment Methods */}
                    {activePropertySubTab === "payments" && (
                        <div className="rounded-[28px] border border-[#E9ECF2] bg-white p-10 shadow-[0_1px_2px_rgba(16,24,40,0.03)]">
                            <div className="flex flex-col items-center justify-center text-center">
                                <div className="w-14 h-14 rounded-full bg-[#F0F1F3] flex items-center justify-center mb-4">
                                    <img src="/images/inv-dashboard/inv-offplan/payment.svg" alt="" className="w-8 h-8 opacity-50" />
                                </div>
                                <p className="text-sm font-medium text-[#667085]">Payment Methods</p>
                                <p className="text-xs text-[#999] mt-1">Coming soon</p>
                            </div>
                        </div>
                    )}

                    {/* Sub-tab: Options */}
                    {activePropertySubTab === "options" && (
                        <div className="rounded-[28px] border border-[#E9ECF2] bg-white p-10 shadow-[0_1px_2px_rgba(16,24,40,0.03)]">
                            <div className="flex flex-col items-center justify-center text-center">
                                <div className="w-14 h-14 rounded-full bg-[#F0F1F3] flex items-center justify-center mb-4">
                                    <img src="/images/inv-dashboard/inv-offplan/options.svg" alt="" className="w-8 h-8 opacity-50" />
                                </div>
                                <p className="text-sm font-medium text-[#667085]">Options</p>
                                <p className="text-xs text-[#999] mt-1">Coming soon</p>
                            </div>
                        </div>
                    )}

                    {/* Sub-tab: Stock */}
                    {activePropertySubTab === "stock" && (
                        <div className="rounded-[28px] border border-[#E9ECF2] bg-white p-10 shadow-[0_1px_2px_rgba(16,24,40,0.03)]">
                            <div className="flex flex-col items-center justify-center text-center">
                                <div className="w-14 h-14 rounded-full bg-[#F0F1F3] flex items-center justify-center mb-4">
                                    <img src="/images/inv-dashboard/inv-offplan/stock.svg" alt="" className="w-8 h-8 opacity-50" />
                                </div>
                                <p className="text-sm font-medium text-[#667085]">Stock</p>
                                <p className="text-xs text-[#999] mt-1">Coming soon</p>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Tab: Houses */}
            {activeTab === "houses" && (
                <div className="space-y-5">
                    <div className="flex items-center justify-between">
                        <FormTabSwitcher
                            tabs={[{ id: "Active", label: "Active houses" }, { id: "Archive", label: "Archive" }]}
                            activeTab={activeHouseTab}
                            onChange={(id) => setActiveHouseTab(id as "Active" | "Archive")}
                            size="md"
                        />
                        <FormAddButton
                            icon={<span className="text-base font-light mr-0.5">+</span>}
                            onClick={() => { setEditingHouseId(null); setShowHouseForm(true); }}
                        >
                            Add House
                        </FormAddButton>
                    </div>

                    {(showHouseForm || editingHouseId) && (
                        <div ref={houseFormRef} className="rounded-[28px] border border-[#E9ECF2] bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.03)]">
                            <HouseForm
                                embedded
                                inline
                                categorySlug={slug}
                                houseId={editingHouseId ?? undefined}
                                key={editingHouseId ?? "new"}
                                onSuccess={() => {
                                    setShowHouseForm(false);
                                    setEditingHouseId(null);
                                    queryClient.invalidateQueries({ queryKey: ["unit-layouts", slug] });
                                }}
                            />
                        </div>
                    )}

                    <div className="flex flex-wrap gap-4">
                        {filteredHouses.length === 0 ? (
                            <div className="w-full py-12 text-center text-[#999] text-sm">
                                {activeHouseTab === "Active" ? "No active houses yet. Click 'Add House' to create one." : "No archived houses"}
                            </div>
                        ) : (
                            filteredHouses.map((house) => {
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
                                            <p className="text-sm font-semibold text-[#1A1A1A] truncate">{house.title}</p>
                                            <p className="text-xs text-[#999]">{house.totalArea} m² · {house.roomOption?.title || `${house.number || 0} rooms`}</p>
                                        </div>
                                        <div className="flex gap-1 px-1 pb-1">
                                            <button
                                                type="button"
                                                onClick={() => { setEditingHouseId(house.id); setShowHouseForm(true); setTimeout(() => houseFormRef.current?.scrollIntoView({ behavior: "smooth" }), 50); }}
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
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <main className="flex-1 p-8 overflow-y-auto" style={{ background: "var(--background-primary-50, #FFFFFF80)" }}>
            {formContent}
        </main>
    );
}
