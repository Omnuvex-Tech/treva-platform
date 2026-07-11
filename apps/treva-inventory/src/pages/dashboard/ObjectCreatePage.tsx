import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { categoriesApi } from "../../api/categories";
import { objectTypesApi, type ObjectType } from "../../api/object-types";
import { FormDropdown, FormTextField, FormButton, FormImageField } from "@repo/ui";

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
        slug: "",
        currency: "Rubels",
        region: "",
        area: "",
        city: "",
        developerBrand: "",
        website: "",
        banks: "",
        infrastructure: "",
        salesDepartment: "",
        fedLaw214: false,
        image: "",
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};
        if (!formData.objectType) newErrors.objectType = "Object type is required";
        if (!formData.propertyName.trim()) newErrors.propertyName = "Name of property is required";
        if (!formData.currency) newErrors.currency = "Currency is required";
        if (!formData.region.trim()) newErrors.region = "Region is required";
        if (!formData.area.trim()) newErrors.area = "Area is required";
        if (!formData.city.trim()) newErrors.city = "City is required";
        if (!formData.developerBrand.trim()) newErrors.developerBrand = "Developer brand is required";
        if (!formData.website.trim()) newErrors.website = "Website is required";
        if (!formData.banks.trim()) newErrors.banks = "Banks is required";
        if (!formData.infrastructure.trim()) newErrors.infrastructure = "Infrastructure is required";
        if (!formData.salesDepartment.trim()) newErrors.salesDepartment = "Sales department is required";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const clearError = (field: string) => {
        if (errors[field]) {
            setErrors((prev) => {
                const next = { ...prev };
                delete next[field];
                return next;
            });
        }
    };

    const createMutation = useMutation({
        mutationFn: () => {
            const selectedType = objectTypes.find((t) => t.id === formData.objectType);
            const finalSlug = formData.slug || `${formData.propertyName
                ? formData.propertyName
                      .toLowerCase()
                      .replace(/[^a-z0-9]+/g, "-")
                      .replace(/(^-|-$)/g, "")
                : "untitled"}-${Date.now()}`;
            return categoriesApi.create({
                title: formData.propertyName || "Untitled",
                name: formData.propertyName || "untitled",
                slug: finalSlug,
                objectType: selectedType?.title || formData.objectType,
                propertyName: formData.propertyName,
                currency: formData.currency,
                region: formData.region,
                area: formData.area,
                city: formData.city,
                developerBrand: formData.developerBrand,
                website: formData.website,
                banks: formData.banks,
                infrastructure: formData.infrastructure,
                salesDepartment: formData.salesDepartment,
                fedLaw214: formData.fedLaw214,
                image: formData.image || undefined,
            });
        },
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: ["categories"] });
            const slug = response?.data?.slug;
            if (slug) {
                navigate(`/dashboard/offplan/objects/${slug}/config`);
            } else {
                navigate("/dashboard/offplan/objects");
            }
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        createMutation.mutate();
    };

    const updateField = (field: string, value: string | boolean) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const formContent = (
        <div className="w-full min-h-full flex items-center justify-center p-6 antialiased font-sans">
            <div className="w-full max-w-[1000px] bg-white rounded-[24px] border border-[#E2E8F0] shadow-xs p-5 relative">
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

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
                        <div>
                            <FormDropdown
                                label="Object type"
                                value={formData.objectType}
                                options={objectTypes.map((t) => ({ id: t.id, label: t.title }))}
                                placeholder="Select object type"
                                onChange={(id) => { updateField("objectType", id); clearError("objectType"); }}
                                required
                                noOptionsLabel="Create Object Type"
                                onNoOptionsClick={() => navigate("/dashboard/offplan/object-types")}
                            />
                            {errors.objectType && <p className="text-[12px] text-[#C3362B] mt-1">{errors.objectType}</p>}
                        </div>

                        <div>
                            <FormTextField
                                label="Name of property"
                                value={formData.propertyName}
                                onChange={(v) => { updateField("propertyName", v); clearError("propertyName"); }}
                                placeholder="Placeholder"
                                required
                            />
                            {errors.propertyName && <p className="text-[12px] text-[#C3362B] mt-1">{errors.propertyName}</p>}
                        </div>

                        <FormTextField
                            label="Slug"
                            value={formData.slug}
                            onChange={(v) => updateField("slug", v)}
                            placeholder="auto-generated-from-name"
                        />

                        <div>
                            <FormDropdown
                                label="Currency"
                                value={formData.currency}
                                options={[
                                    { id: "Rubels", label: "Rubels" },
                                    { id: "Manat", label: "Manat (₼)" },
                                    { id: "USD", label: "USD ($)" },
                                ]}
                                placeholder="Select currency"
                                onChange={(id) => { updateField("currency", id); clearError("currency"); }}
                                required
                            />
                            {errors.currency && <p className="text-[12px] text-[#C3362B] mt-1">{errors.currency}</p>}
                        </div>

                        <div>
                            <FormTextField
                                label="Region"
                                value={formData.region}
                                onChange={(v) => { updateField("region", v); clearError("region"); }}
                                placeholder="Placeholder"
                                required
                            />
                            {errors.region && <p className="text-[12px] text-[#C3362B] mt-1">{errors.region}</p>}
                        </div>

                        <div>
                            <FormTextField
                                label="Area"
                                value={formData.area}
                                onChange={(v) => { updateField("area", v); clearError("area"); }}
                                placeholder="Placeholder"
                                required
                            />
                            {errors.area && <p className="text-[12px] text-[#C3362B] mt-1">{errors.area}</p>}
                        </div>

                        <div>
                            <FormTextField
                                label="City"
                                value={formData.city}
                                onChange={(v) => { updateField("city", v); clearError("city"); }}
                                placeholder="Placeholder"
                                required
                            />
                            {errors.city && <p className="text-[12px] text-[#C3362B] mt-1">{errors.city}</p>}
                        </div>

                        <div>
                            <FormTextField
                                label="Developer Brand"
                                value={formData.developerBrand}
                                onChange={(v) => { updateField("developerBrand", v); clearError("developerBrand"); }}
                                placeholder="Placeholder"
                                required
                            />
                            {errors.developerBrand && <p className="text-[12px] text-[#C3362B] mt-1">{errors.developerBrand}</p>}
                        </div>

                        <div>
                            <FormTextField
                                label="Website"
                                value={formData.website}
                                onChange={(v) => { updateField("website", v); clearError("website"); }}
                                placeholder="Placeholder"
                                required
                            />
                            {errors.website && <p className="text-[12px] text-[#C3362B] mt-1">{errors.website}</p>}
                        </div>

                        <div>
                            <FormTextField
                                label="Banks"
                                value={formData.banks}
                                onChange={(v) => { updateField("banks", v); clearError("banks"); }}
                                placeholder="Placeholder"
                                required
                            />
                            {errors.banks && <p className="text-[12px] text-[#C3362B] mt-1">{errors.banks}</p>}
                        </div>

                        <div>
                            <FormTextField
                                label="Infrastructure"
                                value={formData.infrastructure}
                                onChange={(v) => { updateField("infrastructure", v); clearError("infrastructure"); }}
                                placeholder="Placeholder"
                                required
                            />
                            {errors.infrastructure && <p className="text-[12px] text-[#C3362B] mt-1">{errors.infrastructure}</p>}
                        </div>

                        <div>
                            <FormTextField
                                label="Sales department"
                                value={formData.salesDepartment}
                                onChange={(v) => { updateField("salesDepartment", v); clearError("salesDepartment"); }}
                                placeholder="Placeholder"
                                required
                            />
                            {errors.salesDepartment && <p className="text-[12px] text-[#C3362B] mt-1">{errors.salesDepartment}</p>}
                        </div>
                    </div>

                    <FormImageField
                        label="Object Image"
                        value={formData.image}
                        onChange={(url) => updateField("image", url)}
                        uploadFn={(file) => categoriesApi.uploadFile(file).then((res) => res.data)}
                        accept="image/jpeg,image/png,image/webp"
                        required
                    />

                    <div className="w-full flex flex-col sm:flex-row items-start py-4 justify-between gap-4">
                        <label className="flex items-center gap-3 group cursor-pointer select-none -mt-2">
                            <div className="relative">
                                <input
                                    type="checkbox"
                                    checked={formData.fedLaw214}
                                    onChange={(e) => updateField("fedLaw214", e.target.checked)}
                                    className="sr-only"
                                />
                                {formData.fedLaw214 ? (
                                    <img src="/images/inv-dashboard/inv-offplan/checkbox-checked.svg" alt="" className="w-5 h-5" />
                                ) : (
                                    <img src="/images/inv-dashboard/inv-offplan/checkbox.svg" alt="" className="w-5 h-5 opacity-60" />
                                )}
                            </div>
                            <span className="text-[14px] font-normal text-[#333333]" style={{ lineHeight: "20px" }}>
                                Possibility of Purchase under Federal Law No. 214
                            </span>
                        </label>

                        <FormButton
                            type="submit"
                            disabled={createMutation.isPending}
                            className="ml-auto sm:ml-0 mt-8 sm:mt-12"
                        >
                            {createMutation.isPending ? "Creating..." : "Next"}
                        </FormButton>
                    </div>

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
