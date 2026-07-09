import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { categoriesApi } from "../../api/categories";
import { objectTypesApi, type ObjectType } from "../../api/object-types";

export function ObjectCreatePage({ embedded = false }: { embedded?: boolean } = {}) {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data: categoriesResponse } = useQuery({
        queryKey: ["categories"],
        queryFn: () => categoriesApi.getAll(),
    });

    const categories = Array.isArray(categoriesResponse?.data)
        ? categoriesResponse.data
        : [];

    const { data: objectTypesResponse } = useQuery({
        queryKey: ["object-types"],
        queryFn: () => objectTypesApi.getAll(),
    });

    const objectTypes: ObjectType[] = Array.isArray(objectTypesResponse?.data)
        ? objectTypesResponse.data
        : [];

    const [formData, setFormData] = useState({
        objectType: "",
        propertyName: "",
        currency: "Rubels",
        region: "",
        area: "",
        city: "",
        developerBrand: "",
        website: "",
        fedLaw214: false,
    });

    const createMutation = useMutation({
        mutationFn: () => {
            const selectedType = objectTypes.find((t) => t.id === formData.objectType);
            return categoriesApi.create({
                title: formData.propertyName || "Untitled",
                name: formData.propertyName || "untitled",
                slug: formData.propertyName
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, "-")
                    .replace(/(^-|-$)/g, "") || "untitled",
                objectType: selectedType?.title || formData.objectType,
                propertyName: formData.propertyName,
                currency: formData.currency,
                region: formData.region,
                area: formData.area,
                city: formData.city,
                developerBrand: formData.developerBrand,
                website: formData.website,
                fedLaw214: formData.fedLaw214,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["categories"] });
            navigate("/dashboard/offplan/objects");
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createMutation.mutate();
    };

    const updateField = (field: string, value: string | boolean) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

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
                <label className="mb-1 block text-xs text-[#333333]">{label}</label>
                <button
                    type="button"
                    onClick={() => setOpen(!open)}
                    className={`flex w-full items-center justify-between rounded-xl border border-[#CCCCCC] bg-white px-4 h-[36px] text-sm text-[#333333] focus:border-gray-400 focus:outline-none`}
                >
                    <span className={selected ? "text-[#333333]" : "text-[#666666]"}>{selected?.label || placeholder}</span>
                    <svg
                        width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                        className={open ? "rotate-180 transition-transform" : "transition-transform"}
                    >
                        <path d="M6 9l6 6 6-6" />
                    </svg>
                </button>
                {open && (
                    <div className="absolute left-0 top-full z-50 mt-1 w-full overflow-hidden rounded-xl border border-[#CCCCCC] bg-white shadow-lg">
                        {options.map((opt) => (
                            <button
                                key={opt.id}
                                type="button"
                                className={`w-full px-4 py-2.5 text-left text-sm transition-colors ${
                                    value === opt.id
                                        ? "bg-[#4E525D]/10 text-[#333333] font-medium"
                                        : "text-[#666666] hover:bg-gray-50 hover:text-[#333333]"
                                }`}
                                onClick={() => { onChange(opt.id); setOpen(false); }}
                            >
                                {opt.label}
                            </button>
                        ))}
                        {options.length === 0 && (
                            <div className="px-4 py-2.5 text-sm text-[#999]">No options yet</div>
                        )}
                    </div>
                )}
            </div>
        );
    }

    const formContent = (
        <div className="w-full min-h-full flex items-center justify-center p-6 antialiased font-sans">
            <div className="w-full max-w-[1000px] bg-white rounded-[24px] border border-[#E2E8F0] shadow-xs p-8 relative">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-[16px] font-bold text-[#333333]" style={{ lineHeight: "20px" }}>
                            Creating an Object
                        </h2>
                       
                    </div>
                    <button
                        type="button"
                        onClick={() => navigate("/dashboard/offplan/objects")}
                        className="text-[#718096] hover:text-[#1A1C1E] transition-colors p-1 cursor-pointer"
                        aria-label="Close form"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* 2-Column Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
                        {/* Object Type */}
                        <CustomSelect
                            label="Object type *"
                            value={formData.objectType}
                            options={objectTypes.map((t) => ({ id: t.id, label: t.title }))}
                            placeholder="Select object type"
                            onChange={(id) => updateField("objectType", id)}
                        />

                        {/* Property Name */}
                        <div className="flex flex-col">
                            <label className="mb-1 block text-xs text-[#333333]">
                                Name of property
                            </label>
                            <input
                                type="text"
                                placeholder="Placeholder"
                                value={formData.propertyName}
                                onChange={(e) => updateField("propertyName", e.target.value)}
                                className="w-full h-[36px] px-4 bg-white border border-[#CCCCCC] rounded-[16px] text-[14px] font-normal placeholder-[#666666] text-[#333333] focus:outline-hidden focus:border-[#4A4E5A] transition-colors"
                            />
                        </div>

                        {/* Currency */}
                        <CustomSelect
                            label="Currency *"
                            value={formData.currency}
                            options={[
                                { id: "Rubels", label: "Rubels" },
                                { id: "Manat", label: "Manat (₼)" },
                                { id: "USD", label: "USD ($)" },
                            ]}
                            placeholder="Select currency"
                            onChange={(id) => updateField("currency", id)}
                        />

                        {/* Region */}
                        <div className="flex flex-col">
                            <label className="mb-1 block text-xs text-[#333333]">
                                Region
                            </label>
                            <input
                                type="text"
                                placeholder="Placeholder"
                                value={formData.region}
                                onChange={(e) => updateField("region", e.target.value)}
                                className="w-full h-[36px] px-4 bg-white border border-[#CCCCCC] rounded-[16px] text-[14px] font-normal placeholder-[#666666] text-[#333333] focus:outline-hidden focus:border-[#4A4E5A] transition-colors"
                            />
                        </div>

                        {/* Area */}
                        <div className="flex flex-col">
                            <label className="mb-1 block text-xs text-[#333333]">
                                Area
                            </label>
                            <input
                                type="text"
                                placeholder="Placeholder"
                                value={formData.area}
                                onChange={(e) => updateField("area", e.target.value)}
                                className="w-full h-[36px] px-4 bg-white border border-[#CCCCCC] rounded-[16px] text-[14px] font-normal placeholder-[#666666] text-[#333333] focus:outline-hidden focus:border-[#4A4E5A] transition-colors"
                            />
                        </div>

                        {/* City */}
                        <div className="flex flex-col">
                            <label className="mb-1 block text-xs text-[#333333]">
                                City
                            </label>
                            <input
                                type="text"
                                placeholder="Placeholder"
                                value={formData.city}
                                onChange={(e) => updateField("city", e.target.value)}
                                className="w-full h-[36px] px-4 bg-white border border-[#CCCCCC] rounded-[16px] text-[14px] font-normal placeholder-[#666666] text-[#333333] focus:outline-hidden focus:border-[#4A4E5A] transition-colors"
                            />
                        </div>

                        {/* Developer Brand */}
                        <div className="flex flex-col">
                            <label className="mb-1 block text-xs text-[#333333]">
                                Developer Brand
                            </label>
                            <input
                                type="text"
                                placeholder="Placeholder"
                                value={formData.developerBrand}
                                onChange={(e) => updateField("developerBrand", e.target.value)}
                                className="w-full h-[36px] px-4 bg-white border border-[#CCCCCC] rounded-[16px] text-[14px] font-normal placeholder-[#666666] text-[#333333] focus:outline-hidden focus:border-[#4A4E5A] transition-colors"
                            />
                        </div>

                        {/* Website */}
                        <div className="flex flex-col">
                            <label className="mb-1 block text-xs text-[#333333]">
                                Website
                            </label>
                            <input
                                type="url"
                                placeholder="Placeholder"
                                value={formData.website}
                                onChange={(e) => updateField("website", e.target.value)}
                                className="w-full h-[36px] px-4 bg-white border border-[#CCCCCC] rounded-[16px] text-[14px] font-normal placeholder-[#666666] text-[#333333] focus:outline-hidden focus:border-[#4A4E5A] transition-colors"
                            />
                        </div>
                    </div>

                    {/* Bottom Row: Checkbox + Submit */}
                    <div className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        {/* Federal Law Checkbox */}
                        <label className="flex items-center gap-3 group cursor-pointer select-none">
                            <div className="relative">
                                <input
                                    type="checkbox"
                                    checked={formData.fedLaw214}
                                    onChange={(e) => updateField("fedLaw214", e.target.checked)}
                                    className="sr-only"
                                />
                                <div className={`w-5 h-5 border-2 rounded-[6px] transition-all flex items-center justify-center ${
                                    formData.fedLaw214
                                        ? "bg-[#43464E] border-[#43464E]"
                                        : "bg-white border-[#A0AEC0] group-hover:border-[#43464E]"
                                }`}>
                                    {formData.fedLaw214 && (
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="20 6 9 17 4 12"></polyline>
                                        </svg>
                                    )}
                                </div>
                            </div>
                            <span className="text-[14px] font-normal text-[#333333]" style={{ lineHeight: "20px" }}>
                                Possibility of Purchase under Federal Law No. 214
                            </span>
                        </label>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={createMutation.isPending}
                            className="px-5 h-[48px] bg-[#43464E] hover:bg-[#33363D] text-white rounded-[27px] text-[20px] font-medium tracking-wide transition-all shadow-xs ml-auto sm:ml-0 disabled:opacity-50 cursor-pointer"
                        >
                            {createMutation.isPending ? "Creating..." : "Creat"}
                        </button>
                    </div>

                    {/* Error */}
                    {createMutation.isError && (
                        <div className="rounded-xl bg-red-50 p-3 text-center text-sm text-[#C3362B]">
                            {(createMutation.error as Error)?.message || "Failed to create object"}
                        </div>
                    )}
                </form>
            </div>
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
        <main className="flex-1 p-8 overflow-y-auto" style={{ background: "var(--background-primary-50, #FFFFFF80)" }}>
            {formContent}
        </main>
    );
}
