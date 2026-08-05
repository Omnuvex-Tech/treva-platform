import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { FormDropdown } from "@repo/ui";
import { IoClose } from "react-icons/io5";
import { FiClock, FiGift, FiRefreshCcw, FiStar, FiTag } from "react-icons/fi";
import { housesApi, type CreateHouseData } from "../../api/houses";
import { categoriesApi, type Category } from "../../api/categories";
import { typeOfBuildingOptionsApi, type TypeOfBuildingOption } from "../../api/type-of-building-options";
import { ImageAssetCard } from "../../components/ImageAssetCard";
import { DatePickerField } from "../../components/DatePickerField";
import { useMessageCenter } from "../../components/MessageCenter";
import { getApiErrorMessage } from "../../utils/apiError";

const STATIC_TYPE_OF_BUILDING_OPTIONS = [
    { id: "Residential building", label: "Residential building" },
    { id: "Apartment block", label: "Apartment block" },
    { id: "Villa complex", label: "Villa complex" },
    { id: "Townhouse", label: "Townhouse" },
    { id: "Business center", label: "Business center" },
    { id: "Mixed-use building", label: "Mixed-use building" },
];

const STATIC_CONSTRUCTION_STAGE_OPTIONS = [
    { id: "Planning", label: "Planning" },
    { id: "Foundation", label: "Foundation" },
    { id: "Under construction", label: "Under construction" },
    { id: "Finishing", label: "Finishing" },
    { id: "Ready", label: "Ready" },
];

const inputClass =
    "w-full h-11 rounded-2xl border border-[#E7E9EE] bg-[#F8F9FB] px-4 py-0 text-sm leading-5 text-[#1A1A1A] placeholder-[#A3A3A3] outline-none transition-colors focus:border-[#C8CDD8]";

const IMAGE_ACCEPT = "image/png,image/jpeg,image/webp,image/gif";

const monthOptions = Array.from({ length: 12 }, (_, i) => ({
    id: String(i + 1),
    label: new Date(2024, i).toLocaleString("en", { month: "long" }),
}));

const yearOptions = Array.from({ length: 12 }, (_, i) => ({
    id: String(2024 + i),
    label: String(2024 + i),
}));

type HouseTagIcon = "star" | "tag" | "refresh" | "gift" | "clock";

type HouseTag = {
    id: string;
    text: string;
    color: string;
    icon: HouseTagIcon;
    enabled: boolean;
};

const TAG_COLOR_OPTIONS = [
    "#06B6D4",
    "#10B981",
    "#3B82F6",
    "#6366F1",
    "#8B5CF6",
    "#A855F7",
    "#A3E635",
    "#C4B5A5",
    "#EC4899",
    "#E85D4F",
    "#F97316",
    "#FACC15",
];

const TAG_ICON_OPTIONS: Array<{ id: HouseTagIcon; label: string }> = [
    { id: "star", label: "Star" },
    { id: "tag", label: "Tag" },
    { id: "refresh", label: "Refresh" },
    { id: "gift", label: "Gift" },
    { id: "clock", label: "Clock" },
];

function TagIcon({ icon, className = "h-4 w-4" }: { icon: HouseTagIcon; className?: string }) {
    switch (icon) {
        case "star":
            return <FiStar className={className} />;
        case "refresh":
            return <FiRefreshCcw className={className} />;
        case "gift":
            return <FiGift className={className} />;
        case "clock":
            return <FiClock className={className} />;
        case "tag":
        default:
            return <FiTag className={className} />;
    }
}

function slugify(text: string) {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
}

const responseArray = <T,>(response: unknown): T[] => {
    const value = response as any;
    if (Array.isArray(value?.data?.data)) return value.data.data;
    if (Array.isArray(value?.data)) return value.data;
    if (Array.isArray(value)) return value;
    return [];
};

