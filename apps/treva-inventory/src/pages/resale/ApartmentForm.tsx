import { useState, useEffect, useRef, useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { apartmentsApi, CreateApartmentData, UploadResponse } from "../../api/apartments";
import { apartmentTypesApi, ApartmentType } from "../../api/apartment-types";
import { ownersApi, Owner } from "../../api/owners";
import { Layout } from "../../components/Layout";

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

export function ApartmentForm() {
    const { id } = useParams();
    const isEdit = Boolean(id);
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [activeTab, setActiveTab] = useState<TabKey>("basic");
    const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
    const [tabErrors, setTabErrors] = useState<Record<string, string[]>>({});

    const { data: types } = useQuery({
        queryKey: ["apartment-types"],
        queryFn: () => apartmentTypesApi.getAll(),
    });

    const { data: owners } = useQuery({
        queryKey: ["owners"],
        queryFn: () => ownersApi.getAll(),
    });

    const { data: existing } = useQuery({
        queryKey: ["apartment", id],
        queryFn: () => apartmentsApi.getById(id!),
        enabled: isEdit,
    });

    const [form, setForm] = useState<CreateApartmentData>({
        title: "",
        slug: "",
        description: "",
        image: "",
        gallery: [],
        priceTotal: undefined as unknown as number,
        priceByArea: undefined as unknown as number,
        roomCount: undefined as unknown as number,
        area: undefined as unknown as number,
        floorFrom: undefined as unknown as number,
        floorTo: undefined as unknown as number,
        locationTitle: "",
        locationUrl: "",
        renovation: "",
        kitchenSize: undefined as unknown as number,
        wallMaterial: "",
        apartmentTypeId: "",
        ownerId: "",
        attributeIds: [],
        requestIds: [],
    });

    useEffect(() => {
        if (existing?.data) {
            const d = existing.data;
            setForm({
                title: d.title || "",
                slug: d.slug || "",
                description: d.description || "",
                image: d.image || "",
                gallery: d.gallery || [],
                priceTotal: d.priceTotal,
                priceByArea: d.priceByArea,
                roomCount: d.roomCount,
                area: d.area,
                floorFrom: d.floorFrom,
                floorTo: d.floorTo,
                locationTitle: d.locationTitle || "",
                locationUrl: d.locationUrl || "",
                renovation: d.renovation || "",
                kitchenSize: d.kitchenSize || undefined,
                wallMaterial: d.wallMaterial || "",
                apartmentTypeId: d.apartmentTypeId || "",
                ownerId: d.ownerId || "",
                attributeIds: d.attributeIds || [],
                requestIds: d.requestIds || [],
            });
        }
    }, [existing?.data]);

    const handleSlugFromTitle = (title: string) => {
        if (!slugManuallyEdited) {
            setForm((f) => ({ ...f, slug: slugify(title) }));
        }
    };

    const updateField = (field: keyof CreateApartmentData, value: any) => {
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
        mutationFn: (data: CreateApartmentData) => apartmentsApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["apartments"] });
            navigate("/resale/apartments");
        },
    });

    const updateMutation = useMutation({
        mutationFn: (data: CreateApartmentData) => apartmentsApi.update(id!, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["apartments"] });
            navigate("/resale/apartments");
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
                if (!form.floorTo || form.floorTo < 1) errors.push("Floor To is required");
                if (!form.roomCount || form.roomCount < 1) errors.push("Room Count is required");
                break;
            case "area":
                if (!form.area || form.area <= 0) errors.push("Area is required");
                if (!form.priceTotal || form.priceTotal <= 0) errors.push("Price Total is required");
                if (!form.priceByArea || form.priceByArea <= 0) errors.push("Price per m² is required");
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
        if (isEdit) {
            updateMutation.mutate(form);
        } else {
            createMutation.mutate(form);
        }
    };

    const mutationError = (() => {
        const err = isEdit ? updateMutation.error : createMutation.error;
        if (!err) return null;
        const e = err as any;
        const msg = e?.response?.data?.message;
        if (Array.isArray(msg)) return msg.join(", ");
        return msg || e?.message || "An error occurred";
    })();

    const inputClass =
        "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-white/30 placeholder:text-white/30";

    const renderTabErrors = (tab: TabKey) => {
        const errors = tabErrors[tab];
        if (!errors || errors.length === 0) return null;
        return (
            <div className="mb-4 rounded-lg border border-[#ff6767]/20 bg-[#ff6767]/5 p-3">
                <div className="mb-1 flex items-center gap-2 text-sm font-medium text-[#ff6767]">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                        <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                    </svg>
                    Please fill in all required fields
                </div>
                <ul className="ml-5 list-disc text-xs text-[#ff6767]/80">
                    {errors.map((e, i) => <li key={i}>{e}</li>)}
                </ul>
            </div>
        );
    };

    // ─── Custom Dropdown ───────────────────────────────────────
    function CustomSelect({
        label,
        value,
        options,
        placeholder,
        onChange,
    }: {
        label: string;
        value: string;
        options: { id: string; label: string }[];
        placeholder: string;
        onChange: (id: string) => void;
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

        const selected = options.find((o) => o.id === value);

        return (
            <div ref={ref} className="relative">
                <label className="mb-1 block text-xs text-white/60">{label}</label>
                <button
                    type="button"
                    onClick={() => setOpen(!open)}
                    className={`w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-left text-sm transition-colors hover:border-white/20 ${selected ? "text-white" : "text-white/40"}`}
                >
                    <span>{selected?.label || placeholder}</span>
                    <svg
                        width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                        className="pointer-events-none absolute right-3 top-[38px]"
                        style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}
                    >
                        <path d="M6 9l6 6 6-6" />
                    </svg>
                </button>
                {open && (
                    <div className="absolute left-0 top-full z-50 mt-1 w-full rounded-lg border border-white/10 bg-[#2a2d35] py-1 shadow-xl">
                        <button
                            type="button"
                            className="w-full px-3 py-2 text-left text-sm text-white/50 hover:bg-white/10"
                            onClick={() => { onChange(""); setOpen(false); }}
                        >
                            -- None
                        </button>
                        {options.map((opt) => (
                            <button
                                key={opt.id}
                                type="button"
                                className={`w-full px-3 py-2 text-left text-sm transition-colors ${
                                    value === opt.id
                                        ? "bg-white/15 text-white font-medium"
                                        : "text-white/70 hover:bg-white/10"
                                }`}
                                onClick={() => { onChange(opt.id); setOpen(false); }}
                            >
                                {opt.label}
                            </button>
                        ))}
                        {options.length === 0 && (
                            <div className="px-3 py-2 text-sm text-white/40">No options yet</div>
                        )}
                    </div>
                )}
            </div>
        );
    }

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
            const res = await apartmentsApi.uploadFile(file);
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
                const res = await apartmentsApi.uploadFile(file);
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
    return (
        <Layout>
            <div className="mb-4">
                <h2 className="text-lg font-semibold">
                    {isEdit ? "Edit Apartment" : "New Apartment"}
                </h2>
            </div>

            {/* Tabs */}
            <div className="mb-6 flex gap-1 border-b border-white/10">
                {TABS.map((tab) => {
                    const hasError = (tabErrors[tab.key]?.length ?? 0) > 0;
                    return (
                        <button
                            key={tab.key}
                            type="button"
                            onClick={() => {
                                if (TABS.findIndex((t) => t.key === tab.key) <= TABS.findIndex((t) => t.key === activeTab)) {
                                    setTabErrors((prev) => { const n = { ...prev }; delete n[tab.key]; return n; });
                                    setActiveTab(tab.key);
                                } else {
                                    const errs = validateTab(activeTab);
                                    if (errs.length > 0) {
                                        setTabErrors((prev) => ({ ...prev, [activeTab]: errs }));
                                        return;
                                    }
                                    setTabErrors((prev) => { const n = { ...prev }; delete n[tab.key]; return n; });
                                    setActiveTab(tab.key);
                                }
                            }}
                            className={`relative px-4 py-2.5 text-sm font-medium transition-colors ${
                                activeTab === tab.key
                                    ? "border-b-2 border-white text-white"
                                    : "text-white/50 hover:text-white/80"
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
                <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-center text-sm text-red-300">
                    {mutationError}
                </div>
            )}

            <form onSubmit={handleSubmit} className="max-w-3xl">
                {/* ─── Tab: Basic Info ──────────────────────── */}
                {activeTab === "basic" && (
                    <div className="space-y-4">
                        {renderTabErrors("basic")}
                        <div>
                            <label className="mb-1 block text-xs text-white/60">Title</label>
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
                        <div>
                            <label className="mb-1 block text-xs text-white/60">Slug</label>
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
                        <div className="grid grid-cols-2 gap-4">
                            <CustomSelect
                                label="Type"
                                value={form.apartmentTypeId || ""}
                                options={types?.data?.map((t: ApartmentType) => ({ id: t.id, label: t.title })) || []}
                                placeholder="Select type"
                                onChange={(id) => updateField("apartmentTypeId", id)}
                            />
                            <CustomSelect
                                label="Owner"
                                value={form.ownerId || ""}
                                options={owners?.data?.map((o: Owner) => ({ id: o.id, label: `${o.firstName} ${o.lastName}` })) || []}
                                placeholder="Select owner (optional)"
                                onChange={(id) => updateField("ownerId", id)}
                            />
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="mb-1 block text-xs text-white/60">Floor From</label>
                                <input
                                    className={inputClass}
                                    type="number"
                                    value={form.floorFrom ?? ""}
                                    onChange={(e) => updateField("floorFrom", parseInt(e.target.value) || undefined)}
                                    placeholder="e.g. 8"
                                    min={1}
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-xs text-white/60">Floor To</label>
                                <input
                                    className={inputClass}
                                    type="number"
                                    value={form.floorTo ?? ""}
                                    onChange={(e) => updateField("floorTo", parseInt(e.target.value) || undefined)}
                                    placeholder="e.g. 16"
                                    min={1}
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-xs text-white/60">Room Count</label>
                                <input
                                    className={inputClass}
                                    type="number"
                                    value={form.roomCount ?? ""}
                                    onChange={(e) => updateField("roomCount", parseInt(e.target.value) || undefined)}
                                    placeholder="e.g. 2"
                                    min={1}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="mb-1 block text-xs text-white/60">Renovation</label>
                                <input
                                    className={inputClass}
                                    value={form.renovation || ""}
                                    onChange={(e) => updateField("renovation", e.target.value)}
                                    placeholder="e.g. Renovated"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-xs text-white/60">Kitchen Size (m²)</label>
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
                            <div>
                                <label className="mb-1 block text-xs text-white/60">Wall Material</label>
                                <input
                                    className={inputClass}
                                    value={form.wallMaterial || ""}
                                    onChange={(e) => updateField("wallMaterial", e.target.value)}
                                    placeholder="e.g. Brick"
                                />
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
                                <label className="mb-1 block text-xs text-white/60">Area (m²)</label>
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
                            <div>
                                <label className="mb-1 block text-xs text-white/60">Price Total (AZN)</label>
                                <input
                                    className={inputClass}
                                    type="number"
                                    value={form.priceTotal ?? ""}
                                    onChange={(e) => updateField("priceTotal", parseFloat(e.target.value) || undefined)}
                                    placeholder="e.g. 175,000"
                                    min={0}
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-xs text-white/60">Price per m² (AZN)</label>
                                <input
                                    className={inputClass}
                                    type="number"
                                    value={form.priceByArea ?? ""}
                                    onChange={(e) => updateField("priceByArea", parseFloat(e.target.value) || undefined)}
                                    placeholder="e.g. 2,917"
                                    min={0}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* ─── Tab: Location ────────────────────────── */}
                {activeTab === "location" && (
                    <div className="space-y-4">
                        {renderTabErrors("location")}
                        <div>
                            <label className="mb-1 block text-xs text-white/60">Location Title</label>
                            <input
                                className={inputClass}
                                value={form.locationTitle || ""}
                                onChange={(e) => updateField("locationTitle", e.target.value)}
                                placeholder="e.g. Baku city, Murtuza Mukhtarov str, house 31"
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-xs text-white/60">Location URL</label>
                            <input
                                className={inputClass}
                                value={form.locationUrl || ""}
                                onChange={(e) => updateField("locationUrl", e.target.value)}
                                placeholder="e.g. https://maps.google.com/..."
                            />
                        </div>
                    </div>
                )}

                {/* ─── Tab: Gallery ─────────────────────────── */}
                {activeTab === "gallery" && (
                    <div className="space-y-6">
                        {renderTabErrors("gallery")}
                        {uploadError && (
                            <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-2 text-xs text-red-400">{uploadError}</div>
                        )}

                        {/* Main Image */}
                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-white/70">Main Image</label>
                            {form.image ? (
                                <div className="relative inline-block">
                                    <img src={form.image} alt="Main" className="h-32 w-32 rounded-lg object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => updateField("image", "")}
                                        className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500/80 text-xs text-white hover:bg-red-500"
                                        title="Remove"
                                    >
                                        ✕
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded bg-black/70 px-2 py-0.5 text-[11px] text-white hover:bg-black/90"
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
                                    className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-8 transition-colors ${
                                        mainDrag
                                            ? "border-blue-400 bg-blue-500/10"
                                            : uploading
                                                ? "pointer-events-none opacity-50 border-white/15 bg-white/5"
                                                : "border-white/15 bg-white/5 hover:border-white/25 hover:bg-white/8"
                                    }`}
                                >
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={`transition-colors ${mainDrag ? "text-blue-400" : "text-white/40"}`}>
                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                        <polyline points="17 8 12 3 7 8" />
                                        <line x1="12" y1="3" x2="12" y2="15" />
                                    </svg>
                                    <span className={`text-sm ${mainDrag ? "text-blue-400" : "text-white/60"}`}>
                                        {uploading ? "Uploading..." : mainDrag ? "Drop image here" : "Drag & drop or click to upload"}
                                    </span>
                                    <span className="text-[11px] text-white/30">Image files</span>
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
                            <label className="mb-1.5 block text-xs font-medium text-white/70">
                                Gallery Images {form.gallery && form.gallery.length > 0 && `(${form.gallery.length}/20)`}
                            </label>
                            <div
                                onDragOver={onGalleryDragOver}
                                onDragEnter={onGalleryDragEnter}
                                onDragLeave={onGalleryDragLeave}
                                onDrop={onGalleryDrop}
                                onClick={() => galleryInputRef.current?.click()}
                                className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-6 transition-colors ${
                                    galleryDrag
                                        ? "border-blue-400 bg-blue-500/10"
                                        : uploading
                                            ? "pointer-events-none opacity-50 border-white/15 bg-white/5"
                                            : "border-white/15 bg-white/5 hover:border-white/25 hover:bg-white/8"
                                }`}
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={`transition-colors ${galleryDrag ? "text-blue-400" : "text-white/40"}`}>
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                    <polyline points="17 8 12 3 7 8" />
                                    <line x1="12" y1="3" x2="12" y2="15" />
                                </svg>
                                <span className={`text-sm ${galleryDrag ? "text-blue-400" : "text-white/60"}`}>
                                    {uploading ? "Uploading..." : galleryDrag ? "Drop images here" : "Drag & drop or click to upload"}
                                </span>
                                <span className="text-[11px] text-white/30">
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
                                                className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500/80 text-[10px] text-white opacity-0 transition-opacity hover:bg-red-500 group-hover:opacity-100"
                                            >
                                                ✕
                                            </button>
                                            <div className="absolute bottom-1 left-1 rounded bg-black/60 px-1 py-0.5 text-[9px] text-white opacity-0 transition-opacity group-hover:opacity-100">
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
                            <label className="mb-1 block text-xs text-white/60">Description (HTML)</label>
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
                        disabled={createMutation.isPending || updateMutation.isPending}
                        className="rounded-lg bg-white/10 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-white/20 disabled:opacity-50"
                    >
                        {createMutation.isPending || updateMutation.isPending
                            ? "Saving..."
                            : isEdit
                            ? "Save Changes"
                            : "Create"}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate("/resale/apartments")}
                        className="rounded-lg border border-white/10 px-5 py-2 text-sm text-white/70 hover:bg-white/5"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </Layout>
    );
}
