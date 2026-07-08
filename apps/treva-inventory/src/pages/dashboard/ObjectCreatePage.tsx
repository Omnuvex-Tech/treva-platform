import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { categoriesApi, type Category } from "../../api/categories";

export function ObjectCreatePage() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data: categoriesResponse } = useQuery({
        queryKey: ["categories"],
        queryFn: () => categoriesApi.getAll(),
    });

    const categories: Category[] = Array.isArray(categoriesResponse?.data)
        ? categoriesResponse.data
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
            const selectedCategory = categories.find((c) => c.id === formData.objectType);
            return categoriesApi.create({
                title: formData.propertyName || "Untitled",
                name: formData.propertyName || "untitled",
                slug: formData.propertyName
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, "-")
                    .replace(/(^-|-$)/g, "") || "untitled",
                objectType: selectedCategory?.title || formData.objectType,
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

    return (
        <div className="w-full min-h-screen bg-[#F8F9FA] flex items-center justify-center p-6 antialiased font-sans">
            {/* Primary Card */}
            <div className="w-full max-w-[1000px] bg-white rounded-[24px] border border-[#E2E8F0] shadow-xs p-8 relative">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-[22px] font-bold text-[#1A1C1E] tracking-tight">
                        Creating an Object
                    </h2>
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
                        {/* Object Type - Dynamic from Categories */}
                        <div className="flex flex-col">
                            <label className="text-[14px] font-semibold text-[#2D313A] mb-2">
                                Object type<span className="text-[#EF4444] ml-0.5">*</span>
                            </label>
                            <div className="relative">
                                <select
                                    value={formData.objectType}
                                    onChange={(e) => updateField("objectType", e.target.value)}
                                    className="w-full h-[52px] px-4 bg-white border border-[#E2E8F0] rounded-[16px] text-[15px] text-[#2D313A] font-normal appearance-none focus:outline-hidden focus:border-[#4A4E5A] transition-colors cursor-pointer"
                                    required
                                >
                                    <option value="" disabled>Select category</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.title}
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-[#718096]">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="6 9 12 15 18 9"></polyline>
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Property Name */}
                        <div className="flex flex-col">
                            <label className="text-[14px] font-semibold text-[#2D313A] mb-2">
                                Name of property
                            </label>
                            <input
                                type="text"
                                placeholder="Placeholder"
                                value={formData.propertyName}
                                onChange={(e) => updateField("propertyName", e.target.value)}
                                className="w-full h-[52px] px-4 bg-white border border-[#E2E8F0] rounded-[16px] text-[15px] placeholder-[#A0AEC0] text-[#2D313A] focus:outline-hidden focus:border-[#4A4E5A] transition-colors"
                            />
                        </div>

                        {/* Currency */}
                        <div className="flex flex-col">
                            <label className="text-[14px] font-semibold text-[#2D313A] mb-2">
                                Currency<span className="text-[#EF4444] ml-0.5">*</span>
                            </label>
                            <div className="relative">
                                <select
                                    value={formData.currency}
                                    onChange={(e) => updateField("currency", e.target.value)}
                                    className="w-full h-[52px] px-4 bg-white border border-[#E2E8F0] rounded-[16px] text-[15px] text-[#2D313A] font-normal appearance-none focus:outline-hidden focus:border-[#4A4E5A] transition-colors cursor-pointer"
                                >
                                    <option value="Rubels">Rubels</option>
                                    <option value="Manat">Manat (₼)</option>
                                    <option value="USD">USD ($)</option>
                                </select>
                                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-[#718096]">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="6 9 12 15 18 9"></polyline>
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Region */}
                        <div className="flex flex-col">
                            <label className="text-[14px] font-semibold text-[#2D313A] mb-2">
                                Region
                            </label>
                            <input
                                type="text"
                                placeholder="Placeholder"
                                value={formData.region}
                                onChange={(e) => updateField("region", e.target.value)}
                                className="w-full h-[52px] px-4 bg-white border border-[#E2E8F0] rounded-[16px] text-[15px] placeholder-[#A0AEC0] text-[#2D313A] focus:outline-hidden focus:border-[#4A4E5A] transition-colors"
                            />
                        </div>

                        {/* Area */}
                        <div className="flex flex-col">
                            <label className="text-[14px] font-semibold text-[#2D313A] mb-2">
                                Area
                            </label>
                            <input
                                type="text"
                                placeholder="Placeholder"
                                value={formData.area}
                                onChange={(e) => updateField("area", e.target.value)}
                                className="w-full h-[52px] px-4 bg-white border border-[#E2E8F0] rounded-[16px] text-[15px] placeholder-[#A0AEC0] text-[#2D313A] focus:outline-hidden focus:border-[#4A4E5A] transition-colors"
                            />
                        </div>

                        {/* City */}
                        <div className="flex flex-col">
                            <label className="text-[14px] font-semibold text-[#2D313A] mb-2">
                                City
                            </label>
                            <input
                                type="text"
                                placeholder="Placeholder"
                                value={formData.city}
                                onChange={(e) => updateField("city", e.target.value)}
                                className="w-full h-[52px] px-4 bg-white border border-[#E2E8F0] rounded-[16px] text-[15px] placeholder-[#A0AEC0] text-[#2D313A] focus:outline-hidden focus:border-[#4A4E5A] transition-colors"
                            />
                        </div>

                        {/* Developer Brand */}
                        <div className="flex flex-col">
                            <label className="text-[14px] font-semibold text-[#2D313A] mb-2">
                                Developer Brand
                            </label>
                            <input
                                type="text"
                                placeholder="Placeholder"
                                value={formData.developerBrand}
                                onChange={(e) => updateField("developerBrand", e.target.value)}
                                className="w-full h-[52px] px-4 bg-white border border-[#E2E8F0] rounded-[16px] text-[15px] placeholder-[#A0AEC0] text-[#2D313A] focus:outline-hidden focus:border-[#4A4E5A] transition-colors"
                            />
                        </div>

                        {/* Website */}
                        <div className="flex flex-col">
                            <label className="text-[14px] font-semibold text-[#2D313A] mb-2">
                                Website
                            </label>
                            <input
                                type="url"
                                placeholder="Placeholder"
                                value={formData.website}
                                onChange={(e) => updateField("website", e.target.value)}
                                className="w-full h-[52px] px-4 bg-white border border-[#E2E8F0] rounded-[16px] text-[15px] placeholder-[#A0AEC0] text-[#2D313A] focus:outline-hidden focus:border-[#4A4E5A] transition-colors"
                            />
                        </div>
                    </div>

                    {/* Bottom Row: Checkbox + Submit */}
                    <div className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4">
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
                            <span className="text-[14px] font-medium text-[#2D313A] tracking-tight">
                                Possibility of Purchase under Federal Law No. 214
                            </span>
                        </label>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={createMutation.isPending}
                            className="px-7 h-[46px] bg-[#43464E] hover:bg-[#33363D] text-white rounded-full text-sm font-medium tracking-wide transition-all shadow-xs ml-auto sm:ml-0 disabled:opacity-50 cursor-pointer"
                        >
                            {createMutation.isPending ? "Creating..." : "Create"}
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
}
