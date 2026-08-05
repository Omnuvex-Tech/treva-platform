import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { apartmentsApi, CreateApartmentData, type ApartmentFurnishing, type ApartmentRenovation, UploadResponse } from "../../api/apartments";
import { apartmentTypesApi, ApartmentType } from "../../api/apartment-types";
import { ownersApi, Owner } from "../../api/owners";
import { attributesApi, Attribute } from "../../api/attributes";
import { currenciesApi } from "../../api/currencies";
import { locationOptionsApi, type LocationOption } from "../../api/location-options";
import { ImageAssetCard } from "../../components/ImageAssetCard";
import { useMessageCenter } from "../../components/MessageCenter";
import { getApiErrorMessage } from "../../utils/apiError";
import { STATIC_CURRENCIES } from "../../utils/staticCurrencies";
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
const RESALE_STATUS_OPTIONS = [
    {
        id: "active" as const,
        label: "Active",
        activeClass: "border-emerald-200 bg-emerald-50 text-emerald-700",
        idleClass: "border-[#E7E9EE] bg-white text-[#666666] hover:border-emerald-200 hover:bg-emerald-50/60 hover:text-emerald-700",
    },
    {
        id: "reserved" as const,
        label: "Reserved",
        activeClass: "border-amber-200 bg-amber-50 text-amber-700",
        idleClass: "border-[#E7E9EE] bg-white text-[#666666] hover:border-amber-200 hover:bg-amber-50/60 hover:text-amber-700",
    },
    {
        id: "sold" as const,
        label: "Sold",
        activeClass: "border-rose-200 bg-rose-50 text-rose-700",
        idleClass: "border-[#E7E9EE] bg-white text-[#666666] hover:border-rose-200 hover:bg-rose-50/60 hover:text-rose-700",
    },
] as const;

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

