import { useState, useEffect, useMemo, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { unitLayoutsApi, type CreateUnitLayoutData, type UnitLayoutStatus } from "../../api/unit-layouts";
import { roomOptionsApi, type RoomOption } from "../../api/room-options";
import { attributesApi, type Attribute } from "../../api/attributes";
import { ownersApi, type Owner } from "../../api/owners";
import { currenciesApi, type Currency } from "../../api/currencies";
import { categoriesApi, type Category } from "../../api/categories";
import { lcdOptionsApi, type LcdOption } from "../../api/lcd-options";
import { typeOfBuildingOptionsApi, type TypeOfBuildingOption } from "../../api/type-of-building-options";
import { constructionStageOptionsApi, type ConstructionStageOption } from "../../api/construction-stage-options";
import { useMessageCenter } from "../../components/MessageCenter";
import { getApiErrorMessage } from "../../utils/apiError";
import { FormDropdown, FormKeywordInput } from "@repo/ui";
import { ImageAssetCard } from "../../components/ImageAssetCard";
import { IoClose } from "react-icons/io5";

type TabKey = "basic" | "area" | "location" | "gallery" | "description" | "seo";

const TABS: { key: TabKey; label: string }[] = [
    { key: "basic", label: "Basic Info" },
    { key: "area", label: "Area & Pricing" },
    { key: "location", label: "Location" },
    { key: "gallery", label: "Gallery" },
    { key: "description", label: "Description" },
    { key: "seo", label: "SEO" },
];

const STATIC_PROPERTY_TYPE_OPTIONS = [
    { id: "Apartment", label: "Apartment" },
    { id: "Villa", label: "Villa" },
    { id: "Duplex", label: "Duplex" },
    { id: "Penthouse", label: "Penthouse" },
    { id: "Studio", label: "Studio" },
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

export function HouseForm({ embedded = false, inline = false, houseId, onSuccess, categorySlug: categorySlugProp }: { embedded?: boolean; inline?: boolean; houseId?: string; onSuccess?: () => void; categorySlug?: string } = {}) {
    const { slug: urlSlug } = useParams<{ slug: string }>();
    const [selectedCategorySlug, setSelectedCategorySlug] = useState(categorySlugProp || urlSlug || "");
    const slug = categorySlugProp || urlSlug || selectedCategorySlug;
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { showError, showSuccess } = useMessageCenter();
    const isEditMode = !!houseId;

    const [activeTab, setActiveTab] = useState<TabKey>("basic");
    const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
    const [seoTitleManuallyEdited, setSeoTitleManuallyEdited] = useState(false);
    const [draggedGalleryIndex, setDraggedGalleryIndex] = useState<number | null>(null);
    const [dragOverGalleryIndex, setDragOverGalleryIndex] = useState<number | null>(null);
    const [tabErrors, setTabErrors] = useState<Record<string, string[]>>({});

    const { data: roomOptionsRes } = useQuery({
        queryKey: ["room-options"],
        queryFn: () => roomOptionsApi.getAll(),
    });

    const { data: attributesRes } = useQuery({
        queryKey: ["attributes"],
        queryFn: () => attributesApi.getAll(),
    });

    const { data: currenciesRes } = useQuery({
        queryKey: ["currencies"],
        queryFn: () => currenciesApi.getAll(),
    });

    const { data: lcdOptionsRes } = useQuery({
        queryKey: ["lcd-options"],
        queryFn: () => lcdOptionsApi.getAll(),
    });

    const { data: typeOfBuildingOptionsRes } = useQuery({
        queryKey: ["type-of-building-options"],
        queryFn: () => typeOfBuildingOptionsApi.getAll(),
    });

    const { data: constructionStageOptionsRes } = useQuery({
        queryKey: ["construction-stage-options"],
        queryFn: () => constructionStageOptionsApi.getAll(),
    });

    const { data: ownersRes } = useQuery({
        queryKey: ["owners"],
        queryFn: () => ownersApi.getAll(),
    });

    const { data: categoriesRes } = useQuery({
        queryKey: ["categories", "object"],
        queryFn: () => categoriesApi.getAll("object"),
    });

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
    const roomOptions = useMemo(() => responseArray<RoomOption>(roomOptionsRes), [roomOptionsRes]);
    const attributes = useMemo(() => responseArray<Attribute>(attributesRes), [attributesRes]);
    const currencies = useMemo(() => responseArray<Currency>(currenciesRes), [currenciesRes]);
    const categories = useMemo(() => responseArray<Category>(categoriesRes), [categoriesRes]);
    const lcdOptions = useMemo(() => responseArray<LcdOption>(lcdOptionsRes), [lcdOptionsRes]);
    const typeOfBuildingOptions = useMemo(() => responseArray<TypeOfBuildingOption>(typeOfBuildingOptionsRes), [typeOfBuildingOptionsRes]);
    const constructionStageOptions = useMemo(() => responseArray<ConstructionStageOption>(constructionStageOptionsRes), [constructionStageOptionsRes]);
    const owners = useMemo(() => responseArray<Owner>(ownersRes), [ownersRes]);
    const categoryId = category?.id || categories.find((item) => item.slug === selectedCategorySlug)?.id || "";
    const shouldSelectCategory = !categorySlugProp && !urlSlug;

    const monthOptions = Array.from({ length: 12 }, (_, i) => ({
        id: String(i + 1),
        label: new Date(2024, i).toLocaleString("en", { month: "long" }),
    }));

    const yearOptions = Array.from({ length: 10 }, (_, i) => ({
        id: String(2024 + i),
        label: String(2024 + i),
    }));

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
        apartmentTypeId: "",
        ownerId: "",
            status: "available" as UnitLayoutStatus,
        floorFrom: undefined as unknown as number,
        floorTo: undefined as unknown as number,
        roomCount: undefined as unknown as number,
        attributeIds: [] as string[],
        kitchenSize: undefined as unknown as number,
        area: undefined as unknown as number,
        prices: [] as { currencyId: string; priceTotal: number; priceByArea: number }[],
        locationTitle: "",
        locationUrl: "",
        locationGoogleMapsUrl: "",
        image: "",
            coverImage: "",
        gallery: [] as { url: string; alt?: string }[],
        description: "",
        lcd: "",
        typeOfBuilding: "",
        defaultPropertyType: "",
        constructionStage: "",
        startOfConstructionMonth: "",
        startOfConstructionYear: "",
        completionOfConstructionMonth: "",
        completionOfConstructionYear: "",
        startOfSalesMonth: "",
        startOfSalesYear: "",
        endOfSalesMonth: "",
        endOfSalesYear: "",
    });

    useEffect(() => {
        if (existingHouseData && isEditMode) {
            const house = existingHouseData;
            const totalArea = Number(firstValue(house.totalArea, house.internalArea, house.area, 0));
            const rawPrices = house.pricesByCurrency || house.priceByCurrency || house.prices || {};
            const pricesArray = rawPrices && typeof rawPrices === "object"
                ? Object.entries(rawPrices).map(([currencyValue, priceTotal]) => {
                    const cur = currencies.find((c: Currency) => [c.id, c.value, c.name].includes(String(currencyValue)));
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
                apartmentTypeId: findOptionId(roomOptions, firstValue(house.roomOptionId, house.apartmentTypeId, house.houseNameId, house.roomOption?.id, house.roomOption?.title, house.roomOption?.value, house.apartmentType?.id, house.apartmentType?.value)),
                ownerId: findOptionId(owners, firstValue(house.ownerId, house.owner?.id)),
                status: (((firstValue(house.status, house.statusId) as string) || "available") as UnitLayoutStatus),
                floorFrom: toNumberOrUndefined(house.floorFrom, house.numberOfFloors?.start, house.floor),
                floorTo: toNumberOrUndefined(house.floorTo, house.numberOfFloors?.end, house.floor),
                roomCount: toNumberOrUndefined(house.roomCount, house.numberOfRooms, house.number),
                attributeIds: house.attributeIds || house.similarApartmentIds || [],
                kitchenSize: toNumberOrUndefined(house.kitchenSize, house.balconyArea),
                area: (totalArea || undefined) as number,
                prices: pricesArray,
                locationTitle: house.locationTitle || house.location?.title || "",
                locationUrl: house.locationUrl || house.location?.url || "",
                locationGoogleMapsUrl: house.locationGoogleMapsUrl || "",
                image: house.image || house.mainImage?.url || "",
                    coverImage: house.coverImage?.url || "",
                gallery: (house.gallery || []).map((g: any) => ({ url: g.url, alt: g.alt })),
                description: house.description || "",
                lcd: findOptionValue(lcdOptions, firstValue(house.lcdId, house.lcd)),
                typeOfBuilding: findOptionValue(typeOfBuildingOptions, firstValue(house.typeOfBuildingId, house.typeOfBuilding)),
                defaultPropertyType: findOptionValue(STATIC_PROPERTY_TYPE_OPTIONS, firstValue(house.defaultPropertyTypeId, house.defaultPropertyType, house.propertyTypeId, house.propertyType)),
                constructionStage: findOptionValue(constructionStageOptions, firstValue(house.constructionStageId, house.constructionStage)),
                startOfConstructionMonth: firstValue(house.startOfConstructionMonth, house.startOfConstruction?.month)?.toString() || "",
                startOfConstructionYear: firstValue(house.startOfConstructionYear, house.startOfConstruction?.year)?.toString() || "",
                completionOfConstructionMonth: firstValue(house.completionOfConstructionMonth, house.completionOfConstruction?.month)?.toString() || "",
                completionOfConstructionYear: firstValue(house.completionOfConstructionYear, house.completionOfConstruction?.year, house.completionYear)?.toString() || "",
                startOfSalesMonth: firstValue(house.startOfSalesMonth, house.startOfSales?.month)?.toString() || "",
                startOfSalesYear: firstValue(house.startOfSalesYear, house.startOfSales?.year)?.toString() || "",
                endOfSalesMonth: firstValue(house.endOfSalesMonth, house.endOfSales?.month)?.toString() || "",
                endOfSalesYear: firstValue(house.endOfSalesYear, house.endOfSales?.year)?.toString() || "",
            });
            setSlugManuallyEdited(Boolean(house.slug));
            setSeoTitleManuallyEdited(Boolean(house.seoTitle));
        }
    }, [existingHouseData, isEditMode, currencies, roomOptions, lcdOptions, typeOfBuildingOptions, constructionStageOptions, owners]);

    useEffect(() => {
        if (!selectedCategorySlug && existingHouseData?.category?.slug) {
            setSelectedCategorySlug(existingHouseData.category.slug);
        }
    }, [existingHouseData, selectedCategorySlug]);

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
        setTabErrors((prev) => {
            const next = { ...prev };
            for (const key of Object.keys(next)) {
                next[key] = (next[key] ?? []).filter((e) => !e.toLowerCase().includes(field.toLowerCase()));
                if (next[key].length === 0) delete next[key];
            }
            return next;
        });
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

    const validateTab = (tab: TabKey): string[] => {
        const errors: string[] = [];
        switch (tab) {
            case "basic":
                if (!categoryId) errors.push("Object is required");
                if (!form.title?.trim()) errors.push("Title is required");
                if (!form.apartmentTypeId) errors.push("Type is required");
                if (!form.floorFrom || form.floorFrom < 1) errors.push("Floor From is required");
                if (form.floorFrom && form.floorFrom > 999) errors.push("Floor From must be â‰¤ 999");
                if (!form.floorTo || form.floorTo < 1) errors.push("Floor To is required");
                if (form.floorTo && form.floorTo > 999) errors.push("Floor To must be â‰¤ 999");
                if (!form.roomCount || form.roomCount < 1) errors.push("Room Count is required");
                if (form.roomCount && form.roomCount > 999) errors.push("Room Count must be â‰¤ 999");
                break;
            case "area":
                if (!form.area || form.area <= 0) errors.push("Area is required");
                if (!form.prices || form.prices.length === 0) {
                    errors.push("At least one currency price is required");
                } else {
                    const hasAnyTotal = form.prices.some((p) => p.priceTotal && p.priceTotal > 0);
                    const hasAnyPerArea = form.prices.some((p) => p.priceByArea && p.priceByArea > 0);
                    if (!hasAnyTotal) errors.push("Price Total is required");
                    if (!hasAnyPerArea) errors.push("Price per mÂ² is required");
                }
                break;
            case "location":
                if (!form.locationTitle?.trim()) errors.push("Location Title is required");
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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const allErrors: Record<string, string[]> = {};
        for (const tab of TABS) {
            const errs = validateTab(tab.key);
            if (errs.length > 0) allErrors[tab.key] = errs;
        }
        if (Object.keys(allErrors).length > 0) {
            setTabErrors(allErrors);
            const firstInvalid = TABS.find((t) => allErrors[t.key]);
            if (firstInvalid) setActiveTab(firstInvalid.key);
            return;
        }
        setTabErrors({});

        const pricesRecord: Record<string, number> = {};
        for (const p of form.prices) {
            const cur = currencies.find((c: Currency) => c.id === p.currencyId || c.value === p.currencyId || c.name === p.currencyId);
            pricesRecord[cur?.value || p.currencyId] = p.priceTotal;
        }

        const submitData: CreateUnitLayoutData = {
                title: form.title,
                name: form.name,
            slug: normalizeOptionalText(form.slug) || "",
            seoTitle: normalizeOptionalText(form.seoTitle),
            seoDescription: normalizeOptionalText(form.seoDescription),
            seoKeywords: normalizeOptionalText(form.seoKeywords),
            canonicalUrl: normalizeOptionalText(form.canonicalUrl),
            seoImage: normalizeOptionalText(form.seoImage),
            categoryId,
            floor: form.floorFrom,
            number: form.roomCount,
            totalArea: form.area,
            internalArea: form.area,
            balconyArea: form.kitchenSize || 0,
            prices: pricesRecord,
            completionYear: form.completionOfConstructionYear ? Number(form.completionOfConstructionYear) : 2030,
            numberOfFloors: { start: form.floorFrom, end: form.floorTo || form.floorFrom },
            similarApartmentIds: form.attributeIds,
            attributeIds: form.attributeIds,
            heatingTypeIds: [],
            ownerId: form.ownerId || undefined,
            mainImage: form.image ? { url: form.image } : undefined,
                coverImage: form.coverImage ? { url: form.coverImage } : undefined,
            gallery: form.gallery,
            documents: [],
            location: form.locationTitle ? { title: form.locationTitle, type: "custom", url: form.locationUrl } : undefined,
            locationTitle: form.locationTitle || undefined,
            locationUrl: form.locationUrl || undefined,
            locationGoogleMapsUrl: normalizeOptionalText(form.locationGoogleMapsUrl),
            status: (form.status || "available") as UnitLayoutStatus,
            roomOptionId: form.apartmentTypeId || undefined,
            lcd: form.lcd || undefined,
            typeOfBuilding: form.typeOfBuilding || undefined,
            defaultPropertyType: form.defaultPropertyType || undefined,
            constructionStage: form.constructionStage || undefined,
            startOfConstruction: form.startOfConstructionMonth && form.startOfConstructionYear
                ? { month: Number(form.startOfConstructionMonth), year: Number(form.startOfConstructionYear) }
                : undefined,
            completionOfConstruction: form.completionOfConstructionMonth && form.completionOfConstructionYear
                ? { month: Number(form.completionOfConstructionMonth), year: Number(form.completionOfConstructionYear) }
                : undefined,
            startOfSales: form.startOfSalesMonth && form.startOfSalesYear
                ? { month: Number(form.startOfSalesMonth), year: Number(form.startOfSalesYear) }
                : undefined,
            endOfSales: form.endOfSalesMonth && form.endOfSalesYear
                ? { month: Number(form.endOfSalesMonth), year: Number(form.endOfSalesYear) }
                : undefined,
            description: form.description || undefined,
        };

        createMutation.mutate(submitData);
    };

    const mutationError = (() => {
        const err = createMutation.error;
        if (!err) return null;
        const e = err as any;
        const msg = e?.response?.data?.message;
        if (Array.isArray(msg)) return msg.join(", ");
        return msg || e?.message || "An error occurred";
    })();

    const inputClass =
        "w-full h-10 rounded-xl border border-gray-200 bg-[#F4F5F6] px-3 py-0 text-sm leading-5 text-[#1A1A1A] placeholder-[#999] outline-none focus:border-gray-400 focus:bg-white";

    const renderTabErrors = (tab: TabKey) => {
        const errors = tabErrors[tab];
        if (!errors || errors.length === 0) return null;
        return (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3">
                <div className="mb-1 flex items-center gap-2 text-sm font-medium text-[#C3362B]">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C3362B" strokeWidth="2">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                        <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                    </svg>
                    Please fill in all required fields
                </div>
                <ul className="ml-5 list-disc text-xs text-[#C3362B]">
                    {errors.map((e, i) => <li key={i}>{e}</li>)}
                </ul>
            </div>
        );
    };

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
            const res = await unitLayoutsApi.uploadFile(file);
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
            const res = await unitLayoutsApi.uploadFile(file);
            updateField("coverImage", res.data.url);
        } catch (error) {
            setUploadError(getApiErrorMessage(error, "Cover image upload failed"));
        } finally {
            setUploading(false);
        }
    };

    const handleSeoImageUpload = async (file: File) => {
        if (!validateImageFiles([file])) return;

        setUploading(true);
        setUploadError("");
        try {
            const res = await unitLayoutsApi.uploadFile(file);
            updateField("seoImage", res.data.url);
        } catch (error) {
            setUploadError(getApiErrorMessage(error, "SEO image upload failed"));
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
                const res = await unitLayoutsApi.uploadFile(file);
                newItems.push(res.data);
            }
            setForm((f) => ({ ...f, gallery: [...(f.gallery || []), ...newItems] }));
        } catch (error) {
            setUploadError(getApiErrorMessage(error, "Gallery upload failed"));
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
                    const hasError = (tabErrors[tab.key]?.length ?? 0) > 0;
                    return (
                        <button
                            key={tab.key}
                            type="button"
                            onClick={() => {
                                setTabErrors((prev) => { const n = { ...prev }; delete n[tab.key]; return n; });
                                setActiveTab(tab.key);
                            }}
                                className={`relative cursor-pointer rounded-2xl px-4 py-2.5 text-sm font-medium transition-colors ${
                                activeTab === tab.key
                                        ? "bg-[#4E525D] text-white shadow-sm"
                                        : "text-[#808191] hover:bg-[#F4F5F6] hover:text-[#4E525D]"
                            }`}
                        >
                            {tab.label}
                            {hasError && (
                                <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-[#ff6767] animate-ping" />
                            )}
                        </button>
                    );
                })}
            </div>

            {mutationError && (
                <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-center text-sm text-[#C3362B]">
                    {mutationError}
                </div>
            )}

                <form onSubmit={handleSubmit} className="max-w-5xl">
                {/* â”€â”€â”€ Tab: Basic Info â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
                    {activeTab === "basic" && (
                        <div className="space-y-5">
                            {renderTabErrors("basic")}
                                <SectionBlock title="Identity" description="Core unit layout information and classification.">
                                    <div className="grid gap-5 lg:grid-cols-[280px_minmax(0,1fr)] lg:items-start">
                                        <div className="rounded-[24px] border border-[#ECEEF2] bg-[#FBFCFD] p-4">
                                            <div className="space-y-4">
                                                <ImageAssetCard
                                                    label="Main Image"
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
                                                        value={selectedCategorySlug}
                                                        options={dropdownOptions(categories, selectedCategorySlug, (item) => ({ id: item.slug, label: item.title }))}
                                                        placeholder="Select object"
                                                        onChange={(value) => {
                                                            setSelectedCategorySlug(String(value));
                                                            setTabErrors((prev) => {
                                                                const next = { ...prev };
                                                                delete next.basic;
                                                                return next;
                                                            });
                                                        }}
                                                    />
                                                </div>
                                            ) : null}
                                            <div className="grid gap-4 lg:grid-cols-2">
                                                <div>
                                                    <label className="mb-1 block text-xs text-[#4E525D]">Name <span className="text-[#F31100]">*</span></label>
                                                    <input
                                                        className={inputClass}
                                                        value={form.name || ""}
                                                        onChange={(e) => updateField("name", e.target.value)}
                                                        placeholder="Sea Breeze"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="mb-1 block text-xs text-[#4E525D]">Title <span className="text-[#F31100]">*</span></label>
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
                                                    label="Room option *"
                                                    value={form.apartmentTypeId || ""}
                                                    options={dropdownOptions(roomOptions, form.apartmentTypeId || "", (t) => ({ id: t.id, label: t.title }))}
                                                    placeholder="Select room option"
                                                    onChange={(id) => updateField("apartmentTypeId", id)}
                                                />
                                                <FormDropdown
                                                    label="LCD *"
                                                    value={form.lcd || ""}
                                                    options={dropdownOptions(lcdOptions, form.lcd || "", (o) => ({ id: o.value, label: o.value }))}
                                                    placeholder="Select LCD"
                                                    onChange={(val) => updateField("lcd", val)}
                                                />
                                            </div>
                                            <div className="grid gap-4 lg:grid-cols-2">
                                                <FormDropdown
                                                    label="Type of building *"
                                                    value={form.typeOfBuilding || ""}
                                                    options={dropdownOptions(typeOfBuildingOptions, form.typeOfBuilding || "", (o) => ({ id: o.value, label: o.value }))}
                                                    placeholder="Select type"
                                                    onChange={(val) => updateField("typeOfBuilding", val)}
                                                />
                                                <FormDropdown
                                                    label="Default property type *"
                                                    value={form.defaultPropertyType || ""}
                                                        options={STATIC_PROPERTY_TYPE_OPTIONS}
                                                    placeholder="Select property type"
                                                    onChange={(val) => updateField("defaultPropertyType", val)}
                                                />
                                            </div>
                                            <div>
                                                <FormDropdown
                                                    label="Construction stage"
                                                    value={form.constructionStage || ""}
                                                    options={dropdownOptions(constructionStageOptions, form.constructionStage || "", (o) => ({ id: o.value, label: o.value }))}
                                                    placeholder="Select stage"
                                                    onChange={(val) => updateField("constructionStage", val)}
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
                                        <label className="mb-1 block text-xs text-[#4E525D]">Floor From</label>
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
                                <div className="grid gap-4 lg:grid-cols-2">
                                    <FormDropdown
                                        label="Owner"
                                        value={form.ownerId || ""}
                                        options={dropdownOptions(owners, form.ownerId || "", (o) => ({ id: o.id, label: `${o.firstName} ${o.lastName}` }))}
                                        placeholder="Select owner"
                                        onChange={(id) => updateField("ownerId", id)}
                                    />
                                    <div>
                                        <label className="mb-1 block text-xs text-[#4E525D]">Kitchen Size (m²)</label>
                                        <input
                                            className={inputClass}
                                            type="number"
                                            step="0.1"
                                            value={form.kitchenSize ?? ""}
                                            onChange={(e) => updateField("kitchenSize", parseFloat(e.target.value) || undefined)}
                                            placeholder="15"
                                            min={0}
                                        />
                                    </div>
                                </div>
                                <div className="grid gap-4 lg:grid-cols-2">
                                    <div>
                                        <label className="mb-1 block text-xs text-[#4E525D]">Start of construction</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            <FormDropdown
                                                label=""
                                                value={form.startOfConstructionMonth || ""}
                                                options={monthOptions}
                                                placeholder="Month"
                                                onChange={(id) => updateField("startOfConstructionMonth", id)}
                                            />
                                            <FormDropdown
                                                label=""
                                                value={form.startOfConstructionYear || ""}
                                                options={yearOptions}
                                                placeholder="Year"
                                                onChange={(id) => updateField("startOfConstructionYear", id)}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-xs text-[#4E525D]">Completion of construction</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            <FormDropdown
                                                label=""
                                                value={form.completionOfConstructionMonth || ""}
                                                options={monthOptions}
                                                placeholder="Month"
                                                onChange={(id) => updateField("completionOfConstructionMonth", id)}
                                            />
                                            <FormDropdown
                                                label=""
                                                value={form.completionOfConstructionYear || ""}
                                                options={yearOptions}
                                                placeholder="Year"
                                                onChange={(id) => updateField("completionOfConstructionYear", id)}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="grid gap-4 lg:grid-cols-2">
                                    <div>
                                        <label className="mb-1 block text-xs text-[#4E525D]">Start of sales</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            <FormDropdown
                                                label=""
                                                value={form.startOfSalesMonth || ""}
                                                options={monthOptions}
                                                placeholder="Month"
                                                onChange={(id) => updateField("startOfSalesMonth", id)}
                                            />
                                            <FormDropdown
                                                label=""
                                                value={form.startOfSalesYear || ""}
                                                options={yearOptions}
                                                placeholder="Year"
                                                onChange={(id) => updateField("startOfSalesYear", id)}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-xs text-[#4E525D]">End of sales</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            <FormDropdown
                                                label=""
                                                value={form.endOfSalesMonth || ""}
                                                options={monthOptions}
                                                placeholder="Month"
                                                onChange={(id) => updateField("endOfSalesMonth", id)}
                                            />
                                            <FormDropdown
                                                label=""
                                                value={form.endOfSalesYear || ""}
                                                options={yearOptions}
                                                placeholder="Year"
                                                onChange={(id) => updateField("endOfSalesYear", id)}
                                            />
                                        </div>
                                    </div>
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
                            {renderTabErrors("area")}
                            <SectionBlock title="Area & Pricing" description="Surface area and price matrix for each available currency.">
                                <div className="grid gap-4 lg:grid-cols-3">
                                    <div>
                                        <label className="mb-1 block text-xs text-[#4E525D]">Area (m²)</label>
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
                                </div>

                                {currencies.length > 0 ? (
                                    <div className="space-y-3">
                                        <label className="block text-sm font-semibold text-[#1A1A1A]">Prices by Currency</label>
                                        {currencies.map((cur: Currency) => {
                                            const existingPrice = form.prices?.find((p: any) => p.currencyId === cur.id);
                                            return (
                                                <div key={cur.id} className="rounded-[24px] border border-[#ECEEF2] bg-[#FBFCFD] p-4">
                                                    <div className="mb-3 text-xs font-medium text-[#666666]">{cur.title || cur.name} ({cur.value})</div>
                                                    <div className="grid gap-3 lg:grid-cols-2">
                                                        <div>
                                                            <label className="mb-1 block text-xs text-[#4E525D]">Price Total</label>
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
                                                            <label className="mb-1 block text-xs text-[#4E525D]">Price per m²</label>
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
                                ) : null}
                            </SectionBlock>
                        </div>
                    )}

                {/* â”€â”€â”€ Tab: Location â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
                    {activeTab === "location" && (
                        <div className="space-y-5">
                            {renderTabErrors("location")}
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

                {/* â”€â”€â”€ Tab: Gallery â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
                    {activeTab === "gallery" && (
                        <div className="space-y-5">
                        {renderTabErrors("gallery")}
                        {uploadError && (
                            <div className="rounded-xl border border-red-200 bg-red-50 p-2 text-xs text-[#C3362B]">{uploadError}</div>
                        )}
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
                            {renderTabErrors("seo")}
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
                                                <label className="mb-1.5 block text-xs font-medium text-[#4E525D]">Slug <span className="text-[#F31100]">*</span></label>
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
                                                placeholder="Sea Breeze Residence | Unit Layout in Baku"
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
