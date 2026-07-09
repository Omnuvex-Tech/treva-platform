import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { categoriesApi } from "../../api/categories";
import { objectTypesApi, type ObjectType } from "../../api/object-types";
import { FormDropdown, FormTextField, FormNumberField, FormImageField, FormButton } from "@repo/ui";

const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}.${d.getFullYear()}`;
};

export function ObjectEditPage({ embedded = false }: { embedded?: boolean } = {}) {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [title, setTitle] = useState("");
    const [name, setName] = useState("");
    const [slug, setSlug] = useState("");
    const [image, setImage] = useState("");
    const [status, setStatus] = useState("active");
    const [objectType, setObjectType] = useState("");
    const [propertyName, setPropertyName] = useState("");
    const [currency, setCurrency] = useState("Rubels");
    const [region, setRegion] = useState("");
    const [area, setArea] = useState("");
    const [city, setCity] = useState("");
    const [developerBrand, setDeveloperBrand] = useState("");
    const [website, setWebsite] = useState("");
    const [fedLaw214, setFedLaw214] = useState(false);
    const [housesCount, setHousesCount] = useState(0);
    const [propertiesCount, setPropertiesCount] = useState(0);
    const [reservedCount, setReservedCount] = useState(0);
    const [soldCount, setSoldCount] = useState(0);

    const { data: categoriesResponse } = useQuery({
        queryKey: ["categories"],
        queryFn: () => categoriesApi.getAll(),
    });

    const categoriesList = Array.isArray(categoriesResponse?.data) ? categoriesResponse.data : [];

    const { data: objectTypesResponse } = useQuery({
        queryKey: ["object-types"],
        queryFn: () => objectTypesApi.getAll(),
    });

    const objectTypesList: ObjectType[] = Array.isArray(objectTypesResponse?.data) ? objectTypesResponse.data : [];

    const { data: response, isLoading } = useQuery({
        queryKey: ["category", id],
        queryFn: () => categoriesApi.getById(id!),
        enabled: !!id,
    });

    useEffect(() => {
        if (response?.data) {
            const cat = response.data;
            setTitle(cat.title);
            setName(cat.name);
            setSlug(cat.slug);
            setImage(cat.image || "");
            setStatus(cat.status || "active");
            setObjectType(cat.objectType || "");
            setPropertyName(cat.propertyName || "");
            setCurrency(cat.currency || "Rubels");
            setRegion(cat.region || "");
            setArea(cat.area || "");
            setCity(cat.city || "");
            setDeveloperBrand(cat.developerBrand || "");
            setWebsite(cat.website || "");
            setFedLaw214(cat.fedLaw214 || false);
            setHousesCount(cat.housesCount ?? 0);
            setPropertiesCount(cat.propertiesCount ?? 0);
            setReservedCount(cat.reservedCount ?? 0);
            setSoldCount(cat.soldCount ?? 0);
        }
    }, [response]);

    const updateMutation = useMutation({
        mutationFn: () => {
            const selectedType = objectTypesList.find((t) => t.id === objectType);
            return categoriesApi.update(id!, {
                title,
                name,
                slug,
                image,
                status,
                objectType: selectedType?.title || objectType,
                propertyName,
                currency,
                region,
                area,
                city,
                developerBrand,
                website,
                fedLaw214,
                housesCount,
                propertiesCount,
                reservedCount,
                soldCount,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["categories"] });
            navigate("/dashboard/offplan/objects");
        },
    });

    const handleImageUpload = async (file: File) => {
        const res = await categoriesApi.uploadFile(file);
        return res.data;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateMutation.mutate();
    };

    const formContent = (
        <div className="mx-auto max-w-[800px]">
            <div className="mb-6">
                <h2 className="text-[20px] font-semibold text-[#1A1A1A]">Edit Object</h2>
                <p className="text-[14px] text-[#666666] mt-0.5">Update object details</p>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                {/* Image Upload */}
                <FormImageField
                    label="Image"
                    value={image}
                    onChange={setImage}
                    uploadFn={handleImageUpload}
                />

                {/* 2-Column Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mb-5 mt-5">
                    <FormDropdown
                        label="Object type"
                        value={objectType}
                        options={objectTypesList.map((t) => ({ id: t.id, label: t.title }))}
                        placeholder="Select object type"
                        onChange={setObjectType}
                        required
                        noOptionsLabel="Create Object Type"
                        onNoOptionsClick={() => navigate("/dashboard/offplan/object-types")}
                    />

                    <FormTextField
                        label="Title"
                        value={title}
                        onChange={setTitle}
                        required
                    />

                    <FormTextField
                        label="Name of property"
                        value={propertyName}
                        onChange={setPropertyName}
                    />

                    <FormDropdown
                        label="Currency"
                        value={currency}
                        options={[
                            { id: "Rubels", label: "Rubels" },
                            { id: "Manat", label: "Manat (₼)" },
                            { id: "USD", label: "USD ($)" },
                        ]}
                        placeholder="Select currency"
                        onChange={setCurrency}
                        required
                    />

                    <FormTextField
                        label="Region"
                        value={region}
                        onChange={setRegion}
                    />

                    <FormTextField
                        label="Area"
                        value={area}
                        onChange={setArea}
                    />

                    <FormTextField
                        label="City"
                        value={city}
                        onChange={setCity}
                    />

                    <FormTextField
                        label="Developer Brand"
                        value={developerBrand}
                        onChange={setDeveloperBrand}
                    />

                    <FormTextField
                        label="Website"
                        value={website}
                        onChange={setWebsite}
                    />

                    <FormDropdown
                        label="Status"
                        value={status}
                        options={[
                            { id: "active", label: "Active" },
                            { id: "archive", label: "Archive" },
                        ]}
                        placeholder="Select status"
                        onChange={setStatus}
                    />

                    <div className="flex flex-col">
                        <label className="mb-1 block text-xs font-semibold text-[#333333]" style={{ lineHeight: "18px" }}>Date</label>
                        <input
                            type="text"
                            value={response?.data ? formatDate(response.data.createdAt) : ""}
                            readOnly
                            className="w-full h-[36px] rounded-xl border border-[#CCCCCC] px-4 text-[14px] font-normal text-[#999] bg-[#F4F5F6] cursor-not-allowed outline-none"
                        />
                    </div>
                </div>

                {/* Federal Law Checkbox */}
                <div className="mb-5">
                    <label className="flex items-center gap-3 cursor-pointer select-none">
                        <div className="relative">
                            <input
                                type="checkbox"
                                checked={fedLaw214}
                                onChange={(e) => setFedLaw214(e.target.checked)}
                                className="sr-only"
                            />
                            {fedLaw214 ? (
                                <img src="/images/inv-dashboard/inv-offplan/checkbox.svg" alt="" className="w-5 h-5" />
                            ) : (
                                <img src="/images/inv-dashboard/inv-offplan/checkbox.svg" alt="" className="w-5 h-5 opacity-60" />
                            )}
                        </div>
                        <span className="text-[14px] font-normal text-[#333333]" style={{ lineHeight: "20px" }}>
                            Possibility of Purchase under Federal Law No. 214
                        </span>
                    </label>
                </div>

                {/* Metrics Section */}
                <div className="border-t border-gray-100 pt-5 mb-5">
                    <h3 className="text-sm font-semibold text-[#1A1A1A] mb-4">Metrics</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <FormNumberField
                            label="Houses"
                            value={housesCount}
                            onChange={setHousesCount}
                        />
                        <FormNumberField
                            label="Properties"
                            value={propertiesCount}
                            onChange={setPropertiesCount}
                        />
                        <FormNumberField
                            label="Reserved"
                            value={reservedCount}
                            onChange={setReservedCount}
                        />
                        <FormNumberField
                            label="Sold"
                            value={soldCount}
                            onChange={setSoldCount}
                        />
                    </div>
                </div>

                {/* Error */}
                {updateMutation.isError && (
                    <div className="mb-4 rounded-xl bg-red-50 p-3 text-center text-sm text-[#C3362B]">
                        {(updateMutation.error as Error)?.message || "Failed to update object"}
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                    <FormButton
                        type="submit"
                        disabled={updateMutation.isPending}
                        loading={updateMutation.isPending}
                    >
                        {updateMutation.isPending ? "Saving..." : "Save"}
                    </FormButton>
                    <FormButton
                        type="button"
                        variant="secondary"
                        onClick={() => navigate("/dashboard/offplan/objects")}
                    >
                        Cancel
                    </FormButton>
                </div>
            </form>
        </div>
    );

    if (isLoading) {
        return (
            <main className="flex-1 p-8 overflow-y-auto" style={{ background: "var(--background-primary-50, #FFFFFF80)" }}>
                <div className="py-8 text-center text-[#666666]">Loading...</div>
            </main>
        );
    }

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
