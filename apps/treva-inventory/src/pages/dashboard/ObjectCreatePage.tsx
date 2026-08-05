import { useState, useRef, useMemo, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { categoriesApi, type CategoryDocument } from "../../api/categories";
import { housesApi, type House } from "../../api/houses";
import { unitLayoutsApi, type UnitLayout } from "../../api/unit-layouts";
import { locationOptionsApi, type LocationOption } from "../../api/location-options";
import { FormDropdown, FormAddButton, FormTabSwitcher } from "@repo/ui";
import { HouseForm } from "./HouseForm";
import { HouseInformationCard } from "./HouseInformationCard";
import { HouseForm as UnitLayoutInlineForm } from "./UnitLayoutInlineForm";
import { useMessageCenter } from "../../components/MessageCenter";
import { getApiErrorMessage } from "../../utils/apiError";
import { useFormDraft } from "../../hooks/useFormDraft";
import { ImageAssetCard } from "../../components/ImageAssetCard";
import { PlanUploadCard } from "../../components/PlanUploadCard";
import { buildHouseDuplicatePayload, buildUnitLayoutDuplicatePayload } from "../../utils/entityDuplicatePayloads";
import { STATIC_CURRENCIES } from "../../utils/staticCurrencies";
import { IoClose } from "react-icons/io5";

const SUPPORTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"] as const;
const IMAGE_ACCEPT = SUPPORTED_IMAGE_TYPES.join(",");

type TabKey = "basic" | "commercial" | "location" | "properties" | "payments" | "options" | "stock" | "unitLayouts";

const TABS: { key: TabKey; label: string }[] = [
    { key: "basic", label: "Basic Info" },
    { key: "commercial", label: "Commercial" },
    { key: "location", label: "Location" },
    { key: "properties", label: "General Plans" },
];

const inputClass =
    "w-full h-11 rounded-2xl border border-[#E7E9EE] bg-[#F8F9FB] px-4 py-0 text-sm leading-5 text-[#1A1A1A] placeholder-[#999] outline-none transition-colors focus:border-[#C8CDD8] focus:bg-white";

function formatPriceValue(value: number) {
    return value.toLocaleString();
}

function formatPricePreview(prices: Record<string, number> | undefined) {
    if (!prices || Object.keys(prices).length === 0) return "No price";

    const [currency, amount] = Object.entries(prices)[0] || [];
    if (!currency || amount === undefined) return "No price";
    return `${currency} ${formatPriceValue(Number(amount))}`;
}

const DRAFT_KEY = "treva-object-create-draft";

function getDefaultPlanName(fileName: string) {
    return fileName.replace(/\.[^/.]+$/, "").trim();
}

function normalizePrimaryTab(tab?: string): TabKey {
    switch (tab) {
        case "commercial":
        case "location":
        case "properties":
            return tab;
        default:
            return "basic";
    }
}

function SectionBlock({
    title,
    description,
    children,
}: {
    title: string;
    description?: string;
    children: any;
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
    slug: "",
    currency: "",
    region: "",
    area: "",
    city: "",
    locationTitle: "",
    locationUrl: "",
    locationGoogleMapsUrl: "",
    developerBrand: "",
    website: "",
    salesDepartment: "",
    phoneNumber: "",
    fedLaw214: false,
    image: "",
    coverImage: "",
    bannerImage: "",
};

export function ObjectCreatePage({ embedded = false }: { embedded?: boolean } = {}) {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { showError, showSuccess } = useMessageCenter();
    const [createdSlug, setCreatedSlug] = useState<string | null>(null);
    const [isCityModalOpen, setIsCityModalOpen] = useState(false);
    const [cityDraft, setCityDraft] = useState({ name: "", title: "" });
    const [isRegionModalOpen, setIsRegionModalOpen] = useState(false);
    const [regionDraft, setRegionDraft] = useState({ name: "", title: "" });
    const [showHouseForm, setShowHouseForm] = useState(false);
    const [editingHouseId, setEditingHouseId] = useState<string | null>(null);
    const [previewHouseId, setPreviewHouseId] = useState<string | null>(null);
    const [docUploading, setDocUploading] = useState(false);
    const houseFormRef = useRef<HTMLDivElement>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);
    const coverImageInputRef = useRef<HTMLInputElement>(null);
    const bannerImageInputRef = useRef<HTMLInputElement>(null);
    const [imageUploading, setImageUploading] = useState(false);
    const [coverImageUploading, setCoverImageUploading] = useState(false);
    const [bannerImageUploading, setBannerImageUploading] = useState(false);
    const [imageDrag, setImageDrag] = useState(false);
    const [coverImageDrag, setCoverImageDrag] = useState(false);
    const [bannerImageDrag, setBannerImageDrag] = useState(false);
    const [showPlanUpload, setShowPlanUpload] = useState(false);
    const [pendingPlanName, setPendingPlanName] = useState("");
    const [pendingPlanFile, setPendingPlanFile] = useState<File | null>(null);
    const [draftDocuments, setDraftDocuments] = useState<CategoryDocument[]>([]);
    const [showUnitLayoutList, setShowUnitLayoutList] = useState(false);
    const [showUnitLayoutForm, setShowUnitLayoutForm] = useState(false);
    const [editingUnitLayoutId, setEditingUnitLayoutId] = useState<string | null>(null);
    const [activeUnitLayoutTab, setActiveUnitLayoutTab] = useState<"Active" | "Archive">("Active");
    const [selectedManagementCard, setSelectedManagementCard] = useState<"properties" | "payments" | "options" | "stock" | null>(null);
    const [selectedPostPlanCard, setSelectedPostPlanCard] = useState<"grid" | "property-layouts" | "floor-plans" | "facades" | null>("grid");
    const [showPostPlanCards, setShowPostPlanCards] = useState(false);

    const buildNameFromTitle = (title: string) =>
        title
            .toLowerCase()
            .trim()
            .replace(/\s+/g, "-")
            .replace(/[^a-z0-9-]/g, "")
            .replace(/-+/g, "-")
            .replace(/(^-|-$)/g, "");

    const { state: draftState, setState: setDraftState, clearDraft } = useFormDraft({
        key: DRAFT_KEY,
        initialState: {
            activeTab: "basic" as TabKey,
            activeHouseTab: "Active" as "Active" | "Archive",
            formData: defaultFormData,
        },
    });

    const activeTab = normalizePrimaryTab(draftState.activeTab);
    const setActiveTab = (tab: TabKey) => setDraftState((prev) => ({ ...prev, activeTab: normalizePrimaryTab(tab) }));
    const activeHouseTab = draftState.activeHouseTab;
    const setActiveHouseTab = (tab: "Active" | "Archive") => setDraftState((prev) => ({ ...prev, activeHouseTab: tab }));
    const formData = draftState.formData;
    const updateFormData = (field: string, value: string | boolean) =>
        setDraftState((prev) => ({ ...prev, formData: { ...prev.formData, [field]: value } }));

    useEffect(() => {
        return () => { clearDraft(); };
    }, [clearDraft]);

    const { data: categoriesResponse } = useQuery({
        queryKey: ["categories"],
        queryFn: () => categoriesApi.getAll(),
    });

    const categories = Array.isArray(categoriesResponse?.data) ? categoriesResponse.data : [];

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

    const createLocationOptionMutation = useMutation({
        mutationFn: (payload: { type: "region" | "city"; name: string; title: string; cityId?: string }) =>
            locationOptionsApi.create(payload),
        onSuccess: (res, vars) => {
            queryClient.invalidateQueries({ queryKey: ["location-options"] });
            const created = res?.data;
            if (vars.type === "city") {
                updateFormData("city", created?.title || vars.title);
                updateFormData("region", "");
                setIsCityModalOpen(false);
                setCityDraft({ name: "", title: "" });
                showSuccess({ title: "City created" });
            } else {
                updateFormData("region", created?.title || vars.title);
                setIsRegionModalOpen(false);
                setRegionDraft({ name: "", title: "" });
                showSuccess({ title: "Region created" });
            }
        },
        onError: (error) => {
            showError({
                title: "Location option could not be created",
                description: getApiErrorMessage(error, "Please try again."),
            });
        },
    });

    const handleCreateCity = () => {
        const title = cityDraft.title.trim();
        const name = (cityDraft.name.trim() || buildNameFromTitle(title)).trim();
        if (!title || !name) {
            showError({ title: "Please fill required fields", description: !title ? "Title is required" : "Name is required" });
            return;
        }
        createLocationOptionMutation.mutate({ type: "city", name, title });
    };

    const handleCreateRegion = () => {
        const selectedCityTitle = String(formData.city || "").trim();
        if (!selectedCityTitle) {
            showError({ title: "City is required", description: "Select city first to create region" });
            return;
        }
        const cityId = locationOptionItems.find((item) => item.type === "city" && item.title === selectedCityTitle)?.id;
        if (!cityId) {
            showError({ title: "City is not configured", description: "Selected city is not found in location options" });
            return;
        }
        const title = regionDraft.title.trim();
        const name = (regionDraft.name.trim() || buildNameFromTitle(title)).trim();
        if (!title || !name) {
            showError({ title: "Please fill required fields", description: !title ? "Title is required" : "Name is required" });
            return;
        }
        createLocationOptionMutation.mutate({ type: "region", name, title, cityId });
    };

    const { data: categoryRes } = useQuery({
        queryKey: ["category", createdSlug],
        queryFn: () => categoriesApi.getBySlug(createdSlug!),
        enabled: !!createdSlug,
    });

    const category = useMemo(() => categoryRes?.data, [categoryRes]);
    const documents: CategoryDocument[] = category?.documents || [];
    const generalPlanDocuments = createdSlug ? (documents.length > 0 ? documents : draftDocuments) : draftDocuments;

    const { data: housesRes } = useQuery({
        queryKey: ["houses", createdSlug],
        queryFn: () => housesApi.getAll({ categorySlug: createdSlug! }),
        enabled: !!createdSlug,
    });

    const allHouses: House[] = housesRes?.data?.data || [];
    const filteredHouses = activeHouseTab === "Active"
        ? allHouses.filter((h) => !h.archived)
        : allHouses.filter((h) => h.archived);
    const previewHouse = allHouses.find((house) => house.id === previewHouseId) || null;

    const { data: unitLayoutsRes } = useQuery({
        queryKey: ["unit-layouts", createdSlug, previewHouseId],
        queryFn: () => unitLayoutsApi.getAll({ categorySlug: createdSlug!, houseId: previewHouseId!, limit: 100 }),
        enabled: !!createdSlug && !!previewHouseId,
    });

    const allUnitLayouts: UnitLayout[] = unitLayoutsRes?.data?.data || [];
    const filteredUnitLayouts = activeUnitLayoutTab === "Active"
        ? allUnitLayouts.filter((layout) => !layout.archived)
        : allUnitLayouts.filter((layout) => !!layout.archived);

    useEffect(() => {
        setShowUnitLayoutList(false);
        setShowUnitLayoutForm(false);
        setEditingUnitLayoutId(null);
        setActiveUnitLayoutTab("Active");
    }, [previewHouseId]);

    const [errors, setErrors] = useState<Record<string, string>>({});
    const optionalText = (value: string | undefined) => {
        const trimmed = value?.trim();
        return trimmed ? trimmed : undefined;
    };

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};
        if (!(formData.name || "").trim()) newErrors.name = "Name is required";
        if (!(formData.title || "").trim()) newErrors.title = "Title is required";
        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) {
            showError({ title: "Missing required fields", description: "Name and Title are required." });
            return false;
        }
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

    const validateStep = (tab: "basic" | "commercial") => {
        const newErrors: Record<string, string> = {};

        if (tab === "basic") {
            if (!(formData.name || "").trim()) newErrors.name = "Name is required";
            if (!(formData.title || "").trim()) newErrors.title = "Title is required";
        }

        setErrors((prev) => ({ ...prev, ...newErrors }));
        if (Object.keys(newErrors).length > 0) {
            showError({ title: "Missing required fields", description: "Name and Title are required." });
        }
        return Object.keys(newErrors).length === 0;
    };

    const handleTabChange = (nextTab: TabKey) => {
        if (nextTab === "basic") {
            setActiveTab(nextTab);
            return;
        }

        if (!validateStep("basic")) return;
        setActiveTab(nextTab);
    };

    const handleBasicNext = () => {
        if (!validateStep("basic")) return;
        setActiveTab("commercial");
    };

    const handleCommercialNext = () => {
        if (!validateStep("commercial")) return;
        setActiveTab("location");
    };

    const handleLocationNext = () => {
        if (!validate()) return;
        setActiveTab("properties");
        setSelectedManagementCard(null);
        setSelectedPostPlanCard("grid");
        setShowPostPlanCards(false);
    };

    const createMutation = useMutation({
        mutationFn: () => {
            const slugSource = formData.title || formData.name;
            const finalSlug = formData.slug || `${slugSource
                ? slugSource.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
                : "untitled"}-${Date.now()}`;
            return categoriesApi.create({
                title: formData.title || formData.name || "Untitled",
                name: formData.name || "untitled",
                slug: finalSlug,
                type: "object",
                objectType: formData.objectType?.trim() || undefined,
                propertyName: formData.name || formData.title,
                currency: optionalText(formData.currency) || undefined,
                region: optionalText(formData.region) || undefined,
                area: optionalText(formData.area) || undefined,
                city: optionalText(formData.city) || undefined,
                locationGoogleMapsUrl: optionalText(formData.locationGoogleMapsUrl) || undefined,
                locationTitle: optionalText(formData.locationTitle) || undefined,
                locationUrl: optionalText(formData.locationUrl) || undefined,
                developerBrand: optionalText(formData.developerBrand) || undefined,
                website: optionalText(formData.website) || undefined,
                salesDepartment: optionalText(formData.salesDepartment) || undefined,
                phoneNumber: optionalText(formData.phoneNumber) || undefined,
                documents: draftDocuments,
                fedLaw214: formData.fedLaw214,
                image: formData.image || undefined,
                coverImage: formData.coverImage || undefined,
                bannerImage: formData.bannerImage || undefined,
            });
        },
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: ["categories"] });
            const slug = response?.data?.slug;
            if (slug) {
                setCreatedSlug(slug);
                setActiveTab("properties");
                setSelectedManagementCard(null);
                setSelectedPostPlanCard("grid");
                setShowPostPlanCards(true);
                showSuccess({ title: "Object saved" });
                clearDraft();
            }
        },
        onError: (error) => {
            showError({ title: "Could not create object", description: getApiErrorMessage(error, "Please try again.") });
        },
    });

    const archiveHouseMutation = useMutation({
        mutationFn: ({ id, archived }: { id: string; archived: boolean }) =>
            housesApi.update(id, { archived }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["houses", createdSlug] });
        },
    });

    const deleteHouseMutation = useMutation({
        mutationFn: (houseId: string) => housesApi.delete(houseId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["houses", createdSlug] });
        },
    });

    const duplicateHouseMutation = useMutation({
        mutationFn: (house: House) => housesApi.create(buildHouseDuplicatePayload(house)),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["houses", createdSlug] });
        },
    });

    const deleteUnitLayoutMutation = useMutation({
        mutationFn: (id: string) => unitLayoutsApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["unit-layouts", createdSlug, previewHouseId] });
            queryClient.invalidateQueries({ queryKey: ["houses", createdSlug] });
            showSuccess({ title: "Unit layout deleted" });
        },
        onError: (error) => {
            showError({
                title: "Unit layout could not be deleted",
                description: getApiErrorMessage(error, "Please try again."),
            });
        },
    });

    const archiveUnitLayoutMutation = useMutation({
        mutationFn: ({ id, archived }: { id: string; archived: boolean }) => unitLayoutsApi.update(id, { archived }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["unit-layouts", createdSlug, previewHouseId] });
            showSuccess({ title: "Unit layout updated" });
        },
        onError: (error) => {
            showError({
                title: "Unit layout could not be updated",
                description: getApiErrorMessage(error, "Please try again."),
            });
        },
    });

    const duplicateUnitLayoutMutation = useMutation({
        mutationFn: (layout: UnitLayout) => unitLayoutsApi.create(buildUnitLayoutDuplicatePayload(layout)),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["unit-layouts", createdSlug, previewHouseId] });
            queryClient.invalidateQueries({ queryKey: ["houses", createdSlug] });
            showSuccess({ title: "Unit layout duplicated" });
        },
        onError: (error) => {
            showError({
                title: "Unit layout could not be duplicated",
                description: getApiErrorMessage(error, "Please try again."),
            });
        },
    });

    const updateDocsMutation = useMutation({
        mutationFn: (docs: CategoryDocument[]) => {
            if (!category?.id) throw new Error("No category ID");
            return categoriesApi.update(category.id, { documents: docs });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["category", createdSlug] });
        },
    });

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

    const handleCoverImageUpload = async (file: File) => {
        const items = [file];
        const hasUnsupported = items.some((f) => !SUPPORTED_IMAGE_TYPES.includes(f.type as typeof SUPPORTED_IMAGE_TYPES[number]));
        if (hasUnsupported) {
            showError({ title: "Unsupported file type", description: "Please upload JPG, PNG, WebP, or GIF images." });
            return;
        }
        setCoverImageUploading(true);
        try {
            const res = await unitLayoutsApi.uploadFile(file);
            updateFormData("coverImage", res.data.url);
        } catch (error) {
            showError({ title: "Upload failed", description: getApiErrorMessage(error, "Please try again.") });
        } finally {
            setCoverImageUploading(false);
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

    const onCoverImageDragOver = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); };
    const onCoverImageDragEnter = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setCoverImageDrag(true); };
    const onCoverImageDragLeave = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setCoverImageDrag(false); };
    const onCoverImageDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setCoverImageDrag(false);
        const file = e.dataTransfer.files?.[0];
        if (file) handleCoverImageUpload(file);
    };

    const handleBannerImageUpload = async (file: File) => {
        const items = [file];
        const hasUnsupported = items.some((f) => !SUPPORTED_IMAGE_TYPES.includes(f.type as typeof SUPPORTED_IMAGE_TYPES[number]));
        if (hasUnsupported) {
            showError({ title: "Unsupported file type", description: "Please upload JPG, PNG, WebP, or GIF images." });
            return;
        }
        setBannerImageUploading(true);
        try {
            const res = await unitLayoutsApi.uploadFile(file);
            updateFormData("bannerImage", res.data.url);
        } catch (error) {
            showError({ title: "Upload failed", description: getApiErrorMessage(error, "Please try again.") });
        } finally {
            setBannerImageUploading(false);
        }
    };

    const onBannerImageDragOver = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); };
    const onBannerImageDragEnter = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setBannerImageDrag(true); };
    const onBannerImageDragLeave = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setBannerImageDrag(false); };
    const onBannerImageDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setBannerImageDrag(false);
        const file = e.dataTransfer.files?.[0];
        if (file) handleBannerImageUpload(file);
    };

    const resetPlanUpload = () => {
        setShowPlanUpload(false);
        setPendingPlanName("");
        setPendingPlanFile(null);
    };

    const handleDocFileChange = (file?: File | null) => {
        if (!file) return;
        setPendingPlanFile(file);
    };

    const handleDocUpload = async () => {
        if (!pendingPlanFile) return;
        setDocUploading(true);
        try {
            const res = await unitLayoutsApi.uploadFile(pendingPlanFile);
            const docType = pendingPlanFile.type === "application/pdf" ? "pdf" : "image";
            const nextDoc: CategoryDocument = {
                type: docType,
                url: res.data.url,
                name: pendingPlanName.trim() || getDefaultPlanName(pendingPlanFile.name),
            };
            if (createdSlug) {
                updateDocsMutation.mutate([...documents, nextDoc]);
            } else {
                setDraftDocuments((current) => [...current, nextDoc]);
            }
            resetPlanUpload();
        } catch {
            // silent
        } finally {
            setDocUploading(false);
        }
    };

    const handleRemoveDoc = (index: number) => {
        if (createdSlug) {
            updateDocsMutation.mutate(documents.filter((_, i) => i !== index));
            return;
        }
        setDraftDocuments((current) => current.filter((_, i) => i !== index));
    };

    const managementCards = [
        { key: "properties" as const, label: "Properties", icon: "/images/inv-dashboard/inv-offplan/properties.svg" },
        { key: "payments" as const, label: "Payment methods", icon: "/images/inv-dashboard/inv-offplan/payment.svg" },
        { key: "options" as const, label: "Options", icon: "/images/inv-dashboard/inv-offplan/options.svg" },
        { key: "stock" as const, label: "Stock", icon: "/images/inv-dashboard/inv-offplan/stock.svg" },
    ];

    const postPlanCards = [
        { key: "grid" as const, label: "Grid", icon: "/images/inv-dashboard/inv-offplan/properties.svg", filled: false },
        { key: "property-layouts" as const, label: "Property layouts", icon: "/images/inv-dashboard/inv-offplan/properties.svg", filled: false },
        { key: "floor-plans" as const, label: "Floor plans", icon: "/images/inv-dashboard/inv-offplan/properties.svg", filled: false },
        { key: "facades" as const, label: "Facades", icon: "/images/inv-dashboard/inv-offplan/properties.svg", filled: false },
    ];

    const unitLayoutsPanel = !createdSlug ? null : (
        <div className="space-y-6">
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
                        setPreviewHouseId(null);
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
                        categorySlug={createdSlug || undefined}
                        houseId={editingHouseId ?? undefined}
                        key={editingHouseId ?? "new-house"}
                        onSuccess={() => {
                            const editedHouseId = editingHouseId;
                            setShowHouseForm(false);
                            setPreviewHouseId(editedHouseId ?? null);
                            setEditingHouseId(null);
                            queryClient.invalidateQueries({ queryKey: ["houses", createdSlug] });
                        }}
                        onCancel={() => {
                            setShowHouseForm(false);
                            setPreviewHouseId(editingHouseId ?? previewHouseId);
                            setEditingHouseId(null);
                        }}
                    />
                </div>
            )}

            <div className="space-y-3">
                <div>
                    <h4 className="text-sm font-semibold text-[#1A1A1A]">House List</h4>
                    <p className="mt-1 text-xs text-[#808191]">Only the house list is shown here.</p>
                </div>

                <div className="flex flex-wrap gap-4">
                    {filteredHouses.length === 0 ? (
                        <div className="w-full rounded-[24px] border border-[#E9ECF2] bg-white px-6 py-12 text-center text-sm text-[#999]">
                            {activeHouseTab === "Active" ? "No active houses yet. Click 'Add House' to create one." : "No archived houses"}
                        </div>
                    ) : (
                        filteredHouses.map((house) => {
                            const imageUrl = house.mainImage?.url || house.gallery?.[0]?.url;

                            return (
                                <div
                                    key={house.id}
                                    className="group w-[240px] shrink-0 rounded-[16px] border border-[#EBEBEB] bg-white p-2 text-left transition-colors hover:border-[#D6DAE3]"
                                >
                                    <div
                                        className="relative h-[186px] w-full cursor-pointer overflow-hidden rounded-[12px] bg-[#F3F4F6]"
                                        onClick={() => {
                                            setPreviewHouseId(house.id);
                                            setShowHouseForm(false);
                                            setEditingHouseId(null);
                                            setTimeout(() => houseFormRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
                                        }}
                                    >
                                        {imageUrl ? (
                                            <img
                                                src={imageUrl}
                                                alt={house.title}
                                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                loading="lazy"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center text-xs text-[#999]">No Image</div>
                                        )}

                                        <button
                                            type="button"
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                archiveHouseMutation.mutate({ id: house.id, archived: !house.archived });
                                            }}
                                            disabled={archiveHouseMutation.isPending}
                                            aria-label={house.archived ? "Restore" : "Archive"}
                                            title={house.archived ? "Restore" : "Archive"}
                                            className="absolute left-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#EBEBEB] text-[#4E525D] transition-colors hover:bg-[#E0E0E0] disabled:opacity-50"
                                        >
                                            {house.archived ? (
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                                                </svg>
                                            ) : (
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                                                </svg>
                                            )}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                deleteHouseMutation.mutate(house.id);
                                            }}
                                            aria-label="Delete"
                                            title="Delete"
                                            className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#FDECEC] text-[#C3362B] transition-colors hover:bg-[#F8DDD9]"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14zM10 11v6M14 11v6" />
                                            </svg>
                                        </button>
                                    </div>

                                    <div className="px-1 py-3">
                                        <p className="truncate text-sm font-semibold text-[#1A1A1A]">{house.title}</p>
                                    </div>

                                    <div className="flex gap-1 px-1 pb-1">
                                        <button
                                            type="button"
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                setPreviewHouseId(null);
                                                duplicateHouseMutation.mutate(house);
                                            }}
                                            disabled={duplicateHouseMutation.isPending}
                                            className="flex-1 cursor-pointer rounded-full border border-[#E2E8F0] py-1.5 text-[12px] font-medium text-[#4E525D] transition-colors hover:bg-gray-50 disabled:opacity-50"
                                        >
                                            Copy
                                        </button>
                                        <button
                                            type="button"
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                setPreviewHouseId(house.id);
                                                setShowHouseForm(false);
                                                setEditingHouseId(null);
                                            }}
                                            className="flex-1 cursor-pointer rounded-full bg-[#4E525D] py-1.5 text-[12px] font-medium text-white transition-colors hover:bg-[#3A3D46]"
                                        >
                                            View
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );

    const formContent = (
        <div className="rounded-[32px] border border-[#ECEEF2] bg-[#FCFCFD] p-6 shadow-[0_10px_30px_rgba(17,24,39,0.04)]">
            <div className="mb-6 flex flex-wrap gap-2 rounded-[24px] border border-[#ECEEF2] bg-white p-2">
                {TABS.map((tab) => {
                    return (
                        <button
                            key={tab.key}
                            type="button"
                            onClick={() => handleTabChange(tab.key)}
                            className={`relative cursor-pointer rounded-2xl px-4 py-2.5 text-sm font-medium transition-colors ${
                                activeTab === tab.key
                                    ? "bg-[#4E525D] text-white shadow-sm"
                                    : "text-[#808191] hover:bg-[#F4F5F6] hover:text-[#4E525D]"
                            }`}
                        >
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Tab: Basic Info */}
            {activeTab === "basic" && (
                <form onSubmit={(e) => { e.preventDefault(); handleBasicNext(); }}>
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
                                                if (file) handleImageUpload(file);
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
                                                    if (file) handleCoverImageUpload(file);
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
                                                value={formData.name || ""}
                                                onChange={(e) => { updateFormData("name", e.target.value); clearError("name"); }}
                                                placeholder="Sea Breeze"
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-1.5 block text-xs font-medium text-[#4E525D]">Title *</label>
                                            <input
                                                className={inputClass}
                                                value={formData.title || ""}
                                                onChange={(e) => { updateFormData("title", e.target.value); clearError("title"); }}
                                                placeholder="Sea Breeze Residence"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="mb-1.5 block text-xs font-medium text-[#4E525D]">Object Type</label>
                                        <input
                                            className={inputClass}
                                            value={formData.objectType}
                                            onChange={(e) => updateFormData("objectType", e.target.value)}
                                            placeholder="Residential"
                                        />
                                    </div>
                                    <div className="grid gap-4 lg:grid-cols-2">
                                        <div>
                                            <FormDropdown
                                                label="Currency"
                                                value={formData.currency}
                                                options={STATIC_CURRENCIES.map((c) => ({ id: c.value, label: c.label }))}
                                                placeholder="Select currency"
                                                onChange={(id) => { updateFormData("currency", id); clearError("currency"); }}
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-1.5 block text-xs font-medium text-[#4E525D]">Area</label>
                                            <input
                                                className={inputClass}
                                                value={formData.area}
                                                onChange={(e) => { updateFormData("area", e.target.value); clearError("area"); }}
                                                placeholder="2500 m²"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid gap-4 lg:grid-cols-2">
                                        <div>
                                            <FormDropdown
                                                label="City"
                                                value={formData.city}
                                                options={toLocationDropdownOptions("city", formData.city)}
                                                placeholder="Select city"
                                                onChange={(id) => {
                                                    updateFormData("city", id);
                                                    updateFormData("region", "");
                                                    clearError("city");
                                                    clearError("region");
                                                }}
                                                onCreateClick={() => setIsCityModalOpen(true)}
                                                createLabel="Create city"
                                            />
                                        </div>
                                        <div>
                                            <FormDropdown
                                                label="Region"
                                                value={formData.region}
                                                options={toLocationDropdownOptions("region", formData.region, formData.city)}
                                                placeholder="Select region"
                                                onChange={(id) => { updateFormData("region", id); clearError("region"); }}
                                                onCreateClick={() => setIsRegionModalOpen(true)}
                                                createLabel="Create region"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </SectionBlock>
                    </div>

                    <div className="mt-6 flex gap-3 rounded-[24px] border border-[#ECEEF2] bg-white p-4">
                        <button
                            type="button"
                            onClick={() => navigate("/dashboard/offplan/objects")}
                            className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm text-[#666666] transition-colors hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={createMutation.isPending}
                            className="rounded-xl bg-[#4E525D] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>

                </form>
            )}

            {activeTab === "commercial" && (
                <form onSubmit={(e) => { e.preventDefault(); handleCommercialNext(); }}>
                    <div className="space-y-5">
                        <SectionBlock title="Commercial" description="Developer, sales and infrastructure details shown for the project.">
                            <div className="grid gap-5 lg:grid-cols-2">
                                <div>
                                    <label className="mb-1.5 block text-xs font-medium text-[#4E525D]">Developer Brand</label>
                                    <input
                                        className={inputClass}
                                        value={formData.developerBrand}
                                        onChange={(e) => { updateFormData("developerBrand", e.target.value); clearError("developerBrand"); }}
                                        placeholder="ABC Development"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-xs font-medium text-[#4E525D]">Website</label>
                                    <input
                                        className={inputClass}
                                        value={formData.website}
                                        onChange={(e) => { updateFormData("website", e.target.value); clearError("website"); }}
                                        placeholder="https://example.com"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-xs font-medium text-[#4E525D]">Sales Department</label>
                                    <input
                                        className={inputClass}
                                        value={formData.salesDepartment}
                                        onChange={(e) => { updateFormData("salesDepartment", e.target.value); clearError("salesDepartment"); }}
                                        placeholder="sales@example.com"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-xs font-medium text-[#4E525D]">Phone Number</label>
                                    <input
                                        className={inputClass}
                                        value={formData.phoneNumber}
                                        onChange={(e) => { updateFormData("phoneNumber", e.target.value); clearError("phoneNumber"); }}
                                        placeholder="+994 50 123 45 67"
                                    />
                                </div>
                                <div className="lg:col-span-2 border-t border-[#EEF1F5] pt-4">
                                    <ImageAssetCard
                                        label="Banner Image"
                                        description="Wide banner visual shown for the project on the Commercial section."
                                        alt="Banner"
                                        imageUrl={formData.bannerImage || null}
                                        widthClass="w-[220px]"
                                        previewClassName="h-[110px] w-[220px] rounded-[16px] border border-[#E5E7EC] bg-white p-1.5 shadow-[0_8px_20px_rgba(17,24,39,0.06)]"
                                        emptyPreviewClassName={`flex h-[110px] w-[220px] items-center justify-center rounded-[16px] border-2 border-dashed bg-white ${bannerImageDrag ? "border-blue-400 bg-blue-50" : bannerImageUploading ? "pointer-events-none border-gray-200 bg-[#F4F5F6] opacity-50" : "border-gray-200 hover:border-gray-400"}`}
                                        placeholderTitle="Upload banner"
                                        placeholderHint="Landscape image"
                                        isDragging={bannerImageDrag}
                                        uploading={bannerImageUploading}
                                        onOpen={() => bannerImageInputRef.current?.click()}
                                        onRemove={() => updateFormData("bannerImage", "")}
                                        onDragOver={onBannerImageDragOver}
                                        onDragEnter={onBannerImageDragEnter}
                                        onDragLeave={onBannerImageDragLeave}
                                        onDrop={onBannerImageDrop}
                                    />
                                    <input
                                        ref={bannerImageInputRef}
                                        type="file"
                                        accept={IMAGE_ACCEPT}
                                        className="hidden"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) handleBannerImageUpload(file);
                                            if (bannerImageInputRef.current) bannerImageInputRef.current.value = "";
                                        }}
                                    />
                                </div>
                            </div>
                        </SectionBlock>

                        <div className="rounded-[28px] border border-[#E9ECF2] bg-white px-5 py-4 shadow-[0_1px_2px_rgba(16,24,40,0.03)]">
                            <label className="flex items-center gap-3 group cursor-pointer select-none">
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
                            type="button"
                            onClick={() => setActiveTab("basic")}
                            className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm text-[#666666] transition-colors hover:bg-gray-50"
                        >
                            Back
                        </button>
                        <button
                            type="submit"
                            disabled={createMutation.isPending}
                            className="rounded-xl bg-[#4E525D] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>

                </form>
            )}

            {activeTab === "location" && (
                <form onSubmit={(e) => { e.preventDefault(); handleLocationNext(); }}>
                    <div className="space-y-5">
                        <SectionBlock title="Location" description="Map labels, address copy and embed links for the object.">
                            <div className="grid gap-5 lg:grid-cols-3">
                                <div className="lg:col-span-3">
                                    <label className="mb-1.5 block text-xs font-medium text-[#4E525D]">Location Title</label>
                                    <input
                                        className={inputClass}
                                        value={formData.locationTitle}
                                        onChange={(e) => updateFormData("locationTitle", e.target.value)}
                                        placeholder="Baku city, Murtuza Mukhtarov str, house 31"
                                    />
                                </div>
                                <div className="lg:col-span-3">
                                    <label className="mb-1.5 block text-xs font-medium text-[#4E525D]">Location URL</label>
                                    <input
                                        className={inputClass}
                                        value={formData.locationUrl}
                                        onChange={(e) => updateFormData("locationUrl", e.target.value)}
                                        placeholder="https://maps.google.com/..."
                                    />
                                </div>
                                <div className="lg:col-span-3">
                                    <label className="mb-1.5 block text-xs font-medium text-[#4E525D]">Location Embed URL</label>
                                    <input
                                        className={inputClass}
                                        value={formData.locationGoogleMapsUrl}
                                        onChange={(e) => updateFormData("locationGoogleMapsUrl", e.target.value)}
                                        placeholder="https://www.google.com/maps/embed?pb=..."
                                    />
                                </div>
                            </div>
                        </SectionBlock>
                    </div>

                    <div className="mt-6 flex gap-3 rounded-[24px] border border-[#ECEEF2] bg-white p-4">
                        <button
                            type="button"
                            onClick={() => setActiveTab("commercial")}
                            className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm text-[#666666] transition-colors hover:bg-gray-50"
                        >
                            Back
                        </button>
                        <button
                            type="submit"
                            className="rounded-xl bg-[#4E525D] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>

                </form>
            )}

            {/* Tab: Properties */}
            {activeTab === "properties" && (
                <div className="space-y-5">
                    {!showPostPlanCards ? (
                        <div className="space-y-5">
                            {/* General Plans */}
                            <div className="rounded-[28px] border border-[#E9ECF2] bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.03)]">
                                <div className="mb-5 flex items-start justify-between gap-4 border-b border-[#F1F2F4] pb-4">
                                    <div className="min-w-0">
                                        <h5 className="text-[15px] font-semibold leading-5 text-[#1A1A1A]">General Plans</h5>
                                        <p className="mt-1 text-xs leading-5 text-[#808191]">Upload master plans and documents</p>
                                    </div>
                                </div>
                                {generalPlanDocuments.length > 0 ? (
                                    <div>
                                        <div className="space-y-2 mb-4">
                                            {generalPlanDocuments.map((doc, idx) => (
                                                <div key={idx} className="flex items-center justify-between rounded-xl border border-[#ECEEF2] px-3 py-2.5 group">
                                                    <div className="flex items-center gap-2.5 min-w-0">
                                                        <div className="w-8 h-8 flex items-center justify-center flex-shrink-0 rounded-lg" style={{ background: doc.type === "pdf" ? "#FEE2E2" : "#DBEAFE" }}>
                                                            <span className="text-xs font-bold" style={{ color: doc.type === "pdf" ? "#DC2626" : "#2563EB" }}>
                                                                {doc.type === "pdf" ? "PDF" : "IMG"}
                                                            </span>
                                                        </div>
                                                        <span className="text-sm text-[#1A1A1A] truncate">{doc.name || doc.url.split("/").pop() || `Plan ${idx + 1}`}</span>
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
                                        {showPlanUpload ? (
                                            <div className="mb-4">
                                                <PlanUploadCard
                                                    planName={pendingPlanName}
                                                    onPlanNameChange={setPendingPlanName}
                                                    selectedFileName={pendingPlanFile?.name}
                                                    uploading={docUploading}
                                                    onFileSelect={handleDocFileChange}
                                                    onUpload={handleDocUpload}
                                                    onCancel={resetPlanUpload}
                                                />
                                            </div>
                                        ) : null}
                                        <FormAddButton icon={<span className="text-sm font-light">+</span>}
                                            className="!bg-white !border !border-[#CBD5E1] !text-[#1A1C1E] hover:!bg-gray-50"
                                            onClick={() => setShowPlanUpload(true)} disabled={docUploading}>
                                            Add master plan
                                        </FormAddButton>
                                    </div>
                                ) : (
                                    <div className="space-y-4 pt-0 pb-8">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#EBEBEB]">
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#718096" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                                                </svg>
                                            </div>
                                            <p className="text-sm font-medium text-[#718096]">No plans uploaded yet</p>
                                        </div>
                                        <div className="w-full max-w-[620px] space-y-3">
                                            {showPlanUpload ? (
                                                <PlanUploadCard
                                                    planName={pendingPlanName}
                                                    onPlanNameChange={setPendingPlanName}
                                                    selectedFileName={pendingPlanFile?.name}
                                                    uploading={docUploading}
                                                    onFileSelect={handleDocFileChange}
                                                    onUpload={handleDocUpload}
                                                    onCancel={resetPlanUpload}
                                                />
                                            ) : null}
                                            {!showPlanUpload ? (
                                                <div>
                                                    <FormAddButton icon={<span className="text-sm font-light">+</span>}
                                                        className="!bg-white !border !border-[#CBD5E1] !text-[#1A1C1E] hover:!bg-gray-50"
                                                        onClick={() => setShowPlanUpload(true)} disabled={docUploading}>
                                                        Add master plan
                                                    </FormAddButton>
                                                </div>
                                            ) : null}
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="flex gap-3 rounded-[24px] border border-[#ECEEF2] bg-white p-4">
                                <button
                                    type="button"
                                    onClick={() => setActiveTab("location")}
                                    className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm text-[#666666] transition-colors hover:bg-gray-50"
                                >
                                    Back
                                </button>
                                {createdSlug ? (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowPostPlanCards(true);
                                            setSelectedManagementCard(null);
                                            setSelectedPostPlanCard("grid");
                                        }}
                                        className="rounded-xl bg-[#4E525D] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:opacity-90"
                                    >
                                        Next
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => createMutation.mutate()}
                                        disabled={createMutation.isPending}
                                        className="rounded-xl bg-[#4E525D] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {createMutation.isPending ? "Saving..." : "Save"}
                                    </button>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-5">
                            {!previewHouse ? (
                                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                                    {managementCards.map((card) => {
                                        const isActive = selectedManagementCard === card.key;
                                        return (
                                            <button
                                                key={card.key}
                                                type="button"
                                                onClick={() => {
                                                if (card.key !== "properties") return;
                                                setSelectedManagementCard("properties");
                                                setSelectedPostPlanCard("grid");
                                                }}
                                                className={`flex min-h-[120px] flex-col items-center justify-center rounded-[20px] border bg-[#F3F3F3] px-5 py-6 text-center transition-colors ${
                                                    isActive ? "border-[#4E525D] bg-white" : "border-[#E4E4E4]"
                                                }`}
                                            >
                                                <img src={card.icon} alt="" className="mb-4 h-12 w-12 object-contain" />
                                                <span className="text-sm font-medium text-[#4E525D]">{card.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            ) : null}

                            {selectedManagementCard === "properties" ? (
                                previewHouse ? (
                                    showUnitLayoutList ? (
                                        <div className="space-y-5">
                                            <div className="space-y-6 rounded-[28px] border border-[#E9ECF2] bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.03)]">
                                                <div className="flex items-center justify-between">
                                                    <FormTabSwitcher
                                                        tabs={[{ id: "Active", label: "Active unit layouts" }, { id: "Archive", label: "Archive" }]}
                                                        activeTab={activeUnitLayoutTab}
                                                        onChange={(id) => setActiveUnitLayoutTab(id as "Active" | "Archive")}
                                                        size="md"
                                                    />
                                                    <div className="flex items-center gap-3">
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setShowUnitLayoutList(false);
                                                                setShowUnitLayoutForm(false);
                                                                setEditingUnitLayoutId(null);
                                                            }}
                                                            className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm text-[#666666] transition-colors hover:bg-gray-50"
                                                        >
                                                            Back
                                                        </button>
                                                        <FormAddButton
                                                            icon={<span className="mr-0.5 text-base font-light">+</span>}
                                                            onClick={() => {
                                                                setEditingUnitLayoutId(null);
                                                                setShowUnitLayoutForm(true);
                                                            }}
                                                        >
                                                            Add Unit Layout
                                                        </FormAddButton>
                                                    </div>
                                                </div>

                                                {(showUnitLayoutForm || editingUnitLayoutId) ? (
                                                    <div ref={houseFormRef} className="rounded-[24px] border border-[#E9ECF2] bg-white p-5">
                                                        <UnitLayoutInlineForm
                                                            embedded
                                                            inline
                                                            categorySlug={createdSlug || undefined}
                                                            parentHouseId={previewHouse.id}
                                                            houseId={editingUnitLayoutId ?? undefined}
                                                            key={editingUnitLayoutId ?? `new-${previewHouse.id}`}
                                                            onSuccess={() => {
                                                                setShowUnitLayoutForm(false);
                                                                setEditingUnitLayoutId(null);
                                                                queryClient.invalidateQueries({ queryKey: ["unit-layouts", createdSlug, previewHouseId] });
                                                                queryClient.invalidateQueries({ queryKey: ["houses", createdSlug] });
                                                            }}
                                                        />
                                                    </div>
                                                ) : null}

                                                {filteredUnitLayouts.length === 0 ? (
                                                    <div className="rounded-[24px] border border-[#E9ECF2] bg-white px-6 py-12 text-center text-sm text-[#999]">
                                                        {activeUnitLayoutTab === "Active"
                                                            ? "No active unit layouts yet. Click 'Add Unit Layout' to create one."
                                                            : "No archived unit layouts"}
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-wrap gap-4">
                                                        {filteredUnitLayouts.map((layout) => {
                                                            const imageUrl = layout.mainImage?.url || layout.gallery?.[0]?.url;
                                                            return (
                                                                <div
                                                                    key={layout.id}
                                                                    className="group w-[312px] shrink-0 rounded-[20px] border border-[#EBEBEB] bg-white p-3 text-left transition-colors hover:border-[#D6DAE3]"
                                                                >
                                                                    <div
                                                                        className="relative aspect-[3/4] w-full cursor-pointer overflow-hidden rounded-[16px] bg-[#F8F9FB]"
                                                                        onClick={() => {
                                                                            setEditingUnitLayoutId(layout.id);
                                                                            setShowUnitLayoutForm(true);
                                                                            setTimeout(() => houseFormRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
                                                                        }}
                                                                    >
                                                                        {imageUrl ? (
                                                                            <img
                                                                                src={imageUrl}
                                                                                alt={layout.title}
                                                                                className="h-full w-full p-3 object-contain transition-transform duration-500 group-hover:scale-105"
                                                                                loading="lazy"
                                                                            />
                                                                        ) : (
                                                                            <div className="flex h-full w-full items-center justify-center text-xs text-[#999]">No Image</div>
                                                                        )}

                                                                        <button
                                                                            type="button"
                                                                            onClick={(event) => {
                                                                                event.stopPropagation();
                                                                                archiveUnitLayoutMutation.mutate({ id: layout.id, archived: !layout.archived });
                                                                            }}
                                                                            disabled={archiveUnitLayoutMutation.isPending}
                                                                            aria-label={layout.archived ? "Restore" : "Archive"}
                                                                            title={layout.archived ? "Restore" : "Archive"}
                                                                            className="absolute left-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#EBEBEB] text-[#4E525D] transition-colors hover:bg-[#E0E0E0] disabled:opacity-50"
                                                                        >
                                                                            {layout.archived ? (
                                                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                                                                                </svg>
                                                                            ) : (
                                                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                                                                                </svg>
                                                                            )}
                                                                        </button>

                                                                        <button
                                                                            type="button"
                                                                            onClick={(event) => {
                                                                                event.stopPropagation();
                                                                                deleteUnitLayoutMutation.mutate(layout.id);
                                                                            }}
                                                                            aria-label="Delete"
                                                                            title="Delete"
                                                                            className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#FDECEC] text-[#C3362B] transition-colors hover:bg-[#F8DDD9]"
                                                                        >
                                                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14zM10 11v6M14 11v6" />
                                                                            </svg>
                                                                        </button>
                                                                    </div>

                                                                    <div className="flex items-center justify-between gap-3 px-1 py-3">
                                                                        <p className="truncate text-base font-semibold text-[#1A1A1A]">{formatPricePreview(layout.prices)}</p>
                                                                        <p className="shrink-0 text-sm text-[#666666]">{layout.totalArea} m²</p>
                                                                    </div>

                                                                    <div className="flex gap-1 px-1 pb-1">
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => duplicateUnitLayoutMutation.mutate(layout)}
                                                                            disabled={duplicateUnitLayoutMutation.isPending}
                                                                            className="flex-1 cursor-pointer rounded-full border border-[#E2E8F0] py-1.5 text-[12px] font-medium text-[#4E525D] transition-colors hover:bg-gray-50 disabled:opacity-50"
                                                                        >
                                                                            Copy
                                                                        </button>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => {
                                                                                setEditingUnitLayoutId(layout.id);
                                                                                setShowUnitLayoutForm(true);
                                                                            }}
                                                                            className="flex-1 cursor-pointer rounded-full bg-[#4E525D] py-1.5 text-[12px] font-medium text-white transition-colors hover:bg-[#3A3D46]"
                                                                        >
                                                                            Edit
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ) : (showHouseForm || editingHouseId) ? (
                                        <div className="rounded-[28px] border border-[#E9ECF2] bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.03)]">
                                            <HouseForm
                                                embedded
                                                inline
                                                categorySlug={createdSlug || undefined}
                                                houseId={editingHouseId ?? undefined}
                                                key={editingHouseId ?? "preview-house"}
                                                onSuccess={() => {
                                                    const editedHouseId = editingHouseId;
                                                    setShowHouseForm(false);
                                                    setPreviewHouseId(editedHouseId ?? previewHouseId);
                                                    setEditingHouseId(null);
                                                    queryClient.invalidateQueries({ queryKey: ["houses", createdSlug] });
                                                }}
                                                onCancel={() => {
                                                    setShowHouseForm(false);
                                                    setEditingHouseId(null);
                                                }}
                                            />
                                        </div>
                                    ) : (
                                        <div className="space-y-5">
                                            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                                                {postPlanCards.map((card) => {
                                                    const isActive = card.key === selectedPostPlanCard;
                                                    return (
                                                        <div
                                                            key={card.key}
                                                            className={`rounded-[20px] border bg-white p-4 transition-colors ${
                                                                isActive ? "border-[#4E525D]" : "border-[#E5E7EB]"
                                                            }`}
                                                        >
                                                            <div className="flex items-start justify-between gap-3">
                                                                <div>
                                                                    <p className="text-sm font-medium text-[#1A1A1A]">{card.label}</p>
                                                                    <p className="mt-1 text-sm text-[#808191]">Filling 0%</p>
                                                                </div>
                                                                <img src={card.icon} alt="" className="h-10 w-10 object-contain opacity-70" />
                                                            </div>

                                                            <div className="mt-5">
                                                                {card.key === "grid" ? (
                                                                    <div className="grid grid-cols-2 gap-2">
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => {
                                                                                setSelectedPostPlanCard("grid");
                                                                                setShowUnitLayoutList(true);
                                                                                setShowUnitLayoutForm(false);
                                                                                setEditingUnitLayoutId(null);
                                                                            }}
                                                                            className="rounded-full bg-[#EFEFF1] px-4 py-2 text-sm font-medium text-[#666]"
                                                                        >
                                                                            Edit
                                                                        </button>
                                                                        <button
                                                                            type="button"
                                                                            className="rounded-full bg-[#4E525D] px-4 py-2 text-sm font-medium text-white"
                                                                        >
                                                                            Upload File
                                                                        </button>
                                                                    </div>
                                                                ) : (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setSelectedPostPlanCard(card.key)}
                                                                        className="w-full rounded-full bg-[#EFEFF1] px-4 py-2 text-sm font-medium text-[#666]"
                                                                    >
                                                                        Fill
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>

                                            <HouseInformationCard
                                                house={previewHouse}
                                                onCancel={() => setPreviewHouseId(null)}
                                                onEdit={() => {
                                                    setEditingHouseId(previewHouse.id);
                                                    setShowHouseForm(true);
                                                }}
                                            />
                                        </div>
                                    )
                                ) : (
                                    unitLayoutsPanel
                                )
                            ) : null}
                        </div>
                    )}
                </div>
            )}

            {activeTab === "payments" && (
                <div className="space-y-5">
                    {!createdSlug ? (
                        <div className="rounded-[28px] border border-[#E9ECF2] bg-white p-10 shadow-[0_1px_2px_rgba(16,24,40,0.03)]">
                            <div className="flex flex-col items-center justify-center text-center">
                                <div className="w-14 h-14 rounded-full bg-[#F0F1F3] flex items-center justify-center mb-4">
                                    <img src="/images/inv-dashboard/inv-offplan/payment.svg" alt="" className="w-8 h-8 opacity-50" />
                                </div>
                                <p className="text-sm font-medium text-[#667085]">Payment Methods section is ready</p>
                                <p className="text-xs text-[#999] mt-1">Save the object to continue with payment method setup.</p>
                            </div>
                        </div>
                    ) : (
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
                </div>
            )}

            {activeTab === "options" && (
                <div className="space-y-5">
                    {!createdSlug ? (
                        <div className="rounded-[28px] border border-[#E9ECF2] bg-white p-10 shadow-[0_1px_2px_rgba(16,24,40,0.03)]">
                            <div className="flex flex-col items-center justify-center text-center">
                                <div className="w-14 h-14 rounded-full bg-[#F0F1F3] flex items-center justify-center mb-4">
                                    <img src="/images/inv-dashboard/inv-offplan/options.svg" alt="" className="w-8 h-8 opacity-50" />
                                </div>
                                <p className="text-sm font-medium text-[#667085]">Options section is ready</p>
                                <p className="text-xs text-[#999] mt-1">Save the object to continue with option management.</p>
                            </div>
                        </div>
                    ) : (
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
                </div>
            )}

            {activeTab === "stock" && (
                <div className="space-y-5">
                    {!createdSlug ? (
                        <div className="rounded-[28px] border border-[#E9ECF2] bg-white p-10 shadow-[0_1px_2px_rgba(16,24,40,0.03)]">
                            <div className="flex flex-col items-center justify-center text-center">
                                <div className="w-14 h-14 rounded-full bg-[#F0F1F3] flex items-center justify-center mb-4">
                                    <img src="/images/inv-dashboard/inv-offplan/stock.svg" alt="" className="w-8 h-8 opacity-50" />
                                </div>
                                <p className="text-sm font-medium text-[#667085]">Stock section is ready</p>
                                <p className="text-xs text-[#999] mt-1">Save the object to continue with stock management.</p>
                            </div>
                        </div>
                    ) : (
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

        </div>
    );

    return (
        <main className="flex-1 overflow-y-auto p-8" style={{ background: "var(--background-primary-50, #FFFFFF80)" }}>
            {formContent}
            {isCityModalOpen ? (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#10182833] px-4">
                    <div className="w-full max-w-[420px] rounded-[24px] bg-white p-6 shadow-[0_24px_48px_rgba(16,24,40,0.18)]">
                        <div className="mb-5 flex items-center justify-between">
                            <h4 className="text-xl font-medium text-[#1A1A1A]">Create city</h4>
                            <button
                                type="button"
                                onClick={() => {
                                    setIsCityModalOpen(false);
                                    setCityDraft({ name: "", title: "" });
                                }}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[#666]"
                                disabled={createLocationOptionMutation.isPending}
                            >
                                <IoClose className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="mb-1.5 block text-xs text-[#4E525D]">Name</label>
                                    <input
                                        className="w-full h-10 rounded-xl border border-gray-200 bg-[#F4F5F6] px-3 text-sm outline-none focus:border-gray-400 focus:bg-white"
                                        value={cityDraft.name}
                                        onChange={(e) => setCityDraft((prev) => ({ ...prev, name: e.target.value }))}
                                        placeholder="baku"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-xs text-[#4E525D]">Title</label>
                                    <input
                                        className="w-full h-10 rounded-xl border border-gray-200 bg-[#F4F5F6] px-3 text-sm outline-none focus:border-gray-400 focus:bg-white"
                                        value={cityDraft.title}
                                        onChange={(e) => setCityDraft((prev) => ({ ...prev, title: e.target.value }))}
                                        placeholder="Baku"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsCityModalOpen(false);
                                    setCityDraft({ name: "", title: "" });
                                }}
                                className="rounded-full border border-[#C9CDD5] bg-white px-5 py-2.5 text-sm font-medium text-[#4E525D] transition-colors hover:bg-[#F8F9FB] disabled:opacity-50"
                                disabled={createLocationOptionMutation.isPending}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleCreateCity}
                                className="rounded-full bg-[#4E525D] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:opacity-90 disabled:opacity-50"
                                disabled={createLocationOptionMutation.isPending}
                            >
                                {createLocationOptionMutation.isPending ? "Creating..." : "Add"}
                            </button>
                        </div>
                    </div>
                </div>
            ) : null}
            {isRegionModalOpen ? (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#10182833] px-4">
                    <div className="w-full max-w-[420px] rounded-[24px] bg-white p-6 shadow-[0_24px_48px_rgba(16,24,40,0.18)]">
                        <div className="mb-5 flex items-center justify-between">
                            <h4 className="text-xl font-medium text-[#1A1A1A]">Create region</h4>
                            <button
                                type="button"
                                onClick={() => {
                                    setIsRegionModalOpen(false);
                                    setRegionDraft({ name: "", title: "" });
                                }}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[#666]"
                                disabled={createLocationOptionMutation.isPending}
                            >
                                <IoClose className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="space-y-5">
                            <div className="text-xs text-[#808191]">City: {formData.city || "-"}</div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="mb-1.5 block text-xs text-[#4E525D]">Name</label>
                                    <input
                                        className="w-full h-10 rounded-xl border border-gray-200 bg-[#F4F5F6] px-3 text-sm outline-none focus:border-gray-400 focus:bg-white"
                                        value={regionDraft.name}
                                        onChange={(e) => setRegionDraft((prev) => ({ ...prev, name: e.target.value }))}
                                        placeholder="nasimi"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-xs text-[#4E525D]">Title</label>
                                    <input
                                        className="w-full h-10 rounded-xl border border-gray-200 bg-[#F4F5F6] px-3 text-sm outline-none focus:border-gray-400 focus:bg-white"
                                        value={regionDraft.title}
                                        onChange={(e) => setRegionDraft((prev) => ({ ...prev, title: e.target.value }))}
                                        placeholder="Nasimi"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsRegionModalOpen(false);
                                    setRegionDraft({ name: "", title: "" });
                                }}
                                className="rounded-full border border-[#C9CDD5] bg-white px-5 py-2.5 text-sm font-medium text-[#4E525D] transition-colors hover:bg-[#F8F9FB] disabled:opacity-50"
                                disabled={createLocationOptionMutation.isPending}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleCreateRegion}
                                className="rounded-full bg-[#4E525D] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:opacity-90 disabled:opacity-50"
                                disabled={createLocationOptionMutation.isPending}
                            >
                                {createLocationOptionMutation.isPending ? "Creating..." : "Add"}
                            </button>
                        </div>
                    </div>
                </div>
            ) : null}
        </main>
    );
}