function normalizeOptionalText(value: string | undefined) {
    if (typeof value !== "string") return undefined;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
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
    createLabel,
    onCreateClick,
    multiSelect = false,
}: {
    label: string;
    value: string | string[];
    options: { id: string; label: string }[];
    placeholder: string;
    onChange: (value: string | string[]) => void;
    noOptionsLabel?: string;
    onNoOptionsClick?: () => void;
    createLabel?: string;
    onCreateClick?: () => void;
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
                    {onCreateClick ? (
                        <button
                            type="button"
                            className="w-full px-4 py-2.5 text-left text-sm font-medium text-[#4E525D] transition-colors hover:bg-gray-50 hover:text-[#1A1A1A]"
                            onClick={() => {
                                setOpen(false);
                                onCreateClick();
                            }}
                        >
                            {createLabel || "Create"}
                        </button>
                    ) : null}
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

function BinarySwitchField({
    label,
    value,
    leftOption,
    rightOption,
    onChange,
}: {
    label: string;
    value?: string;
    leftOption: {
        id: string;
        label: string;
    };
    rightOption: {
        id: string;
        label: string;
    };
    onChange: (value: string) => void;
}) {
    const isRightSelected = value === rightOption.id;
    return (
        <div className="inline-flex w-fit max-w-full self-start flex-col">
            <label className="mb-1.5 block text-xs font-medium text-[#4E525D]">{label}</label>
            <div className="inline-flex w-fit max-w-full min-h-[52px] items-center gap-3 rounded-[20px] border border-[#ECEEF2] bg-[#F8F9FB] px-4 py-2">
                <button
                    type="button"
                    onClick={() => onChange(leftOption.id)}
                    className={`text-left text-sm leading-5 transition-colors ${
                        !isRightSelected ? "font-semibold text-[#1A1A1A]" : "font-medium text-[#9AA1AF]"
                    }`}
                >
                    {leftOption.label}
                </button>
                <button
                    type="button"
                    role="switch"
                    aria-checked={isRightSelected}
                    onClick={() => onChange(isRightSelected ? leftOption.id : rightOption.id)}
                    className={`relative h-7 w-12 flex-shrink-0 rounded-full border transition-all ${
                        isRightSelected
                            ? "border-[#7E8797] bg-[#7E8797]"
                            : "border-[#D9DEE7] bg-white"
                    }`}
                >
                    <span
                        className={`absolute top-0.5 h-5.5 w-5.5 rounded-full shadow-[0_1px_2px_rgba(16,24,40,0.16)] transition-all ${
                            isRightSelected
                                ? "left-[24px] bg-white"
                                : "left-0.5 bg-[#7E8797]"
                        }`}
                    />
                </button>
                <button
                    type="button"
                    onClick={() => onChange(rightOption.id)}
                    className={`text-right text-sm leading-5 transition-colors ${
                        isRightSelected ? "font-semibold text-[#1A1A1A]" : "font-medium text-[#9AA1AF]"
                    }`}
                >
                    {rightOption.label}
                </button>
            </div>
        </div>
    );
}

export function ApartmentForm({ embedded = false }: { embedded?: boolean } = {}) {
    const { id } = useParams();
    const isEdit = Boolean(id);
    const location = useLocation();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { showError, showSuccess } = useMessageCenter();
    const createTab = new URLSearchParams(location.search).get("tab") === "archive" ? "archive" : "active";

    const [activeTab, setActiveTab] = useState<TabKey>("basic");
    const [isApartmentTypeModalOpen, setIsApartmentTypeModalOpen] = useState(false);
    const [apartmentTypeDraft, setApartmentTypeDraft] = useState({ name: "", title: "" });
    const [isOwnerModalOpen, setIsOwnerModalOpen] = useState(false);
    const [ownerDraft, setOwnerDraft] = useState({ firstName: "", lastName: "", phoneNumber: "", profession: "" });
    const [isCityModalOpen, setIsCityModalOpen] = useState(false);
    const [cityDraft, setCityDraft] = useState({ name: "", title: "" });
    const [isRegionModalOpen, setIsRegionModalOpen] = useState(false);
    const [regionDraft, setRegionDraft] = useState({ name: "", title: "" });
    const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
    const [seoTitleManuallyEdited, setSeoTitleManuallyEdited] = useState(false);
    const [draggedGalleryIndex, setDraggedGalleryIndex] = useState<number | null>(null);
    const [dragOverGalleryIndex, setDragOverGalleryIndex] = useState<number | null>(null);

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

    const { data: existing } = useQuery({
        queryKey: ["apartment", id],
        queryFn: () => apartmentsApi.getById(id!),
        enabled: isEdit,
    });

    const createApartmentTypeMutation = useMutation({
        mutationFn: (payload: { name: string; title: string }) => apartmentTypesApi.create(payload),
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: ["apartment-types"] });
            const created = res?.data;
            if (created?.id) updateField("apartmentTypeId", created.id);
            setIsApartmentTypeModalOpen(false);
            setApartmentTypeDraft({ name: "", title: "" });
            showSuccess({ title: "Listing type created" });
        },
        onError: (error) => {
            showError({
                title: "Listing type could not be created",
                description: getApiErrorMessage(error, "Please try again."),
            });
        },
    });

    const createOwnerMutation = useMutation({
        mutationFn: (payload: { firstName: string; lastName: string; phoneNumber: string; profession?: string }) =>
            ownersApi.create(payload),
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: ["owners"] });
            const created = res?.data;
            if (created?.id) updateField("ownerId", created.id);
            setIsOwnerModalOpen(false);
            setOwnerDraft({ firstName: "", lastName: "", phoneNumber: "", profession: "" });
            showSuccess({ title: "Owner created" });
        },
        onError: (error) => {
            showError({
                title: "Owner could not be created",
                description: getApiErrorMessage(error, "Please try again."),
            });
        },
    });

    const createLocationOptionMutation = useMutation({
        mutationFn: (payload: { type: "region" | "city"; name: string; title: string; cityId?: string }) =>
            locationOptionsApi.create(payload),
        onSuccess: (res, vars) => {
            queryClient.invalidateQueries({ queryKey: ["location-options"] });
            const created = res?.data;
            if (vars.type === "city") {
                updateField("city", created?.title || vars.title);
                updateField("region", "");
                setIsCityModalOpen(false);
                setCityDraft({ name: "", title: "" });
                showSuccess({ title: "City created" });
            } else {
                updateField("region", created?.title || vars.title);
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

    const priceCurrencies = useMemo(() => {
        const list = Array.isArray(currencies?.data) ? currencies.data : [];
        return STATIC_CURRENCIES.map((sc) => ({
            value: sc.value,
            label: sc.label,
            id: list.find((item) => item.value === sc.value)?.id,
        }));
    }, [currencies?.data]);

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
        locationGoogleMapsUrl: "",
        renovation: undefined,
        mortgage: undefined,
        extract: undefined,
        buildingAge: undefined as unknown as number,
        furnishing: undefined,
        ceilingHeight: undefined as unknown as number,
        apartmentTypeId: "",
        ownerId: "",
        attributeIds: [],
        requestIds: [],
        status: "active" as "active" | "reserved" | "sold",
        archived: createTab === "archive",
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
                locationGoogleMapsUrl: d.locationGoogleMapsUrl || "",
                renovation: d.renovation || undefined,
                mortgage: d.mortgage ?? undefined,
                extract: d.extract ?? undefined,
                buildingAge: d.buildingAge ?? undefined,
                furnishing: d.furnishing || undefined,
                ceilingHeight: d.ceilingHeight ?? undefined,
                apartmentTypeId: d.apartmentTypeId || "",
                ownerId: d.ownerId || "",
                attributeIds: d.attributeIds || [],
                requestIds: d.requestIds || [],
                status: d.status || "active",
                archived: !!d.archived,
                prices: (d.prices || []).map((p: any) => ({ currencyId: p.currencyId, priceTotal: p.priceTotal, priceByArea: p.priceByArea })),
            });
            setSlugManuallyEdited(Boolean(d.slug));
            setSeoTitleManuallyEdited(Boolean(d.seoTitle));
        }
    }, [existing?.data]);

    useEffect(() => {
        if (isEdit) return;
        setForm((prev) => ({ ...prev, archived: createTab === "archive" }));
    }, [createTab, isEdit]);

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
            navigate(`/dashboard/resale/apartments?tab=${createTab}`);
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
            navigate(`/dashboard/resale/apartments?tab=${form.archived ? "archive" : "active"}`);
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
            archived: isEdit ? !!form.archived : createTab === "archive",
            name: normalizeOptionalText(form.name),
            description: normalizeOptionalText(form.description),
            seoTitle: normalizeOptionalText(form.seoTitle),
            seoDescription: normalizeOptionalText(form.seoDescription),
            seoKeywords: normalizeOptionalText(form.seoKeywords),
            canonicalUrl: normalizeOptionalText(form.canonicalUrl),
            seoImage: normalizeOptionalText(form.seoImage),
            image: normalizeOptionalText(form.image),
            coverImage: normalizeOptionalText(form.coverImage),
            region: normalizeOptionalText(form.region),
            city: normalizeOptionalText(form.city),
            locationTitle: normalizeOptionalText(form.locationTitle),
            locationUrl: normalizeOptionalText(form.locationUrl),
            locationGoogleMapsUrl: normalizeOptionalText(form.locationGoogleMapsUrl),
            ownerId: normalizeOptionalText(form.ownerId),
            heatingTypeIds: [],
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

    const reorderGalleryItem = (fromIndex: number, toIndex: number) => {
        if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0) return;
        setForm((f) => {
            const gallery = [...(f.gallery || [])];
            const [movedItem] = gallery.splice(fromIndex, 1);
            if (!movedItem) return f;
            gallery.splice(toIndex, 0, movedItem);
            return { ...f, gallery };
        });
    };

    const handleGalleryItemDragStart = (e: React.DragEvent, index: number) => {
        e.stopPropagation();
        e.dataTransfer.setData("text/plain", index.toString());
        e.dataTransfer.effectAllowed = "move";
        setDraggedGalleryIndex(index);
    };

    const handleGalleryItemDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        e.stopPropagation();
        e.dataTransfer.dropEffect = "move";
        if (dragOverGalleryIndex !== index) {
            setDragOverGalleryIndex(index);
        }
    };

    const handleGalleryItemDrop = (e: React.DragEvent, targetIndex: number) => {
        e.preventDefault();
        e.stopPropagation();
        const sourceIndexStr = e.dataTransfer.getData("text/plain");
        const sourceIndex = sourceIndexStr !== "" ? parseInt(sourceIndexStr, 10) : draggedGalleryIndex;

        if (sourceIndex !== null && !isNaN(sourceIndex) && sourceIndex !== targetIndex) {
            reorderGalleryItem(sourceIndex, targetIndex);
        }
        setDraggedGalleryIndex(null);
        setDragOverGalleryIndex(null);
    };

    const handleGalleryItemDragEnd = (e: React.DragEvent) => {
        e.stopPropagation();
        setDraggedGalleryIndex(null);
        setDragOverGalleryIndex(null);
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

    const buildNameFromTitle = (title: string) =>
        title
            .toLowerCase()
            .trim()
            .replace(/\s+/g, "-")
            .replace(/[^a-z0-9-]/g, "")
            .replace(/-+/g, "-")
            .replace(/(^-|-$)/g, "");

    const handleCreateListingType = () => {
        const title = apartmentTypeDraft.title.trim();
        const name = (apartmentTypeDraft.name.trim() || buildNameFromTitle(title)).trim();
        if (!title || !name) {
            showError({ title: "Please fill required fields", description: !title ? "Title is required" : "Name is required" });
            return;
        }
        createApartmentTypeMutation.mutate({ name, title });
    };

    const handleCreateOwner = () => {
        const firstName = ownerDraft.firstName.trim();
        const lastName = ownerDraft.lastName.trim();
        const phoneNumber = ownerDraft.phoneNumber.trim();
        const profession = ownerDraft.profession.trim();
        if (!firstName || !lastName || !phoneNumber) {
            showError({ title: "Please fill required fields", description: "First name, last name and phone are required" });
            return;
        }
        createOwnerMutation.mutate({ firstName, lastName, phoneNumber, profession: profession || undefined });
    };

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
        const selectedCityTitle = String(form.city || "").trim();
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

    // â”€â”€â”€ Render â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const formContent = (
        <>
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

            <form onSubmit={handleSubmit}>
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
                                        <BinarySwitchField
                                            label="Offer Type"
                                            value={form.purpose || "sale"}
                                            leftOption={{ id: "sale", label: "For Sale" }}
                                            rightOption={{ id: "rent", label: "For Rent" }}
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
                                            createLabel="Create Listing Type"
                                            onCreateClick={() => setIsApartmentTypeModalOpen(true)}
                                        />
                                        <CustomSelect
                                            label="Owner"
                                            value={form.ownerId || ""}
                                            options={owners?.data?.map((o: Owner) => ({ id: o.id, label: `${o.firstName} ${o.lastName}` })) || []}
                                            placeholder="Select owner (optional)"
                                            onChange={(id) => updateField("ownerId", id)}
                                            createLabel="Create Owner"
                                            onCreateClick={() => setIsOwnerModalOpen(true)}
                                        />
                                    </div>
                                    <div className="grid gap-4 lg:grid-cols-2">
                                        <CustomSelect
                                            label="Region"
                                            value={form.region || ""}
                                            options={toLocationDropdownOptions("region", form.region, form.city)}
                                            placeholder={form.city ? "Select region" : "Select city first"}
                                            onChange={(id) => updateField("region", id)}
                                            createLabel="Create Region"
                                            onCreateClick={() => setIsRegionModalOpen(true)}
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
                                            createLabel="Create City"
                                            onCreateClick={() => setIsCityModalOpen(true)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </SectionBlock>

                        <SectionBlock title="Layout" description="Physical structure and apartment placement details.">
                            <div className="grid gap-4 lg:grid-cols-2">
                                <div>
                                    <label className="mb-1.5 block text-xs font-medium text-[#4E525D]">Status</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {RESALE_STATUS_OPTIONS.map((option) => {
                                            const isSelected = (form.status || "active") === option.id;
                                            return (
                                                <button
                                                    key={option.id}
                                                    type="button"
                                                    onClick={() => updateField("status", option.id)}
                                                    className={`h-11 rounded-2xl border px-3 text-sm font-semibold transition-colors ${
                                                        isSelected ? option.activeClass : option.idleClass
                                                    }`}
                                                >
                                                    {option.label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
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
                                    <BinarySwitchField
                                        label="Renovation"
                                        value={form.renovation}
                                        leftOption={{ id: "renovated", label: "Renovated" }}
                                        rightOption={{ id: "non-renovated", label: "Unrenovated" }}
                                        onChange={(id) => updateField("renovation", id as ApartmentRenovation)}
                                    />
                                </div>
                                <div>
                                    <BinarySwitchField
                                        label="Furnishing"
                                        value={form.furnishing}
                                        leftOption={{ id: "furnished", label: "Furnished" }}
                                        rightOption={{ id: "unfurnished", label: "Unfurnished" }}
                                        onChange={(id) => updateField("furnishing", id as ApartmentFurnishing)}
                                    />
                                </div>
                                <div>
                                    <BinarySwitchField
                                        label="Mortgage"
                                        value={form.mortgage === undefined ? undefined : String(form.mortgage)}
                                        leftOption={{ id: "true", label: "Yes" }}
                                        rightOption={{ id: "false", label: "No" }}
                                        onChange={(id) => updateField("mortgage", id === "true")}
                                    />
                                </div>
                                <div>
                                    <BinarySwitchField
                                        label="Extract"
                                        value={form.extract === undefined ? undefined : String(form.extract)}
                                        leftOption={{ id: "true", label: "Yes" }}
                                        rightOption={{ id: "false", label: "No" }}
                                        onChange={(id) => updateField("extract", id === "true")}
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

                        {priceCurrencies.length > 0 && (
                            <SectionBlock title="Prices by Currency" description="Each currency now lives in its own cleaner pricing card.">
                                <div className="space-y-3">
                                    {priceCurrencies.map((cur) => {
                                        const existingPrice = cur.id ? form.prices?.find((p: any) => p.currencyId === cur.id) : undefined;
                                        return (
                                            <div key={cur.value} className="rounded-[22px] border border-[#ECEEF2] bg-[#F8F9FB] p-4">
                                                <div className="mb-3 flex items-center justify-between gap-3">
                                                    <div className="text-sm font-semibold text-[#1A1A1A]">{cur.label}</div>
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
                                                                if (!cur.id) {
                                                                    showError({
                                                                        title: "Currency is not configured",
                                                                        description: `Currency ${cur.value} is not configured`,
                                                                    });
                                                                    return;
                                                                }
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
                                                                if (!cur.id) {
                                                                    showError({
                                                                        title: "Currency is not configured",
                                                                        description: `Currency ${cur.value} is not configured`,
                                                                    });
                                                                    return;
                                                                }
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
                            <div>
                                <label className="mb-1.5 block text-xs font-medium text-[#4E525D]">Location Embed URL</label>
                                <input
                                    className={inputClass}
                                    value={form.locationGoogleMapsUrl || ""}
                                    onChange={(e) => updateField("locationGoogleMapsUrl", e.target.value)}
                                    placeholder="https://www.google.com/maps/embed?pb=..."
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
                                {form.gallery && form.gallery.length > 0 && (() => {
                                    const galleryList = form.gallery;
                                    return (
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between text-xs text-[#808191]">
                                            <span>Drag images to reorder gallery display sequence</span>
                                            <span>{galleryList.length} photos</span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
                                            {galleryList.map((item: any, idx: number) => {
                                                const isDragging = draggedGalleryIndex === idx;
                                                const isDragOver = dragOverGalleryIndex === idx && !isDragging;
                                                return (
                                                    <div
                                                        key={idx}
                                                        draggable
                                                        onDragStart={(e) => handleGalleryItemDragStart(e, idx)}
                                                        onDragOver={(e) => handleGalleryItemDragOver(e, idx)}
                                                        onDragLeave={(e) => {
                                                            e.stopPropagation();
                                                            if (dragOverGalleryIndex === idx) setDragOverGalleryIndex(null);
                                                        }}
                                                        onDrop={(e) => handleGalleryItemDrop(e, idx)}
                                                        onDragEnd={handleGalleryItemDragEnd}
                                                        className={`group relative overflow-hidden rounded-[20px] border p-2 transition-all cursor-grab active:cursor-grabbing ${
                                                            isDragging
                                                                ? "opacity-30 border-blue-400 scale-[0.97] bg-blue-50/20"
                                                                : isDragOver
                                                                    ? "border-blue-500 bg-blue-50/50 ring-2 ring-blue-400/40"
                                                                    : "border-[#ECEEF2] bg-[#F8F9FB] hover:border-[#D8DCE5]"
                                                        }`}
                                                    >
                                                        <img
                                                            src={item.url || item}
                                                            alt={`Gallery ${idx + 1}`}
                                                            className="h-28 w-full rounded-[16px] object-cover pointer-events-none"
                                                        />
                                                        <div className="absolute left-3 top-3 flex h-6 w-6 cursor-grab items-center justify-center rounded-full bg-[rgba(17,24,39,0.72)] text-white backdrop-blur-sm opacity-70 transition-opacity group-hover:opacity-100">
                                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                                                                <circle cx="8" cy="4" r="2" />
                                                                <circle cx="8" cy="12" r="2" />
                                                                <circle cx="8" cy="20" r="2" />
                                                                <circle cx="16" cy="4" r="2" />
                                                                <circle cx="16" cy="12" r="2" />
                                                                <circle cx="16" cy="20" r="2" />
                                                            </svg>
                                                        </div>
                                                        <div className="absolute right-3 top-3 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                                                            {idx > 0 && (
                                                                <button
                                                                    type="button"
                                                                    aria-label={`Move image ${idx + 1} left`}
                                                                    title="Move left"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        reorderGalleryItem(idx, idx - 1);
                                                                    }}
                                                                    className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-[rgba(17,24,39,0.72)] text-white backdrop-blur-sm transition-colors hover:bg-black"
                                                                >
                                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                                                        <path d="M15 18l-6-6 6-6" />
                                                                    </svg>
                                                                </button>
                                                            )}
                                                            {idx < galleryList.length - 1 && (
                                                                <button
                                                                    type="button"
                                                                    aria-label={`Move image ${idx + 1} right`}
                                                                    title="Move right"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        reorderGalleryItem(idx, idx + 1);
                                                                    }}
                                                                    className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-[rgba(17,24,39,0.72)] text-white backdrop-blur-sm transition-colors hover:bg-black"
                                                                >
                                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                                                        <path d="M9 18l6-6-6-6" />
                                                                    </svg>
                                                                </button>
                                                            )}
                                                            <button
                                                                type="button"
                                                                aria-label={`Remove gallery image ${idx + 1}`}
                                                                title="Remove image"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    removeGalleryItem(idx);
                                                                }}
                                                                className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-[rgba(220,38,38,0.85)] text-white backdrop-blur-sm transition-colors hover:bg-red-600"
                                                            >
                                                                <IoClose size={16} />
                                                            </button>
                                                        </div>
                                                        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full bg-[#1A1A1A]/75 px-2 py-0.5 text-[10px] font-medium text-white">
                                                            <span>#{idx + 1}</span>
                                                            {idx === 0 && <span className="rounded bg-blue-500/80 px-1 text-[9px] uppercase">Cover</span>}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                    );
                                })()}
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
        {isApartmentTypeModalOpen ? (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#10182833] px-4">
                <div className="w-full max-w-[420px] rounded-[24px] bg-white p-6 shadow-[0_24px_48px_rgba(16,24,40,0.18)]">
                    <div className="mb-5 flex items-center justify-between">
                        <h4 className="text-xl font-medium text-[#1A1A1A]">Create listing type</h4>
                        <button
                            type="button"
                            onClick={() => {
                                setIsApartmentTypeModalOpen(false);
                                setApartmentTypeDraft({ name: "", title: "" });
                            }}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[#666]"
                            disabled={createApartmentTypeMutation.isPending}
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
                                    value={apartmentTypeDraft.name}
                                    onChange={(e) => setApartmentTypeDraft((prev) => ({ ...prev, name: e.target.value }))}
                                    placeholder="studio"
                                />
                            </div>
                            <div>
                                <label className="mb-1.5 block text-xs text-[#4E525D]">Title</label>
                                <input
                                    className="w-full h-10 rounded-xl border border-gray-200 bg-[#F4F5F6] px-3 text-sm outline-none focus:border-gray-400 focus:bg-white"
                                    value={apartmentTypeDraft.title}
                                    onChange={(e) => setApartmentTypeDraft((prev) => ({ ...prev, title: e.target.value }))}
                                    placeholder="Studio"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => {
                                setIsApartmentTypeModalOpen(false);
                                setApartmentTypeDraft({ name: "", title: "" });
                            }}
                            className="rounded-full border border-[#C9CDD5] bg-white px-5 py-2.5 text-sm font-medium text-[#4E525D] transition-colors hover:bg-[#F8F9FB] disabled:opacity-50"
                            disabled={createApartmentTypeMutation.isPending}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleCreateListingType}
                            className="rounded-full bg-[#4E525D] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:opacity-90 disabled:opacity-50"
                            disabled={createApartmentTypeMutation.isPending}
                        >
                            {createApartmentTypeMutation.isPending ? "Creating..." : "Add"}
                        </button>
                    </div>
                </div>
            </div>
        ) : null}
        {isOwnerModalOpen ? (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#10182833] px-4">
                <div className="w-full max-w-[460px] rounded-[24px] bg-white p-6 shadow-[0_24px_48px_rgba(16,24,40,0.18)]">
                    <div className="mb-5 flex items-center justify-between">
                        <h4 className="text-xl font-medium text-[#1A1A1A]">Create owner</h4>
                        <button
                            type="button"
                            onClick={() => {
                                setIsOwnerModalOpen(false);
                                setOwnerDraft({ firstName: "", lastName: "", phoneNumber: "", profession: "" });
                            }}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[#666]"
                            disabled={createOwnerMutation.isPending}
                        >
                            <IoClose className="h-5 w-5" />
                        </button>
                    </div>
                    <div className="space-y-5">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="mb-1.5 block text-xs text-[#4E525D]">First name</label>
                                <input
                                    className="w-full h-10 rounded-xl border border-gray-200 bg-[#F4F5F6] px-3 text-sm outline-none focus:border-gray-400 focus:bg-white"
                                    value={ownerDraft.firstName}
                                    onChange={(e) => setOwnerDraft((prev) => ({ ...prev, firstName: e.target.value }))}
                                    placeholder="John"
                                />
                            </div>
                            <div>
                                <label className="mb-1.5 block text-xs text-[#4E525D]">Last name</label>
                                <input
                                    className="w-full h-10 rounded-xl border border-gray-200 bg-[#F4F5F6] px-3 text-sm outline-none focus:border-gray-400 focus:bg-white"
                                    value={ownerDraft.lastName}
                                    onChange={(e) => setOwnerDraft((prev) => ({ ...prev, lastName: e.target.value }))}
                                    placeholder="Doe"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="mb-1.5 block text-xs text-[#4E525D]">Phone number</label>
                                <input
                                    className="w-full h-10 rounded-xl border border-gray-200 bg-[#F4F5F6] px-3 text-sm outline-none focus:border-gray-400 focus:bg-white"
                                    value={ownerDraft.phoneNumber}
                                    onChange={(e) => setOwnerDraft((prev) => ({ ...prev, phoneNumber: e.target.value }))}
                                    placeholder="+994..."
                                />
                            </div>
                            <div>
                                <label className="mb-1.5 block text-xs text-[#4E525D]">Profession (optional)</label>
                                <input
                                    className="w-full h-10 rounded-xl border border-gray-200 bg-[#F4F5F6] px-3 text-sm outline-none focus:border-gray-400 focus:bg-white"
                                    value={ownerDraft.profession}
                                    onChange={(e) => setOwnerDraft((prev) => ({ ...prev, profession: e.target.value }))}
                                    placeholder="Engineer"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => {
                                setIsOwnerModalOpen(false);
                                setOwnerDraft({ firstName: "", lastName: "", phoneNumber: "", profession: "" });
                            }}
                            className="rounded-full border border-[#C9CDD5] bg-white px-5 py-2.5 text-sm font-medium text-[#4E525D] transition-colors hover:bg-[#F8F9FB] disabled:opacity-50"
                            disabled={createOwnerMutation.isPending}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleCreateOwner}
                            className="rounded-full bg-[#4E525D] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:opacity-90 disabled:opacity-50"
                            disabled={createOwnerMutation.isPending}
                        >
                            {createOwnerMutation.isPending ? "Creating..." : "Add"}
                        </button>
                    </div>
                </div>
            </div>
        ) : null}
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
                        <div className="text-xs text-[#808191]">City: {form.city || "-"}</div>
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
        </>
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
