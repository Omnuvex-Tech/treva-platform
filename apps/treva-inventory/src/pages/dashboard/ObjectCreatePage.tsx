import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { categoriesApi } from "../../api/categories";
import { objectTypesApi, type ObjectType } from "../../api/object-types";
import { FormDropdown, FormTextField, FormButton } from "@repo/ui";

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
                slug: `${formData.propertyName
                    ? formData.propertyName
                          .toLowerCase()
                          .replace(/[^a-z0-9]+/g, "-")
                          .replace(/(^-|-$)/g, "")
                    : "untitled"}-${Date.now()}`,
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
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: ["categories"] });
            const newId = response?.data?.id;
            if (newId) {
                navigate(`/dashboard/offplan/objects/${newId}/config`);
            } else {
                navigate("/dashboard/offplan/objects");
            }
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createMutation.mutate();
    };

    const updateField = (field: string, value: string | boolean) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const formContent = (
        <div className="w-full min-h-full flex items-center justify-center p-6 antialiased font-sans">
            <div className="w-full max-w-[1000px] bg-white rounded-[24px] border border-[#E2E8F0] shadow-xs p-5 relative">
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
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* 2-Column Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
                        <FormDropdown
                            label="Object type"
                            value={formData.objectType}
                            options={objectTypes.map((t) => ({ id: t.id, label: t.title }))}
                            placeholder="Select object type"
                            onChange={(id) => updateField("objectType", id)}
                            required
                            noOptionsLabel="Create Object Type"
                            onNoOptionsClick={() => navigate("/dashboard/offplan/object-types")}
                        />

                        <FormTextField
                            label="Name of property"
                            value={formData.propertyName}
                            onChange={(v) => updateField("propertyName", v)}
                            placeholder="Placeholder"
                        />

                        <FormDropdown
                            label="Currency"
                            value={formData.currency}
                            options={[
                                { id: "Rubels", label: "Rubels" },
                                { id: "Manat", label: "Manat (₼)" },
                                { id: "USD", label: "USD ($)" },
                            ]}
                            placeholder="Select currency"
                            onChange={(id) => updateField("currency", id)}
                            required
                        />

                        <FormTextField
                            label="Region"
                            value={formData.region}
                            onChange={(v) => updateField("region", v)}
                            placeholder="Placeholder"
                        />

                        <FormTextField
                            label="Area"
                            value={formData.area}
                            onChange={(v) => updateField("area", v)}
                            placeholder="Placeholder"
                        />

                        <FormTextField
                            label="City"
                            value={formData.city}
                            onChange={(v) => updateField("city", v)}
                            placeholder="Placeholder"
                        />

                        <FormTextField
                            label="Developer Brand"
                            value={formData.developerBrand}
                            onChange={(v) => updateField("developerBrand", v)}
                            placeholder="Placeholder"
                        />

                        <FormTextField
                            label="Website"
                            value={formData.website}
                            onChange={(v) => updateField("website", v)}
                            placeholder="Placeholder"
                        />
                    </div>

                    {/* Bottom Row: Checkbox + Submit */}
                    <div className="w-full flex flex-col sm:flex-row items-start py-4 justify-between gap-4">
                        {/* Federal Law Checkbox */}
                        <label className="flex items-center gap-3 group cursor-pointer select-none -mt-2">
                            <div className="relative">
                                <input
                                    type="checkbox"
                                    checked={formData.fedLaw214}
                                    onChange={(e) => updateField("fedLaw214", e.target.checked)}
                                    className="sr-only"
                                />
                                {formData.fedLaw214 ? (
                                    <img src="/images/inv-dashboard/inv-offplan/checkbox.svg" alt="" className="w-5 h-5" />
                                ) : (
                                    <img src="/images/inv-dashboard/inv-offplan/checkbox.svg" alt="" className="w-5 h-5 opacity-60" />
                                )}
                            </div>
                            <span className="text-[14px] font-normal text-[#333333]" style={{ lineHeight: "20px" }}>
                                Possibility of Purchase under Federal Law No. 214
                            </span>
                        </label>

                        {/* Submit Button */}
                        <FormButton
                            type="submit"
                            disabled={createMutation.isPending}
                            className="ml-auto sm:ml-0 mt-8 sm:mt-12"
                        >
                            {createMutation.isPending ? "Creating..." : "Next"}
                        </FormButton>
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

    return (
        <main className="flex-1 p-8 overflow-y-auto" style={{ background: "var(--background-primary-50, #FFFFFF80)" }}>
            {formContent}
        </main>
    );
}
