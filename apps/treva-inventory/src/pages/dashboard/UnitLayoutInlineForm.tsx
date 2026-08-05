import { useState, useEffect, useMemo, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { unitLayoutsApi, type CreateUnitLayoutData, type UnitLayoutStatus } from "../../api/unit-layouts";
import { unitTypeOptionsApi, type UnitTypeOption } from "../../api/unit-type-options";
import { attributesApi, type Attribute } from "../../api/attributes";
import { categoriesApi, type Category } from "../../api/categories";
import { useMessageCenter } from "../../components/MessageCenter";
import { getApiErrorMessage } from "../../utils/apiError";
import { STATIC_CURRENCIES } from "../../utils/staticCurrencies";
import { FormDropdown, FormKeywordInput } from "@repo/ui";
import { ImageAssetCard } from "../../components/ImageAssetCard";
import { IoClose } from "react-icons/io5";

type TabKey = "basic" | "area" | "gallery" | "description" | "seo";

const TABS: { key: TabKey; label: string }[] = [
    { key: "basic", label: "Basic Info" },
    { key: "area", label: "Area & Pricing" },
    { key: "gallery", label: "Gallery" },
    { key: "description", label: "Description" },
    { key: "seo", label: "SEO" },
];

const UNIT_LAYOUT_STATUS_BUTTONS = [
    {
        id: "available" as const,
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

function SectionBlock({
    title,
    description,
    children,
}: {
    title: string;
    description?: string;
    children: React.ReactNode;
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

const SUPPORTED_IMAGE_UPLOAD_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"] as const;
const IMAGE_UPLOAD_ACCEPT = SUPPORTED_IMAGE_UPLOAD_TYPES.join(",");

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

const responseData = <T,>(response: unknown): T | undefined => {
    const value = response as any;
    return value?.data?.data ?? value?.data ?? value;
};

const responseArray = <T,>(response: unknown): T[] => {
    const value = responseData<T[] | { data?: T[] }>(response);
    if (Array.isArray(value)) return value;
    if (Array.isArray((value as any)?.data)) return (value as any).data;
    return [];
};

const firstValue = (...values: unknown[]) => {
    for (const value of values) {
        if (value !== undefined && value !== null && value !== "") return value;
    }
    return undefined;
};

const toNumberOrUndefined = (...values: unknown[]) => {
    const value = firstValue(...values);
    if (value === undefined) return undefined as unknown as number;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : (undefined as unknown as number);
};

export function HouseForm({
    embedded = false,
    inline = false,
    houseId,
    parentHouseId,
    onSuccess,
    categorySlug: categorySlugProp,
}: {
    embedded?: boolean;
    inline?: boolean;
    houseId?: string;
    parentHouseId?: string;
    onSuccess?: () => void;
    categorySlug?: string;
} = {}) {
    const { slug: urlSlug } = useParams<{ slug: string }>();
    const [selectedCategoryId, setSelectedCategoryId] = useState("");
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { showError, showSuccess } = useMessageCenter();
    const isEditMode = !!houseId;

    const [activeTab, setActiveTab] = useState<TabKey>("basic");
    const [isUnitTypeModalOpen, setIsUnitTypeModalOpen] = useState(false);
    const [unitTypeDraft, setUnitTypeDraft] = useState({ name: "", title: "" });
    const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
    const [seoTitleManuallyEdited, setSeoTitleManuallyEdited] = useState(false);
    const [draggedGalleryIndex, setDraggedGalleryIndex] = useState<number | null>(null);
    const [dragOverGalleryIndex, setDragOverGalleryIndex] = useState<number | null>(null);
    const [brochureUploading, setBrochureUploading] = useState(false);
    const brochureFileRef = useRef<HTMLInputElement>(null);

    const { data: unitTypesRes } = useQuery({
        queryKey: ["unit-type-options"],
        queryFn: () => unitTypeOptionsApi.getAll(),
    });

    const { data: attributesRes } = useQuery({
        queryKey: ["attributes"],
        queryFn: () => attributesApi.getAll(),
    });

    const { data: categoriesRes } = useQuery({
        queryKey: ["categories", "object"],
        queryFn: () => categoriesApi.getAll("object"),
    });

    const categories = useMemo(() => responseArray<Category>(categoriesRes), [categoriesRes]);

    const selectedCategorySlug = useMemo(() => {
        if (categorySlugProp || urlSlug) return categorySlugProp || urlSlug || "";
        return categories.find((item) => item.id === selectedCategoryId)?.slug || "";
    }, [categorySlugProp, urlSlug, categories, selectedCategoryId]);

    const slug = selectedCategorySlug;

    const { data: categoryRes } = useQuery({
        queryKey: ["category", slug],
        queryFn: () => categoriesApi.getBySlug(slug!),
        enabled: !!slug,
    });

    const { data: existingHouse, isLoading: isLoadingHouse } = useQuery({
        queryKey: ["unit-layout", houseId],
        queryFn: async () => {
            const response = await unitLayoutsApi.getById(houseId!);
            return response.data;
        },
        enabled: !!houseId,
    });

    const category = useMemo(() => responseData<any>(categoryRes), [categoryRes]);
    const existingHouseData = useMemo(() => responseData<any>(existingHouse), [existingHouse]);
    const unitTypes = useMemo(() => responseArray<UnitTypeOption>(unitTypesRes), [unitTypesRes]);
    const attributes = useMemo(() => responseArray<Attribute>(attributesRes), [attributesRes]);
    const currencies = useMemo(
        () => STATIC_CURRENCIES.map((c) => ({ id: c.value, name: c.label, title: c.label, value: c.value })),
        [],
    );
    const categoryId = category?.id || selectedCategoryId || "";
    const shouldSelectCategory = !categorySlugProp && !urlSlug;

    const existingDocuments = useMemo(() => {
        const docs = (existingHouseData as any)?.documents;
        return Array.isArray(docs) ? docs : [];
    }, [existingHouseData]);

    const brochureDoc = useMemo(() => {
        return existingDocuments.find((doc: any) => doc?.type === "brochure") || null;
    }, [existingDocuments]);

    const brochureFileName = useMemo(() => {
        const url = brochureDoc?.url;
        if (!url) return "";
        try {
            return String(url).split("/").pop() || "";
        } catch {
            return "";
        }
    }, [brochureDoc?.url]);

    const findOptionId = <T extends { id: string; value?: string; name?: string; title?: string }>(
        options: T[] | undefined,
        value: unknown
    ) => {
        if (!value) return "";
        const raw = String(value);
        return options?.find((option) => {
            const candidates = [option.id, option.value, option.name, option.title].filter(Boolean).map(String);
            return candidates.includes(raw);
        })?.id || raw;
    };

    const findOptionValue = <T extends { id: string; value?: string; name?: string; title?: string }>(
        options: T[] | undefined,
        value: unknown
    ) => {
        if (!value) return "";
        const raw = String(value);
        const option = options?.find((item) => {
            const candidates = [item.id, item.value, item.name, item.title].filter(Boolean).map(String);
            return candidates.includes(raw);
        });
        return option?.value || option?.title || option?.name || option?.id || raw;
    };

    const optionLabel = <T extends { id: string; value?: string; name?: string; title?: string }>(
        options: T[] | undefined,
        value: unknown
    ) => {
        if (!value) return "";
        const raw = String(value);
        const option = options?.find((item) => {
            const candidates = [item.id, item.value, item.name, item.title].filter(Boolean).map(String);
            return candidates.includes(raw);
        });
        return option?.value || option?.title || option?.name || raw;
    };

    const dropdownOptions = <T extends { id: string; value?: string; name?: string; title?: string }>(
        options: T[],
        currentValue: string,
        mapper: (option: T) => { id: string; label: string }
    ) => {
        const mapped = options.map(mapper);
        if (currentValue && !mapped.some((option) => option.id === currentValue)) {
            mapped.unshift({ id: currentValue, label: optionLabel(options, currentValue) });
        }
        return mapped;
    };

        const [form, setForm] = useState({
            name: "",
            title: "",
            slug: "",
            seoTitle: "",
            seoDescription: "",
            seoKeywords: "",
            canonicalUrl: "",
            seoImage: "",
            unitTypeOptionId: "",
            realEstateType: "",
            status: "available" as UnitLayoutStatus,
            floorFrom: undefined as unknown as number,
            floorTo: undefined as unknown as number,
            roomCount: undefined as unknown as number,
            attributeIds: [] as string[],
            totalArea: undefined as unknown as number,
            internalArea: undefined as unknown as number,
            balconyArea: undefined as unknown as number,
            prices: [] as { currencyId: string; priceTotal?: number; priceByArea?: number }[],
            image: "",
            coverImage: "",
            gallery: [] as { url: string; alt?: string }[],
            entrance: "",
            description: "",
        });

    useEffect(() => {
        if (existingHouseData && isEditMode) {
            const house = existingHouseData;
            const totalArea = Number(firstValue(house.totalArea, house.area, house.internalArea, 0));
            const internalArea = Number(firstValue(house.internalArea, house.totalArea, house.area, 0));
            const balconyArea = Number(firstValue(house.balconyArea, 0));
            const rawPrices = house.pricesByCurrency || house.priceByCurrency || house.prices || {};
            const pricesArray = rawPrices && typeof rawPrices === "object"
                ? Object.entries(rawPrices).map(([currencyValue, priceTotal]) => {
                    const currencyKey = String(currencyValue);
                    const cur = currencies.find((c) => c.id === currencyKey || c.value === currencyKey || c.name === currencyKey);
                    const total = Number(priceTotal) || 0;
                    return {
                        currencyId: cur?.id || String(currencyValue),
                        priceTotal: total,
                        priceByArea: totalArea > 0 ? Number((total / totalArea).toFixed(2)) : 0,
                    };
                }).filter(p => p.currencyId)
                : [];

                setForm({
                    name: house.name || house.title || "",
                    title: house.title || house.name || "",
                slug: house.slug || "",
                seoTitle: house.seoTitle || "",
                seoDescription: house.seoDescription || "",
                seoKeywords: house.seoKeywords || "",
                canonicalUrl: house.canonicalUrl || "",
                seoImage: house.seoImage || "",
                unitTypeOptionId: findOptionId(
                    unitTypes,
                    firstValue(
                        (house as any).unitTypeOptionId,
                        house.apartmentTypeId,
                        (house as any).unitTypeOption?.id,
                        (house as any).unitTypeOption?.name,
                        (house as any).unitTypeOption?.title,
                    ),
                ),
                realEstateType: house.realEstateType || "",
                status: (((firstValue(house.status, house.statusId) as string) || "available") as UnitLayoutStatus),
                floorFrom: toNumberOrUndefined(house.floorFrom, house.numberOfFloors?.start, house.floor),
                floorTo: toNumberOrUndefined(house.floorTo, house.numberOfFloors?.end, house.floor),
                roomCount: toNumberOrUndefined(house.roomCount, house.numberOfRooms, house.number),
                attributeIds: house.attributeIds || house.similarApartmentIds || [],
                totalArea: (totalArea || undefined) as number,
                internalArea: (internalArea || undefined) as number,
                balconyArea: (balconyArea || undefined) as number,
                prices: pricesArray,
                image: house.image || house.mainImage?.url || "",
                    coverImage: house.coverImage?.url || "",
                gallery: (house.gallery || []).map((g: any) => ({ url: g.url, alt: g.alt })),
                entrance: house.entrance || "",
                description: house.description || "",
            });
            setSlugManuallyEdited(Boolean(house.slug));
            setSeoTitleManuallyEdited(Boolean(house.seoTitle));
        }
    }, [existingHouseData, isEditMode, currencies, unitTypes]);

    useEffect(() => {
        if (!selectedCategoryId && existingHouseData?.category?.id) {
            setSelectedCategoryId(existingHouseData.category.id);
        }
    }, [existingHouseData, selectedCategoryId]);

    const handleSlugFromTitle = (title: string) => {
        const nextSlug = slugify(title);
        setForm((f) => ({
            ...f,
            ...(!slugManuallyEdited ? { slug: nextSlug } : {}),
            ...(!seoTitleManuallyEdited ? { seoTitle: title } : {}),
        }));
    };

    const updateField = (field: string, value: any) => {
        setForm((f) => ({ ...f, [field]: value }));
    };

    const createMutation = useMutation({
        mutationFn: (data: CreateUnitLayoutData) => {
            if (isEditMode && houseId) {
                return unitLayoutsApi.update(houseId, data);
            }
            return unitLayoutsApi.create(data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["unit-layouts"] });
            queryClient.invalidateQueries({ queryKey: ["unit-layouts", slug] });
            queryClient.invalidateQueries({
                queryKey: ["unit-layouts", slug, parentHouseId || existingHouseData?.houseId],
            });
            if (houseId) queryClient.invalidateQueries({ queryKey: ["unit-layout", houseId] });
            showSuccess({ title: isEditMode ? "Unit layout updated" : "Unit layout created" });
            if (onSuccess) {
                onSuccess();
            } else if (!inline) {
                navigate(slug ? `/dashboard/offplan/objects/${slug}/edit` : "/dashboard/offplan/unit-layouts");
            }
        },
        onError: (error) => {
            showError({
                title: isEditMode ? "Unit layout could not be updated" : "Unit layout could not be created",
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
                updateField("unitTypeOptionId", created.id);
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

    const validateTab = (tab: TabKey): string[] => {
        const errors: string[] = [];
        switch (tab) {
            case "basic":
                if (!categoryId) errors.push("Object is required");
                if (!form.name?.trim()) errors.push("Name is required");
                if (!form.title?.trim()) errors.push("Title is required");
                if (!form.unitTypeOptionId) errors.push("Unit type is required");
                if (!form.floorFrom || form.floorFrom < 1) errors.push("Floor From is required");
                if (form.floorFrom && form.floorFrom > 999) errors.push("Floor From must be â‰¤ 999");
                if (form.floorTo && form.floorTo < 1) errors.push("Floor To must be â‰¥ 1");
                if (form.floorTo && form.floorTo > 999) errors.push("Floor To must be â‰¤ 999");
                if (form.roomCount && form.roomCount < 1) errors.push("Room Count must be â‰¥ 1");
                if (form.roomCount && form.roomCount > 999) errors.push("Room Count must be â‰¤ 999");
                break;
            case "area":
                if (!form.totalArea || form.totalArea <= 0) errors.push("Total Area is required");
                if (!form.prices || form.prices.length === 0) {
                    errors.push("At least one currency price is required");
                } else {
                    const hasAnyTotal = form.prices.some((p) => p.priceTotal && p.priceTotal > 0);
                    const hasAnyPerArea = form.prices.some((p) => p.priceByArea && p.priceByArea > 0);
                    if (!hasAnyTotal) errors.push("Price Total is required");
                    if (!hasAnyPerArea) errors.push("Price per mÂ² is required");
                }
                break;
            case "gallery":
                if (!form.image?.trim()) errors.push("Main Image is required");
                break;
            case "seo":
                if (!form.slug?.trim()) errors.push("Slug is required");
                break;
        }
        return errors;
    };

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

    const showValidationToast = (errors: string[]) => {
        if (errors.length === 0) return;
        showError({
            title: "Please fill required fields",
            description: errors[0],
        });
    };

    const handleBrochureFileUpload = async (file: File) => {
        if (!isEditMode || !houseId) {
            showError({
                title: "Please save unit layout first",
                description: "Brochure can be uploaded after the unit layout is created.",
            });
            return;
        }

        setBrochureUploading(true);
        try {
            const uploadRes = await unitLayoutsApi.uploadFile(file);
            const url = uploadRes?.data?.url;
            if (!url) throw new Error("Upload response is missing url");

            const nextDocuments = [
                ...existingDocuments.filter((doc: any) => doc?.type !== "brochure"),
                { type: "brochure", url },
            ];

            await unitLayoutsApi.update(houseId, { documents: nextDocuments });
            queryClient.invalidateQueries({ queryKey: ["unit-layout", houseId] });
            queryClient.invalidateQueries({ queryKey: ["unit-layouts"] });
            queryClient.invalidateQueries({ queryKey: ["unit-layouts", slug] });
            showSuccess({ title: "Brochure saved" });
        } catch (error) {
            showError({
                title: "Brochure could not be saved",
                description: getApiErrorMessage(error, "Please try again."),
            });
        } finally {
            setBrochureUploading(false);
        }
    };

    const removeBrochure = async () => {
        if (!isEditMode || !houseId) return;
        const nextDocuments = existingDocuments.filter((doc: any) => doc?.type !== "brochure");
        setBrochureUploading(true);
        try {
            await unitLayoutsApi.update(houseId, { documents: nextDocuments });
            queryClient.invalidateQueries({ queryKey: ["unit-layout", houseId] });
            queryClient.invalidateQueries({ queryKey: ["unit-layouts"] });
            queryClient.invalidateQueries({ queryKey: ["unit-layouts", slug] });
            showSuccess({ title: "Brochure removed" });
        } catch (error) {
            showError({
                title: "Brochure could not be removed",
                description: getApiErrorMessage(error, "Please try again."),
            });
        } finally {
            setBrochureUploading(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const allErrors: Record<string, string[]> = {};
        for (const tab of TABS) {
            const errs = validateTab(tab.key);
            if (errs.length > 0) allErrors[tab.key] = errs;
        }
        if (Object.keys(allErrors).length > 0) {
            const firstInvalid = TABS.find((t) => allErrors[t.key]);
            if (firstInvalid) {
                setActiveTab(firstInvalid.key);
                showValidationToast(allErrors[firstInvalid.key] ?? []);
            }
            return;
        }

        const pricesRecord: Record<string, number> = {};
        for (const p of form.prices) {
            if (!p.priceTotal) continue;
            const cur = currencies.find((c) => c.id === p.currencyId || c.value === p.currencyId || c.name === p.currencyId);
            pricesRecord[cur?.value || p.currencyId] = p.priceTotal;
        }

        const seoTitle = normalizeOptionalText(form.seoTitle);
        const seoDescription = normalizeOptionalText(form.seoDescription);
        const seoKeywords = normalizeOptionalText(form.seoKeywords);
        const canonicalUrl = normalizeOptionalText(form.canonicalUrl);
        const seoImage = normalizeOptionalText(form.seoImage);
        const entrance = normalizeOptionalText(form.entrance);
        const realEstateType = normalizeOptionalText(form.realEstateType);
        const houseIdValue = parentHouseId || existingHouseData?.houseId || undefined;
        const descriptionValue = normalizeOptionalText(form.description);

        const submitData: CreateUnitLayoutData = {
            title: form.title,
            name: form.name,
            slug: normalizeOptionalText(form.slug) || "",
            categoryId,
            floor: form.floorFrom,
            totalArea: form.totalArea,
            internalArea: form.internalArea || form.totalArea,
            balconyArea: form.balconyArea || 0,
            prices: pricesRecord,
            completionYear: existingHouseData?.completionYear || new Date().getFullYear(),
            numberOfFloors: { start: form.floorFrom, end: form.floorTo || form.floorFrom },
            similarApartmentIds: form.attributeIds,
            attributeIds: form.attributeIds,
            heatingTypeIds: [],
            ...(form.image ? { mainImage: { url: form.image } } : {}),
            ...(form.coverImage ? { coverImage: { url: form.coverImage } } : {}),
            gallery: form.gallery,
            status: (form.status || "available") as UnitLayoutStatus,
            ...(seoTitle ? { seoTitle } : {}),
            ...(seoDescription ? { seoDescription } : {}),
            ...(seoKeywords ? { seoKeywords } : {}),
            ...(canonicalUrl ? { canonicalUrl } : {}),
            ...(seoImage ? { seoImage } : {}),
            ...(houseIdValue ? { houseId: houseIdValue } : {}),
            ...(entrance ? { entrance } : {}),
            ...(realEstateType ? { realEstateType } : {}),
            ...(form.roomCount ? { number: form.roomCount } : {}),
            ...(form.unitTypeOptionId ? { unitTypeOptionId: form.unitTypeOptionId } : {}),
            ...(descriptionValue ? { description: descriptionValue } : {}),
        };

        createMutation.mutate(submitData);
    };

    const inputClass =
        "w-full h-10 rounded-xl border border-gray-200 bg-[#F4F5F6] px-3 py-0 text-sm leading-5 text-[#1A1A1A] placeholder-[#999] outline-none focus:border-gray-400 focus:bg-white";

    // â”€â”€â”€ Gallery Upload â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const [uploading, setUploading] = useState(false);
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
            showError({
                title: "File upload failed",
                description: "Only JPEG, PNG, WebP and GIF images are allowed.",
            });
            return null;
        }

        return items;
    };

    const handleMainImageUpload = async (file: File) => {
        if (!validateImageFiles([file])) return;

        setUploading(true);
        try {
            const res = await unitLayoutsApi.uploadFile(file);
            updateField("image", res.data.url);
        } catch (error) {
            showError({
                title: "Main image upload failed",
                description: getApiErrorMessage(error, "Please try again."),
            });
        } finally {
            setUploading(false);
        }
    };

    const handleCoverImageUpload = async (file: File) => {
        if (!validateImageFiles([file])) return;

        setUploading(true);
        try {
            const res = await unitLayoutsApi.uploadFile(file);
            updateField("coverImage", res.data.url);
        } catch (error) {
            showError({
                title: "Cover image upload failed",
                description: getApiErrorMessage(error, "Please try again."),
            });
        } finally {
            setUploading(false);
        }
    };

    const handleSeoImageUpload = async (file: File) => {
        if (!validateImageFiles([file])) return;

        setUploading(true);
        try {
            const res = await unitLayoutsApi.uploadFile(file);
            updateField("seoImage", res.data.url);
        } catch (error) {
            showError({
                title: "SEO image upload failed",
                description: getApiErrorMessage(error, "Please try again."),
            });
        } finally {
            setUploading(false);
        }
    };

    const handleGalleryUpload = async (files: FileList | File[]) => {
        const arr = validateImageFiles(files);
        if (!arr) return;

        const currentCount = form.gallery?.length || 0;
        if (currentCount + arr.length > 20) {
            showError({
                title: "Gallery upload failed",
                description: `Maximum 20 gallery images allowed. You can add ${20 - currentCount} more.`,
            });
            return;
        }
        setUploading(true);
        try {
            const newItems: any[] = [];
            for (const file of arr) {
                const res = await unitLayoutsApi.uploadFile(file);
                newItems.push(res.data);
            }
            setForm((f) => ({ ...f, gallery: [...(f.gallery || []), ...newItems] }));
        } catch (error) {
            showError({
                title: "Gallery upload failed",
                description: getApiErrorMessage(error, "Please try again."),
            });
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

    // â”€â”€â”€ Render â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    if (isEditMode && isLoadingHouse) {
        return (
            <main className="flex-1 p-8 overflow-y-auto" style={{ background: "var(--background-primary-50, #FFFFFF80)" }}>
                    <div className="rounded-[32px] border border-[#ECEEF2] bg-[#FCFCFD] p-6 shadow-[0_10px_30px_rgba(17,24,39,0.04)]">
                    <div className="flex items-center justify-center py-12">
                        <div className="text-sm text-[#666666]">Loading unit layout data...</div>
                    </div>
                </div>
            </main>
        );
    }

    const formContent = (
            <div className="rounded-[32px] border border-[#ECEEF2] bg-[#FCFCFD] p-6 shadow-[0_10px_30px_rgba(17,24,39,0.04)]">
                <div className="mb-6">
                    <h4 className="m-0 text-[#1A1A1A]" style={{ fontWeight: 600, fontSize: 16, lineHeight: "20px" }}>
                        {isEditMode ? "Edit Unit Layout" : "Add Unit Layout"}
                    </h4>
                </div>

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
                {/* â”€â”€â”€ Tab: Basic Info â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
                    {activeTab === "basic" && (
                        <div className="space-y-5">
                                <SectionBlock title="Identity" description="Core unit layout information and classification.">
                                    <div className="grid gap-5 lg:grid-cols-[280px_minmax(0,1fr)] lg:items-start">
                                        <div className="rounded-[24px] border border-[#ECEEF2] bg-[#FBFCFD] p-4">
                                            <div className="space-y-4">
                                                <ImageAssetCard
                                                    label="Main Image *"
                                                    description="Primary thumbnail used in cards and quick unit layout views."
                                                    alt="Main"
                                                    imageUrl={form.image || null}
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
                                                        description="Optional portrait-style visual for richer unit layout presentation."
                                                        alt="Cover"
                                                        imageUrl={form.coverImage || null}
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
                                            {shouldSelectCategory ? (
                                                <div>
                                                    <FormDropdown
                                                        label="Object *"
                                                        value={selectedCategoryId}
                                                        options={dropdownOptions(categories, selectedCategoryId, (item) => ({ id: item.id, label: item.title }))}
                                                        placeholder="Select object"
                                                        onChange={(value) => {
                                                            setSelectedCategoryId(String(value));
                                                        }}
                                                    />
                                                </div>
                                            ) : null}
                                            <div className="grid gap-4 lg:grid-cols-2">
                                                <div>
                                                    <label className="mb-1 block text-xs text-[#4E525D]">Unit layout name *</label>
                                                    <input
                                                        className={inputClass}
                                                        value={form.name || ""}
                                                        onChange={(e) => updateField("name", e.target.value)}
                                                        placeholder="Sea Breeze"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="mb-1 block text-xs text-[#4E525D]">Title *</label>
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
                                            </div>
                                            <div className="grid gap-4 lg:grid-cols-2">
                                                <FormDropdown
                                                    label="Unit type *"
                                                    value={form.unitTypeOptionId || ""}
                                                    options={dropdownOptions(unitTypes, form.unitTypeOptionId || "", (t) => ({ id: t.id, label: t.title }))}
                                                    placeholder="Select unit type"
                                                    onChange={(id) => updateField("unitTypeOptionId", id)}
                                                    createLabel="Create unit type"
                                                    onCreateClick={() => setIsUnitTypeModalOpen(true)}
                                                />
                                                <div>
                                                    <label className="mb-1 block text-xs text-[#4E525D]">Entrance (optional)</label>
                                                    <input
                                                        className={inputClass}
                                                        type="text"
                                                        value={form.entrance ?? ""}
                                                        onChange={(e) => updateField("entrance", e.target.value)}
                                                        placeholder="A"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="mb-1 block text-xs text-[#4E525D]">Real estate type (optional)</label>
                                                <input
                                                    className={inputClass}
                                                    type="text"
                                                    value={form.realEstateType ?? ""}
                                                    onChange={(e) => updateField("realEstateType", e.target.value)}
                                                    placeholder="apartment"
                                                />
                                            </div>
                                            <div>
                                                <label className="mb-1.5 block text-xs font-medium text-[#4E525D]">Status</label>
                                                <div className="grid grid-cols-3 gap-2">
                                                    {UNIT_LAYOUT_STATUS_BUTTONS.map((option) => {
                                                        const isSelected = (form.status || "available") === option.id;
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
                                        </div>
                                    </div>
                                </SectionBlock>

                            <SectionBlock title="Specification" description="Physical, ownership and construction details for this layout.">
                                <div className="grid gap-4 lg:grid-cols-3">
                                    <div>
                                        <label className="mb-1 block text-xs text-[#4E525D]">Floor From *</label>
                                        <input
                                            className={inputClass}
                                            type="number"
                                            value={form.floorFrom ?? ""}
                                            onChange={(e) => updateField("floorFrom", parseInt(e.target.value) || undefined)}
                                            placeholder="8"
                                            min={1}
                                            max={999}
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-xs text-[#4E525D]">Floor To</label>
                                        <input
                                            className={inputClass}
                                            type="number"
                                            value={form.floorTo ?? ""}
                                            onChange={(e) => updateField("floorTo", parseInt(e.target.value) || undefined)}
                                            placeholder="16"
                                            min={1}
                                            max={999}
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-xs text-[#4E525D]">Room Count</label>
                                        <input
                                            className={inputClass}
                                            type="number"
                                            value={form.roomCount ?? ""}
                                            onChange={(e) => updateField("roomCount", parseInt(e.target.value) || undefined)}
                                            placeholder="2"
                                            min={1}
                                            max={999}
                                        />
                                    </div>
                                </div>
                            </SectionBlock>

                            <SectionBlock title="Brochure" description="Upload a brochure PDF and save it immediately to this unit layout.">
                                <div className="space-y-3">
                                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 bg-[#F4F5F6] px-4 py-3">
                                        <div className="min-w-0">
                                            <div className="truncate text-sm font-medium text-[#1A1A1A]">
                                                {brochureFileName || "No brochure uploaded"}
                                            </div>
                                            {brochureDoc?.url ? (
                                                <a
                                                    href={brochureDoc.url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="text-xs text-[#4E525D] hover:underline"
                                                >
                                                    Open brochure
                                                </a>
                                            ) : (
                                                <div className="text-xs text-[#999]">PDF only</div>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {brochureDoc?.url ? (
                                                <button
                                                    type="button"
                                                    onClick={removeBrochure}
                                                    disabled={brochureUploading}
                                                    className="rounded-full border border-[#C9CDD5] bg-white px-4 py-2 text-xs font-semibold text-[#4E525D] transition-colors hover:bg-[#F8F9FB] disabled:opacity-50"
                                                >
                                                    Remove
                                                </button>
                                            ) : null}
                                            <button
                                                type="button"
                                                onClick={() => brochureFileRef.current?.click()}
                                                disabled={brochureUploading || !isEditMode}
                                                className="rounded-full bg-[#4E525D] px-4 py-2 text-xs font-semibold text-white transition-colors hover:opacity-90 disabled:opacity-50"
                                            >
                                                {brochureUploading ? "Uploading..." : brochureDoc?.url ? "Replace" : "Upload"}
                                            </button>
                                            <input
                                                ref={brochureFileRef}
                                                type="file"
                                                accept=".pdf"
                                                className="hidden"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) handleBrochureFileUpload(file);
                                                    if (brochureFileRef.current) brochureFileRef.current.value = "";
                                                }}
                                            />
                                        </div>
                                    </div>
                                    {!isEditMode ? (
                                        <div className="text-xs text-[#999]">
                                            Create the unit layout first to enable brochure upload.
                                        </div>
                                    ) : null}
                                </div>
                            </SectionBlock>

                            <SectionBlock title="Attributes" description="Choose the unit layout features shown with the listing.">
                                <div className="flex flex-wrap gap-2 rounded-xl border border-gray-200 bg-[#F4F5F6] px-3 py-2">
                                    {attributes.map((attr: Attribute) => {
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
                                                className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                                                    selected
                                                        ? "border border-blue-400/30 bg-blue-500/20 text-blue-600"
                                                        : "border border-gray-200 bg-white text-[#666666] hover:bg-gray-50 hover:text-[#1A1A1A]"
                                                }`}
                                            >
                                                {attr.icon ? (
                                                    <img src={attr.icon} alt="" className="h-3.5 w-3.5 rounded-sm object-cover" />
                                                ) : null}
                                                {attr.title}
                                            </button>
                                        );
                                    })}
                                    {attributes.length === 0 ? (
                                        <span className="text-xs text-[#999]">No attributes created yet</span>
                                    ) : null}
                                </div>
                            </SectionBlock>
                        </div>
                    )}

                {/* â”€â”€â”€ Tab: Area & Pricing â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
                    {activeTab === "area" && (
                        <div className="space-y-5">
                            <SectionBlock title="Area & Pricing" description="Surface area and price matrix for each available currency.">
                                <div className="grid gap-4 lg:grid-cols-3">
                                    <div>
                                        <label className="mb-1 block text-xs text-[#4E525D]">Total Area (m²) *</label>
                                        <input
                                            className={inputClass}
                                            type="number"
                                            step="0.1"
                                            value={form.totalArea ?? ""}
                                            onChange={(e) => updateField("totalArea", parseFloat(e.target.value) || undefined)}
                                            placeholder="60.5"
                                            min={0}
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-xs text-[#4E525D]">Internal Area (m²)</label>
                                        <input
                                            className={inputClass}
                                            type="number"
                                            step="0.1"
                                            value={form.internalArea ?? ""}
                                            onChange={(e) => updateField("internalArea", parseFloat(e.target.value) || undefined)}
                                            placeholder="55.0"
                                            min={0}
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-xs text-[#4E525D]">Balcony Area (m²)</label>
                                        <input
                                            className={inputClass}
                                            type="number"
                                            step="0.1"
                                            value={form.balconyArea ?? ""}
                                            onChange={(e) => updateField("balconyArea", parseFloat(e.target.value) || undefined)}
                                            placeholder="5.5"
                                            min={0}
                                        />
                                    </div>
                                </div>

                                {currencies.length > 0 ? (
                                    <div className="space-y-3">
                                        <label className="block text-sm font-semibold text-[#1A1A1A]">Prices by Currency</label>
                                        {currencies.map((cur) => {
                                            const existingPrice = form.prices?.find((p: any) => p.currencyId === cur.id);
                                            return (
                                                <div key={cur.id} className="rounded-[24px] border border-[#ECEEF2] bg-[#FBFCFD] p-4">
                                                    <div className="mb-3 text-xs font-medium text-[#666666]">{cur.title || cur.name} ({cur.value})</div>
                                                    <div className="grid gap-3 lg:grid-cols-2">
                                                        <div>
                                                            <label className="mb-1 block text-xs text-[#4E525D]">Price Total *</label>
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
                                                                            prices[idx] = { currencyId: cur.id, priceTotal: val, priceByArea: prices[idx]?.priceByArea };
                                                                        } else {
                                                                            prices.push({ currencyId: cur.id, priceTotal: val });
                                                                        }
                                                                    }
                                                                    updateField("prices", prices);
                                                                }}
                                                                placeholder="175,000"
                                                                min={0}
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="mb-1 block text-xs text-[#4E525D]">Price per m² *</label>
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
                                                                            prices[idx] = { currencyId: cur.id, priceTotal: prices[idx]?.priceTotal, priceByArea: val };
                                                                        } else {
                                                                            prices.push({ currencyId: cur.id, priceByArea: val });
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
                                ) : null}
                            </SectionBlock>
                        </div>
                    )}

                {/* â”€â”€â”€ Tab: Gallery â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
                    {activeTab === "gallery" && (
                        <div className="space-y-5">
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
                )}

                {/* â”€â”€â”€ Tab: Description â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
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
                            <SectionBlock title="SEO Fields" description="Search and social metadata for the unit layout page.">
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
                                                <label className="mb-1.5 block text-xs font-medium text-[#4E525D]">Slug *</label>
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
                                                    placeholder="https://treva.realestate/offplan/sea-breeze-residence"
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
                                                placeholder="Sea Breeze Residence | Unit layout in Baku"
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

                {/* â”€â”€â”€ Actions â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
                    <div className="mt-6 flex gap-3 rounded-[24px] border border-[#ECEEF2] bg-white p-4">
                    <button
                        type="submit"
                        disabled={createMutation.isPending}
                        className="rounded-xl bg-[#4E525D] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                            {createMutation.isPending ? "Saving..." : isEditMode ? "Update Unit Layout" : "Create Unit Layout"}
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            if (onSuccess) {
                                onSuccess();
                            } else if (!inline) {
                                navigate(`/dashboard/offplan/objects/${slug}/edit`);
                            }
                        }}
                        disabled={createMutation.isPending}
                        className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm text-[#666666] transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
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
                                    <label className="mb-1.5 block text-xs text-[#4E525D]">Name *</label>
                                    <input
                                        className={inputClass}
                                        value={unitTypeDraft.name}
                                        onChange={(e) => setUnitTypeDraft((prev) => ({ ...prev, name: e.target.value }))}
                                        placeholder="2-room"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-xs text-[#4E525D]">Title *</label>
                                    <input
                                        className={inputClass}
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
    );

    if (inline) {
        return formContent;
    }

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
