import { type ReactNode, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { categoriesApi, type CategoryDocument } from "../../api/categories";
import { unitLayoutsApi, type UnitLayout } from "../../api/unit-layouts";
import { objectTypesApi, type ObjectType } from "../../api/object-types";
import { currenciesApi, type Currency } from "../../api/currencies";
import { locationOptionsApi, type LocationOption } from "../../api/location-options";
import { FormAddButton, FormDropdown, FormTabSwitcher } from "@repo/ui";
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

function SectionBlock({
    title,
    description,
    children,
}: {
    title: string;
    description?: string;
    children: ReactNode;
}) {
    return (
        <section className="rounded-[28px] border border-[#E9ECF2] bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.03)]">
            <div className="mb-5 flex items-start justify-between gap-4 border-b border-[#F1F2F4] pb-4">
                <div className="min-w-0">
                    <h5 className="text-[15px] font-semibold leading-5 text-[#1A1A1A]">{title}</h5>
                    {description ? <p className="mt-1 text-xs leading-5 text-[#808191]">{description}</p> : null}
                </div>
                <span className="mt-1 h-2.5 w-2.5 flex-shrink-0 rounded-full bg-[#D8DCE5]" />
            </div>
            <div className="space-y-4">{children}</div>
        </section>
    );
}

const defaultFormData = {
    name: "",
    title: "",
    objectType: "",
    currency: "",
    region: "",
    area: "",
    city: "",
    locationGoogleMapsUrl: "",
    developerBrand: "",
    website: "",
    banks: "",
    infrastructure: "",
    salesDepartment: "",
    fedLaw214: false,
    image: "",
    coverImage: "",
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
    const coverImageInputRef = useRef<HTMLInputElement>(null);
    const [imageUploading, setImageUploading] = useState(false);
    const [coverImageUploading, setCoverImageUploading] = useState(false);
    const [imageDrag, setImageDrag] = useState(false);
    const [coverImageDrag, setCoverImageDrag] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

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
    const setActiveHouseTab = (tab: "Active" | "Archive") =>
        setDraftState((prev) => ({ ...prev, activeHouseTab: tab }));
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

    const { data: locationOptionsResponse } = useQuery({
        queryKey: ["location-options"],
        queryFn: () => locationOptionsApi.getAll(),
    });
    const locationOptionItems: LocationOption[] = Array.isArray(locationOptionsResponse?.data)
        ? locationOptionsResponse.data
        : [];

    const toLocationDropdownOptions = (type: "region" | "city", selectedValue?: string, cityTitle?: string) => {
        const mapped = locationOptionItems
            .filter((item) => {
                if (item.type !== type) return false;
                if (type === "region" && cityTitle) {
                    return item.city?.title === cityTitle;
                }
                return true;
            })
            .map((item) => ({
                id: item.title,
                label: item.title,
            }));

        if (selectedValue && !mapped.some((item) => item.id === selectedValue)) {
            mapped.unshift({ id: selectedValue, label: selectedValue });
        }

        return mapped;
    };

    const { data: layoutsRes } = useQuery({
        queryKey: ["unit-layouts", slug],
        queryFn: () => unitLayoutsApi.getAll({ categorySlug: slug! }),
        enabled: !!slug,
    });

    const allHouses: UnitLayout[] = layoutsRes?.data?.data || [];
    const filteredHouses = activeHouseTab === "Active"
        ? allHouses.filter((h) => !h.archived)
        : allHouses.filter((h) => h.archived);

    const restoredFromDraft = useRef(false);
    useEffect(() => {
        if (category && objectTypes.length > 0 && !restoredFromDraft.current) {
            restoredFromDraft.current = true;
            const matchedType = objectTypes.find((t) => t.title === category.objectType);
            setDraftState((prev) => ({
                ...prev,
                formData: {
                    name: category.name || category.propertyName || "",
                    title: category.title || "",
                    objectType: matchedType?.id || category.objectType || "",
                    currency: category.currency || "",
                    region: category.region || "",
                    area: category.area || "",
                    city: category.city || "",
                    locationGoogleMapsUrl: category.locationGoogleMapsUrl || "",
                    developerBrand: category.developerBrand || "",
                    website: category.website || "",
                    banks: category.banks || "",
                    infrastructure: category.infrastructure || "",
                    salesDepartment: category.salesDepartment || "",
                    fedLaw214: category.fedLaw214 || false,
                    image: category.image || "",
                    coverImage: category.coverImage || "",
                },
            }));
        }
    }, [category, objectTypes, setDraftState]);

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};
        if (!formData.objectType) newErrors.objectType = "Object type is required";
        if (!formData.name.trim()) newErrors.name = "Name is required";
        if (!formData.title.trim()) newErrors.title = "Title is required";
        if (!formData.currency) newErrors.currency = "Currency is required";
        if (!formData.city.trim()) newErrors.city = "City is required";
        if (!formData.region.trim()) newErrors.region = "Region is required";
        if (!formData.area.trim()) newErrors.area = "Area is required";
        if (!formData.developerBrand.trim()) newErrors.developerBrand = "Developer brand is required";
        if (!formData.website.trim()) newErrors.website = "Website is required";
        if (!formData.banks.trim()) newErrors.banks = "Banks is required";
        if (!formData.infrastructure.trim()) newErrors.infrastructure = "Infrastructure is required";
        if (!formData.salesDepartment.trim()) newErrors.salesDepartment = "Sales department is required";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const clearError = (field: string) => {
        if (errors[field]) {
            setErrors((prev) => {
                const next = { ...prev };
                delete next[field];
                return next;
            });
        }
    };

    const updateMutation = useMutation({
        mutationFn: (data: typeof formData) => {
            const selectedType = objectTypes.find((t) => t.id === data.objectType);
            return categoriesApi.update(category!.id, {
                name: data.name,
                title: data.title,
                objectType: selectedType?.title || data.objectType,
                propertyName: data.name || data.title,
                currency: data.currency,
                region: data.region,
                area: data.area,
                city: data.city,
                locationGoogleMapsUrl: data.locationGoogleMapsUrl || undefined,
                developerBrand: data.developerBrand,
                website: data.website,
                banks: data.banks,
                infrastructure: data.infrastructure,
                salesDepartment: data.salesDepartment,
                fedLaw214: data.fedLaw214,
                image: data.image || undefined,
                coverImage: data.coverImage || undefined,
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
        mutationFn: (nextDocs: CategoryDocument[]) => categoriesApi.update(category!.id, { documents: nextDocs }),
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

    const archiveMutation = useMutation({
        mutationFn: ({ id, archived }: { id: string; archived: boolean }) =>
            unitLayoutsApi.update(id, { archived }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["unit-layouts", slug] });
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        updateMutation.mutate(formData);
    };

    const handleImageUpload = async (file: File, field: "image" | "coverImage", setUploading: (value: boolean) => void) => {
        const items = [file];
        const hasUnsupported = items.some(
            (item) => !SUPPORTED_IMAGE_TYPES.includes(item.type as (typeof SUPPORTED_IMAGE_TYPES)[number]),
        );
        if (hasUnsupported) {
            showError({ title: "Unsupported file type", description: "Please upload JPG, PNG, WebP, or GIF images." });
            return;
        }

        setUploading(true);
        try {
            const res = await unitLayoutsApi.uploadFile(file);
            updateFormData(field, res.data.url);
        } catch (error) {
            showError({ title: "Upload failed", description: getApiErrorMessage(error, "Please try again.") });
        } finally {
            setUploading(false);
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
        if (file) handleImageUpload(file, "image", setImageUploading);
    };

    const onCoverImageDragOver = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); };
    const onCoverImageDragEnter = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setCoverImageDrag(true); };
    const onCoverImageDragLeave = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setCoverImageDrag(false); };
    const onCoverImageDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setCoverImageDrag(false);
        const file = e.dataTransfer.files?.[0];
        if (file) handleImageUpload(file, "coverImage", setCoverImageUploading);
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
        updateDocsMutation.mutate(documents.filter((_, itemIndex) => itemIndex !== index));
    };

    if (isLoading) {
        return (
            <main className="flex-1 overflow-y-auto p-8" style={{ background: "var(--background-primary-50, #FFFFFF80)" }}>
                <div className="py-8 text-center text-[#666666]">Loading...</div>
            </main>
        );
    }

    if (!category) {
        return (
            <main className="flex-1 overflow-y-auto p-8" style={{ background: "var(--background-primary-50, #FFFFFF80)" }}>
                <div className="py-8 text-center text-[#C3362B]">Object not found</div>
            </main>
        );
    }

    const formContent = (
        <div className="rounded-[32px] border border-[#ECEEF2] bg-[#FCFCFD] p-6 shadow-[0_10px_30px_rgba(17,24,39,0.04)]">
            <div className="mb-6 flex flex-wrap gap-2 rounded-[24px] border border-[#ECEEF2] bg-white p-2">
                {TABS.map((tab) => (
                    <button
                        key={tab.key}
                        type="button"
                        onClick={() => setActiveTab(tab.key)}
                        className={`relative cursor-pointer rounded-2xl px-4 py-2.5 text-sm font-medium transition-colors ${
                            activeTab === tab.key
                                ? "bg-[#4E525D] text-white shadow-sm"
                                : "text-[#808191] hover:bg-[#F4F5F6] hover:text-[#4E525D]"
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {activeTab === "info" && (
                <form onSubmit={handleSubmit} className="max-w-5xl">
                    <div className="space-y-5">
                        <SectionBlock title="Identity" description="Core object information and listing basics.">
                            <div className="grid gap-5 lg:grid-cols-[280px_minmax(0,1fr)] lg:items-start">
                                <div className="rounded-[24px] border border-[#ECEEF2] bg-[#FBFCFD] p-4">
                                    <div className="space-y-4">
                                        <ImageAssetCard
                                            label="Main Image"
                                            description="Primary thumbnail used in cards and object listing views."
                                            alt="Project"
                                            imageUrl={formData.image || null}
                                            widthClass="w-[90px]"
                                            previewClassName="h-[90px] w-[90px] rounded-[24px] border border-[#E5E7EC] bg-white p-1.5 shadow-[0_8px_20px_rgba(17,24,39,0.06)]"
                                            emptyPreviewClassName={`flex h-[90px] w-[90px] items-center justify-center rounded-[24px] border-2 border-dashed bg-white ${imageDrag ? "border-blue-400 bg-blue-50" : imageUploading ? "pointer-events-none border-gray-200 bg-[#F4F5F6] opacity-50" : "border-gray-200 hover:border-gray-400"}`}
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
                                                if (file) handleImageUpload(file, "image", setImageUploading);
                                                if (imageInputRef.current) imageInputRef.current.value = "";
                                            }}
                                        />

                                        <div className="border-t border-[#EEF1F5] pt-4">
                                            <ImageAssetCard
                                                label="Cover Image"
                                                description="Optional portrait-style visual for richer object presentation."
                                                alt="Cover"
                                                imageUrl={formData.coverImage || null}
                                                widthClass="w-[112px]"
                                                previewClassName="h-[148px] w-[112px] rounded-[24px] border border-[#E5E7EC] bg-white p-1.5 shadow-[0_8px_20px_rgba(17,24,39,0.06)]"
                                                emptyPreviewClassName={`flex h-[148px] w-[112px] items-center justify-center rounded-[24px] border-2 border-dashed bg-white ${coverImageDrag ? "border-blue-400 bg-blue-50" : coverImageUploading ? "pointer-events-none border-gray-200 bg-[#F4F5F6] opacity-50" : "border-gray-200 hover:border-gray-400"}`}
                                                placeholderTitle="Upload cover"
                                                placeholderHint="Portrait image"
                                                isDragging={coverImageDrag}
                                                uploading={coverImageUploading}
                                                onOpen={() => coverImageInputRef.current?.click()}
                                                onRemove={() => updateFormData("coverImage", "")}
                                                onDragOver={onCoverImageDragOver}
                                                onDragEnter={onCoverImageDragEnter}
                                                onDragLeave={onCoverImageDragLeave}
                                                onDrop={onCoverImageDrop}
                                            />
                                            <input
                                                ref={coverImageInputRef}
                                                type="file"
                                                accept={IMAGE_ACCEPT}
                                                className="hidden"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) handleImageUpload(file, "coverImage", setCoverImageUploading);
                                                    if (coverImageInputRef.current) coverImageInputRef.current.value = "";
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="grid gap-4 lg:grid-cols-2">
                                        <div>
                                            <label className="mb-1.5 block text-xs font-medium text-[#4E525D]">Name *</label>
                                            <input
                                                className={inputClass}
                                                value={formData.name}
                                                onChange={(e) => { updateFormData("name", e.target.value); clearError("name"); }}
                                                placeholder="Sea Breeze"
                                            />
                                            {errors.name && <p className="mt-1 text-[12px] text-[#C3362B]">{errors.name}</p>}
                                        </div>
                                        <div>
                                            <label className="mb-1.5 block text-xs font-medium text-[#4E525D]">Title *</label>
                                            <input
                                                className={inputClass}
                                                value={formData.title}
                                                onChange={(e) => { updateFormData("title", e.target.value); clearError("title"); }}
                                                placeholder="Sea Breeze Residence"
                                            />
                                            {errors.title && <p className="mt-1 text-[12px] text-[#C3362B]">{errors.title}</p>}
                                        </div>
                                    </div>

                                    <div className="grid gap-4 lg:grid-cols-2">
                                        <div>
                                            <FormDropdown
                                                label="Type *"
                                                value={formData.objectType}
                                                options={objectTypes.map((item) => ({ id: item.id, label: item.title }))}
                                                placeholder="Select type"
                                                onChange={(id) => { updateFormData("objectType", id); clearError("objectType"); }}
                                                onCreateClick={() => navigate("/dashboard/offplan/object-types")}
                                                createLabel="Create object type"
                                            />
                                            {errors.objectType && <p className="mt-1 text-[12px] text-[#C3362B]">{errors.objectType}</p>}
                                        </div>
                                        <div>
                                            <FormDropdown
                                                label="Currency *"
                                                value={formData.currency}
                                                options={currencies.map((item) => ({ id: item.value, label: item.title }))}
                                                placeholder="Select currency"
                                                onChange={(id) => { updateFormData("currency", id); clearError("currency"); }}
                                                onCreateClick={() => navigate("/dashboard/offplan/currencies")}
                                                createLabel="Create currency"
                                            />
                                            {errors.currency && <p className="mt-1 text-[12px] text-[#C3362B]">{errors.currency}</p>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </SectionBlock>

                        <SectionBlock title="Location" description="Region, city and area details for the object.">
                            <div className="grid gap-5 lg:grid-cols-3">
                                <div>
                                    <FormDropdown
                                        label="City *"
                                        value={formData.city}
                                        options={toLocationDropdownOptions("city", formData.city)}
                                        placeholder="Select city"
                                        onChange={(id) => {
                                            updateFormData("city", id);
                                            updateFormData("region", "");
                                            clearError("city");
                                            clearError("region");
                                        }}
                                        onCreateClick={() => navigate("/dashboard/resale/location-options")}
                                        createLabel="Create city"
                                    />
                                    {errors.city && <p className="mt-1 text-[12px] text-[#C3362B]">{errors.city}</p>}
                                </div>
                                <div>
                                    <FormDropdown
                                        label="Region *"
                                        value={formData.region}
                                        options={toLocationDropdownOptions("region", formData.region, formData.city)}
                                        placeholder={formData.city ? "Select region" : "Select city first"}
                                        onChange={(id) => { updateFormData("region", id); clearError("region"); }}
                                        onCreateClick={() => navigate("/dashboard/resale/location-options")}
                                        createLabel="Create region"
                                    />
                                    {errors.region && <p className="mt-1 text-[12px] text-[#C3362B]">{errors.region}</p>}
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-xs font-medium text-[#4E525D]">Area *</label>
                                    <input
                                        className={inputClass}
                                        value={formData.area}
                                        onChange={(e) => { updateFormData("area", e.target.value); clearError("area"); }}
                                        placeholder="2500 m²"
                                    />
                                    {errors.area && <p className="mt-1 text-[12px] text-[#C3362B]">{errors.area}</p>}
                                </div>
                                <div className="lg:col-span-3">
                                    <label className="mb-1.5 block text-xs font-medium text-[#4E525D]">Location URL</label>
                                    <input
                                        className={inputClass}
                                        value={formData.locationGoogleMapsUrl}
                                        onChange={(e) => updateFormData("locationGoogleMapsUrl", e.target.value)}
                                        placeholder="https://www.google.com/maps/embed?pb=..."
                                    />
                                </div>
                            </div>
                        </SectionBlock>

                        <SectionBlock title="Commercial" description="Developer, sales and infrastructure details shown for the project.">
                            <div className="grid gap-5 lg:grid-cols-2">
                                <div>
                                    <label className="mb-1.5 block text-xs font-medium text-[#4E525D]">Developer Brand *</label>
                                    <input
                                        className={inputClass}
                                        value={formData.developerBrand}
                                        onChange={(e) => { updateFormData("developerBrand", e.target.value); clearError("developerBrand"); }}
                                        placeholder="ABC Development"
                                    />
                                    {errors.developerBrand && <p className="mt-1 text-[12px] text-[#C3362B]">{errors.developerBrand}</p>}
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-xs font-medium text-[#4E525D]">Website *</label>
                                    <input
                                        className={inputClass}
                                        value={formData.website}
                                        onChange={(e) => { updateFormData("website", e.target.value); clearError("website"); }}
                                        placeholder="https://example.com"
                                    />
                                    {errors.website && <p className="mt-1 text-[12px] text-[#C3362B]">{errors.website}</p>}
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-xs font-medium text-[#4E525D]">Banks *</label>
                                    <input
                                        className={inputClass}
                                        value={formData.banks}
                                        onChange={(e) => { updateFormData("banks", e.target.value); clearError("banks"); }}
                                        placeholder="Kapital Bank, PASHA Bank"
                                    />
                                    {errors.banks && <p className="mt-1 text-[12px] text-[#C3362B]">{errors.banks}</p>}
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-xs font-medium text-[#4E525D]">Sales Department *</label>
                                    <input
                                        className={inputClass}
                                        value={formData.salesDepartment}
                                        onChange={(e) => { updateFormData("salesDepartment", e.target.value); clearError("salesDepartment"); }}
                                        placeholder="sales@example.com"
                                    />
                                    {errors.salesDepartment && <p className="mt-1 text-[12px] text-[#C3362B]">{errors.salesDepartment}</p>}
                                </div>
                                <div className="lg:col-span-2">
                                    <label className="mb-1.5 block text-xs font-medium text-[#4E525D]">Infrastructure *</label>
                                    <input
                                        className={inputClass}
                                        value={formData.infrastructure}
                                        onChange={(e) => { updateFormData("infrastructure", e.target.value); clearError("infrastructure"); }}
                                        placeholder="Swimming pool, Gym, Parking"
                                    />
                                    {errors.infrastructure && <p className="mt-1 text-[12px] text-[#C3362B]">{errors.infrastructure}</p>}
                                </div>
                            </div>
                        </SectionBlock>

                        <div className="rounded-[28px] border border-[#E9ECF2] bg-white px-5 py-4 shadow-[0_1px_2px_rgba(16,24,40,0.03)]">
                            <label className="group flex cursor-pointer select-none items-center gap-3">
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        checked={formData.fedLaw214}
                                        onChange={(e) => updateFormData("fedLaw214", e.target.checked)}
                                        className="sr-only"
                                    />
                                    {formData.fedLaw214 ? (
                                        <img src="/images/inv-dashboard/inv-offplan/checkbox-checked.svg" alt="" className="h-5 w-5" />
                                    ) : (
                                        <img src="/images/inv-dashboard/inv-offplan/checkbox.svg" alt="" className="h-5 w-5 opacity-60" />
                                    )}
                                </div>
                                <div>
                                    <div className="text-sm font-semibold text-[#1A1A1A]">Federal Law No. 214</div>
                                    <div className="mt-1 text-xs leading-5 text-[#808191]">
                                        Mark this if the project supports purchase under the related federal law.
                                    </div>
                                </div>
                            </label>
                        </div>
                    </div>

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

            {activeTab === "property" && (
                <div className="max-w-5xl space-y-5">
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

                    {activePropertySubTab === "properties" && (
                        <div className="space-y-5">
                            <div className="rounded-[28px] border border-[#E9ECF2] bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.03)]">
                                <div className="mb-5 flex items-start justify-between gap-4 border-b border-[#F1F2F4] pb-4">
                                    <div className="min-w-0">
                                        <h5 className="text-[15px] font-semibold leading-5 text-[#1A1A1A]">Property information</h5>
                                        <p className="mt-1 text-xs leading-5 text-[#808191]">Key details about this object</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 gap-x-8 gap-y-3.5 pt-1 sm:grid-cols-2">
                                    <div className="space-y-3.5">
                                        <div className="flex items-start">
                                            <span className="w-[100px] shrink-0 text-xs text-[#4E525D]">Type</span>
                                            <span className="text-sm font-medium text-[#1A1A1A]">{category?.objectType || "not specified"}</span>
                                        </div>
                                        <div className="flex items-start">
                                            <span className="w-[100px] shrink-0 text-xs text-[#4E525D]">Name</span>
                                            <span className="text-sm font-medium text-[#1A1A1A]">{category?.name || "not specified"}</span>
                                        </div>
                                        <div className="flex items-start">
                                            <span className="w-[100px] shrink-0 text-xs text-[#4E525D]">Title</span>
                                            <span className="text-sm font-medium text-[#1A1A1A]">{category?.title || "not specified"}</span>
                                        </div>
                                        <div className="flex items-start">
                                            <span className="w-[100px] shrink-0 text-xs text-[#4E525D]">Address</span>
                                            <span className="text-sm font-medium text-[#1A1A1A]">{[category?.city, category?.region].filter(Boolean).join(", ") || "not specified"}</span>
                                        </div>
                                        <div className="flex items-start">
                                            <span className="w-[100px] shrink-0 text-xs text-[#4E525D]">Developer</span>
                                            <span className="text-sm font-medium text-[#1A1A1A]">{category?.developerBrand || "not specified"}</span>
                                        </div>
                                        <div className="flex items-start">
                                            <span className="w-[100px] shrink-0 text-xs text-[#4E525D]">Banks</span>
                                            <span className="text-sm font-medium text-[#1A1A1A]">{cmsData?.banks || category?.banks || "not specified"}</span>
                                        </div>
                                    </div>
                                    <div className="space-y-3.5">
                                        <div className="flex items-start">
                                            <span className="w-[110px] shrink-0 text-xs text-[#4E525D]">Currency</span>
                                            <span className="text-sm font-medium text-[#1A1A1A]">{category?.currency || "not specified"}</span>
                                        </div>
                                        <div className="flex items-start">
                                            <span className="w-[110px] shrink-0 text-xs text-[#4E525D]">Infrastructure</span>
                                            <span className="text-sm font-medium text-[#1A1A1A]">{cmsData?.infrastructure || category?.infrastructure || "not specified"}</span>
                                        </div>
                                        <div className="flex items-start">
                                            <span className="w-[110px] shrink-0 text-xs text-[#4E525D]">Website</span>
                                            <span className="text-sm font-medium text-[#1A1A1A]">{category?.website || "not specified"}</span>
                                        </div>
                                        <div className="flex items-start">
                                            <span className="w-[110px] shrink-0 text-xs text-[#4E525D]">Location URL</span>
                                            <span className="break-all text-sm font-medium text-[#1A1A1A]">
                                                {category?.locationGoogleMapsUrl || "not specified"}
                                            </span>
                                        </div>
                                        <div className="flex items-start">
                                            <span className="w-[110px] shrink-0 text-xs text-[#4E525D]">Sales department</span>
                                            <span className="text-sm font-medium text-[#1A1A1A]">{cmsData?.salesDepartment || category?.salesDepartment || "not specified"}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-[28px] border border-[#E9ECF2] bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.03)]">
                                <div className="mb-5 flex items-start justify-between gap-4 border-b border-[#F1F2F4] pb-4">
                                    <div className="min-w-0">
                                        <h5 className="text-[15px] font-semibold leading-5 text-[#1A1A1A]">General Plans</h5>
                                        <p className="mt-1 text-xs leading-5 text-[#808191]">Upload master plans and documents</p>
                                    </div>
                                </div>
                                <input
                                    ref={docInputRef}
                                    type="file"
                                    accept=".pdf,image/jpeg,image/png,image/webp"
                                    multiple
                                    className="hidden"
                                    onChange={(e) => {
                                        if (e.target.files && e.target.files.length > 0) handleDocUpload(e.target.files);
                                    }}
                                />
                                {documents.length > 0 ? (
                                    <div>
                                        <div className="mb-4 space-y-2">
                                            {documents.map((doc, idx) => (
                                                <div key={idx} className="group flex items-center justify-between rounded-xl border border-[#ECEEF2] px-3 py-2.5">
                                                    <div className="flex min-w-0 items-center gap-2.5">
                                                        <div
                                                            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg"
                                                            style={{ background: doc.type === "pdf" ? "#FEE2E2" : "#DBEAFE" }}
                                                        >
                                                            <span
                                                                className="text-xs font-bold"
                                                                style={{ color: doc.type === "pdf" ? "#DC2626" : "#2563EB" }}
                                                            >
                                                                {doc.type === "pdf" ? "PDF" : "IMG"}
                                                            </span>
                                                        </div>
                                                        <span className="truncate text-sm text-[#1A1A1A]">{doc.url.split("/").pop() || `Plan ${idx + 1}`}</span>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveDoc(idx)}
                                                        className="flex-shrink-0 rounded p-1 opacity-0 transition-opacity hover:bg-red-50 group-hover:opacity-100 cursor-pointer"
                                                    >
                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C3362B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                            <line x1="18" y1="6" x2="6" y2="18" />
                                                            <line x1="6" y1="6" x2="18" y2="18" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                        <FormAddButton
                                            icon={<span className="text-sm font-light">+</span>}
                                            className="!bg-white !border !border-[#CBD5E1] !text-[#1A1C1E] hover:!bg-gray-50"
                                            onClick={() => docInputRef.current?.click()}
                                            disabled={docUploading}
                                        >
                                            {docUploading ? "Uploading..." : "Add master plan"}
                                        </FormAddButton>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-8 text-center">
                                        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#EBEBEB]">
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#718096" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                                <circle cx="12" cy="10" r="3" />
                                            </svg>
                                        </div>
                                        <p className="mb-4 text-sm font-medium text-[#718096]">No plans uploaded yet</p>
                                        <FormAddButton
                                            icon={<span className="text-sm font-light">+</span>}
                                            className="!bg-white !border !border-[#CBD5E1] !text-[#1A1C1E] hover:!bg-gray-50"
                                            onClick={() => docInputRef.current?.click()}
                                            disabled={docUploading}
                                        >
                                            {docUploading ? "Uploading..." : "Add master plan"}
                                        </FormAddButton>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activePropertySubTab === "payments" && (
                        <div className="rounded-[28px] border border-[#E9ECF2] bg-white p-10 shadow-[0_1px_2px_rgba(16,24,40,0.03)]">
                            <div className="flex flex-col items-center justify-center text-center">
                                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#F0F1F3]">
                                    <img src="/images/inv-dashboard/inv-offplan/payment.svg" alt="" className="h-8 w-8 opacity-50" />
                                </div>
                                <p className="text-sm font-medium text-[#667085]">Payment Methods</p>
                                <p className="mt-1 text-xs text-[#999]">Coming soon</p>
                            </div>
                        </div>
                    )}

                    {activePropertySubTab === "options" && (
                        <div className="rounded-[28px] border border-[#E9ECF2] bg-white p-10 shadow-[0_1px_2px_rgba(16,24,40,0.03)]">
                            <div className="flex flex-col items-center justify-center text-center">
                                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#F0F1F3]">
                                    <img src="/images/inv-dashboard/inv-offplan/options.svg" alt="" className="h-8 w-8 opacity-50" />
                                </div>
                                <p className="text-sm font-medium text-[#667085]">Options</p>
                                <p className="mt-1 text-xs text-[#999]">Coming soon</p>
                            </div>
                        </div>
                    )}

                    {activePropertySubTab === "stock" && (
                        <div className="rounded-[28px] border border-[#E9ECF2] bg-white p-10 shadow-[0_1px_2px_rgba(16,24,40,0.03)]">
                            <div className="flex flex-col items-center justify-center text-center">
                                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#F0F1F3]">
                                    <img src="/images/inv-dashboard/inv-offplan/stock.svg" alt="" className="h-8 w-8 opacity-50" />
                                </div>
                                <p className="text-sm font-medium text-[#667085]">Stock</p>
                                <p className="mt-1 text-xs text-[#999]">Coming soon</p>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {activeTab === "houses" && (
                <div className="max-w-5xl space-y-5">
                    <div className="flex items-center justify-between">
                        <FormTabSwitcher
                            tabs={[{ id: "Active", label: "Active houses" }, { id: "Archive", label: "Archive" }]}
                            activeTab={activeHouseTab}
                            onChange={(id) => setActiveHouseTab(id as "Active" | "Archive")}
                            size="md"
                        />
                        <FormAddButton
                            icon={<span className="mr-0.5 text-base font-light">+</span>}
                            onClick={() => {
                                setEditingHouseId(null);
                                setShowHouseForm(true);
                            }}
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
                                    <div key={house.id} className="w-[220px] shrink-0 rounded-[16px] border border-[#EBEBEB] bg-white p-2 flex flex-col gap-2">
                                        <div className="relative h-[140px] w-full overflow-hidden rounded-[12px] bg-[#F3F4F6]">
                                            {imageUrl ? (
                                                <img src={imageUrl} alt={house.title} className="h-full w-full object-cover" loading="lazy" />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center text-xs text-[#999]">No Image</div>
                                            )}
                                        </div>
                                        <div className="px-1 pb-1">
                                            <p className="truncate text-sm font-semibold text-[#1A1A1A]">{house.title}</p>
                                            <p className="text-xs text-[#999]">{house.totalArea} m² · {house.roomOption?.title || `${house.number || 0} rooms`}</p>
                                        </div>
                                        <div className="flex gap-1 px-1 pb-1">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setEditingHouseId(house.id);
                                                    setShowHouseForm(true);
                                                    setTimeout(() => houseFormRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
                                                }}
                                                className="flex-1 rounded-lg border border-[#E2E8F0] py-1.5 text-[12px] font-medium text-[#4E525D] transition-colors hover:bg-gray-50 cursor-pointer"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => archiveMutation.mutate({ id: house.id, archived: !house.archived })}
                                                disabled={archiveMutation.isPending}
                                                className="flex-1 rounded-lg border border-[#E2E8F0] py-1.5 text-[12px] font-medium text-[#4E525D] transition-colors hover:bg-gray-50 cursor-pointer disabled:opacity-50"
                                            >
                                                {house.archived ? "Restore" : "Archive"}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => deleteMutation.mutate(house.id)}
                                                className="flex-1 rounded-lg border border-[#FECACA] py-1.5 text-[12px] font-medium text-[#C3362B] transition-colors hover:bg-red-50 cursor-pointer"
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
        <main className="flex-1 overflow-y-auto p-8" style={{ background: "var(--background-primary-50, #FFFFFF80)" }}>
            {formContent}
        </main>
    );
}
