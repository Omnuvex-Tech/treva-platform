import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    unitLayoutsApi,
    CreateUnitLayoutData,
    UploadResponse,
    Document,
    GalleryImage,
} from "../../api/unit-layouts";
import { categoriesApi, Category } from "../../api/categories";
import { roomOptionsApi, RoomOption } from "../../api/room-options";
import { viewOptionsApi, ViewOption } from "../../api/view-options";
import { statusOptionsApi, StatusOption } from "../../api/status-options";
import { FileUpload } from "../../components/FileUpload";
import { useMessageCenter } from "../../components/MessageCenter";
import { getApiErrorMessage } from "../../utils/apiError";
import { IoClose } from "react-icons/io5";

type Tab = "basic" | "area" | "location" | "documents" | "gallery" | "similar";

type ApiError = {
    response?: {
        data?: {
            message?: string | string[];
        };
    };
    message?: string;
};

const tabs: { key: Tab; label: string }[] = [
    { key: "basic", label: "Basic Info" },
    { key: "area", label: "Area & Pricing" },
    { key: "location", label: "Location & Building" },
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
    if (!form.floor && form.floor !== 0) errors.push({ field: "Floor", message: "Basic Info / Floor is required" });
    if (!form.number && form.number !== 0) errors.push({ field: "Number", message: "Basic Info / Number is required" });
    // if (!form.viewOptionId) errors.push({ field: "View", message: "Basic Info / View Option is required" }); // Optional if required
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

const validateLocationTab = (form: CreateUnitLayoutData): TabValidation => {
    const errors: ValidationError[] = [];
    if (!form.location?.title?.trim()) errors.push({ field: "Location Title", message: "Location & Building / Location Title is required" });
    if (!form.location?.url?.trim()) errors.push({ field: "Location URL", message: "Location & Building / Location URL is required" });
    if (!form.location?.type?.trim()) errors.push({ field: "Location Type", message: "Location & Building / Location Type is required" });
    if (!form.completionYear && form.completionYear !== 0) errors.push({ field: "Completion Year", message: "Location & Building / Completion Year is required" });
    if (!form.numberOfFloors?.start && form.numberOfFloors?.start !== 0) errors.push({ field: "Floors From", message: "Location & Building / Floors From is required" });
    if (!form.numberOfFloors?.end && form.numberOfFloors?.end !== 0) errors.push({ field: "Floors To", message: "Location & Building / Floors To is required" });
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
        case "location": return validateLocationTab(form);
        case "documents": return validateDocumentsTab(form);
        case "gallery": return validateGalleryTab(form);
        case "similar": return validateSimilarTab(form);
        default: return { valid: true, errors: [] };
    }
};

const tabOrder: Tab[] = ["basic", "area", "location", "documents", "gallery", "similar"];

