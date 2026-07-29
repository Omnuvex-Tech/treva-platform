import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    unitLayoutsApi,
    UNIT_LAYOUT_STATUS_OPTIONS,
    CreateUnitLayoutData,
    UploadResponse,
    Document,
    GalleryImage,
} from "../../api/unit-layouts";
import { categoriesApi, Category } from "../../api/categories";
import { unitTypeOptionsApi, UnitTypeOption } from "../../api/unit-type-options";
import { FileUpload } from "../../components/FileUpload";
import { useMessageCenter } from "../../components/MessageCenter";
import { getApiErrorMessage } from "../../utils/apiError";
import { STATIC_CURRENCIES } from "../../utils/staticCurrencies";
import { IoClose } from "react-icons/io5";

type Tab = "basic" | "area" | "documents" | "gallery" | "similar";

const tabs: { key: Tab; label: string }[] = [
    { key: "basic", label: "Basic Info" },
    { key: "area", label: "Area & Pricing" },
    { key: "documents", label: "Documents" },
    { key: "gallery", label: "Gallery" },
    { key: "similar", label: "Similar Apartments" },
];

type ValidationError = {
    field: string;
    message: string;
};

type TabValidation = {
    valid: boolean;
    errors: ValidationError[];
};

const validateBasicTab = (form: CreateUnitLayoutData): TabValidation => {
    const errors: ValidationError[] = [];
    if (!form.title?.trim()) errors.push({ field: "Title", message: "Basic Info / Title is required" });
    if (!form.name?.trim()) errors.push({ field: "Name", message: "Basic Info / Name is required" });
    if (!form.slug?.trim()) errors.push({ field: "Slug", message: "Basic Info / Slug is required" });
    if (!form.categoryId) errors.push({ field: "Category", message: "Basic Info / Category is required" });
    if (!form.completionYear && form.completionYear !== 0) errors.push({ field: "Completion Year", message: "Basic Info / Completion Year is required" });
    if (!form.numberOfFloors?.start && form.numberOfFloors?.start !== 0) errors.push({ field: "Floors From", message: "Basic Info / Floors From is required" });
    return { valid: errors.length === 0, errors };
};

const validateAreaTab = (form: CreateUnitLayoutData): TabValidation => {
    const errors: ValidationError[] = [];
    if (!form.totalArea && form.totalArea !== 0) errors.push({ field: "Total Area", message: "Area & Pricing / Total Area is required" });
    if (!form.internalArea && form.internalArea !== 0) errors.push({ field: "Internal Area", message: "Area & Pricing / Internal Area is required" });
    if (!form.balconyArea && form.balconyArea !== 0) errors.push({ field: "Balcony Area", message: "Area & Pricing / Balcony Area is required" });
    if (!form.prices || Object.keys(form.prices).length === 0) errors.push({ field: "Prices", message: "Area & Pricing / At least one price is required" });
    return { valid: errors.length === 0, errors };
};

const validateDocumentsTab = (form: CreateUnitLayoutData): TabValidation => {
    const errors: ValidationError[] = [];
    if (!form.documents || form.documents.length === 0) {
        errors.push({ field: "Documents", message: "Documents / At least one PDF document is required" });
    }
    return { valid: errors.length === 0, errors };
};

const validateGalleryTab = (form: CreateUnitLayoutData): TabValidation => {
    const errors: ValidationError[] = [];
    if (!form.mainImage?.url) errors.push({ field: "Main Image", message: "Gallery / Main Image is required" });
    if (!form.gallery || form.gallery.length === 0) {
        errors.push({ field: "Gallery Images", message: "Gallery / At least one gallery image is required" });
    }
    return { valid: errors.length === 0, errors };
};

const validateSimilarTab = (form: CreateUnitLayoutData): TabValidation => {
    return { valid: true, errors: [] };
};

const validateTab = (tab: Tab, form: CreateUnitLayoutData): TabValidation => {
    switch (tab) {
        case "basic": return validateBasicTab(form);
        case "area": return validateAreaTab(form);
        case "documents": return validateDocumentsTab(form);
        case "gallery": return validateGalleryTab(form);
        case "similar": return validateSimilarTab(form);
        default: return { valid: true, errors: [] };
    }
};

const tabOrder: Tab[] = ["basic", "area", "documents", "gallery", "similar"];

