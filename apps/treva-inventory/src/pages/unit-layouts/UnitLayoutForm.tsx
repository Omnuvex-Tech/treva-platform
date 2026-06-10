import { useState, useEffect } from "react";
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
import { Layout } from "../../components/Layout";
import { FileUpload } from "../../components/FileUpload";

type Tab = "basic" | "area" | "location" | "documents" | "gallery";

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
];

export function UnitLayoutForm() {
    const { id } = useParams<{ id: string }>();
    const isEdit = !!id;
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [activeTab, setActiveTab] = useState<Tab>("basic");
    const [form, setForm] = useState<CreateUnitLayoutData>({
        title: "",
        name: "",
        slug: "",
        status: "available",
        categoryId: "",
        floor: 1,
        number: undefined,
        totalArea: 0,
        internalArea: 0,
        balconyArea: undefined,
        priceUsd: 0,
        priceAzn: 0,
        completionYear: 2030,
        numberOfFloors: { start: 1, end: 1 },
        view: "",
        similarApartmentIds: [],
        mainImage: undefined,
        gallery: [],
        documents: [],
        location: { title: "", url: "", type: "apartment" },
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

    useEffect(() => {
        if (existing?.data) {
            const d = existing.data;
            setForm({
                title: d.title,
                name: d.name,
                slug: d.slug,
                status: d.status || "available",
                categoryId: d.categoryId,
                floor: d.floor ?? 1,
                number: d.number ?? undefined,
                totalArea: d.totalArea ?? 0,
                internalArea: d.internalArea ?? 0,
                balconyArea: d.balconyArea ?? undefined,
                priceUsd: d.priceUsd ?? 0,
                priceAzn: d.priceAzn ?? 0,
                completionYear: d.completionYear ?? 2030,
                numberOfFloors: d.numberOfFloors || { start: 1, end: 1 },
                view: d.view || "",
                similarApartmentIds: d.similarApartmentIds || [],
                mainImage: d.mainImage ?? undefined,
                gallery: Array.isArray(d.gallery) ? d.gallery : [],
                documents: Array.isArray(d.documents) ? d.documents : [],
                location: d.location || { title: "", url: "", type: "apartment" },
            });
        }
    }, [existing]);

    const createMutation = useMutation({
        mutationFn: (data: CreateUnitLayoutData) => unitLayoutsApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["unit-layouts"] });
            navigate("/unit-layouts");
        },
    });

    const updateMutation = useMutation({
        mutationFn: (data: Partial<CreateUnitLayoutData>) =>
            unitLayoutsApi.update(id!, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["unit-layouts"] });
            navigate("/unit-layouts");
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEdit) {
            updateMutation.mutate(form);
        } else {
            createMutation.mutate(form);
        }
    };

    const handleSlugFromTitle = (title: string) => {
        setForm((prev) => ({
            ...prev,
            title,
            slug:
                prev.slug ||
                title
                    .toLowerCase()
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

    const updateLocation = (
        key: keyof NonNullable<CreateUnitLayoutData["location"]>,
        value: string
    ) => {
        setForm((prev) => ({
            ...prev,
            location: { ...prev.location!, [key]: value },
        }));
    };

    const updateFloors = (key: "start" | "end", value: number) => {
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

    const categories = Array.isArray(categoriesResponse?.data)
        ? (categoriesResponse.data as Category[])
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
            <Layout>
                <div className="py-8 text-center text-white/50">Loading...</div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="mx-auto max-w-3xl">
                <div className="mb-4">
                    <h2 className="text-lg font-semibold">
                        {isEdit ? "Edit Unit Layout" : "New Unit Layout"}
                    </h2>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4 flex gap-1 border-b border-white/10">
                        {tabs.map((tab) => (
                            <button
                                key={tab.key}
                                type="button"
                                onClick={() => setActiveTab(tab.key)}
                                className={`px-4 py-2.5 text-sm transition-colors ${
                                    activeTab === tab.key
                                        ? "border-b-2 border-white text-white"
                                        : "text-white/50 hover:text-white/80"
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <div className="rounded-xl border border-white/10 bg-white/3 p-6">
                        {activeTab === "basic" && (
                            <div className="flex flex-col gap-4">
                                <div>
                                    <label className="mb-1.5 block text-xs font-medium text-white/70">
                                        Title
                                    </label>
                                    <input
                                        type="text"
                                        value={form.title}
                                        onChange={(e) => handleSlugFromTitle(e.target.value)}
                                        className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/40 focus:border-white/30 focus:outline-none"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-xs font-medium text-white/70">
                                        Name
                                    </label>
                                    <input
                                        type="text"
                                        value={form.name}
                                        onChange={(e) => updateField("name", e.target.value)}
                                        className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/40 focus:border-white/30 focus:outline-none"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-xs font-medium text-white/70">
                                        Slug
                                    </label>
                                    <input
                                        type="text"
                                        value={form.slug}
                                        onChange={(e) => updateField("slug", e.target.value)}
                                        className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/40 focus:border-white/30 focus:outline-none"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="mb-1.5 block text-xs font-medium text-white/70">
                                            Category
                                        </label>
                                        <select
                                            value={form.categoryId}
                                            onChange={(e) =>
                                                updateField("categoryId", e.target.value)
                                            }
                                            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white focus:border-white/30 focus:outline-none"
                                            required
                                        >
                                            <option value="">Select category</option>
                                            {categories.map((cat) => (
                                                <option key={cat.id} value={cat.id}>
                                                    {cat.title}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="mb-1.5 block text-xs font-medium text-white/70">
                                            Status
                                        </label>
                                        <select
                                            value={form.status}
                                            onChange={(e) =>
                                                updateField("status", e.target.value)
                                            }
                                            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white focus:border-white/30 focus:outline-none"
                                        >
                                            <option value="available">Available</option>
                                            <option value="sold">Sold</option>
                                            <option value="reserved">Reserved</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="mb-1.5 block text-xs font-medium text-white/70">
                                            Floor
                                        </label>
                                        <input
                                            type="number"
                                            value={form.floor}
                                            onChange={(e) =>
                                                updateField("floor", parseInt(e.target.value) || 1)
                                            }
                                            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white focus:border-white/30 focus:outline-none"
                                            min={1}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1.5 block text-xs font-medium text-white/70">
                                            Number
                                        </label>
                                        <input
                                            type="number"
                                            value={form.number ?? ""}
                                            onChange={(e) =>
                                                updateField(
                                                    "number",
                                                    e.target.value ? parseInt(e.target.value) : undefined
                                                )
                                            }
                                            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white focus:border-white/30 focus:outline-none"
                                            min={1}
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1.5 block text-xs font-medium text-white/70">
                                            View
                                        </label>
                                        <input
                                            type="text"
                                            value={form.view || ""}
                                            onChange={(e) => updateField("view", e.target.value)}
                                            placeholder="e.g. Sea view"
                                            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/40 focus:border-white/30 focus:outline-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === "area" && (
                            <div className="flex flex-col gap-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="mb-1.5 block text-xs font-medium text-white/70">
                                            Total Area (m²)
                                        </label>
                                        <input
                                            type="number"
                                            value={form.totalArea}
                                            onChange={(e) =>
                                                updateField(
                                                    "totalArea",
                                                    parseFloat(e.target.value) || 0
                                                )
                                            }
                                            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white focus:border-white/30 focus:outline-none"
                                            min={0}
                                            step={0.1}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1.5 block text-xs font-medium text-white/70">
                                            Internal Area (m²)
                                        </label>
                                        <input
                                            type="number"
                                            value={form.internalArea}
                                            onChange={(e) =>
                                                updateField(
                                                    "internalArea",
                                                    parseFloat(e.target.value) || 0
                                                )
                                            }
                                            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white focus:border-white/30 focus:outline-none"
                                            min={0}
                                            step={0.1}
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-xs font-medium text-white/70">
                                        Balcony Area (m²)
                                    </label>
                                    <input
                                        type="number"
                                        value={form.balconyArea ?? ""}
                                        onChange={(e) =>
                                            updateField(
                                                "balconyArea",
                                                e.target.value
                                                    ? parseFloat(e.target.value)
                                                    : undefined
                                            )
                                        }
                                        className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/40 focus:border-white/30 focus:outline-none"
                                        min={0}
                                        step={0.1}
                                        placeholder="Optional"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="mb-1.5 block text-xs font-medium text-white/70">
                                            Price (USD)
                                        </label>
                                        <input
                                            type="number"
                                            value={form.priceUsd}
                                            onChange={(e) =>
                                                updateField(
                                                    "priceUsd",
                                                    parseFloat(e.target.value) || 0
                                                )
                                            }
                                            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white focus:border-white/30 focus:outline-none"
                                            min={0}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1.5 block text-xs font-medium text-white/70">
                                            Price (AZN)
                                        </label>
                                        <input
                                            type="number"
                                            value={form.priceAzn}
                                            onChange={(e) =>
                                                updateField(
                                                    "priceAzn",
                                                    parseFloat(e.target.value) || 0
                                                )
                                            }
                                            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white focus:border-white/30 focus:outline-none"
                                            min={0}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === "location" && (
                            <div className="flex flex-col gap-4">
                                <div>
                                    <label className="mb-1.5 block text-xs font-medium text-white/70">
                                        Location Title
                                    </label>
                                    <input
                                        type="text"
                                        value={form.location?.title || ""}
                                        onChange={(e) =>
                                            updateLocation("title", e.target.value)
                                        }
                                        placeholder="e.g. Sea Breeze Resort, Nardaran District"
                                        className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/40 focus:border-white/30 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-xs font-medium text-white/70">
                                        Location URL
                                    </label>
                                    <input
                                        type="text"
                                        value={form.location?.url || ""}
                                        onChange={(e) =>
                                            updateLocation("url", e.target.value)
                                        }
                                        placeholder="Optional"
                                        className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/40 focus:border-white/30 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-xs font-medium text-white/70">
                                        Location Type
                                    </label>
                                    <input
                                        type="text"
                                        value={form.location?.type || "apartment"}
                                        onChange={(e) =>
                                            updateLocation("type", e.target.value)
                                        }
                                        className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white focus:border-white/30 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-xs font-medium text-white/70">
                                        Completion Year
                                    </label>
                                    <input
                                        type="number"
                                        value={form.completionYear}
                                        onChange={(e) =>
                                            updateField(
                                                "completionYear",
                                                parseInt(e.target.value) || 2030
                                            )
                                        }
                                        className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white focus:border-white/30 focus:outline-none"
                                        min={2020}
                                        max={2100}
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="mb-1.5 block text-xs font-medium text-white/70">
                                            Floors From
                                        </label>
                                        <input
                                            type="number"
                                            value={form.numberOfFloors.start}
                                            onChange={(e) =>
                                                updateFloors(
                                                    "start",
                                                    parseInt(e.target.value) || 1
                                                )
                                            }
                                            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white focus:border-white/30 focus:outline-none"
                                            min={1}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1.5 block text-xs font-medium text-white/70">
                                            Floors To
                                        </label>
                                        <input
                                            type="number"
                                            value={form.numberOfFloors.end}
                                            onChange={(e) =>
                                                updateFloors(
                                                    "end",
                                                    parseInt(e.target.value) || 1
                                                )
                                            }
                                            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white focus:border-white/30 focus:outline-none"
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
                                                className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-4 py-2.5"
                                            >
                                                <span className="text-sm text-white/70">
                                                    {doc.url.split("/").pop()}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => removeDocument(index)}
                                                    className="text-red-400 hover:text-red-300"
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
                                    <label className="mb-1.5 block text-xs font-medium text-white/70">
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
                                                className="text-red-400 hover:text-red-300"
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
                                    <label className="mb-1.5 block text-xs font-medium text-white/70">
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
                                                            onClick={() =>
                                                                removeGalleryImage(index)
                                                            }
                                                            className="absolute top-1 right-1 rounded-full bg-black/60 p-1 text-xs text-white hover:bg-black/80"
                                                        >
                                                            ✕
                                                        </button>
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {mutationError && (
                        <div className="mt-4 rounded-lg bg-red-500/20 p-3 text-center text-sm text-red-300">
                            {mutationErrorMessage}
                        </div>
                    )}

                    <div className="mt-6 flex gap-3">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="rounded-lg bg-white/10 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/20 disabled:opacity-50"
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
                            className="rounded-lg border border-white/10 px-5 py-2.5 text-sm text-white/70 transition-colors hover:bg-white/5"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </Layout>
    );
}