export function UnitLayoutForm() {
    const { id } = useParams<{ id: string }>();
    const isEdit = !!id;
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { showError, showSuccess } = useMessageCenter();

    const [activeTab, setActiveTab] = useState<Tab>("basic");
    const [form, setForm] = useState<CreateUnitLayoutData>({
        title: "",
        name: "",
        slug: "",
        categoryId: "",
        roomOptionId: undefined,
        statusOptionId: undefined,
        floor: undefined as unknown as number,
        number: undefined as unknown as number,
        totalArea: undefined as unknown as number,
        internalArea: undefined as unknown as number,
        balconyArea: undefined as unknown as number,
        prices: {},
        completionYear: undefined as unknown as number,
        numberOfFloors: { start: undefined as unknown as number, end: undefined as unknown as number },
        viewOptionId: undefined,
        similarApartmentIds: [],
        mainImage: undefined,
        gallery: [],
        documents: [],
        location: { title: "", url: "", type: "" },
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

    const { data: roomOptionsResponse } = useQuery({
        queryKey: ["room-options"],
        queryFn: () => roomOptionsApi.getAll(),
    });

    const { data: viewOptionsResponse } = useQuery({
        queryKey: ["view-options"],
        queryFn: () => viewOptionsApi.getAll(),
    });

    const { data: statusOptionsResponse } = useQuery({
        queryKey: ["status-options"],
        queryFn: () => statusOptionsApi.getAll(),
    });

    const { data: currenciesResponse } = useQuery({
        queryKey: ["currencies"],
        queryFn: () => import("../../api/currencies").then(m => m.currenciesApi.getAll()),
    });
    const currencies = Array.isArray(currenciesResponse?.data) ? currenciesResponse.data : [];

    const [similarSearch, setSimilarSearch] = useState("");
    const [categoryOpen, setCategoryOpen] = useState(false);
    const [roomOptionOpen, setRoomOptionOpen] = useState(false);
    const [viewOptionOpen, setViewOptionOpen] = useState(false);
    const [statusOpen, setStatusOpen] = useState(false);
    const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
    const [currentTabError, setCurrentTabError] = useState<ValidationError[]>([]);
    const [similarRecommendation, setSimilarRecommendation] = useState(false);
    const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
    const categoryRef = useRef<HTMLDivElement>(null);
    const roomOptionRef = useRef<HTMLDivElement>(null);
    const viewOptionRef = useRef<HTMLDivElement>(null);
    const statusRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (categoryRef.current && !categoryRef.current.contains(e.target as Node)) setCategoryOpen(false);
            if (roomOptionRef.current && !roomOptionRef.current.contains(e.target as Node)) setRoomOptionOpen(false);
            if (viewOptionRef.current && !viewOptionRef.current.contains(e.target as Node)) setViewOptionOpen(false);
            if (statusRef.current && !statusRef.current.contains(e.target as Node)) setStatusOpen(false);
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
                statusOptionId: d.statusOptionId ?? undefined,
                floor: d.floor ?? 1,
                number: d.number ?? 0,
                totalArea: d.totalArea ?? 0,
                internalArea: d.internalArea ?? 0,
                balconyArea: d.balconyArea ?? 0,
                prices: d.prices || {},
                completionYear: d.completionYear ?? 2030,
                numberOfFloors: d.numberOfFloors || { start: 1, end: 1 },
                viewOptionId: d.viewOptionId ?? undefined,
                similarApartmentIds: d.similarApartmentIds || [],
                mainImage: d.mainImage ?? undefined,
                gallery: Array.isArray(d.gallery) ? d.gallery : [],
                documents: Array.isArray(d.documents) ? d.documents : [],
                location: d.location || { title: "", url: "", type: "apartment" },
                roomOptionId: d.roomOptionId ?? undefined,
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
            setValidationErrors(allErrors);
            const firstInvalidTab = tabOrder.find((tab) => !validateTab(tab, form).valid);
            if (firstInvalidTab) {
                setActiveTab(firstInvalidTab);
                setCurrentTabError(validateTab(firstInvalidTab, form).errors);
            }
            return;
        }

        const hasSimilar = form.similarApartmentIds && form.similarApartmentIds.length > 0;
        setSimilarRecommendation(!hasSimilar);

        setValidationErrors([]);
        setCurrentTabError([]);

        if (isEdit) {
            updateMutation.mutate(form);
        } else {
            createMutation.mutate(form);
        }
    };

    const handleTabClick = (tab: Tab) => {
        const currentIndex = tabOrder.indexOf(activeTab);
        const targetIndex = tabOrder.indexOf(tab);

        if (targetIndex > currentIndex) {
            const result = validateTab(activeTab, form);
            if (!result.valid) {
                setCurrentTabError(result.errors);
                setValidationErrors(result.errors);
                return;
            }
        }

        setCurrentTabError([]);
        setValidationErrors([]);
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
        if (currentTabError.length > 0) {
            setCurrentTabError((prev) => prev.filter((e) => !e.field.toLowerCase().includes(String(key).toLowerCase())));
        }
    };

    const updateLocation = (
        key: keyof NonNullable<CreateUnitLayoutData["location"]>,
        value: string
    ) => {
        setForm((prev) => ({
            ...prev,
            location: { ...prev.location!, [key]: value },
        }));
        if (currentTabError.length > 0) {
            setCurrentTabError((prev) => prev.filter((e) => !e.field.toLowerCase().includes(String(key).toLowerCase())));
        }
    };

    const updateFloors = (key: "start" | "end", value: number | undefined) => {
        setForm((prev) => ({
            ...prev,
            numberOfFloors: { ...prev.numberOfFloors, [key]: value },
        }));
        if (currentTabError.length > 0) {
            setCurrentTabError((prev) => prev.filter((e) => !e.field.toLowerCase().includes(key)));
        }
    };

    const handleMainImageUpload = (result: UploadResponse) => {
        setForm((prev) => ({
            ...prev,
            mainImage: { url: result.url, alt: result.alt },
        }));
        if (currentTabError.length > 0) {
            setCurrentTabError((prev) => prev.filter((e) => !e.field.toLowerCase().includes("main")));
        }
    };

    const handleGalleryUpload = (result: UploadResponse) => {
        setForm((prev) => ({
            ...prev,
            gallery: [...(prev.gallery || []), { url: result.url, alt: result.alt }],
        }));
        if (currentTabError.length > 0) {
            setCurrentTabError((prev) => prev.filter((e) => !e.field.toLowerCase().includes("gallery")));
        }
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
        if (currentTabError.length > 0) {
            setCurrentTabError((prev) => prev.filter((e) => !e.field.toLowerCase().includes("document")));
        }
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
        if (currentTabError.length > 0) {
            setCurrentTabError((prev) => prev.filter((e) => !e.field.toLowerCase().includes("similar")));
        }
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
    const roomOptions = Array.isArray(roomOptionsResponse?.data)
        ? (roomOptionsResponse.data as RoomOption[])
        : [];
    const viewOptions = Array.isArray(viewOptionsResponse?.data)
        ? (viewOptionsResponse.data as ViewOption[])
        : [];
    const statusOptions = Array.isArray(statusOptionsResponse?.data)
        ? (statusOptionsResponse.data as StatusOption[])
        : [];
    const mutationError =
        createMutation.error || updateMutation.error;
    const mutationErrorMessage = (() => {
        const apiError = mutationError as ApiError | null;
        const message = apiError?.response?.data?.message;
        if (Array.isArray(message)) return message.join(", ");
        return message || apiError?.message || "An error occurred";
    })();
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
                            const tabResult = validateTab(tab.key, form);
                            const isActive = activeTab === tab.key;
                            const hasError = !tabResult.valid;
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
                                    {hasError && !isActive && (
                                        <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#ff6767] opacity-75"></span>
                                            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#ff6767]"></span>
                                        </span>
                                    )}
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
                                        <div ref={statusRef} className="relative">
                                            <button
                                                type="button"
                                                onClick={() => setStatusOpen((p) => !p)}
                                                className="flex w-full items-center justify-between rounded-xl border border-gray-200 bg-[#F4F5F6] px-4 h-10 text-sm text-[#1A1A1A] focus:border-gray-400 focus:outline-none"
                                            >
                                                <span className={form.statusOptionId ? "text-[#1A1A1A]" : "text-[#999]"}>
                                                    {statusOptions.find((s) => s.id === form.statusOptionId)?.value || "Select status (optional)"}
                                                </span>
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={`transition-transform ${statusOpen ? "rotate-180" : ""}`}>
                                                    <path d="M6 9l6 6 6-6" />
                                                </svg>
                                            </button>
                                            {statusOpen && (
                                                <div className="absolute top-full left-0 z-50 mt-1 w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
                                                    <button
                                                        type="button"
                                                        onClick={() => { updateField("statusOptionId", undefined); setStatusOpen(false); }}
                                                        className={`flex w-full items-center px-4 py-2.5 text-left text-sm transition-colors ${
                                                            !form.statusOptionId
                                                                ? "bg-[#4E525D]/10 text-[#1A1A1A] font-medium"
                                                                : "text-[#666666] hover:bg-gray-50 hover:text-[#1A1A1A]"
                                                        }`}
                                                    >
                                                        â€” None
                                                    </button>
                                                    {statusOptions.map((opt) => (
                                                        <button
                                                            key={opt.id}
                                                            type="button"
                                                            onClick={() => { updateField("statusOptionId", opt.id); setStatusOpen(false); }}
                                                            className={`flex w-full items-center px-4 py-2.5 text-left text-sm transition-colors ${
                                                                form.statusOptionId === opt.id
                                                                    ? "bg-[#4E525D]/10 text-[#1A1A1A] font-medium"
                                                                    : "text-[#666666] hover:bg-gray-50 hover:text-[#1A1A1A]"
                                                            }`}
                                                        >
                                                            {opt.value}
                                                        </button>
                                                    ))}
                                                    {statusOptions.length === 0 && (
                                                        <div className="px-4 py-3 text-sm text-[#999]">
                                                            No status options yet. Add them in Status Options.
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-[#4E525D]">
                                        Room Option
                                    </label>
                                    <div ref={roomOptionRef} className="relative">
                                        <button
                                            type="button"
                                            onClick={() => setRoomOptionOpen((p) => !p)}
                                            className="flex w-full items-center justify-between rounded-xl border border-gray-200 bg-[#F4F5F6] px-4 h-10 text-sm text-[#1A1A1A] focus:border-gray-400 focus:outline-none"
                                        >
                                            <span className={form.roomOptionId ? "text-[#1A1A1A]" : "text-[#999]"}>
                                                {roomOptions.find((r) => r.id === form.roomOptionId)?.title || "Select room option (optional)"}
                                            </span>
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={`transition-transform ${roomOptionOpen ? "rotate-180" : ""}`}>
                                                <path d="M6 9l6 6 6-6" />
                                            </svg>
                                        </button>
                                        {roomOptionOpen && (
                                            <div className="absolute top-full left-0 z-50 mt-1 w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
                                                <button
                                                    type="button"
                                                    onClick={() => { updateField("roomOptionId", undefined); setRoomOptionOpen(false); }}
                                                    className={`flex w-full items-center px-4 py-2.5 text-left text-sm transition-colors ${
                                                        !form.roomOptionId
                                                            ? "bg-[#4E525D]/10 text-[#1A1A1A] font-medium"
                                                            : "text-[#666666] hover:bg-gray-50 hover:text-[#1A1A1A]"
                                                    }`}
                                                >
                                                    â€” None
                                                </button>
                                                {roomOptions.map((opt) => (
                                                    <button
                                                        key={opt.id}
                                                        type="button"
                                                        onClick={() => { updateField("roomOptionId", opt.id); setRoomOptionOpen(false); }}
                                                        className={`flex w-full items-center px-4 py-2.5 text-left text-sm transition-colors ${
                                                            form.roomOptionId === opt.id
                                                                ? "bg-[#4E525D]/10 text-[#1A1A1A] font-medium"
                                                                : "text-[#666666] hover:bg-gray-50 hover:text-[#1A1A1A]"
                                                        }`}
                                                    >
                                                        {opt.title}
                                                    </button>
                                                ))}
                                                {roomOptions.length === 0 && (
                                                    <div className="px-4 py-3 text-sm text-[#999]">
                                                        No room options yet. Add them in Room Options.
                                                    </div>
                                                )}
                                            </div>
                                        )}
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
                                            View Option
                                        </label>
                                        <div ref={viewOptionRef} className="relative">
                                            <button
                                                type="button"
                                                onClick={() => setViewOptionOpen((p) => !p)}
                                                className="flex w-full items-center justify-between rounded-xl border border-gray-200 bg-[#F4F5F6] px-4 h-10 text-sm text-[#1A1A1A] focus:border-gray-400 focus:outline-none"
                                            >
                                                <span className={form.viewOptionId ? "text-[#1A1A1A]" : "text-[#999]"}>
                                                    {viewOptions.find((v) => v.id === form.viewOptionId)?.title || "Select view option (optional)"}
                                                </span>
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={`transition-transform ${viewOptionOpen ? "rotate-180" : ""}`}>
                                                    <path d="M6 9l6 6 6-6" />
                                                </svg>
                                            </button>
                                            {viewOptionOpen && (
                                                <div className="absolute top-full left-0 z-50 mt-1 w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
                                                    <button
                                                        type="button"
                                                        onClick={() => { updateField("viewOptionId", undefined); setViewOptionOpen(false); }}
                                                        className={`flex w-full items-center px-4 py-2.5 text-left text-sm transition-colors ${
                                                            !form.viewOptionId
                                                                ? "bg-[#4E525D]/10 text-[#1A1A1A] font-medium"
                                                                : "text-[#666666] hover:bg-gray-50 hover:text-[#1A1A1A]"
                                                        }`}
                                                    >
                                                        â€” None
                                                    </button>
                                                    {viewOptions.map((opt) => (
                                                        <button
                                                            key={opt.id}
                                                            type="button"
                                                            onClick={() => { updateField("viewOptionId", opt.id); setViewOptionOpen(false); }}
                                                            className={`flex w-full items-center px-4 py-2.5 text-left text-sm transition-colors ${
                                                                form.viewOptionId === opt.id
                                                                    ? "bg-[#4E525D]/10 text-[#1A1A1A] font-medium"
                                                                    : "text-[#666666] hover:bg-gray-50 hover:text-[#1A1A1A]"
                                                            }`}
                                                        >
                                                            {opt.title}
                                                        </button>
                                                    ))}
                                                    {viewOptions.length === 0 && (
                                                        <div className="px-4 py-3 text-sm text-[#999]">
                                                            No view options yet. Add them in View Options.
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
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
                                        <div key={curr.id}>
                                            <label className="mb-1 block text-xs font-medium text-[#4E525D]">
                                                Price ({curr.title || curr.name || curr.value})
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
                                    {currencies.length === 0 && (
                                        <>
                                            <div>
                                                <label className="mb-1 block text-xs font-medium text-[#4E525D]">
                                                    Price (USD)
                                                </label>
                                                <input
                                                    type="number"
                                                    value={form.prices?.["USD"] || ""}
                                                    onChange={(e) =>
                                                        updateField(
                                                            "prices",
                                                            {
                                                                ...form.prices,
                                                                USD: e.target.value ? parseFloat(e.target.value) : 0,
                                                            }
                                                        )
                                                    }
                                                    placeholder="120,000"
                                                    className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-[#F4F5F6] text-sm text-[#1A1A1A] placeholder-[#999] outline-none focus:bg-white focus:border-gray-400"
                                                    min={0}
                                                />
                                            </div>
                                            <div>
                                                <label className="mb-1 block text-xs font-medium text-[#4E525D]">
                                                    Price (AZN)
                                                </label>
                                                <input
                                                    type="number"
                                                    value={form.prices?.["AZN"] || ""}
                                                    onChange={(e) =>
                                                        updateField(
                                                            "prices",
                                                            {
                                                                ...form.prices,
                                                                AZN: e.target.value ? parseFloat(e.target.value) : 0,
                                                            }
                                                        )
                                                    }
                                                    placeholder="204,000"
                                                    className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-[#F4F5F6] text-sm text-[#1A1A1A] placeholder-[#999] outline-none focus:bg-white focus:border-gray-400"
                                                    min={0}
                                                />
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === "location" && (
                            <div className="flex flex-col gap-4">
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-[#4E525D]">
                                        Location Title
                                    </label>
                                    <input
                                        type="text"
                                        value={form.location?.title || ""}
                                        onChange={(e) =>
                                            updateLocation("title", e.target.value)
                                        }
                                        placeholder="Sea Breeze Resort, Nardaran District"
                                        className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-[#F4F5F6] text-sm text-[#1A1A1A] placeholder-[#999] outline-none focus:bg-white focus:border-gray-400"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-[#4E525D]">
                                        Location URL
                                    </label>
                                        <input
                                            type="text"
                                            value={form.location?.url || ""}
                                            onChange={(e) =>
                                                updateLocation("url", e.target.value)
                                            }
                                            placeholder="https://maps.google.com/..."
                                            className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-[#F4F5F6] text-sm text-[#1A1A1A] placeholder-[#999] outline-none focus:bg-white focus:border-gray-400"
                                            required
                                        />
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-[#4E525D]">
                                        Location Type
                                    </label>
                                    <input
                                        type="text"
                                        value={form.location?.type || ""}
                                        onChange={(e) =>
                                            updateLocation("type", e.target.value)
                                        }
                                        placeholder="For example: Apartment"
                                        className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-[#F4F5F6] text-sm text-[#1A1A1A] placeholder-[#999] outline-none focus:bg-white focus:border-gray-400"
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

                    {currentTabError.length > 0 && (
                        <div className="mt-4 overflow-hidden rounded-xl border border-red-200 bg-red-50">
                            <div className="flex items-center gap-2 border-b border-red-100 bg-red-50 px-4 py-2.5">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C3362B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10"/>
                                    <line x1="12" y1="8" x2="12" y2="12"/>
                                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                                </svg>
                                <span className="text-sm font-medium text-[#C3362B]">
                                    Please fill in all required fields
                                </span>
                            </div>
                            <div className="px-4 py-3">
                                <ul className="flex flex-col gap-1.5">
                                    {currentTabError.map((err, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm text-[#C3362B]">
                                            <span className="mt-1.5 block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#C3362B]" />
                                            {err.message}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}

                    {mutationError && (
                        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-center text-sm text-[#C3362B]">
                            {mutationErrorMessage}
                        </div>
                    )}

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
            </div>
        </div>
        </div>
    );
}
