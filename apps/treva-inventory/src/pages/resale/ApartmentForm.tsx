import { useState, useEffect, useRef, useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { apartmentsApi, CreateApartmentData, type ApartmentFurnishing, type ApartmentRenovation, UploadResponse } from "../../api/apartments";
import { apartmentTypesApi, ApartmentType } from "../../api/apartment-types";
import { ownersApi, Owner } from "../../api/owners";
import { attributesApi, Attribute } from "../../api/attributes";
import { currenciesApi, Currency } from "../../api/currencies";
import { locationOptionsApi, type LocationOption } from "../../api/location-options";
import { viewOptionsApi, type ViewOption } from "../../api/view-options";
import { heatingTypeOptionsApi, type HeatingTypeOption } from "../../api/heating-type-options";
import { ImageAssetCard } from "../../components/ImageAssetCard";
import { useMessageCenter } from "../../components/MessageCenter";
import { getApiErrorMessage } from "../../utils/apiError";
import { IoClose } from "react-icons/io5";
import { FormKeywordInput } from "@repo/ui";

type TabKey = "basic" | "area" | "location" | "gallery" | "description" | "seo";

const TABS: { key: TabKey; label: string }[] = [
    { key: "basic", label: "Basic Info" },
    { key: "area", label: "Area & Pricing" },
    { key: "location", label: "Location" },
    { key: "gallery", label: "Gallery" },
    { key: "description", label: "Description" },
    { key: "seo", label: "SEO" },
];

const SUPPORTED_IMAGE_UPLOAD_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"] as const;
const IMAGE_UPLOAD_ACCEPT = SUPPORTED_IMAGE_UPLOAD_TYPES.join(",");
const MAX_RESALE_FLOOR = 999;

function slugify(text: string): string {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
}

function parseKeywordString(value?: string | null) {
    if (!value) return [];

    return value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
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

function CustomSelect({
    label,
    value,
    options,
    placeholder,
    onChange,
    noOptionsLabel,
    onNoOptionsClick,
    multiSelect = false,
}: {
    label: string;
    value: string | string[];
    options: { id: string; label: string }[];
    placeholder: string;
    onChange: (value: string | string[]) => void;
    noOptionsLabel?: string;
    onNoOptionsClick?: () => void;
    multiSelect?: boolean;
}) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const selectedIds = Array.isArray(value) ? value : value ? [value] : [];
    const selectedOptions = options.filter((option) => selectedIds.includes(option.id));
    const displayValue = multiSelect
        ? selectedOptions.length <= 2
            ? selectedOptions.map((option) => option.label).join(", ")
            : `${selectedOptions.slice(0, 2).map((option) => option.label).join(", ")} +${selectedOptions.length - 2}`
        : selectedOptions[0]?.label;

    const handleOptionClick = (id: string) => {
        if (multiSelect) {
            const nextValue = selectedIds.includes(id)
                ? selectedIds.filter((item) => item !== id)
                : [...selectedIds, id];
            onChange(nextValue);
            return;
        }

        onChange(id);
        setOpen(false);
    };

    return (
        <div ref={ref} className="relative">
            <label className="mb-1.5 block text-xs font-medium text-[#4E525D]">{label}</label>
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="flex h-11 w-full items-center justify-between rounded-2xl border border-[#E7E9EE] bg-[#F8F9FB] px-4 text-sm text-[#1A1A1A] outline-none transition-colors focus:border-[#C8CDD8]"
            >
                <span className={`truncate text-left ${displayValue ? "text-[#1A1A1A]" : "text-[#999]"}`}>{displayValue || placeholder}</span>
                <svg
                    width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                    className={open ? "rotate-180 transition-transform" : "transition-transform"}
                >
                    <path d="M6 9l6 6 6-6" />
                </svg>
            </button>
            {open && (
                <div className="absolute left-0 top-full z-50 mt-2 w-full overflow-hidden rounded-2xl border border-[#E7E9EE] bg-white shadow-lg">
                    <button
                        type="button"
                        className="w-full px-4 py-2.5 text-left text-sm text-[#666666] hover:bg-gray-50 hover:text-[#1A1A1A]"
                        onClick={() => {
                            onChange(multiSelect ? [] : "");
                            setOpen(false);
                        }}
                    >
                        {multiSelect ? "Clear selection" : "-- None"}
                    </button>
                    {options.map((opt) => (
                        <button
                            key={opt.id}
                            type="button"
                            className={`flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-sm transition-colors ${
                                selectedIds.includes(opt.id)
                                    ? "bg-[#4E525D]/10 text-[#1A1A1A] font-medium"
                                    : "text-[#666666] hover:bg-gray-50 hover:text-[#1A1A1A]"
                            }`}
                            onClick={() => handleOptionClick(opt.id)}
                        >
                            <span>{opt.label}</span>
                            {selectedIds.includes(opt.id) ? (
                                <span className="text-xs font-semibold text-[#4E525D]">Selected</span>
                            ) : null}
                        </button>
                    ))}
                    {options.length === 0 && (
                        onNoOptionsClick ? (
                            <button
                                type="button"
                                className="w-full px-4 py-2.5 text-left text-sm font-medium text-[#4E525D] transition-colors hover:bg-gray-50 hover:text-[#1A1A1A]"
                                onClick={() => {
                                    setOpen(false);
                                    onNoOptionsClick();
                                }}
                            >
                                {noOptionsLabel || "Create"}
                            </button>
                        ) : (
                            <div className="px-4 py-2.5 text-sm text-[#999]">No options yet</div>
                        )
                    )}
                </div>
            )}
        </div>
    );
}

export function ApartmentForm({ embedded = false }: { embedded?: boolean } = {}) {
    const { id } = useParams();
    const isEdit = Boolean(id);
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { showError, showSuccess } = useMessageCenter();

    const [activeTab, setActiveTab] = useState<TabKey>("basic");
    const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
    const [seoTitleManuallyEdited, setSeoTitleManuallyEdited] = useState(false);

    const { data: types } = useQuery({
        queryKey: ["apartment-types"],
        queryFn: () => apartmentTypesApi.getAll(),
    });

    const { data: owners } = useQuery({
        queryKey: ["owners"],
        queryFn: () => ownersApi.getAll(),
    });

    const { data: attributes } = useQuery({
        queryKey: ["attributes"],
        queryFn: () => attributesApi.getAll(),
    });

    const { data: currencies } = useQuery({
        queryKey: ["currencies"],
        queryFn: () => currenciesApi.getAll(),
    });

    const { data: locationOptions } = useQuery({
        queryKey: ["location-options"],
        queryFn: () => locationOptionsApi.getAll(),
    });

    const { data: viewOptionsRes } = useQuery({
        queryKey: ["view-options"],
        queryFn: () => viewOptionsApi.getAll(),
    });

    const { data: heatingTypeOptionsRes } = useQuery({
        queryKey: ["heating-type-options"],
        queryFn: () => heatingTypeOptionsApi.getAll(),
    });

    const { data: existing } = useQuery({
        queryKey: ["apartment", id],
        queryFn: () => apartmentsApi.getById(id!),
        enabled: isEdit,
    });

    const [form, setForm] = useState<CreateApartmentData>({
        name: "",
        title: "",
        slug: "",
        description: "",
        seoTitle: "",
        seoDescription: "",
        seoKeywords: "",
        canonicalUrl: "",
        seoImage: "",
        image: "",
        coverImage: "",
        gallery: [],
        priceTotal: undefined as unknown as number,
        priceByArea: undefined as unknown as number,
        roomCount: undefined as unknown as number,
        area: undefined as unknown as number,
        grossArea: undefined as unknown as number,
        floorFrom: undefined as unknown as number,
        floorTo: undefined as unknown as number,
        bathroomCount: undefined as unknown as number,
        purpose: "sale",
        region: "",
        city: "",
        locationTitle: "",
        locationUrl: "",
        renovation: undefined,
        mortgage: undefined,
        extract: undefined,
        parking: undefined,
        buildingAge: undefined as unknown as number,
        furnishing: undefined,
        elevator: undefined,
        ceilingHeight: undefined as unknown as number,
        heatingTypeIds: [],
        viewOptionIds: [],
        apartmentTypeId: "",
        ownerId: "",
        attributeIds: [],
        requestIds: [],
        status: "active" as "active" | "reserved" | "sold",
        prices: [],
    });

    useEffect(() => {
        if (existing?.data) {
            const d = existing.data;
            setForm({
                name: d.name || "",
                title: d.title || "",
                slug: d.slug || "",
                description: d.description || "",
                seoTitle: d.seoTitle || "",
                seoDescription: d.seoDescription || "",
                seoKeywords: d.seoKeywords || "",
                canonicalUrl: d.canonicalUrl || "",
                seoImage: d.seoImage || "",
                image: d.image || "",
                coverImage: d.coverImage || "",
                gallery: d.gallery || [],
                priceTotal: d.priceTotal,
                priceByArea: d.priceByArea,
                roomCount: d.roomCount,
                area: d.area,
                grossArea: d.grossArea ?? undefined,
                floorFrom: d.floorFrom,
                floorTo: d.floorTo,
                bathroomCount: d.bathroomCount ?? undefined,
                purpose: d.purpose || "sale",
                region: d.region || "",
                city: d.city || "",
                locationTitle: d.locationTitle || "",
                locationUrl: d.locationUrl || "",
                renovation: d.renovation || undefined,
                mortgage: d.mortgage ?? undefined,
                extract: d.extract ?? undefined,
                parking: d.parking ?? undefined,
                buildingAge: d.buildingAge ?? undefined,
                furnishing: d.furnishing || undefined,
                elevator: d.elevator ?? undefined,
                ceilingHeight: d.ceilingHeight ?? undefined,
                heatingTypeIds: d.heatingTypeIds || (d.heatingTypes || []).map((item) => item.id),
                viewOptionIds: d.viewOptionIds || (d.viewOptions || []).map((item) => item.id),
                apartmentTypeId: d.apartmentTypeId || "",
                ownerId: d.ownerId || "",
                attributeIds: d.attributeIds || [],
                requestIds: d.requestIds || [],
                status: d.status || "active",
                prices: (d.prices || []).map((p: any) => ({ currencyId: p.currencyId, priceTotal: p.priceTotal, priceByArea: p.priceByArea })),
            });
            setSlugManuallyEdited(Boolean(d.slug));
            setSeoTitleManuallyEdited(Boolean(d.seoTitle));
        }
    }, [existing?.data]);

    const handleSlugFromTitle = (title: string) => {
        const nextSlug = slugify(title);
        setForm((f) => ({
            ...f,
            ...(!slugManuallyEdited ? { slug: nextSlug } : {}),
            ...(!seoTitleManuallyEdited ? { seoTitle: title } : {}),
        }));
    };

    const updateField = (field: keyof CreateApartmentData, value: any) => {
        setForm((f) => ({ ...f, [field]: value }));
    };

    const createMutation = useMutation({
        mutationFn: (data: CreateApartmentData) => apartmentsApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["apartments"] });
            showSuccess({ title: "Apartment created" });
            navigate("/dashboard/resale/apartments");
        },
        onError: (error) => {
            showError({
                title: "Apartment could not be created",
                description: getApiErrorMessage(error, "Please try again."),
            });
        },
    });

    const updateMutation = useMutation({
        mutationFn: (data: CreateApartmentData) => apartmentsApi.update(id!, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["apartments"] });
            queryClient.invalidateQueries({ queryKey: ["apartment", id] });
            showSuccess({ title: "Apartment updated" });
            navigate("/dashboard/resale/apartments");
        },
        onError: (error) => {
            showError({
                title: "Apartment could not be updated",
                description: getApiErrorMessage(error, "Please try again."),
            });
        },
    });

    const validateTab = (tab: TabKey, sourceForm: CreateApartmentData = form): string[] => {
        const errors: string[] = [];
        switch (tab) {
            case "basic":
                if (!sourceForm.name?.trim()) errors.push("Name is required");
                if (!sourceForm.title?.trim()) errors.push("Title is required");
                if (!sourceForm.purpose?.trim()) errors.push("Offer Type is required");
                if (!sourceForm.apartmentTypeId) errors.push("Type is required");
                if (!sourceForm.floorTo || sourceForm.floorTo < 1) errors.push("Number Of Floor is required");
                if (sourceForm.floorTo && sourceForm.floorTo > MAX_RESALE_FLOOR) errors.push(`Number Of Floor must be <= ${MAX_RESALE_FLOOR}`);
                if (!sourceForm.floorFrom || sourceForm.floorFrom < 1) errors.push("Floor is required");
                if (sourceForm.floorFrom && sourceForm.floorFrom > MAX_RESALE_FLOOR) errors.push(`Floor must be <= ${MAX_RESALE_FLOOR}`);
                if (sourceForm.floorFrom && sourceForm.floorTo && sourceForm.floorFrom > sourceForm.floorTo) errors.push("Floor cannot be greater than Number Of Floor");
                if (!sourceForm.roomCount || sourceForm.roomCount < 1) errors.push("Room Count is required");
                if (!sourceForm.image?.trim()) errors.push("Main Image is required");
                break;
            case "area":
                if (!sourceForm.area || sourceForm.area <= 0) errors.push("Area is required");
                if (!sourceForm.prices || sourceForm.prices.length === 0) {
                    errors.push("At least one currency price is required");
                } else {
                    const hasAnyTotal = sourceForm.prices.some((p) => p.priceTotal && p.priceTotal > 0);
                    const hasAnyPerArea = sourceForm.prices.some((p) => p.priceByArea && p.priceByArea > 0);
                    if (!hasAnyTotal) errors.push("Price Total is required");
                    if (!hasAnyPerArea) errors.push("Price per mÂ² is required");
                }
                break;
            case "location":
                if (!sourceForm.locationTitle?.trim()) errors.push("Location Title is required");
                break;
            case "gallery":
                break;
            case "seo":
                if (!sourceForm.slug?.trim()) errors.push("Slug is required");
                break;
        }
        return errors;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const issues = TABS.flatMap((tab) =>
            validateTab(tab.key).map((message) => ({
                tabLabel: tab.label,
                message,
            }))
        );

        if (issues.length > 0) {
            const lastIssue = issues[issues.length - 1];
            if (!lastIssue) return;
            showError({
                title: lastIssue.message,
                description: `${lastIssue.tabLabel} section`,
            });
            return;
        }
        const submitData = {
            ...form,
            prices: (form.prices || []).map((p: any) => ({
                currencyId: p.currencyId,
                priceTotal: p.priceTotal,
                priceByArea: p.priceByArea,
            })),
        };
        if (isEdit) {
            updateMutation.mutate(submitData);
        } else {
            createMutation.mutate(submitData);
        }
    };

    const inputClass =
        "w-full h-11 rounded-2xl border border-[#E7E9EE] bg-[#F8F9FB] px-4 py-0 text-sm leading-5 text-[#1A1A1A] placeholder-[#999] outline-none transition-colors focus:border-[#C8CDD8] focus:bg-white";

    // â”€â”€â”€ Gallery Upload â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState("");
    const [mainDrag, setMainDrag] = useState(false);
    const [coverDrag, setCoverDrag] = useState(false);
    const [seoDrag, setSeoDrag] = useState(false);
    const [galleryDrag, setGalleryDrag] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const coverInputRef = useRef<HTMLInputElement>(null);
    const seoInputRef = useRef<HTMLInputElement>(null);
    const galleryInputRef = useRef<HTMLInputElement>(null);

    const validateImageFiles = (files: FileList | File[]) => {
        const items = Array.from(files);
        const hasUnsupportedFile = items.some((file) => !SUPPORTED_IMAGE_UPLOAD_TYPES.includes(file.type as typeof SUPPORTED_IMAGE_UPLOAD_TYPES[number]));

        if (hasUnsupportedFile) {
            setUploadError("Only JPEG, PNG, WebP and GIF images are allowed");
            return null;
        }

        return items;
    };

    const handleMainImageUpload = async (file: File) => {
        if (!validateImageFiles([file])) return;

        setUploading(true);
        setUploadError("");
        try {
            const res = await apartmentsApi.uploadFile(file);
            updateField("image", res.data.url);
        } catch (error) {
            setUploadError(getApiErrorMessage(error, "Main image upload failed"));
        } finally {
            setUploading(false);
        }
    };

    const handleCoverImageUpload = async (file: File) => {
        if (!validateImageFiles([file])) return;

        setUploading(true);
        setUploadError("");
        try {
            const res = await apartmentsApi.uploadFile(file);
            updateField("coverImage", res.data.url);
        } catch (error) {
            setUploadError(getApiErrorMessage(error, "Cover image upload failed"));
        } finally {
            setUploading(false);
        }
    };

    const handleGalleryUpload = async (files: FileList | File[]) => {
        const arr = validateImageFiles(files);
        if (!arr) return;

        const currentCount = form.gallery?.length || 0;
        if (currentCount + arr.length > 20) {
            setUploadError(`Maximum 20 gallery images allowed. You can add ${20 - currentCount} more.`);
            return;
        }
        setUploading(true);
        setUploadError("");
        try {
            const newItems: any[] = [];
            for (const file of arr) {
                const res = await apartmentsApi.uploadFile(file);
                newItems.push(res.data);
            }
            setForm((f) => ({ ...f, gallery: [...(f.gallery || []), ...newItems] }));
        } catch (error) {
            setUploadError(getApiErrorMessage(error, "Gallery upload failed"));
        } finally {
            setUploading(false);
        }
    };

    const handleSeoImageUpload = async (file: File) => {
        if (!validateImageFiles([file])) return;

        setUploading(true);
        setUploadError("");
        try {
            const res = await apartmentsApi.uploadFile(file);
            updateField("seoImage", res.data.url);
        } catch (error) {
            setUploadError(getApiErrorMessage(error, "SEO image upload failed"));
        } finally {
            setUploading(false);
        }
    };

    const removeGalleryItem = (index: number) => {
        setForm((f) => ({
            ...f,
            gallery: (f.gallery || []).filter((_: any, i: number) => i !== index),
        }));
    };

    const onMainDragOver = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); };
    const onMainDragEnter = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setMainDrag(true); };
    const onMainDragLeave = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setMainDrag(false); };
    const onMainDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setMainDrag(false);
        const file = e.dataTransfer.files?.[0];
        if (file) handleMainImageUpload(file);
    };

    const onCoverDragOver = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); };
    const onCoverDragEnter = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setCoverDrag(true); };
    const onCoverDragLeave = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setCoverDrag(false); };
    const onCoverDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setCoverDrag(false);
        const file = e.dataTransfer.files?.[0];
        if (file) handleCoverImageUpload(file);
    };

    const onSeoDragOver = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); };
    const onSeoDragEnter = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setSeoDrag(true); };
    const onSeoDragLeave = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setSeoDrag(false); };
    const onSeoDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setSeoDrag(false);
        const file = e.dataTransfer.files?.[0];
        if (file) handleSeoImageUpload(file);
    };

    const onGalleryDragOver = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); };
    const onGalleryDragEnter = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setGalleryDrag(true); };
    const onGalleryDragLeave = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setGalleryDrag(false); };
    const onGalleryDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setGalleryDrag(false);
        const files = e.dataTransfer.files;
        if (files && files.length > 0) handleGalleryUpload(files);
    };

    const locationOptionItems = Array.isArray(locationOptions?.data) ? locationOptions.data : [];
    const viewOptionItems = Array.isArray(viewOptionsRes?.data) ? viewOptionsRes.data : [];
    const heatingTypeItems = Array.isArray(heatingTypeOptionsRes?.data) ? heatingTypeOptionsRes.data : [];
    const toLocationDropdownOptions = (type: "region" | "city", selectedValue?: string, cityTitle?: string) => {
        const mapped = locationOptionItems
            .filter((item: LocationOption) => {
                if (item.type !== type) return false;
                if (type === "region" && cityTitle) {
                    return item.city?.title === cityTitle;
                }
                return true;
            })
            .map((item: LocationOption) => ({
                id: item.title,
                label: item.title,
            }));

        if (selectedValue && !mapped.some((item) => item.id === selectedValue)) {
            mapped.unshift({ id: selectedValue, label: selectedValue });
        }

        return mapped;
    };

    const toSimpleOptions = <T extends { id: string; title: string }>(items: T[]) => {
        return items.map((item) => ({
            id: item.id,
            label: item.title,
        }));
    };

    // â”€â”€â”€ Render â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const formContent = (
        <div className="rounded-[32px] border border-[#ECEEF2] bg-[#FCFCFD] p-6 shadow-[0_10px_30px_rgba(17,24,39,0.04)]">
            <div className="mb-6 flex flex-wrap gap-2 rounded-[24px] border border-[#ECEEF2] bg-white p-2">
                {TABS.map((tab) => {
                    return (
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
                    );
                })}
            </div>

            <form onSubmit={handleSubmit} className="max-w-5xl">
                {activeTab === "basic" && (
                    <div className="space-y-5">
                        <SectionBlock title="Identity" description="Core listing information and ownership details.">
                            <div className="grid gap-5 lg:grid-cols-[280px_minmax(0,1fr)] lg:items-start">
                                <div className="rounded-[24px] border border-[#ECEEF2] bg-[#FBFCFD] p-4">
                                    <div className="space-y-4">
                                        <ImageAssetCard
                                            label="Main Image"
                                            description="Primary thumbnail used in cards and quick listing views."
                                            alt="Main"
                                            imageUrl={form.image}
                                            widthClass="w-[90px]"
                                            previewClassName="h-[90px] w-[90px] rounded-[24px] border border-[#E5E7EC] bg-white p-1.5 shadow-[0_8px_20px_rgba(17,24,39,0.06)]"
                                            emptyPreviewClassName={`flex h-[90px] w-[90px] items-center justify-center rounded-[24px] border-2 border-dashed bg-white ${mainDrag ? "border-blue-400 bg-blue-50" : uploading ? "pointer-events-none border-gray-200 bg-[#F4F5F6] opacity-50" : "border-gray-200 hover:border-gray-400"}`}
                                            placeholderTitle="Upload"
                                            isDragging={mainDrag}
                                            uploading={uploading}
                                            onOpen={() => fileInputRef.current?.click()}
                                            onRemove={() => updateField("image", "")}
                                            onDragOver={onMainDragOver}
                                            onDragEnter={onMainDragEnter}
                                            onDragLeave={onMainDragLeave}
                                            onDrop={onMainDrop}
                                        />
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept={IMAGE_UPLOAD_ACCEPT}
                                            className="hidden"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) handleMainImageUpload(file);
                                                if (fileInputRef.current) fileInputRef.current.value = "";
                                            }}
                                        />
                                        <div className="border-t border-[#EEF1F5] pt-4">
                                            <ImageAssetCard
                                                label="Cover Image"
                                                description="Optional portrait-style visual for richer listing presentation."
                                                alt="Cover"
                                                imageUrl={form.coverImage}
                                                widthClass="w-[112px]"
                                                previewClassName="h-[148px] w-[112px] rounded-[24px] border border-[#E5E7EC] bg-white p-1.5 shadow-[0_8px_20px_rgba(17,24,39,0.06)]"
                                                emptyPreviewClassName={`flex h-[148px] w-[112px] items-center justify-center rounded-[24px] border-2 border-dashed bg-white ${coverDrag ? "border-blue-400 bg-blue-50" : uploading ? "pointer-events-none border-gray-200 bg-[#F4F5F6] opacity-50" : "border-gray-200 hover:border-gray-400"}`}
                                                placeholderTitle="Upload cover"
                                                placeholderHint="Portrait image"
                                                isDragging={coverDrag}
                                                uploading={uploading}
                                                onOpen={() => coverInputRef.current?.click()}
                                                onRemove={() => updateField("coverImage", "")}
                                                onDragOver={onCoverDragOver}
                                                onDragEnter={onCoverDragEnter}
                                                onDragLeave={onCoverDragLeave}
                                                onDrop={onCoverDrop}
                                            />
                                            <input
                                                ref={coverInputRef}
                                                type="file"
                                                accept={IMAGE_UPLOAD_ACCEPT}
                                                className="hidden"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) handleCoverImageUpload(file);
                                                    if (coverInputRef.current) coverInputRef.current.value = "";
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="grid gap-4 lg:grid-cols-2">
                                        <div>
                                            <label className="mb-1.5 block text-xs font-medium text-[#4E525D]">Name</label>
                                            <input
                                                className={inputClass}
                                                value={form.name || ""}
                                                onChange={(e) => updateField("name", e.target.value)}
                                                placeholder="Sea Breeze"
                                            />
                                        </div>
                                        <CustomSelect
                                            label="Offer Type"
                                            value={form.purpose || "sale"}
                                            options={[
                                                { id: "sale", label: "For Sale" },
                                                { id: "rent", label: "For Rent" },
                                            ]}
                                            placeholder="Select offer type"
                                            onChange={(id) => updateField("purpose", id as "sale" | "rent")}
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1.5 block text-xs font-medium text-[#4E525D]">Title</label>
                                        <input
                                            className={inputClass}
                                            value={form.title || ""}
                                            onChange={(e) => {
                                                updateField("title", e.target.value);
                                                handleSlugFromTitle(e.target.value);
                                            }}
                                            placeholder="Sea Breeze Residence"
                                        />
                                    </div>
                                    <div className="grid gap-4 lg:grid-cols-2">
                                        <CustomSelect
                                            label="Type"
                                            value={form.apartmentTypeId || ""}
                                            options={types?.data?.map((t: ApartmentType) => ({ id: t.id, label: t.title })) || []}
                                            placeholder="Select type"
                                            onChange={(id) => updateField("apartmentTypeId", id)}
                                            noOptionsLabel="Create Listing Type"
                                            onNoOptionsClick={() => navigate("/dashboard/resale/apartment-types")}
                                        />
                                        <CustomSelect
                                            label="Owner"
                                            value={form.ownerId || ""}
                                            options={owners?.data?.map((o: Owner) => ({ id: o.id, label: `${o.firstName} ${o.lastName}` })) || []}
                                            placeholder="Select owner (optional)"
                                            onChange={(id) => updateField("ownerId", id)}
                                            noOptionsLabel="Create Owner"
                                            onNoOptionsClick={() => navigate("/dashboard/resale/owners")}
                                        />
                                    </div>
                                    <div className="grid gap-4 lg:grid-cols-2">
                                        <CustomSelect
                                            label="Region"
                                            value={form.region || ""}
                                            options={toLocationDropdownOptions("region", form.region, form.city)}
                                            placeholder={form.city ? "Select region" : "Select city first"}
                                            onChange={(id) => updateField("region", id)}
                                            noOptionsLabel="Create Region"
                                            onNoOptionsClick={() => navigate("/dashboard/resale/location-options")}
                                        />
                                        <CustomSelect
                                            label="City"
                                            value={form.city || ""}
                                            options={toLocationDropdownOptions("city", form.city)}
                                            placeholder="Select city"
                                            onChange={(id) => {
                                                updateField("city", id);
                                                updateField("region", "");
                                            }}
                                            noOptionsLabel="Create City"
                                            onNoOptionsClick={() => navigate("/dashboard/resale/location-options")}
                                        />
                                    </div>
                                </div>
                            </div>
                        </SectionBlock>

                        <SectionBlock title="Layout" description="Physical structure and apartment placement details.">
                            <div className="grid gap-4 lg:grid-cols-2">
                                <CustomSelect
                                    label="Status"
                                    value={form.status || "active"}
                                    options={[
                                        { id: "active", label: "Active" },
                                        { id: "reserved", label: "Reserved" },
                                        { id: "sold", label: "Sold" },
                                    ]}
                                    placeholder="Select status"
                                    onChange={(id) => updateField("status", id as "active" | "reserved" | "sold")}
                                />
                                <div>
                                    <label className="mb-1.5 block text-xs font-medium text-[#4E525D]">Room Count</label>
                                    <input
                                        className={inputClass}
                                        type="number"
                                        value={form.roomCount ?? ""}
                                        onChange={(e) => updateField("roomCount", parseInt(e.target.value) || undefined)}
                                        placeholder="2"
                                        min={1}
                                    />
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-xs font-medium text-[#4E525D]">Number Of Floor</label>
                                    <input
                                        className={inputClass}
                                        type="number"
                                        value={form.floorTo ?? ""}
                                        onChange={(e) => updateField("floorTo", parseInt(e.target.value) || undefined)}
                                        placeholder="16"
                                        min={1}
                                        max={MAX_RESALE_FLOOR}
                                    />
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-xs font-medium text-[#4E525D]">Floor</label>
                                    <input
                                        className={inputClass}
                                        type="number"
                                        value={form.floorFrom ?? ""}
                                        onChange={(e) => updateField("floorFrom", parseInt(e.target.value) || undefined)}
                                        placeholder="8"
                                        min={1}
                                        max={MAX_RESALE_FLOOR}
                                    />
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-xs font-medium text-[#4E525D]">Bathroom Count</label>
                                    <input
                                        className={inputClass}
                                        type="number"
                                        value={form.bathroomCount ?? ""}
                                        onChange={(e) => updateField("bathroomCount", parseInt(e.target.value) || undefined)}
                                        placeholder="2"
                                        min={0}
                                    />
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-xs font-medium text-[#4E525D]">Building Age</label>
                                    <input
                                        className={inputClass}
                                        type="number"
                                        value={form.buildingAge ?? ""}
                                        onChange={(e) => updateField("buildingAge", parseInt(e.target.value) || undefined)}
                                        placeholder="8"
                                        min={0}
                                    />
                                </div>
                                <div>
                                    <CustomSelect
                                        label="Renovation"
                                        value={form.renovation || ""}
                                        options={[
                                            { id: "renovated", label: "Renovated" },
                                            { id: "non-renovated", label: "Non-renovated" },
                                        ]}
                                        placeholder="Select renovation"
                                        onChange={(id) => updateField("renovation", id as ApartmentRenovation)}
                                    />
                                </div>
                                <div>
                                    <CustomSelect
                                        label="Furnishing"
                                        value={form.furnishing || ""}
                                        options={[
                                            { id: "furnished", label: "Furnished" },
                                            { id: "unfurnished", label: "Unfurnished" },
                                        ]}
                                        placeholder="Select furnishing"
                                        onChange={(id) => updateField("furnishing", id as ApartmentFurnishing)}
                                    />
                                </div>
                                <div>
                                    <CustomSelect
                                        label="Mortgage"
                                        value={form.mortgage === undefined ? "" : String(form.mortgage)}
                                        options={[
                                            { id: "true", label: "Yes" },
                                            { id: "false", label: "No" },
                                        ]}
                                        placeholder="Select mortgage"
                                        onChange={(id) => updateField("mortgage", id === "" ? undefined : id === "true")}
                                    />
                                </div>
                                <div>
                                    <CustomSelect
                                        label="Extract"
                                        value={form.extract === undefined ? "" : String(form.extract)}
                                        options={[
                                            { id: "true", label: "Yes" },
                                            { id: "false", label: "No" },
                                        ]}
                                        placeholder="Select extract"
                                        onChange={(id) => updateField("extract", id === "" ? undefined : id === "true")}
                                    />
                                </div>
                                <div>
                                    <CustomSelect
                                        label="Parking"
                                        value={form.parking === undefined ? "" : String(form.parking)}
                                        options={[
                                            { id: "true", label: "Yes" },
                                            { id: "false", label: "No" },
                                        ]}
                                        placeholder="Select parking"
                                        onChange={(id) => updateField("parking", id === "" ? undefined : id === "true")}
                                    />
                                </div>
                                <div>
                                    <CustomSelect
                                        label="Elevator"
                                        value={form.elevator === undefined ? "" : String(form.elevator)}
                                        options={[
                                            { id: "true", label: "Yes" },
                                            { id: "false", label: "No" },
                                        ]}
                                        placeholder="Select elevator"
                                        onChange={(id) => updateField("elevator", id === "" ? undefined : id === "true")}
                                    />
                                </div>
                                <div>
                                    <CustomSelect
                                        label="Heating Type"
                                        value={form.heatingTypeIds || []}
                                        options={toSimpleOptions<HeatingTypeOption>(heatingTypeItems)}
                                        placeholder="Select heating type"
                                        onChange={(value) => updateField("heatingTypeIds", value as string[])}
                                        multiSelect
                                        noOptionsLabel="Create Heating Type"
                                        onNoOptionsClick={() => navigate("/dashboard/resale/heating-type-options")}
                                    />
                                </div>
                                <div>
                                    <CustomSelect
                                        label="View"
                                        value={form.viewOptionIds || []}
                                        options={toSimpleOptions<ViewOption>(viewOptionItems)}
                                        placeholder="Select view"
                                        onChange={(value) => updateField("viewOptionIds", value as string[])}
                                        multiSelect
                                        noOptionsLabel="Create View"
                                        onNoOptionsClick={() => navigate("/dashboard/resale/view-options")}
                                    />
                                </div>
                            </div>
                        </SectionBlock>

                        <SectionBlock title="Attributes" description="Choose the apartment features shown with the listing.">
                            <div className="flex flex-wrap gap-2 rounded-[20px] border border-[#ECEEF2] bg-[#F8F9FB] p-3">
                                {attributes?.data?.map((attr: Attribute) => {
                                    const selected = form.attributeIds?.includes(attr.id);
                                    return (
                                        <button
                                            key={attr.id}
                                            type="button"
                                            onClick={() => {
                                                const current = form.attributeIds || [];
                                                const next = selected
                                                    ? current.filter((id) => id !== attr.id)
                                                    : [...current, attr.id];
                                                updateField("attributeIds", next);
                                            }}
                                            className={`flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                                                selected
                                                    ? "border-[#A9B4C8] bg-[#E9EDF5] text-[#243042]"
                                                    : "border-[#E1E5EC] bg-white text-[#666666] hover:bg-gray-50 hover:text-[#1A1A1A]"
                                            }`}
                                        >
                                            {attr.icon && (
                                                <img src={attr.icon} alt="" className="h-3.5 w-3.5 rounded-sm object-cover" />
                                            )}
                                            {attr.title}
                                        </button>
                                    );
                                })}
                                {(!attributes?.data || attributes.data.length === 0) && (
                                    <span className="text-xs text-[#999]">No attributes created yet</span>
                                )}
                            </div>
                        </SectionBlock>
                    </div>
                )}

                {activeTab === "area" && (
                    <div className="space-y-5">
                        <SectionBlock title="Area Metrics" description="Primary sizing details grouped in a cleaner block.">
                            <div className="grid gap-4 lg:grid-cols-2">
                                <div>
                                    <label className="mb-1.5 block text-xs font-medium text-[#4E525D]">Area (m2)</label>
                                    <input
                                        className={inputClass}
                                        type="number"
                                        step="0.1"
                                        value={form.area ?? ""}
                                        onChange={(e) => updateField("area", parseFloat(e.target.value) || undefined)}
                                        placeholder="60.5"
                                        min={0}
                                    />
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-xs font-medium text-[#4E525D]">Gross Area (m2)</label>
                                    <input
                                        className={inputClass}
                                        type="number"
                                        step="0.1"
                                        value={form.grossArea ?? ""}
                                        onChange={(e) => updateField("grossArea", parseFloat(e.target.value) || undefined)}
                                        placeholder="67"
                                        min={0}
                                    />
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-xs font-medium text-[#4E525D]">Ceiling Height (m)</label>
                                    <input
                                        className={inputClass}
                                        type="number"
                                        step="0.1"
                                        value={form.ceilingHeight ?? ""}
                                        onChange={(e) => updateField("ceilingHeight", parseFloat(e.target.value) || undefined)}
                                        placeholder="2.8"
                                        min={0}
                                    />
                                </div>
                            </div>
                        </SectionBlock>

                        {currencies?.data && currencies.data.length > 0 && (
                            <SectionBlock title="Prices by Currency" description="Each currency now lives in its own cleaner pricing card.">
                                <div className="space-y-3">
                                    {currencies.data.map((cur: Currency) => {
                                        const existingPrice = form.prices?.find((p: any) => p.currencyId === cur.id);
                                        return (
                                            <div key={cur.id} className="rounded-[22px] border border-[#ECEEF2] bg-[#F8F9FB] p-4">
                                                <div className="mb-3 flex items-center justify-between gap-3">
                                                    <div className="text-sm font-semibold text-[#1A1A1A]">{cur.title || cur.name}</div>
                                                    <div className="rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-[#808191]">
                                                        {cur.value}
                                                    </div>
                                                </div>
                                                <div className="grid gap-3 lg:grid-cols-2">
                                                    <div>
                                                        <label className="mb-1.5 block text-xs font-medium text-[#4E525D]">Price Total</label>
                                                        <input
                                                            className={inputClass}
                                                            type="number"
                                                            value={existingPrice?.priceTotal ?? ""}
                                                            onChange={(e) => {
                                                                const raw = e.target.value;
                                                                const prices = [...(form.prices || [])];
                                                                const idx = prices.findIndex((p: any) => p.currencyId === cur.id);
                                                                if (raw === "" || raw === null) {
                                                                    if (idx >= 0) prices.splice(idx, 1);
                                                                } else {
                                                                    const val = parseFloat(raw) || 0;
                                                                    if (idx >= 0) {
                                                                        prices[idx] = { currencyId: cur.id, priceTotal: val, priceByArea: prices[idx]?.priceByArea ?? 0 };
                                                                    } else {
                                                                        prices.push({ currencyId: cur.id, priceTotal: val, priceByArea: 0 });
                                                                    }
                                                                }
                                                                updateField("prices", prices);
                                                            }}
                                                            placeholder="175,000"
                                                            min={0}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="mb-1.5 block text-xs font-medium text-[#4E525D]">Price per m2</label>
                                                        <input
                                                            className={inputClass}
                                                            type="number"
                                                            value={existingPrice?.priceByArea ?? ""}
                                                            onChange={(e) => {
                                                                const raw = e.target.value;
                                                                const prices = [...(form.prices || [])];
                                                                const idx = prices.findIndex((p: any) => p.currencyId === cur.id);
                                                                if (raw === "" || raw === null) {
                                                                    if (idx >= 0) prices.splice(idx, 1);
                                                                } else {
                                                                    const val = parseFloat(raw) || 0;
                                                                    if (idx >= 0) {
                                                                        prices[idx] = { currencyId: cur.id, priceTotal: prices[idx]?.priceTotal ?? 0, priceByArea: val };
                                                                    } else {
                                                                        prices.push({ currencyId: cur.id, priceTotal: 0, priceByArea: val });
                                                                    }
                                                                }
                                                                updateField("prices", prices);
                                                            }}
                                                            placeholder="2,917"
                                                            min={0}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </SectionBlock>
                        )}
                    </div>
                )}

                {activeTab === "location" && (
                    <div className="space-y-5">
                        <SectionBlock title="Address" description="Location fields stay together in a single focused block.">
                            <div>
                                <label className="mb-1.5 block text-xs font-medium text-[#4E525D]">Location Title</label>
                                <input
                                    className={inputClass}
                                    value={form.locationTitle || ""}
                                    onChange={(e) => updateField("locationTitle", e.target.value)}
                                    placeholder="Baku city, Murtuza Mukhtarov str, house 31"
                                />
                            </div>
                            <div>
                                <label className="mb-1.5 block text-xs font-medium text-[#4E525D]">Location URL</label>
                                <input
                                    className={inputClass}
                                    value={form.locationUrl || ""}
                                    onChange={(e) => updateField("locationUrl", e.target.value)}
                                    placeholder="https://maps.google.com/..."
                                />
                            </div>
                        </SectionBlock>
                    </div>
                )}

                {activeTab === "gallery" && (
                    <div className="space-y-5">
                        {uploadError && (
                            <div className="rounded-xl border border-red-200 bg-red-50 p-2 text-xs text-[#C3362B]">{uploadError}</div>
                        )}

                        <div>
                            <SectionBlock
                                title="Gallery Images"
                                description={`Additional listing photos${form.gallery && form.gallery.length > 0 ? ` (${form.gallery.length}/20)` : ""}.`}
                            >
                                <div
                                    onDragOver={onGalleryDragOver}
                                    onDragEnter={onGalleryDragEnter}
                                    onDragLeave={onGalleryDragLeave}
                                    onDrop={onGalleryDrop}
                                    onClick={() => galleryInputRef.current?.click()}
                                    className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-[24px] border-2 border-dashed px-4 py-8 text-center transition-colors ${
                                        galleryDrag
                                            ? "border-blue-400 bg-blue-50"
                                            : uploading
                                                ? "pointer-events-none border-gray-200 bg-[#F4F5F6] opacity-50"
                                                : "border-gray-200 bg-[#F8F9FB] hover:border-gray-400"
                                    }`}
                                >
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={`transition-colors ${galleryDrag ? "text-blue-500" : "text-[#999]"}`}>
                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                        <polyline points="17 8 12 3 7 8" />
                                        <line x1="12" y1="3" x2="12" y2="15" />
                                    </svg>
                                    <span className={`text-sm font-medium ${galleryDrag ? "text-blue-500" : "text-[#666666]"}`}>
                                        {uploading ? "Uploading..." : galleryDrag ? "Drop images here" : "Drag, drop or click to upload"}
                                    </span>
                                    <span className="text-[11px] text-[#999]">
                                        {(form.gallery?.length || 0) >= 20 ? "Maximum 20 images reached" : "Image files (multiple)"}
                                    </span>
                                </div>
                                <input
                                    ref={galleryInputRef}
                                    type="file"
                                    accept={IMAGE_UPLOAD_ACCEPT}
                                    multiple
                                    className="hidden"
                                    onChange={(e) => {
                                        const files = e.target.files;
                                        if (files && files.length > 0) handleGalleryUpload(files);
                                        if (galleryInputRef.current) galleryInputRef.current.value = "";
                                    }}
                                />
                                {form.gallery && form.gallery.length > 0 && (
                                    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
                                        {form.gallery.map((item: any, idx: number) => (
                                            <div key={idx} className="group relative overflow-hidden rounded-[20px] border border-[#ECEEF2] bg-[#F8F9FB] p-2">
                                                <img
                                                    src={item.url || item}
                                                    alt={`Gallery ${idx + 1}`}
                                                    className="h-28 w-full rounded-[16px] object-cover"
                                                />
                                                <button
                                                    type="button"
                                                    aria-label={`Remove gallery image ${idx + 1}`}
                                                    onClick={() => removeGalleryItem(idx)}
                                                    className="absolute right-3 top-3 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-[rgba(17,24,39,0.72)] text-white backdrop-blur-sm opacity-0 transition-opacity hover:opacity-85 group-hover:opacity-100"
                                                >
                                                    <IoClose size={18} />
                                                </button>
                                                <div className="absolute bottom-3 left-3 rounded-full bg-[#1A1A1A]/75 px-2 py-0.5 text-[10px] font-medium text-white">
                                                    {idx + 1}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </SectionBlock>
                        </div>
                    </div>
                )}

                {activeTab === "description" && (
                    <div className="space-y-5">
                        <SectionBlock title="Description" description="Long-form listing copy stays in its own quiet editing area.">
                            <div>
                                <label className="mb-1.5 block text-xs font-medium text-[#4E525D]">Description (HTML)</label>
                                <textarea
                                    className={`${inputClass} min-h-[240px] resize-y py-3 font-mono`}
                                    value={form.description || ""}
                                    onChange={(e) => updateField("description", e.target.value)}
                                    placeholder="<p>Write HTML description here...</p>"
                                />
                            </div>
                        </SectionBlock>
                    </div>
                )}

                {activeTab === "seo" && (
                    <div className="space-y-5">
                        {uploadError && (
                            <div className="rounded-xl border border-red-200 bg-red-50 p-2 text-xs text-[#C3362B]">{uploadError}</div>
                        )}

                        <SectionBlock title="SEO Fields" description="Search and social metadata for the listing page.">
                            <div className="grid gap-5 lg:grid-cols-[320px_minmax(0,1fr)] lg:items-start">
                                <div>
                                    <div className="rounded-[22px] border border-[#ECEEF2] bg-white p-4">
                                        <div className="flex items-start gap-4">
                                            <div className="relative w-[128px]">
                                                <button
                                                    type="button"
                                                    onClick={() => seoInputRef.current?.click()}
                                                    onDragOver={onSeoDragOver}
                                                    onDragEnter={onSeoDragEnter}
                                                    onDragLeave={onSeoDragLeave}
                                                    onDrop={onSeoDrop}
                                                    className={`cursor-pointer overflow-hidden text-left transition-colors ${
                                                        form.seoImage
                                                            ? "h-[128px] w-[128px] rounded-[24px] border border-[#E5E7EC] bg-white p-1.5 shadow-[0_8px_20px_rgba(17,24,39,0.06)]"
                                                            : `flex h-[128px] w-[128px] items-center justify-center rounded-[24px] border-2 border-dashed bg-white ${
                                                                  seoDrag
                                                                      ? "border-blue-400 bg-blue-50"
                                                                      : uploading
                                                                          ? "pointer-events-none border-gray-200 bg-[#F4F5F6] opacity-50"
                                                                          : "border-gray-200 hover:border-gray-400"
                                                              }`
                                                    }`}
                                                >
                                                    {form.seoImage ? (
                                                        <img src={form.seoImage} alt="SEO" className="h-full w-full rounded-[18px] object-cover" />
                                                    ) : (
                                                        <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 px-3 text-center">
                                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={seoDrag ? "text-blue-500" : "text-[#999]"}>
                                                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                                                <polyline points="17 8 12 3 7 8" />
                                                                <line x1="12" y1="3" x2="12" y2="15" />
                                                            </svg>
                                                            <span className={`text-[11px] font-medium leading-4 ${seoDrag ? "text-blue-500" : "text-[#666666]"}`}>
                                                                {uploading ? "Uploading..." : seoDrag ? "Drop here" : "Upload SEO image"}
                                                            </span>
                                                            <span className="text-[10px] leading-4 text-[#9AA0AE]">Square image</span>
                                                        </div>
                                                    )}
                                                </button>
                                                {form.seoImage ? (
                                                    <button
                                                        type="button"
                                                        aria-label="Remove SEO Image"
                                                        onClick={() => updateField("seoImage", "")}
                                                        className="absolute right-3 top-3 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-[rgba(17,24,39,0.72)] text-white backdrop-blur-sm transition-opacity hover:opacity-85"
                                                    >
                                                        <IoClose size={18} />
                                                    </button>
                                                ) : null}
                                            </div>
                                            <div className="min-w-0">
                                                <div className="text-sm font-semibold text-[#1A1A1A]">SEO Image</div>
                                                <p className="mt-1 text-xs leading-5 text-[#808191]">
                                                    Used for search previews and shared social cards.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <input
                                        ref={seoInputRef}
                                        type="file"
                                        accept={IMAGE_UPLOAD_ACCEPT}
                                        className="hidden"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) handleSeoImageUpload(file);
                                            if (seoInputRef.current) seoInputRef.current.value = "";
                                        }}
                                    />
                                </div>

                                <div className="space-y-4">
                                    <div className="grid gap-4 lg:grid-cols-2">
                                        <div>
                                            <label className="mb-1.5 block text-xs font-medium text-[#4E525D]">Slug</label>
                                            <input
                                                className={inputClass}
                                                value={form.slug || ""}
                                                onChange={(e) => {
                                                    setSlugManuallyEdited(true);
                                                    updateField("slug", e.target.value);
                                                }}
                                                placeholder="sea-breeze-residence"
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-1.5 block text-xs font-medium text-[#4E525D]">Canonical URL</label>
                                            <input
                                                className={inputClass}
                                                value={form.canonicalUrl || ""}
                                                onChange={(e) => updateField("canonicalUrl", e.target.value)}
                                                placeholder="https://treva.realestate/resale/sea-breeze-residence"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="mb-1.5 block text-xs font-medium text-[#4E525D]">SEO Title</label>
                                        <input
                                            className={inputClass}
                                            value={form.seoTitle || ""}
                                            onChange={(e) => {
                                                setSeoTitleManuallyEdited(true);
                                                updateField("seoTitle", e.target.value);
                                            }}
                                            placeholder="Sea Breeze Residence | For Sale in Baku"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1.5 block text-xs font-medium text-[#4E525D]">Meta Description</label>
                                        <textarea
                                            className={`${inputClass} min-h-[120px] resize-y py-3`}
                                            value={form.seoDescription || ""}
                                            onChange={(e) => updateField("seoDescription", e.target.value)}
                                            placeholder="Short summary for search engines and social previews."
                                        />
                                    </div>
                                    <div>
                                        <FormKeywordInput
                                            label="Meta Keywords"
                                            value={parseKeywordString(form.seoKeywords)}
                                            onChange={(keywords) => updateField("seoKeywords", keywords.join(", "))}
                                            placeholder="baku apartment"
                                            addButtonLabel="Add"
                                        />
                                    </div>
                                </div>
                            </div>
                        </SectionBlock>
                    </div>
                )}

                <div className="mt-6 flex gap-3 rounded-[24px] border border-[#ECEEF2] bg-white p-4">
                    <button
                        type="submit"
                        disabled={createMutation.isPending || updateMutation.isPending}
                        className="cursor-pointer rounded-xl bg-[#4E525D] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {createMutation.isPending || updateMutation.isPending
                            ? "Saving..."
                            : isEdit
                            ? "Save Changes"
                            : "Create"}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate("/dashboard/resale/apartments")}
                        disabled={createMutation.isPending || updateMutation.isPending}
                        className="cursor-pointer rounded-xl border border-gray-200 px-5 py-2.5 text-sm text-[#666666] transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );

    if (embedded) {
        return (
            <main className="flex-1 p-8 overflow-y-auto" style={{ background: "var(--background-primary-50, #FFFFFF80)" }}>
                {formContent}
            </main>
        );
    }

    return (
        <div className="min-h-screen bg-[#F4F5F6] py-8">
            <div className="mx-auto max-w-4xl">
                {formContent}
            </div>
        </div>
    );
}