export function HouseForm({
    embedded = false,
    inline = false,
    houseId,
    onSuccess,
    onCancel,
    categorySlug: categorySlugProp,
}: {
    embedded?: boolean;
    inline?: boolean;
    houseId?: string;
    onSuccess?: () => void;
    onCancel?: () => void;
    categorySlug?: string;
} = {}) {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { slug: urlSlug } = useParams<{ slug: string }>();
    const { showError, showSuccess } = useMessageCenter();
    const isEditMode = !!houseId;
    const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
    const [selectedCategoryId, setSelectedCategoryId] = useState("");
    const [imageUploading, setImageUploading] = useState(false);
    const imageInputRef = useRef<HTMLInputElement | null>(null);
    const [houseTags, setHouseTags] = useState<HouseTag[]>([]);
    const [isTagModalOpen, setIsTagModalOpen] = useState(false);
    const [tagDraft, setTagDraft] = useState<{ text: string; color: string; icon: HouseTagIcon }>({
        text: "",
        color: TAG_COLOR_OPTIONS[0] ?? "#06B6D4",
        icon: "star",
    });

    const [form, setForm] = useState({
        name: "",
        title: "",
        slug: "",
        image: "",
        street: "",
        houseNumber: "",
        typeOfBuilding: "",
        constructionStage: "",
        deadlineForCommissioning: "",
        salesOffice: "",
        landCadastralNumber: "",
        contractAddress: "",
        showroomAvailability: "",
    });

    const activeCategorySlug = categorySlugProp || urlSlug || "";

    const { data: categoriesRes } = useQuery({
        queryKey: ["categories", "object"],
        queryFn: () => categoriesApi.getAll("object"),
        enabled: !activeCategorySlug,
    });

    const { data: categoryRes } = useQuery({
        queryKey: ["category", activeCategorySlug],
        queryFn: () => categoriesApi.getBySlug(activeCategorySlug),
        enabled: !!activeCategorySlug,
    });

    const { data: existingHouseRes, isLoading: isLoadingHouse } = useQuery({
        queryKey: ["house", houseId],
        queryFn: () => housesApi.getById(houseId!),
        enabled: !!houseId,
    });

    const { data: typeOfBuildingOptionsRes } = useQuery({
        queryKey: ["type-of-building-options"],
        queryFn: () => typeOfBuildingOptionsApi.getAll(),
    });

    const categories = useMemo(() => responseArray<Category>(categoriesRes), [categoriesRes]);
    const typeOfBuildingOptions = useMemo(
        () => responseArray<TypeOfBuildingOption>(typeOfBuildingOptionsRes),
        [typeOfBuildingOptionsRes]
    );
    const mergedTypeOfBuildingOptions = useMemo(() => {
        const apiOptions = typeOfBuildingOptions.map((item) => ({ id: item.value, label: item.value }));
        const combined = [...STATIC_TYPE_OF_BUILDING_OPTIONS, ...apiOptions];

        return combined.filter((option, index, array) =>
            array.findIndex((item) => item.id === option.id) === index
        );
    }, [typeOfBuildingOptions]);
    const categoryId = (categoryRes as any)?.data?.id || selectedCategoryId;
    const existingHouse = (existingHouseRes as any)?.data;

    useEffect(() => {
        if (!isEditMode || !existingHouse) return;
        setForm({
            name: existingHouse.name || existingHouse.title || "",
            title: existingHouse.title || existingHouse.name || "",
            slug: existingHouse.slug || "",
            image: existingHouse.mainImage?.url || "",
            street: existingHouse.street || "",
            houseNumber: existingHouse.houseNumber || "",
            typeOfBuilding: existingHouse.typeOfBuilding || "",
            constructionStage: existingHouse.constructionStage || "",
            deadlineForCommissioning: existingHouse.deadlineForCommissioning || "",
            salesOffice: existingHouse.salesOffice || "",
            landCadastralNumber: existingHouse.landCadastralNumber || "",
            contractAddress: existingHouse.contractAddress || "",
            showroomAvailability: existingHouse.showroomAvailability || "",
        });
        setSlugManuallyEdited(Boolean(existingHouse.slug));
    }, [existingHouse, isEditMode]);

    const resetTagDraft = () => {
        setTagDraft({
            text: "",
            color: TAG_COLOR_OPTIONS[0] ?? "#06B6D4",
            icon: "star",
        });
    };

    const handleCreateTag = () => {
        const trimmedText = tagDraft.text.trim();
        if (!trimmedText) {
            showError({
                title: "Tag text is required",
                description: "Enter a tag name before adding it.",
            });
            return;
        }

        setHouseTags((prev) => [
            ...prev,
            {
                id: `tag-${Date.now()}`,
                text: trimmedText,
                color: tagDraft.color,
                icon: tagDraft.icon,
                enabled: true,
            },
        ]);
        resetTagDraft();
        setIsTagModalOpen(false);
    };

    const handleMainImageUpload = async (file: File) => {
        if (!file.type.startsWith("image/")) {
            showError({
                title: "Invalid image",
                description: "Only image files are allowed.",
            });
            return;
        }

        setImageUploading(true);
        try {
            const res = await housesApi.uploadFile(file);
            updateField("image", res.data.url);
        } catch (error) {
            showError({
                title: "Main image upload failed",
                description: getApiErrorMessage(error, "Please try again."),
            });
        } finally {
            setImageUploading(false);
        }
    };

    const updateField = (field: keyof typeof form, value: string) => {
        setForm((prev) => {
            const next = { ...prev, [field]: value };
            if (field === "name") {
                if (!slugManuallyEdited) next.slug = slugify(value);
                next.title = value;
            }
            return next;
        });
    };

    const mutation = useMutation({
        mutationFn: (data: CreateHouseData) => {
            if (isEditMode && houseId) {
                return housesApi.update(houseId, data);
            }
            return housesApi.create(data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["houses"] });
            queryClient.invalidateQueries({ queryKey: ["houses", activeCategorySlug] });
            if (houseId) queryClient.invalidateQueries({ queryKey: ["house", houseId] });
            showSuccess({ title: isEditMode ? "House updated" : "House created" });
            onSuccess?.();
            if (!inline && !embedded) {
                navigate(activeCategorySlug ? `/dashboard/offplan/objects/${activeCategorySlug}/edit` : "/dashboard/offplan/objects");
            }
        },
        onError: (error) => {
            showError({
                title: isEditMode ? "House could not be updated" : "House could not be created",
                description: getApiErrorMessage(error, "Please try again."),
            });
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!categoryId || !form.name.trim() || !form.typeOfBuilding) {
            showError({
                title: "Please fill required house fields",
                description: "House name and type of building are required.",
            });
            return;
        }

        const parsedHouseNumber = Number.parseInt(form.houseNumber, 10);
        const completionYearFromDate = form.deadlineForCommissioning
            ? Number.parseInt(form.deadlineForCommissioning.slice(0, 4), 10)
            : NaN;
        const completionYear =
            (Number.isFinite(completionYearFromDate) ? completionYearFromDate : undefined) ??
            (existingHouse as any)?.completionYear ??
            2030;

        mutation.mutate({
            categoryId,
            title: form.name.trim(),
            name: form.name.trim(),
            slug: form.slug.trim() || slugify(form.name),
            status: "available",
            floor: 1,
            number: Number.isFinite(parsedHouseNumber) ? parsedHouseNumber : 1,
            totalArea: 0,
            internalArea: 0,
            balconyArea: 0,
            prices: {},
            completionYear,
            numberOfFloors: { start: 1, end: 1 },
            similarApartmentIds: [],
            mainImage: form.image.trim() ? { url: form.image.trim(), alt: form.name.trim() || "House" } : undefined,
            gallery: existingHouse?.gallery || [],
            documents: existingHouse?.documents || [],
            location: undefined,
            locationTitle: undefined,
            locationUrl: undefined,
            locationGoogleMapsUrl: undefined,
            heatingTypeIds: [],
            attributeIds: [],
            street: form.street.trim() || undefined,
            houseNumber: form.houseNumber.trim() || undefined,
            typeOfBuilding: form.typeOfBuilding,
            constructionStage: form.constructionStage || undefined,
            deadlineForCommissioning: form.deadlineForCommissioning || undefined,
            salesOffice: form.salesOffice.trim() || undefined,
            landCadastralNumber: form.landCadastralNumber.trim() || undefined,
            contractAddress: form.contractAddress.trim() || undefined,
            showroomAvailability: form.showroomAvailability.trim() || undefined,
        });
    };

    const handleCancel = () => {
        if (onCancel) {
            onCancel();
            return;
        }

        if (!embedded) {
            navigate(-1);
        }
    };

    if (isEditMode && isLoadingHouse) {
        return <div className="rounded-[24px] border border-[#ECECEC] bg-white p-6 text-sm text-[#666]">Loading house...</div>;
    }

    return (
        <form onSubmit={handleSubmit} className="rounded-[28px] border border-[#E9ECF2] bg-white p-6 shadow-[0_1px_2px_rgba(16,24,40,0.03)]">
            <div className="mb-5 flex items-center justify-between">
                <h3 className="text-[22px] font-medium text-[#1A1A1A]">Making a home</h3>
                {!embedded ? (
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[#666]"
                    >
                        <IoClose className="h-5 w-5" />
                    </button>
                ) : null}
            </div>

            {!activeCategorySlug ? (
                <div className="mb-4">
                    <FormDropdown
                        label="Object"
                        required
                        value={selectedCategoryId}
                        options={categories.map((item) => ({ id: item.id, label: item.title }))}
                        onChange={(id) => setSelectedCategoryId(id)}
                        placeholder="Select object"
                    />
                </div>
            ) : null}

            <div className="mb-5 grid gap-5 lg:grid-cols-[280px_minmax(0,1fr)] lg:items-start">
                <div className="rounded-[24px] border border-[#ECEEF2] bg-[#FBFCFD] p-4">
                    <ImageAssetCard
                        label="Main Image"
                        description="Primary image used in house cards and list views."
                        alt={form.name || "House"}
                        imageUrl={form.image || null}
                        widthClass="w-[96px]"
                        previewClassName="h-[96px] w-[96px] rounded-[24px] border border-[#E5E7EC] bg-white p-1.5 shadow-[0_8px_20px_rgba(17,24,39,0.06)]"
                        emptyPreviewClassName={`flex h-[96px] w-[96px] items-center justify-center rounded-[24px] border-2 border-dashed bg-white ${imageUploading ? "pointer-events-none border-gray-200 bg-[#F4F5F6] opacity-50" : "border-gray-200 hover:border-gray-400"}`}
                        placeholderTitle="Upload"
                        placeholderHint="1:1 image"
                        uploading={imageUploading}
                        onOpen={() => imageInputRef.current?.click()}
                        onRemove={() => updateField("image", "")}
                    />
                    <input
                        ref={imageInputRef}
                        type="file"
                        accept={IMAGE_ACCEPT}
                        className="hidden"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleMainImageUpload(file);
                            if (imageInputRef.current) imageInputRef.current.value = "";
                        }}
                    />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <div>
                        <label className="mb-1 block text-xs text-[#4E525D]">House name *</label>
                        <input
                            className={inputClass}
                            value={form.name}
                            onChange={(e) => updateField("name", e.target.value)}
                            placeholder="Enter house name"
                        />
                    </div>
                    <div>
                        <FormDropdown
                            label="Type of building"
                            required
                            value={form.typeOfBuilding}
                            options={mergedTypeOfBuildingOptions}
                            onChange={(id) => updateField("typeOfBuilding", id)}
                            placeholder="Select type"
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-xs text-[#4E525D]">Street</label>
                        <input className={inputClass} value={form.street} onChange={(e) => updateField("street", e.target.value)} placeholder="e.g. Main street" />
                    </div>
                    <div>
                        <label className="mb-1 block text-xs text-[#4E525D]">House number</label>
                        <input className={inputClass} value={form.houseNumber} onChange={(e) => updateField("houseNumber", e.target.value)} placeholder="e.g. 12A" />
                    </div>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <div>
                    <FormDropdown
                        label="Construction stage"
                        value={form.constructionStage}
                        options={STATIC_CONSTRUCTION_STAGE_OPTIONS}
                        onChange={(id) => updateField("constructionStage", id)}
                        placeholder="Select stage"
                    />
                </div>
                <div>
                    <label className="mb-1 block text-xs text-[#4E525D]">The deadline for commissioning</label>
                    <DatePickerField
                        value={form.deadlineForCommissioning}
                        onChange={(value) => updateField("deadlineForCommissioning", value)}
                        placeholder="Select deadline"
                    />
                </div>

                <div>
                    <label className="mb-1 block text-xs text-[#4E525D]">Sales office</label>
                    <input className={inputClass} value={form.salesOffice} onChange={(e) => updateField("salesOffice", e.target.value)} placeholder="e.g. Sales office A" />
                </div>
                <div>
                    <label className="mb-1 block text-xs text-[#4E525D]">Land cadastral number</label>
                    <input className={inputClass} value={form.landCadastralNumber} onChange={(e) => updateField("landCadastralNumber", e.target.value)} placeholder="e.g. AA-12345" />
                </div>

                <div>
                    <label className="mb-1 block text-xs text-[#4E525D]">Address of the house according to the contract</label>
                    <input className={inputClass} value={form.contractAddress} onChange={(e) => updateField("contractAddress", e.target.value)} placeholder="Address according to contract" />
                </div>
                <div>
                    <label className="mb-1 block text-xs text-[#4E525D]">Showroom availability in the house</label>
                    <input className={inputClass} value={form.showroomAvailability} onChange={(e) => updateField("showroomAvailability", e.target.value)} placeholder="e.g. Available" />
                </div>
            </div>

            <div className="mt-6">
                <div className="mb-3 flex items-center justify-between gap-4">
                    <h4 className="text-base font-medium text-[#1A1A1A]">Add a tag to your home</h4>
                    <button
                        type="button"
                        onClick={() => setIsTagModalOpen(true)}
                        className="inline-flex items-center gap-2 rounded-full border border-[#C9CDD5] bg-white px-4 py-2 text-sm font-medium text-[#4E525D] transition-colors hover:bg-[#F8F9FB]"
                    >
                        <FiTag className="h-4 w-4" />
                        Create a tag
                    </button>
                </div>

                <div className="rounded-[20px] border border-[#E9ECF2] bg-white p-5">
                    {houseTags.length > 0 ? (
                        <div className="space-y-3">
                            {houseTags.map((tag) => (
                                <div key={tag.id} className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        aria-pressed={tag.enabled}
                                        onClick={() =>
                                            setHouseTags((prev) =>
                                                prev.map((item) => (item.id === tag.id ? { ...item, enabled: !item.enabled } : item))
                                            )
                                        }
                                        className={`relative h-6 w-11 rounded-full transition-colors ${
                                            tag.enabled ? "bg-[#4E525D]" : "bg-[#D7DAE0]"
                                        }`}
                                    >
                                        <span
                                            className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all ${
                                                tag.enabled ? "left-6" : "left-1"
                                            }`}
                                        />
                                    </button>

                                    <div
                                        className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm"
                                        style={{ borderColor: `${tag.color}55`, backgroundColor: `${tag.color}14`, color: "#4E525D" }}
                                    >
                                        <TagIcon icon={tag.icon} className="h-4 w-4" />
                                        <span>{tag.text}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-[#808191]">No tags added yet.</p>
                    )}
                </div>
            </div>

            <div className="mt-5 flex justify-end gap-3">
                <button
                    type="button"
                    onClick={handleCancel}
                    className="rounded-full border border-[#E7E9EE] bg-white px-6 py-2.5 text-sm font-medium text-[#4E525D] transition-colors hover:bg-[#F8F9FB]"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={mutation.isPending}
                    className="rounded-full bg-[#4E525D] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:opacity-90 disabled:opacity-50"
                >
                    {mutation.isPending ? "Saving..." : isEditMode ? "Update" : "Create"}
                </button>
            </div>

            {isTagModalOpen ? (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#10182833] px-4">
                    <div className="w-full max-w-[420px] rounded-[24px] bg-white p-6 shadow-[0_24px_48px_rgba(16,24,40,0.18)]">
                        <div className="mb-5 flex items-center justify-between">
                            <h4 className="text-xl font-medium text-[#1A1A1A]">Creating a tag</h4>
                            <button
                                type="button"
                                onClick={() => {
                                    setIsTagModalOpen(false);
                                    resetTagDraft();
                                }}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[#666]"
                            >
                                <IoClose className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="space-y-5">
                            <div>
                                <label className="mb-1.5 block text-xs text-[#4E525D]">Tag text</label>
                                <input
                                    className={inputClass}
                                    value={tagDraft.text}
                                    onChange={(e) => setTagDraft((prev) => ({ ...prev, text: e.target.value }))}
                                    placeholder="Enter tag text"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-xs text-[#4E525D]">Color</label>
                                <div className="flex flex-wrap gap-2">
                                    {TAG_COLOR_OPTIONS.map((color) => {
                                        const isActive = tagDraft.color === color;
                                        return (
                                            <button
                                                key={color}
                                                type="button"
                                                onClick={() => setTagDraft((prev) => ({ ...prev, color }))}
                                                className={`h-7 w-7 rounded-full border-2 ${isActive ? "border-[#4E525D]" : "border-transparent"}`}
                                                style={{ backgroundColor: color }}
                                                aria-label={`Select ${color} color`}
                                            />
                                        );
                                    })}
                                </div>
                            </div>

                            <div>
                                <label className="mb-2 block text-xs text-[#4E525D]">Tag text</label>
                                <div className="flex flex-wrap gap-2">
                                    {TAG_ICON_OPTIONS.map((option) => {
                                        const isActive = tagDraft.icon === option.id;
                                        return (
                                            <button
                                                key={option.id}
                                                type="button"
                                                onClick={() => setTagDraft((prev) => ({ ...prev, icon: option.id }))}
                                                className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl border transition-colors ${
                                                    isActive ? "border-[#4E525D] bg-[#F3F4F6] text-[#4E525D]" : "border-[#ECEEF2] bg-[#F8F9FB] text-[#7B8190]"
                                                }`}
                                                title={option.label}
                                            >
                                                <TagIcon icon={option.id} className="h-5 w-5" />
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsTagModalOpen(false);
                                    resetTagDraft();
                                }}
                                className="rounded-full border border-[#C9CDD5] bg-white px-5 py-2.5 text-sm font-medium text-[#4E525D] transition-colors hover:bg-[#F8F9FB]"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleCreateTag}
                                className="rounded-full bg-[#4E525D] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:opacity-90"
                            >
                                Add
                            </button>
                        </div>
                    </div>
                </div>
            ) : null}
        </form>
    );
}
