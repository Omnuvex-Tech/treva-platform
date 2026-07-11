import { useState, useEffect, useMemo, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { unitLayoutsApi, type CreateUnitLayoutData } from "../../api/unit-layouts";
import { roomOptionsApi, type RoomOption } from "../../api/room-options";
import { viewOptionsApi, type ViewOption } from "../../api/view-options";
import { statusOptionsApi, type StatusOption } from "../../api/status-options";
import { attributesApi, type Attribute } from "../../api/attributes";
import { currenciesApi, type Currency } from "../../api/currencies";
import { categoriesApi } from "../../api/categories";
import { lcdOptionsApi, type LcdOption } from "../../api/lcd-options";
import { typeOfBuildingOptionsApi, type TypeOfBuildingOption } from "../../api/type-of-building-options";
import { propertyTypeOptionsApi, type PropertyTypeOption } from "../../api/property-type-options";
import { constructionStageOptionsApi, type ConstructionStageOption } from "../../api/construction-stage-options";
import { salesOfficeOptionsApi, type SalesOfficeOption } from "../../api/sales-office-options";
import { useMessageCenter } from "../../components/MessageCenter";
import { getApiErrorMessage } from "../../utils/apiError";
import { FormDropdown } from "@repo/ui";

type TabKey = "basic" | "area" | "location" | "gallery" | "description";

const TABS: { key: TabKey; label: string }[] = [
    { key: "basic", label: "Basic Info" },
    { key: "area", label: "Area & Pricing" },
    { key: "location", label: "Location" },
    { key: "gallery", label: "Gallery" },
    { key: "description", label: "Description" },
];

function slugify(text: string): string {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
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

const toDateInputValue = (value: unknown): string => {
    if (!value) return "";
    return String(value).split("T")[0] || "";
};

export function HouseForm({ embedded = false, inline = false, houseId, onSuccess }: { embedded?: boolean; inline?: boolean; houseId?: string; onSuccess?: () => void } = {}) {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { showError, showSuccess } = useMessageCenter();
    const isEditMode = !!houseId;

    const [activeTab, setActiveTab] = useState<TabKey>("basic");
    const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
    const [tabErrors, setTabErrors] = useState<Record<string, string[]>>({});

    const { data: roomOptionsRes } = useQuery({
        queryKey: ["room-options"],
        queryFn: () => roomOptionsApi.getAll(),
    });

    const { data: viewOptionsRes } = useQuery({
        queryKey: ["view-options"],
        queryFn: () => viewOptionsApi.getAll(),
    });

    const { data: statusOptionsRes } = useQuery({
        queryKey: ["status-options"],
        queryFn: () => statusOptionsApi.getAll(),
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

    const { data: propertyTypeOptionsRes } = useQuery({
        queryKey: ["property-type-options"],
        queryFn: () => propertyTypeOptionsApi.getAll(),
    });

    const { data: constructionStageOptionsRes } = useQuery({
        queryKey: ["construction-stage-options"],
        queryFn: () => constructionStageOptionsApi.getAll(),
    });

    const { data: salesOfficeOptionsRes } = useQuery({
        queryKey: ["sales-office-options"],
        queryFn: () => salesOfficeOptionsApi.getAll(),
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
    const viewOptions = useMemo(() => responseArray<ViewOption>(viewOptionsRes), [viewOptionsRes]);
    const statusOptions = useMemo(() => responseArray<StatusOption>(statusOptionsRes), [statusOptionsRes]);
    const attributes = useMemo(() => responseArray<Attribute>(attributesRes), [attributesRes]);
    const currencies = useMemo(() => responseArray<Currency>(currenciesRes), [currenciesRes]);
    const lcdOptions = useMemo(() => responseArray<LcdOption>(lcdOptionsRes), [lcdOptionsRes]);
    const typeOfBuildingOptions = useMemo(() => responseArray<TypeOfBuildingOption>(typeOfBuildingOptionsRes), [typeOfBuildingOptionsRes]);
    const propertyTypeOptions = useMemo(() => responseArray<PropertyTypeOption>(propertyTypeOptionsRes), [propertyTypeOptionsRes]);
    const constructionStageOptions = useMemo(() => responseArray<ConstructionStageOption>(constructionStageOptionsRes), [constructionStageOptionsRes]);
    const salesOfficeOptions = useMemo(() => responseArray<SalesOfficeOption>(salesOfficeOptionsRes), [salesOfficeOptionsRes]);
    const categoryId = category?.id || "";

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
        title: "",
        slug: "",
        apartmentTypeId: "",
        ownerId: "",
        status: "" as string,
        floorFrom: undefined as unknown as number,
        floorTo: undefined as unknown as number,
        roomCount: undefined as unknown as number,
        attributeIds: [] as string[],
        renovation: "",
        kitchenSize: undefined as unknown as number,
        wallMaterial: "",
        area: undefined as unknown as number,
        prices: [] as { currencyId: string; priceTotal: number; priceByArea: number }[],
        locationTitle: "",
        locationUrl: "",
        image: "",
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
        salesOffice: "",
        contractAddress: "",
        street: "",
        houseNumber: "",
        deadlineForCommissioning: "",
        landCadastralNumber: "",
        showroomAvailability: "",
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
                title: house.title || house.name || "",
                slug: house.slug || "",
                apartmentTypeId: findOptionId(roomOptions, firstValue(house.roomOptionId, house.apartmentTypeId, house.houseNameId, house.roomOption?.id, house.roomOption?.value, house.apartmentType?.id, house.apartmentType?.value)),
                ownerId: findOptionId(viewOptions, firstValue(house.viewOptionId, house.ownerId, house.viewOption?.id, house.viewOption?.value)),
                status: findOptionId(statusOptions, firstValue(house.statusOptionId, house.statusId, house.status, house.statusOption?.id, house.statusOption?.value)) || "active",
                floorFrom: toNumberOrUndefined(house.floorFrom, house.numberOfFloors?.start, house.floor),
                floorTo: toNumberOrUndefined(house.floorTo, house.numberOfFloors?.end, house.floor),
                roomCount: toNumberOrUndefined(house.roomCount, house.numberOfRooms, house.number),
                attributeIds: house.attributeIds || house.similarApartmentIds || [],
                renovation: house.renovation || "",
                kitchenSize: toNumberOrUndefined(house.kitchenSize, house.balconyArea),
                wallMaterial: house.wallMaterial || "",
                area: (totalArea || undefined) as number,
                prices: pricesArray,
                locationTitle: house.locationTitle || house.location?.title || "",
                locationUrl: house.locationUrl || house.location?.url || "",
                image: house.image || house.mainImage?.url || "",
                gallery: (house.gallery || []).map((g: any) => ({ url: g.url, alt: g.alt })),
                description: house.description || "",
                lcd: findOptionValue(lcdOptions, firstValue(house.lcdId, house.lcd)),
                typeOfBuilding: findOptionValue(typeOfBuildingOptions, firstValue(house.typeOfBuildingId, house.typeOfBuilding)),
                defaultPropertyType: findOptionValue(propertyTypeOptions, firstValue(house.defaultPropertyTypeId, house.defaultPropertyType, house.propertyTypeId, house.propertyType)),
                constructionStage: findOptionValue(constructionStageOptions, firstValue(house.constructionStageId, house.constructionStage)),
                startOfConstructionMonth: firstValue(house.startOfConstructionMonth, house.startOfConstruction?.month)?.toString() || "",
                startOfConstructionYear: firstValue(house.startOfConstructionYear, house.startOfConstruction?.year)?.toString() || "",
                completionOfConstructionMonth: firstValue(house.completionOfConstructionMonth, house.completionOfConstruction?.month)?.toString() || "",
                completionOfConstructionYear: firstValue(house.completionOfConstructionYear, house.completionOfConstruction?.year, house.completionYear)?.toString() || "",
                startOfSalesMonth: firstValue(house.startOfSalesMonth, house.startOfSales?.month)?.toString() || "",
                startOfSalesYear: firstValue(house.startOfSalesYear, house.startOfSales?.year)?.toString() || "",
                endOfSalesMonth: firstValue(house.endOfSalesMonth, house.endOfSales?.month)?.toString() || "",
                endOfSalesYear: firstValue(house.endOfSalesYear, house.endOfSales?.year)?.toString() || "",
                salesOffice: findOptionValue(salesOfficeOptions, firstValue(house.salesOfficeId, house.salesOffice)),
                contractAddress: house.contractAddress || "",
                street: house.street || "",
                houseNumber: house.houseNumber || "",
                deadlineForCommissioning: toDateInputValue(house.deadlineForCommissioning),
                landCadastralNumber: house.landCadastralNumber || "",
                showroomAvailability: house.showroomAvailability || "",
            });
            setSlugManuallyEdited(true);
        }
    }, [existingHouseData, isEditMode, currencies, roomOptions, viewOptions, statusOptions, lcdOptions, typeOfBuildingOptions, propertyTypeOptions, constructionStageOptions, salesOfficeOptions]);

    const handleSlugFromTitle = (title: string) => {
        if (!slugManuallyEdited) {
            setForm((f) => ({ ...f, slug: slugify(title) }));
        }
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
            showSuccess({ title: isEditMode ? "House updated" : "House created" });
            if (onSuccess) {
                onSuccess();
            } else if (!inline) {
                navigate(`/dashboard/offplan/objects/${slug}/config/properties`);
            }
        },
        onError: (error) => {
            showError({
                title: isEditMode ? "House could not be updated" : "House could not be created",
                description: getApiErrorMessage(error, "Please try again."),
            });
        },
    });

    const validateTab = (tab: TabKey): string[] => {
        const errors: string[] = [];
        switch (tab) {
            case "basic":
                if (!form.title?.trim()) errors.push("Title is required");
                if (!form.slug?.trim()) errors.push("Slug is required");
                if (!form.apartmentTypeId) errors.push("Type is required");
                if (!form.floorFrom || form.floorFrom < 1) errors.push("Floor From is required");
                if (form.floorFrom && form.floorFrom > 999) errors.push("Floor From must be ≤ 999");
                if (!form.floorTo || form.floorTo < 1) errors.push("Floor To is required");
                if (form.floorTo && form.floorTo > 999) errors.push("Floor To must be ≤ 999");
                if (!form.roomCount || form.roomCount < 1) errors.push("Room Count is required");
                if (form.roomCount && form.roomCount > 999) errors.push("Room Count must be ≤ 999");
                break;
            case "area":
                if (!form.area || form.area <= 0) errors.push("Area is required");
                if (!form.prices || form.prices.length === 0) {
                    errors.push("At least one currency price is required");
                } else {
                    const hasAnyTotal = form.prices.some((p) => p.priceTotal && p.priceTotal > 0);
                    const hasAnyPerArea = form.prices.some((p) => p.priceByArea && p.priceByArea > 0);
                    if (!hasAnyTotal) errors.push("Price Total is required");
                    if (!hasAnyPerArea) errors.push("Price per m² is required");
                }
                break;
            case "location":
                if (!form.locationTitle?.trim()) errors.push("Location Title is required");
                break;
            case "gallery":
                if (!form.image?.trim()) errors.push("Main Image is required");
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
            name: form.title,
            slug: form.slug,
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
            mainImage: form.image ? { url: form.image } : undefined,
            gallery: form.gallery,
            documents: [],
            location: form.locationTitle ? { title: form.locationTitle, type: "custom", url: form.locationUrl } : undefined,
            statusOptionId: form.status || undefined,
            viewOptionId: form.ownerId || undefined,
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
            salesOffice: form.salesOffice || undefined,
            contractAddress: form.contractAddress || undefined,
            street: form.street || undefined,
            houseNumber: form.houseNumber || undefined,
            deadlineForCommissioning: form.deadlineForCommissioning?.trim() || undefined,
            landCadastralNumber: form.landCadastralNumber || undefined,
            showroomAvailability: form.showroomAvailability || undefined,
            renovation: form.renovation || undefined,
            wallMaterial: form.wallMaterial || undefined,
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
        "w-full h-10 px-3 rounded-xl border border-gray-200 bg-[#F4F5F6] text-sm text-[#1A1A1A] placeholder-[#999] outline-none focus:bg-white focus:border-gray-400";

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

    // ─── Gallery Upload ────────────────────────────────────────
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState("");
    const [mainDrag, setMainDrag] = useState(false);
    const [galleryDrag, setGalleryDrag] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const galleryInputRef = useRef<HTMLInputElement>(null);

    const handleMainImageUpload = async (file: File) => {
        setUploading(true);
        setUploadError("");
        try {
            const res = await unitLayoutsApi.uploadFile(file);
            updateField("image", res.data.url);
        } catch {
            setUploadError("Main image upload failed");
        } finally {
            setUploading(false);
        }
    };

    const handleGalleryUpload = async (files: FileList | File[]) => {
        const arr = Array.from(files);
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
        } catch {
            setUploadError("Gallery upload failed");
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
        if (file && file.type.startsWith("image/")) handleMainImageUpload(file);
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

    // ─── Render ────────────────────────────────────────────────
    if (isEditMode && isLoadingHouse) {
        return (
            <main className="flex-1 p-8 overflow-y-auto" style={{ background: "var(--background-primary-50, #FFFFFF80)" }}>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-center py-12">
                        <div className="text-sm text-[#666666]">Loading house data...</div>
                    </div>
                </div>
            </main>
        );
    }

    const formContent = (
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div className="mb-6">
                    <h4 className="m-0 text-[#1A1A1A]" style={{ fontWeight: 600, fontSize: 16, lineHeight: "20px" }}>
                        {isEditMode ? "Edit house" : "Make a home"}
                    </h4>
                </div>

            {/* Tabs */}
            <div className="mb-6 flex gap-1 border-b border-gray-200">
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
                            className={`relative px-4 py-2.5 text-sm transition-colors ${
                                activeTab === tab.key
                                    ? "border-b-2 border-[#4E525D] text-[#1A1A1A]"
                                    : "text-[#808191] hover:text-[#4E525D]"
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

            <form onSubmit={handleSubmit}>
                {/* ─── Tab: Basic Info ──────────────────────── */}
                {activeTab === "basic" && (
                    <div className="space-y-4">
                        {renderTabErrors("basic")}
                        <div>
                            <label className="mb-1 block text-xs text-[#4E525D]">Title <span className="text-[#F31100]">*</span></label>
                            <input
                                className={inputClass}
                                value={form.title || ""}
                                onChange={(e) => {
                                    updateField("title", e.target.value);
                                    handleSlugFromTitle(e.target.value);
                                }}
                                placeholder="e.g. Sea Breeze Residence"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <FormDropdown
                                label="House name *"
                                value={form.apartmentTypeId || ""}
                                options={dropdownOptions(roomOptions, form.apartmentTypeId || "", (t) => ({ id: t.id, label: t.value }))}
                                placeholder="Select house name"
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
                        <div className="grid grid-cols-2 gap-4">
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
                                options={dropdownOptions(propertyTypeOptions, form.defaultPropertyType || "", (o) => ({ id: o.value, label: o.value }))}
                                placeholder="Select property type"
                                onChange={(val) => updateField("defaultPropertyType", val)}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <FormDropdown
                                label="Construction stage"
                                value={form.constructionStage || ""}
                                options={dropdownOptions(constructionStageOptions, form.constructionStage || "", (o) => ({ id: o.value, label: o.value }))}
                                placeholder="Select stage"
                                onChange={(val) => updateField("constructionStage", val)}
                            />
                            <FormDropdown
                                label="Sales office"
                                value={form.salesOffice || ""}
                                options={dropdownOptions(salesOfficeOptions, form.salesOffice || "", (o) => ({ id: o.value, label: o.value }))}
                                placeholder="Select office"
                                onChange={(val) => updateField("salesOffice", val)}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="mb-1 block text-xs text-[#4E525D]">Finishing facilities</label>
                                <input
                                    className={inputClass}
                                    value={form.renovation || ""}
                                    onChange={(e) => updateField("renovation", e.target.value)}
                                    placeholder="e.g. Renovated"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-xs text-[#4E525D]">House material</label>
                                <input
                                    className={inputClass}
                                    value={form.wallMaterial || ""}
                                    onChange={(e) => updateField("wallMaterial", e.target.value)}
                                    placeholder="e.g. Brick"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="mb-1 block text-xs text-[#4E525D]">Slug</label>
                                <input
                                    className={inputClass}
                                    value={form.slug || ""}
                                    onChange={(e) => {
                                        setSlugManuallyEdited(true);
                                        updateField("slug", e.target.value);
                                    }}
                                    placeholder="e.g. sea-breeze-residence"
                                />
                            </div>
                            <FormDropdown
                                label="Status"
                                value={form.status || "active"}
                                options={dropdownOptions(statusOptions, form.status || "active", (o) => ({ id: o.id, label: o.value }))}
                                placeholder="Select status"
                                onChange={(id) => updateField("status", id)}
                            />
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="mb-1 block text-xs text-[#4E525D]">Floor From</label>
                                <input
                                    className={inputClass}
                                    type="number"
                                    value={form.floorFrom ?? ""}
                                    onChange={(e) => updateField("floorFrom", parseInt(e.target.value) || undefined)}
                                    placeholder="e.g. 8"
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
                                    placeholder="e.g. 16"
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
                                    placeholder="e.g. 2"
                                    min={1}
                                    max={999}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="mb-1 block text-xs text-[#4E525D]">Attributes (Apartment Details)</label>
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
                                                    ? "bg-blue-500/20 text-blue-600 border border-blue-400/30"
                                                    : "bg-white text-[#666666] border border-gray-200 hover:bg-gray-50 hover:text-[#1A1A1A]"
                                            }`}
                                        >
                                            {attr.icon && (
                                                <img src={attr.icon} alt="" className="h-3.5 w-3.5 rounded-sm object-cover" />
                                            )}
                                            {attr.title}
                                        </button>
                                    );
                                })}
                                {attributes.length === 0 && (
                                    <span className="text-xs text-[#999]">No attributes created yet</span>
                                )}
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="mb-1 block text-xs text-[#4E525D]">Kitchen Size (m²)</label>
                                <input
                                    className={inputClass}
                                    type="number"
                                    step="0.1"
                                    value={form.kitchenSize ?? ""}
                                    onChange={(e) => updateField("kitchenSize", parseFloat(e.target.value) || undefined)}
                                    placeholder="e.g. 15"
                                    min={0}
                                />
                            </div>
                            <div></div>
                        </div>
                        {/* Start of construction */}
                        <div className="grid grid-cols-2 gap-4">
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
                        {/* Start/End of sales */}
                        <div className="grid grid-cols-2 gap-4">
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
                    </div>
                )}

                {/* ─── Tab: Area & Pricing ──────────────────── */}
                {activeTab === "area" && (
                    <div className="space-y-4">
                        {renderTabErrors("area")}
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="mb-1 block text-xs text-[#4E525D]">Area (m²)</label>
                                <input
                                    className={inputClass}
                                    type="number"
                                    step="0.1"
                                    value={form.area ?? ""}
                                    onChange={(e) => updateField("area", parseFloat(e.target.value) || undefined)}
                                    placeholder="e.g. 60.5"
                                    min={0}
                                />
                            </div>
                        </div>

                        {currencies.length > 0 && (
                            <div className="mt-4">
                                <label className="mb-2 block text-sm font-semibold text-[#1A1A1A]">Prices by Currency</label>
                                <div className="space-y-3">
                                    {currencies.map((cur: Currency) => {
                                        const existingPrice = form.prices?.find((p: any) => p.currencyId === cur.id);
                                        return (
                                            <div key={cur.id} className="rounded-xl border border-gray-200 bg-[#F4F5F6] p-3">
                                                <div className="mb-2 text-xs font-medium text-[#666666]">{cur.name} ({cur.value})</div>
                                                <div className="grid grid-cols-2 gap-3">
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
                                                            placeholder="e.g. 175,000"
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
                                                            placeholder="e.g. 2,917"
                                                            min={0}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ─── Tab: Location ─────────────────────────── */}
                {activeTab === "location" && (
                    <div className="space-y-4">
                        {renderTabErrors("location")}
                        <div>
                            <label className="mb-1 block text-xs text-[#4E525D]">Location Title</label>
                            <input
                                className={inputClass}
                                value={form.locationTitle || ""}
                                onChange={(e) => updateField("locationTitle", e.target.value)}
                                placeholder="e.g. Baku city, Murtuza Mukhtarov str, house 31"
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-xs text-[#4E525D]">Location URL</label>
                            <input
                                className={inputClass}
                                value={form.locationUrl || ""}
                                onChange={(e) => updateField("locationUrl", e.target.value)}
                                placeholder="e.g. https://maps.google.com/..."
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="mb-1 block text-xs text-[#4E525D]">Street</label>
                                <input
                                    className={inputClass}
                                    value={form.street || ""}
                                    onChange={(e) => updateField("street", e.target.value)}
                                    placeholder="e.g. Neftchilar Avenue"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-xs text-[#4E525D]">House number</label>
                                <input
                                    className={inputClass}
                                    value={form.houseNumber || ""}
                                    onChange={(e) => updateField("houseNumber", e.target.value)}
                                    placeholder="e.g. 42"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="mb-1 block text-xs text-[#4E525D]">Address of the house according to the contract</label>
                            <input
                                className={inputClass}
                                value={form.contractAddress || ""}
                                onChange={(e) => updateField("contractAddress", e.target.value)}
                                placeholder="e.g. 123 Main Street, Building 5"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="mb-1 block text-xs text-[#4E525D]">Land cadastral number</label>
                                <input
                                    className={inputClass}
                                    value={form.landCadastralNumber || ""}
                                    onChange={(e) => updateField("landCadastralNumber", e.target.value)}
                                    placeholder="e.g. 123456789"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-xs text-[#4E525D]">Showroom availability in the house *</label>
                                <input
                                    className={inputClass}
                                    value={form.showroomAvailability || ""}
                                    onChange={(e) => updateField("showroomAvailability", e.target.value)}
                                    placeholder="e.g. Yes / No"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="mb-1 block text-xs text-[#4E525D]">The deadline for commissioning</label>
                            <input
                                className={inputClass}
                                type="date"
                                value={form.deadlineForCommissioning || ""}
                                onChange={(e) => updateField("deadlineForCommissioning", e.target.value)}
                            />
                        </div>
                    </div>
                )}

                {/* ─── Tab: Gallery ─────────────────────────── */}
                {activeTab === "gallery" && (
                    <div className="space-y-6">
                        {renderTabErrors("gallery")}
                        {uploadError && (
                            <div className="rounded-xl border border-red-200 bg-red-50 p-2 text-xs text-[#C3362B]">{uploadError}</div>
                        )}

                        {/* Main Image */}
                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-[#4E525D]">Main Image</label>
                            {form.image ? (
                                <div className="relative inline-block">
                                    <img src={form.image} alt="Main" className="h-32 w-32 rounded-lg object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => updateField("image", "")}
                                        className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#C3362B] text-xs text-white hover:opacity-90"
                                        title="Remove"
                                    >
                                        ✕
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded bg-[#4E525D] px-2 py-0.5 text-[11px] text-white hover:opacity-90"
                                    >
                                        Change
                                    </button>
                                </div>
                            ) : (
                                <div
                                    onDragOver={onMainDragOver}
                                    onDragEnter={onMainDragEnter}
                                    onDragLeave={onMainDragLeave}
                                    onDrop={onMainDrop}
                                    onClick={() => fileInputRef.current?.click()}
                                    className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-8 transition-colors ${
                                        mainDrag
                                            ? "border-blue-400 bg-blue-50"
                                            : uploading
                                                ? "pointer-events-none opacity-50 border-gray-200 bg-[#F4F5F6]"
                                                : "border-gray-200 bg-[#F4F5F6] hover:border-gray-400"
                                    }`}
                                >
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={`transition-colors ${mainDrag ? "text-blue-500" : "text-[#999]"}`}>
                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                        <polyline points="17 8 12 3 7 8" />
                                        <line x1="12" y1="3" x2="12" y2="15" />
                                    </svg>
                                    <span className={`text-sm ${mainDrag ? "text-blue-500" : "text-[#666666]"}`}>
                                        {uploading ? "Uploading..." : mainDrag ? "Drop image here" : "Drag & drop or click to upload"}
                                    </span>
                                    <span className="text-[11px] text-[#999]">Image files</span>
                                </div>
                            )}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleMainImageUpload(file);
                                    if (fileInputRef.current) fileInputRef.current.value = "";
                                }}
                            />
                        </div>

                        {/* Gallery Images */}
                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-[#4E525D]">
                                Gallery Images {form.gallery && form.gallery.length > 0 && `(${form.gallery.length}/20)`}
                            </label>
                            <div
                                onDragOver={onGalleryDragOver}
                                onDragEnter={onGalleryDragEnter}
                                onDragLeave={onGalleryDragLeave}
                                onDrop={onGalleryDrop}
                                onClick={() => galleryInputRef.current?.click()}
                                className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-6 transition-colors ${
                                    galleryDrag
                                        ? "border-blue-400 bg-blue-50"
                                        : uploading
                                            ? "pointer-events-none opacity-50 border-gray-200 bg-[#F4F5F6]"
                                            : "border-gray-200 bg-[#F4F5F6] hover:border-gray-400"
                                }`}
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={`transition-colors ${galleryDrag ? "text-blue-500" : "text-[#999]"}`}>
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                    <polyline points="17 8 12 3 7 8" />
                                    <line x1="12" y1="3" x2="12" y2="15" />
                                </svg>
                                <span className={`text-sm ${galleryDrag ? "text-blue-500" : "text-[#666666]"}`}>
                                    {uploading ? "Uploading..." : galleryDrag ? "Drop images here" : "Drag & drop or click to upload"}
                                </span>
                                <span className="text-[11px] text-[#999]">
                                    {(form.gallery?.length || 0) >= 20 ? "Maximum 20 images reached" : "Image files (multiple)"}
                                </span>
                            </div>
                            <input
                                ref={galleryInputRef}
                                type="file"
                                accept="image/*"
                                multiple
                                className="hidden"
                                onChange={(e) => {
                                    const files = e.target.files;
                                    if (files && files.length > 0) handleGalleryUpload(files);
                                    if (galleryInputRef.current) galleryInputRef.current.value = "";
                                }}
                            />
                            {form.gallery && form.gallery.length > 0 && (
                                <div className="mt-3 grid grid-cols-4 gap-2">
                                    {form.gallery.map((item: any, idx: number) => (
                                        <div key={idx} className="group relative">
                                            <img
                                                src={item.url || item}
                                                alt={`Gallery ${idx + 1}`}
                                                className="h-24 w-full rounded-lg object-cover"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeGalleryItem(idx)}
                                                className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#C3362B] text-[10px] text-white opacity-0 transition-opacity hover:opacity-90 group-hover:opacity-100"
                                            >
                                                ✕
                                            </button>
                                            <div className="absolute bottom-1 left-1 rounded bg-[#4E525D] px-1 py-0.5 text-[9px] text-white opacity-0 transition-opacity group-hover:opacity-100">
                                                {idx + 1}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ─── Tab: Description ─────────────────────── */}
                {activeTab === "description" && (
                    <div className="space-y-4">
                        <div>
                            <label className="mb-1 block text-xs text-[#4E525D]">Description (HTML)</label>
                            <textarea
                                className={`${inputClass} min-h-[200px] resize-y font-mono`}
                                value={form.description || ""}
                                onChange={(e) => updateField("description", e.target.value)}
                                placeholder="<p>Write HTML description here...</p>"
                            />
                        </div>
                    </div>
                )}

                {/* ─── Actions ──────────────────────────────── */}
                <div className="mt-6 flex gap-3 pt-2">
                    <button
                        type="submit"
                        disabled={createMutation.isPending}
                        className="rounded-xl bg-[#4E525D] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {createMutation.isPending ? "Saving..." : isEditMode ? "Update" : inline ? "Edit" : "Create"}
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            if (onSuccess) {
                                onSuccess();
                            } else if (!inline) {
                                navigate(`/dashboard/offplan/objects/${slug}/config/properties`);
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