export function UnitLayoutForm() {
    const { id } = useParams<{ id: string }>();
    const isEdit = !!id;
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { showError, showSuccess } = useMessageCenter();

    const [activeTab, setActiveTab] = useState<Tab>("basic");
    const [isUnitTypeModalOpen, setIsUnitTypeModalOpen] = useState(false);
    const [unitTypeDraft, setUnitTypeDraft] = useState({ name: "", title: "" });
    const [form, setForm] = useState<CreateUnitLayoutData>({
        title: "",
        name: "",
        slug: "",
        categoryId: "",
        unitTypeOptionId: undefined,
            status: "available",
        floor: undefined as unknown as number,
        number: undefined as unknown as number,
        entrance: "",
        totalArea: undefined as unknown as number,
        internalArea: undefined as unknown as number,
        balconyArea: undefined as unknown as number,
        prices: {},
        completionYear: undefined as unknown as number,
        numberOfFloors: { start: undefined as unknown as number, end: undefined as unknown as number },
        similarApartmentIds: [],
        mainImage: undefined,
        gallery: [],
        documents: [],
    });

    const { data: existing, isLoading: loadingExisting } = useQuery({
        queryKey: ["unit-layout", id],
        queryFn: () => unitLayoutsApi.getById(id!),
        enabled: isEdit,
    });

    const { data: categoriesResponse } = useQuery({
        queryKey: ["categories"],
        queryFn: () => categoriesApi.getAll(),
    });

    const { data: allLayoutsResponse } = useQuery({
        queryKey: ["unit-layouts-all"],
        queryFn: () => unitLayoutsApi.getAll({ limit: 200 }),
        enabled: activeTab === "similar",
    });

    const { data: unitTypesResponse } = useQuery({
        queryKey: ["unit-type-options"],
        queryFn: () => unitTypeOptionsApi.getAll(),
    });

    const currencies = STATIC_CURRENCIES;

    const [similarSearch, setSimilarSearch] = useState("");
    const [categoryOpen, setCategoryOpen] = useState(false);
    const [roomOptionOpen, setRoomOptionOpen] = useState(false);
    const [similarRecommendation, setSimilarRecommendation] = useState(false);
    const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
    const categoryRef = useRef<HTMLDivElement>(null);
    const roomOptionRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (categoryRef.current && !categoryRef.current.contains(e.target as Node)) setCategoryOpen(false);
            if (roomOptionRef.current && !roomOptionRef.current.contains(e.target as Node)) setRoomOptionOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (existing?.data) {
            const d = existing.data;
            setForm({
                title: d.title,
                name: d.name,
                slug: d.slug,
                categoryId: d.categoryId,
                status: d.status ?? "available",
                floor: d.floor ?? 1,
                number: d.number ?? 0,
                entrance: d.entrance ?? "",
                totalArea: d.totalArea ?? 0,
                internalArea: d.internalArea ?? 0,
                balconyArea: d.balconyArea ?? 0,
                prices: d.prices || {},
                completionYear: d.completionYear ?? 2030,
                numberOfFloors: d.numberOfFloors || { start: 1, end: 1 },
                similarApartmentIds: d.similarApartmentIds || [],
                mainImage: d.mainImage ?? undefined,
                gallery: Array.isArray(d.gallery) ? d.gallery : [],
                documents: Array.isArray(d.documents) ? d.documents : [],
                unitTypeOptionId: d.unitTypeOptionId ?? undefined,
            });
        }
    }, [existing]);

    const createMutation = useMutation({
        mutationFn: (data: CreateUnitLayoutData) => unitLayoutsApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["unit-layouts"] });
            showSuccess({ title: "Unit layout created" });
            navigate("/unit-layouts");
        },
        onError: (error) => {
            showError({
                title: "Unit layout could not be created",
                description: getApiErrorMessage(error, "Please try again."),
            });
        },
    });

    const updateMutation = useMutation({
        mutationFn: (data: Partial<CreateUnitLayoutData>) =>
            unitLayoutsApi.update(id!, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["unit-layouts"] });
            showSuccess({ title: "Unit layout updated" });
            navigate("/unit-layouts");
        },
        onError: (error) => {
            showError({
                title: "Unit layout could not be updated",
                description: getApiErrorMessage(error, "Please try again."),
            });
        },
    });

    const createUnitTypeMutation = useMutation({
        mutationFn: (payload: { name: string; title: string }) => unitTypeOptionsApi.create(payload),
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: ["unit-type-options"] });
            const created = res?.data;
            if (created?.id) {
                setForm((prev) => ({ ...prev, unitTypeOptionId: created.id }));
            }
            setIsUnitTypeModalOpen(false);
            setUnitTypeDraft({ name: "", title: "" });
            showSuccess({ title: "Unit type created" });
        },
        onError: (error) => {
            showError({
                title: "Unit type could not be created",
                description: getApiErrorMessage(error, "Please try again."),
            });
        },
    });

    const handleCreateUnitType = () => {
        const name = unitTypeDraft.name.trim();
        const title = unitTypeDraft.title.trim();
        if (!name || !title) {
            showError({
                title: "Please fill required fields",
                description: !name ? "Name is required" : "Title is required",
            });
            return;
        }
        createUnitTypeMutation.mutate({ name, title });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const allErrors: ValidationError[] = [];
        for (const tab of tabOrder) {
            const result = validateTab(tab, form);
            if (!result.valid) {
                allErrors.push(...result.errors);
            }
        }

        if (allErrors.length > 0) {
            const firstInvalidTab = tabOrder.find((tab) => !validateTab(tab, form).valid);
            if (firstInvalidTab) {
                const firstTabErrors = validateTab(firstInvalidTab, form).errors;
                setActiveTab(firstInvalidTab);
                showError({
                    title: "Please fill required fields",
                    description: firstTabErrors[0]?.message || "Please review the required fields.",
                });
            }
            return;
        }

        const hasSimilar = form.similarApartmentIds && form.similarApartmentIds.length > 0;
        setSimilarRecommendation(!hasSimilar);

        const submitForm: CreateUnitLayoutData = {
            ...form,
            floor:
                (form.floor ?? undefined) ??
                (form.numberOfFloors?.start ?? undefined) ??
                1,
            numberOfFloors: {
                start: form.numberOfFloors?.start,
                end: form.numberOfFloors?.end ?? form.numberOfFloors?.start,
            },
        };

        if (isEdit) {
            updateMutation.mutate(submitForm);
        } else {
            createMutation.mutate(submitForm);
        }
    };

    const handleTabClick = (tab: Tab) => {
        const currentIndex = tabOrder.indexOf(activeTab);
        const targetIndex = tabOrder.indexOf(tab);

        if (targetIndex > currentIndex) {
            const result = validateTab(activeTab, form);
            if (!result.valid) {
                showError({
                    title: "Please fill required fields",
                    description: result.errors[0]?.message || "Please review the required fields.",
                });
                return;
            }
        }

        setActiveTab(tab);
    };

    const handleSlugFromTitle = (title: string) => {
        setForm((prev) => ({
            ...prev,
            title,
            slug: slugManuallyEdited
                ? prev.slug
                : title
                    .toLowerCase()
                    .trim()
                    .replace(/[^a-z0-9]+/g, "-")
                    .replace(/(^-|-$)/g, ""),
        }));
    };

    const updateField = <K extends keyof CreateUnitLayoutData>(
        key: K,
        value: CreateUnitLayoutData[K]
    ) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const updateFloors = (key: "start" | "end", value: number | undefined) => {
        setForm((prev) => ({
            ...prev,
            numberOfFloors: { ...prev.numberOfFloors, [key]: value },
        }));
    };

    const handleMainImageUpload = (result: UploadResponse) => {
        setForm((prev) => ({
            ...prev,
            mainImage: { url: result.url, alt: result.alt },
        }));
    };

    const handleGalleryUpload = (result: UploadResponse) => {
        setForm((prev) => ({
            ...prev,
            gallery: [...(prev.gallery || []), { url: result.url, alt: result.alt }],
        }));
    };

    const removeGalleryImage = (index: number) => {
        setForm((prev) => ({
            ...prev,
            gallery: prev.gallery?.filter((_, i) => i !== index) || [],
        }));
    };

    const handleDocumentUpload = (result: UploadResponse) => {
        setForm((prev) => ({
            ...prev,
            documents: [
                ...(prev.documents || []),
                { type: "pdf", url: result.url },
            ],
        }));
    };

    const removeDocument = (index: number) => {
        setForm((prev) => ({
            ...prev,
            documents: prev.documents?.filter((_, i) => i !== index) || [],
        }));
    };

    const toggleSimilarApartment = (layoutId: string) => {
        setForm((prev) => {
            const current = prev.similarApartmentIds || [];
            const exists = current.includes(layoutId);
            return {
                ...prev,
                similarApartmentIds: exists
                    ? current.filter((id) => id !== layoutId)
                    : [...current, layoutId],
            };
        });
        setSimilarRecommendation(false);
    };

    const removeSimilarApartment = (layoutId: string) => {
        setForm((prev) => ({
            ...prev,
            similarApartmentIds: (prev.similarApartmentIds || []).filter(
                (id) => id !== layoutId
            ),
        }));
    };

    const categories = Array.isArray(categoriesResponse?.data)
        ? (categoriesResponse.data as Category[])
        : [];
    const unitTypes = Array.isArray(unitTypesResponse?.data)
        ? (unitTypesResponse.data as UnitTypeOption[])
        : [];
    const isSubmitting = createMutation.isPending || updateMutation.isPending;

    if (isEdit && loadingExisting) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#F4F5F6]">
                <div className="text-center text-[#666666]">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F4F5F6] py-8">
            <div className="mx-auto max-w-4xl">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div className="mb-6">
                    <h4 className="m-0 text-[#1A1A1A]" style={{ fontWeight: 600, fontSize: 16, lineHeight: "20px" }}>
                        {isEdit ? "Edit Unit Layout" : "New Unit Layout"}
                    </h4>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4 flex gap-1 border-b border-gray-200">
                        {tabs.map((tab) => {
                            const isActive = activeTab === tab.key;
                            return (
                                <button
                                    key={tab.key}
                                    type="button"
                                    onClick={() => handleTabClick(tab.key)}
                                    className={`relative px-4 py-2.5 text-sm transition-colors ${
                                        isActive
                                            ? "border-b-2 border-[#4E525D] text-[#1A1A1A]"
                                            : "text-[#808191] hover:text-[#4E525D]"
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>

                    <div className="rounded-xl border border-gray-100 bg-white p-6">
                        {activeTab === "basic" && (
                            <div className="flex flex-col gap-4">
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-[#4E525D]">
                                        Title
                                    </label>
                                    <input
                                        type="text"
                                        value={form.title}
                                        onChange={(e) => handleSlugFromTitle(e.target.value)}
                                        placeholder="Sea Breeze Residence"
                                        className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-[#F4F5F6] text-sm text-[#1A1A1A] placeholder-[#999] outline-none focus:bg-white focus:border-gray-400"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-[#4E525D]">
                                        Name
                                    </label>
                                    <input
                                        type="text"
                                        value={form.name}
                                        onChange={(e) => updateField("name", e.target.value)}
                                        placeholder="Block A, Apartment 12"
                                        className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-[#F4F5F6] text-sm text-[#1A1A1A] placeholder-[#999] outline-none focus:bg-white focus:border-gray-400"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-[#4E525D]">
                                        Slug
                                    </label>
                                    <input
                                        type="text"
                                        value={form.slug}
                                        onChange={(e) => { setSlugManuallyEdited(true); updateField("slug", e.target.value); }}
                                        placeholder="sea-breeze-residence-a-12"
                                        className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-[#F4F5F6] text-sm text-[#1A1A1A] placeholder-[#999] outline-none focus:bg-white focus:border-gray-400"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="mb-1 block text-xs font-medium text-[#4E525D]">
                                            Category
                                        </label>
                                        <div ref={categoryRef} className="relative">
                                            <button
                                                type="button"
                                                onClick={() => setCategoryOpen((p) => !p)}
                                                className="flex w-full items-center justify-between rounded-xl border border-gray-200 bg-[#F4F5F6] px-4 h-10 text-sm text-[#1A1A1A] focus:border-gray-400 focus:outline-none"
                                            >
                                                <span className={form.categoryId ? "text-[#1A1A1A]" : "text-[#999]"}>
                                                    {categories.find((c) => c.id === form.categoryId)?.title || "Select category"}
                                                </span>
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={`transition-transform ${categoryOpen ? "rotate-180" : ""}`}>
                                                    <path d="M6 9l6 6 6-6" />
                                                </svg>
                                            </button>
                                            {categoryOpen && (
                                                <div className="absolute top-full left-0 z-50 mt-1 w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
                                                    {categories.map((cat) => (
                                                        <button
                                                            key={cat.id}
                                                            type="button"
                                                            onClick={() => { updateField("categoryId", cat.id); setCategoryOpen(false); }}
                                                            className={`flex w-full items-center px-4 py-2.5 text-left text-sm transition-colors ${
                                                                form.categoryId === cat.id
                                                                    ? "bg-[#4E525D]/10 text-[#1A1A1A] font-medium"
                                                                    : "text-[#666666] hover:bg-gray-50 hover:text-[#1A1A1A]"
                                                            }`}
                                                        >
                                                            {cat.title}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                        <div>
                                            <label className="mb-1 block text-xs font-medium text-[#4E525D]">
                                                Status
                                            </label>
                                            <select
                                                value={form.status || "available"}
                                                onChange={(e) => updateField("status", e.target.value as CreateUnitLayoutData["status"])}
                                                className="w-full h-10 rounded-xl border border-gray-200 bg-[#F4F5F6] px-3 text-sm text-[#1A1A1A] outline-none focus:bg-white focus:border-gray-400"
                                            >
                                                {UNIT_LAYOUT_STATUS_OPTIONS.map((option) => (
                                                    <option key={option.id} value={option.id}>
                                                        {option.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="mb-1 block text-xs font-medium text-[#4E525D]">
                                            Unit type
                                        </label>
                                        <div ref={roomOptionRef} className="relative">
                                            <button
                                                type="button"
                                                onClick={() => setRoomOptionOpen((p) => !p)}
                                                className="flex w-full items-center justify-between rounded-xl border border-gray-200 bg-[#F4F5F6] px-4 h-10 text-sm text-[#1A1A1A] focus:border-gray-400 focus:outline-none"
                                            >
                                                <span className={form.unitTypeOptionId ? "text-[#1A1A1A]" : "text-[#999]"}>
                                                    {unitTypes.find((t) => t.id === form.unitTypeOptionId)?.title || "Select unit type (optional)"}
                                                </span>
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={`transition-transform ${roomOptionOpen ? "rotate-180" : ""}`}>
                                                    <path d="M6 9l6 6 6-6" />
                                                </svg>
                                            </button>
                                            {roomOptionOpen && (
                                                <div className="absolute top-full left-0 z-50 mt-1 w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
                                                    <button
                                                        type="button"
                                                        onClick={() => { updateField("unitTypeOptionId", undefined); setRoomOptionOpen(false); }}
                                                        className={`flex w-full items-center px-4 py-2.5 text-left text-sm transition-colors ${
                                                            !form.unitTypeOptionId
                                                                ? "bg-[#4E525D]/10 text-[#1A1A1A] font-medium"
                                                                : "text-[#666666] hover:bg-gray-50 hover:text-[#1A1A1A]"
                                                        }`}
                                                    >
                                                        â€” None
                                                    </button>
                                                    {unitTypes.map((opt) => (
                                                        <button
                                                            key={opt.id}
                                                            type="button"
                                                            onClick={() => { updateField("unitTypeOptionId", opt.id); setRoomOptionOpen(false); }}
                                                            className={`flex w-full items-center px-4 py-2.5 text-left text-sm transition-colors ${
                                                                form.unitTypeOptionId === opt.id
                                                                    ? "bg-[#4E525D]/10 text-[#1A1A1A] font-medium"
                                                                    : "text-[#666666] hover:bg-gray-50 hover:text-[#1A1A1A]"
                                                            }`}
                                                        >
                                                            {opt.title}
                                                        </button>
                                                    ))}
                                                    {unitTypes.length === 0 && (
                                                        <div className="px-4 py-3 text-sm text-[#999]">
                                                        No unit types yet. Add them in Unit Types.
                                                        </div>
                                                    )}
                                                    <button
                                                        type="button"
                                                        className="flex w-full items-center border-t border-gray-200 px-4 py-2.5 text-left text-sm font-medium text-[#4E525D] transition-colors hover:bg-gray-50 hover:text-[#1A1A1A]"
                                                        onClick={() => {
                                                            setRoomOptionOpen(false);
                                                            setIsUnitTypeModalOpen(true);
                                                        }}
                                                    >
                                                        Create unit type
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-xs font-medium text-[#4E525D]">
                                            Entrance (optional)
                                        </label>
                                        <input
                                            type="text"
                                            value={form.entrance ?? ""}
                                            onChange={(e) => updateField("entrance", e.target.value)}
                                            placeholder="A"
                                            className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-[#F4F5F6] text-sm text-[#1A1A1A] placeholder-[#999] outline-none focus:bg-white focus:border-gray-400"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="mb-1 block text-xs font-medium text-[#4E525D]">
                                            Floor
                                        </label>
                                        <input
                                            type="number"
                                            value={form.floor ?? ""}
                                            onChange={(e) =>
                                                updateField("floor", e.target.value ? parseInt(e.target.value) : 0)
                                            }
                                            placeholder="5"
                                            className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-[#F4F5F6] text-sm text-[#1A1A1A] placeholder-[#999] outline-none focus:bg-white focus:border-gray-400"
                                            min={1}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-xs font-medium text-[#4E525D]">
                                            Number
                                        </label>
                                        <input
                                            type="number"
                                            value={form.number ?? ""}
                                            onChange={(e) =>
                                                updateField(
                                                    "number",
                                                    e.target.value ? parseInt(e.target.value) : 0
                                                )
                                            }
                                            placeholder="12"
                                            className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-[#F4F5F6] text-sm text-[#1A1A1A] placeholder-[#999] outline-none focus:bg-white focus:border-gray-400"
                                            min={1}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-xs font-medium text-[#4E525D]">
                                            Completion Year
                                        </label>
                                        <input
                                            type="number"
                                            value={form.completionYear || ""}
                                            onChange={(e) =>
                                                updateField(
                                                    "completionYear",
                                                    e.target.value ? parseInt(e.target.value) : 0
                                                )
                                            }
                                            placeholder="2026"
                                            className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-[#F4F5F6] text-sm text-[#1A1A1A] placeholder-[#999] outline-none focus:bg-white focus:border-gray-400"
                                            min={2020}
                                            max={2100}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="mb-1 block text-xs font-medium text-[#4E525D]">
                                            Floors From
                                        </label>
                                        <input
                                            type="number"
                                            value={form.numberOfFloors.start ?? ""}
                                            onChange={(e) =>
                                                updateFloors(
                                                    "start",
                                                    e.target.value ? parseInt(e.target.value) : 0
                                                )
                                            }
                                            placeholder="1"
                                            className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-[#F4F5F6] text-sm text-[#1A1A1A] placeholder-[#999] outline-none focus:bg-white focus:border-gray-400"
                                            min={1}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-xs font-medium text-[#4E525D]">
                                            Floors To
                                        </label>
                                        <input
                                            type="number"
                                            value={form.numberOfFloors.end ?? ""}
                                            onChange={(e) =>
                                                updateFloors(
                                                    "end",
                                                    e.target.value ? parseInt(e.target.value) : 0
                                                )
                                            }
                                            placeholder="15"
                                            className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-[#F4F5F6] text-sm text-[#1A1A1A] placeholder-[#999] outline-none focus:bg-white focus:border-gray-400"
                                            min={1}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === "area" && (
                            <div className="flex flex-col gap-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="mb-1 block text-xs font-medium text-[#4E525D]">
                                            Total Area (mÂ²)
                                        </label>
                                        <input
                                            type="number"
                                            value={form.totalArea || ""}
                                            onChange={(e) =>
                                                updateField(
                                                    "totalArea",
                                                    e.target.value ? parseFloat(e.target.value) : 0
                                                )
                                            }
                                            placeholder="85.5"
                                            className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-[#F4F5F6] text-sm text-[#1A1A1A] placeholder-[#999] outline-none focus:bg-white focus:border-gray-400"
                                            min={0}
                                            step={0.1}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-xs font-medium text-[#4E525D]">
                                            Internal Area (mÂ²)
                                        </label>
                                        <input
                                            type="number"
                                            value={form.internalArea || ""}
                                            onChange={(e) =>
                                                updateField(
                                                    "internalArea",
                                                    e.target.value ? parseFloat(e.target.value) : 0
                                                )
                                            }
                                            placeholder="72.3"
                                            className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-[#F4F5F6] text-sm text-[#1A1A1A] placeholder-[#999] outline-none focus:bg-white focus:border-gray-400"
                                            min={0}
                                            step={0.1}
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-[#4E525D]">
                                        Balcony Area (mÂ²)
                                    </label>
                                        <input
                                            type="number"
                                            value={form.balconyArea ?? ""}
                                            onChange={(e) =>
                                                updateField(
                                                    "balconyArea",
                                                    e.target.value
                                                        ? parseFloat(e.target.value)
                                                        : 0
                                                )
                                            }
                                            placeholder="8.5"
                                            className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-[#F4F5F6] text-sm text-[#1A1A1A] placeholder-[#999] outline-none focus:bg-white focus:border-gray-400"
                                            min={0}
                                            step={0.1}
                                            required
                                        />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    {currencies.map((curr) => (
                                        <div key={curr.value}>
                                            <label className="mb-1 block text-xs font-medium text-[#4E525D]">
                                                Price ({curr.label})
                                            </label>
                                            <input
                                                type="number"
                                                value={form.prices?.[curr.value] || ""}
                                                onChange={(e) =>
                                                    updateField(
                                                        "prices",
                                                        {
                                                            ...form.prices,
                                                            [curr.value]: e.target.value ? parseFloat(e.target.value) : 0,
                                                        }
                                                    )
                                                }
                                                placeholder={`e.g. 120,000`}
                                                className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-[#F4F5F6] text-sm text-[#1A1A1A] placeholder-[#999] outline-none focus:bg-white focus:border-gray-400"
                                                min={0}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === "documents" && (
                            <div className="flex flex-col gap-4">
                                <FileUpload
                                    label="Upload Document (PDF)"
                                    accept=".pdf"
                                    onUpload={handleDocumentUpload}
                                />
                                {form.documents && form.documents.length > 0 && (
                                    <div className="flex flex-col gap-2">
                                        {form.documents.map((doc: Document, index: number) => (
                                            <div
                                                key={index}
                                                className="flex items-center justify-between rounded-xl border border-gray-200 bg-[#F4F5F6] px-4 py-2.5"
                                            >
                                                <span className="text-sm text-[#666666]">
                                                    {doc.url.split("/").pop()}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => removeDocument(index)}
                                                    className="text-[#C3362B] hover:underline"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === "gallery" && (
                            <div className="flex flex-col gap-4">
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-[#4E525D]">
                                        Main Image
                                    </label>
                                    {form.mainImage ? (
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={form.mainImage.url}
                                                alt={form.mainImage.alt || "Main image"}
                                                className="h-20 w-20 rounded-lg object-cover"
                                            />
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    updateField("mainImage", undefined)
                                                }
                                                className="text-[#C3362B] hover:underline"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    ) : (
                                        <FileUpload
                                            label="Upload Main Image"
                                            accept="image/*"
                                            onUpload={handleMainImageUpload}
                                        />
                                    )}
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-[#4E525D]">
                                        Gallery Images
                                    </label>
                                    <FileUpload
                                        label="Upload Gallery Images"
                                        accept="image/*"
                                        onUpload={handleGalleryUpload}
                                        multiple
                                    />
                                    {form.gallery && form.gallery.length > 0 && (
                                        <div className="mt-3 grid grid-cols-4 gap-3">
                                            {form.gallery.map(
                                                (img: GalleryImage, index: number) => (
                                                    <div key={index} className="relative">
                                                        <img
                                                            src={img.url}
                                                            alt={img.alt || `Gallery ${index + 1}`}
                                                            className="h-24 w-full rounded-lg object-cover"
                                                        />
                                                        <button
                                                            type="button"
                                                            aria-label={`Remove gallery image ${index + 1}`}
                                                            onClick={() =>
                                                                removeGalleryImage(index)
                                                            }
                                                            className="absolute right-3 top-3 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-[rgba(17,24,39,0.72)] text-[0px] text-white backdrop-blur-sm transition-opacity hover:opacity-85"
                                                        >
                                                            <IoClose size={18} />
                                                            âœ•
                                                        </button>
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === "similar" && (
                            <div className="flex flex-col gap-6">
                                {/* Selected Similar Apartments */}
                                <div>
                                    <label className="mb-3 block text-xs font-medium text-[#4E525D]">
                                        Selected Similar Apartments ({(form.similarApartmentIds || []).length})
                                    </label>
                                    {(form.similarApartmentIds || []).length === 0 ? (
                                        <p className="text-sm text-[#999]">No similar apartments selected yet.</p>
                                    ) : (
                                        <div className="grid grid-cols-3 gap-3">
                                            {(Array.isArray(allLayoutsResponse?.data?.data) ? allLayoutsResponse.data.data : [])
                                                .filter((l: any) => (form.similarApartmentIds || []).includes(l.id))
                                                .map((layout: any) => (
                                                    <div
                                                        key={layout.id}
                                                        className="relative overflow-hidden rounded-xl border border-gray-200 bg-[#F4F5F6]"
                                                    >
                                                        <div className="relative h-32 w-full bg-[#F4F5F6]">
                                                            {(layout.mainImage?.url || layout.gallery?.[0]?.url) ? (
                                                                <img
                                                                    src={layout.mainImage?.url || layout.gallery?.[0]?.url}
                                                                    alt={layout.mainImage?.alt || layout.gallery?.[0]?.alt || layout.title}
                                                                    className="h-full w-full object-cover"
                                                                />
                                                            ) : (
                                                                <div className="flex h-full w-full items-center justify-center text-xs text-[#999]">
                                                                    No image
                                                                </div>
                                                            )}
                                                            <button
                                                                type="button"
                                                                onClick={() => removeSimilarApartment(layout.id)}
                                                                className="absolute top-2 right-2 rounded-full bg-[#C3362B] p-1 text-white hover:opacity-90"
                                                            >
                                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                                                    <line x1="18" y1="6" x2="6" y2="18"/>
                                                                    <line x1="6" y1="6" x2="18" y2="18"/>
                                                                </svg>
                                                            </button>
                                                            <span className="absolute top-2 left-2 rounded bg-black/50 px-2 py-0.5 text-[10px] font-medium text-white">
                                                                {layout.status}
                                                            </span>
                                                        </div>
                                                        <div className="p-3">
                                                            <div className="text-xs text-[#666666]">NÂ° {layout.number || '?'} Â· {layout.floor} floor</div>
                                                            <div className="mt-0.5 text-sm font-medium text-[#1A1A1A]">{layout.title}</div>
                                                            <div className="mt-1 flex items-center justify-between">
                                                                <span className="text-xs text-[#666666]">{layout.totalArea} mÂ²</span>
                                                                 <span className="text-sm font-semibold text-[#1A1A1A]">{Object.entries(layout.prices || {}).map(([curr, price]) => `${curr} ${price?.toLocaleString()}`).join(' / ')}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                        </div>
                                    )}
                                </div>

                                {/* Available Apartments */}
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-[#4E525D]">
                                        Available Apartments
                                    </label>
                                    <input
                                        type="text"
                                        value={similarSearch}
                                        onChange={(e) => setSimilarSearch(e.target.value)}
                                        placeholder="Search apartments..."
                                        className="mb-3 w-full h-10 px-3 rounded-xl border border-gray-200 bg-[#F4F5F6] text-sm text-[#1A1A1A] placeholder-[#999] outline-none focus:bg-white focus:border-gray-400"
                                    />
                                    <div className="grid max-h-[540px] grid-cols-3 gap-3 overflow-y-auto pr-1">
                                        {(Array.isArray(allLayoutsResponse?.data?.data) ? allLayoutsResponse.data.data : [])
                                            .filter((l: any) => l.id !== id)
                                            .filter((l: any) => {
                                                if (!similarSearch) return true;
                                                const q = similarSearch.toLowerCase();
                                                return (
                                                    l.title?.toLowerCase().includes(q) ||
                                                    l.name?.toLowerCase().includes(q) ||
                                                    l.slug?.toLowerCase().includes(q)
                                                );
                                            })
                                            .map((layout: any) => {
                                                const isSelected = (form.similarApartmentIds || []).includes(layout.id);
                                                return (
                                                    <div
                                                        key={layout.id}
                                                        onClick={() => toggleSimilarApartment(layout.id)}
                                                        className={`relative cursor-pointer overflow-hidden rounded-xl border transition-all ${
                                                            isSelected
                                                                ? "border-blue-400/60 ring-2 ring-blue-400/30"
                                                                : "border-gray-200 hover:border-gray-400"
                                                        }`}
                                                    >
                                                        <div className="relative h-32 w-full bg-[#F4F5F6]">
                                                            {(layout.mainImage?.url || layout.gallery?.[0]?.url) ? (
                                                                <img
                                                                    src={layout.mainImage?.url || layout.gallery?.[0]?.url}
                                                                    alt={layout.mainImage?.alt || layout.gallery?.[0]?.alt || layout.title}
                                                                    className="h-full w-full object-cover"
                                                                />
                                                            ) : (
                                                                <div className="flex h-full w-full items-center justify-center text-xs text-[#999]">
                                                                    No image
                                                                </div>
                                                            )}
                                                            <div
                                                                className={`absolute top-2 left-2 flex h-5 w-5 items-center justify-center rounded border transition-colors ${
                                                                    isSelected
                                                                        ? "border-blue-400 bg-blue-500"
                                                                        : "border-gray-300 bg-[#F4F5F6]"
                                                                }`}
                                                            >
                                                                {isSelected && (
                                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-white">
                                                                        <polyline points="20 6 9 17 4 12"/>
                                                                    </svg>
                                                                )}
                                                            </div>
                                                            <span className="absolute top-2 right-2 rounded bg-black/50 px-2 py-0.5 text-[10px] font-medium text-white">
                                                                {layout.status}
                                                            </span>
                                                        </div>
                                                        <div className="p-3">
                                                            <div className="text-xs text-[#666666]">NÂ° {layout.number || '?'} Â· {layout.floor} floor</div>
                                                            <div className="mt-0.5 text-sm font-medium text-[#1A1A1A]">{layout.title}</div>
                                                            <div className="mt-1 flex items-center justify-between">
                                                                <span className="text-xs text-[#666666]">{layout.totalArea} mÂ²</span>
                                                                 <span className="text-sm font-semibold text-[#1A1A1A]">{Object.entries(layout.prices || {}).map(([curr, price]) => `${curr} ${price?.toLocaleString()}`).join(' / ')}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {similarRecommendation && (
                        <div className="mt-4 overflow-hidden rounded-xl border border-yellow-200 bg-yellow-50">
                            <div className="flex items-center gap-2 px-4 py-3">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9A7A1F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10"/>
                                    <line x1="12" y1="16" x2="12" y2="12"/>
                                    <line x1="12" y1="8" x2="12.01" y2="8"/>
                                </svg>
                                <span className="text-sm text-[#9A7A1F]">
                                    Selecting similar apartments is recommended for better user experience
                                </span>
                            </div>
                        </div>
                    )}

                    <div className="mt-6 flex gap-3">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="rounded-xl bg-[#4E525D] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:opacity-90 disabled:opacity-50"
                        >
                            {isSubmitting
                                ? "Saving..."
                                : isEdit
                                ? "Save Changes"
                                : "Create"}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate("/unit-layouts")}
                            className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm text-[#666666] transition-colors hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
                {isUnitTypeModalOpen ? (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#10182833] px-4">
                        <div className="w-full max-w-[420px] rounded-[24px] bg-white p-6 shadow-[0_24px_48px_rgba(16,24,40,0.18)]">
                            <div className="mb-5 flex items-center justify-between">
                                <h4 className="text-xl font-medium text-[#1A1A1A]">Create unit type</h4>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsUnitTypeModalOpen(false);
                                        setUnitTypeDraft({ name: "", title: "" });
                                    }}
                                    className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[#666]"
                                    disabled={createUnitTypeMutation.isPending}
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
                                            value={unitTypeDraft.name}
                                            onChange={(e) => setUnitTypeDraft((prev) => ({ ...prev, name: e.target.value }))}
                                            placeholder="2-room"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1.5 block text-xs text-[#4E525D]">Title</label>
                                        <input
                                            className="w-full h-10 rounded-xl border border-gray-200 bg-[#F4F5F6] px-3 text-sm outline-none focus:border-gray-400 focus:bg-white"
                                            value={unitTypeDraft.title}
                                            onChange={(e) => setUnitTypeDraft((prev) => ({ ...prev, title: e.target.value }))}
                                            placeholder="2 rooms"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsUnitTypeModalOpen(false);
                                        setUnitTypeDraft({ name: "", title: "" });
                                    }}
                                    className="rounded-full border border-[#C9CDD5] bg-white px-5 py-2.5 text-sm font-medium text-[#4E525D] transition-colors hover:bg-[#F8F9FB] disabled:opacity-50"
                                    disabled={createUnitTypeMutation.isPending}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCreateUnitType}
                                    className="rounded-full bg-[#4E525D] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:opacity-90 disabled:opacity-50"
                                    disabled={createUnitTypeMutation.isPending}
                                >
                                    {createUnitTypeMutation.isPending ? "Creating..." : "Add"}
                                </button>
                            </div>
                        </div>
                    </div>
                ) : null}
            </div>
        </div>
        </div>
    );
}
