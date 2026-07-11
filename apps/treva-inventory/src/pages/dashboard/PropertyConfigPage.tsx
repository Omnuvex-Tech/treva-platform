import { useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { categoriesApi, type CategoryDocument } from "../../api/categories";
import { unitLayoutsApi, type UnitLayout, type UploadResponse } from "../../api/unit-layouts";
import { FormTabSwitcher, FormAddButton } from "@repo/ui";

interface LayihelerimizCategory {
    id: string;
    banks?: string;
    infrastructure?: string;
    salesDepartment?: string;
}

export function PropertyConfigPage({ embedded = false }: { embedded?: boolean } = {}) {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [activeHouseTab, setActiveHouseTab] = useState<"Active" | "Archive">("Active");
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { data: response, isLoading } = useQuery({
        queryKey: ["category", slug],
        queryFn: () => categoriesApi.getBySlug(slug!),
        enabled: !!slug,
    });

    const { data: cmsData } = useQuery({
        queryKey: ["layihelerimiz-category", slug],
        queryFn: async () => {
            const res = await fetch(`/cms-api/layihelerimiz/categories/${slug}`);
            if (!res.ok) return null;
            return res.json() as Promise<LayihelerimizCategory>;
        },
        enabled: !!slug,
    });

    const category = response?.data;
    const banks = cmsData?.banks || category?.banks || "";
    const infrastructure = cmsData?.infrastructure || category?.infrastructure || "";
    const salesDepartment = cmsData?.salesDepartment || category?.salesDepartment || "";
    const documents: CategoryDocument[] = category?.documents || [];

    const { data: layoutsRes } = useQuery({
        queryKey: ["unit-layouts", slug],
        queryFn: () => unitLayoutsApi.getAll({ categorySlug: slug! }),
        enabled: !!slug,
    });

    const allHouses: UnitLayout[] = layoutsRes?.data?.data || [];
    const filteredHouses = activeHouseTab === "Active"
        ? allHouses.filter((h) => h.statusOption?.value !== "Sold")
        : allHouses.filter((h) => h.statusOption?.value === "Sold");

    const updateDocsMutation = useMutation({
        mutationFn: (docs: CategoryDocument[]) => {
            if (!category?.id) throw new Error("No category ID");
            return categoriesApi.update(category.id, { documents: docs });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["category", slug] });
        },
    });

    const handleFileUpload = async (files: FileList | File[]) => {
        const arr = Array.from(files);
        if (arr.length === 0) return;
        setUploading(true);
        try {
            const newDocs: CategoryDocument[] = [];
            for (const file of arr) {
                const res = await unitLayoutsApi.uploadFile(file);
                const data = res.data;
                const docType = file.type === "application/pdf" ? "pdf" : "image";
                newDocs.push({ type: docType, url: data.url });
            }
            const updatedDocs = [...documents, ...newDocs];
            updateDocsMutation.mutate(updatedDocs);
        } catch {
            // upload failed silently
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleRemoveDoc = (index: number) => {
        const updatedDocs = documents.filter((_, i) => i !== index);
        updateDocsMutation.mutate(updatedDocs);
    };

    const handleBack = () => {
        navigate(`/dashboard/offplan/objects/${slug}/config`);
    };

    const content = (
        <div className="min-h-full w-full bg-[#ffffff] p-8 font-sans antialiased text-[#1A1A1A]">
            <h1 style={{ fontWeight: 500, fontSize: 16, lineHeight: "20px", letterSpacing: 0 }} className="mb-6">
                Properties
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10 items-stretch">

                {/* Property Information Card */}
                <div className="bg-white border border-[#EAECEF] rounded-[16px] p-5 flex flex-col justify-between shadow-xs">
                    <div>
                        <div className="flex items-center justify-between border-b border-[#F4F5F7] pb-4 mb-4">
                            <h2 style={{ fontWeight: 500, fontSize: 14, lineHeight: "20px", letterSpacing: 0 }} className="text-[#1A1A1A]">
                                Property information
                            </h2>
                            <button
                                type="button"
                                style={{ width: 32, height: 32, padding: 8, borderRadius: 24, border: "1px solid #FFFFFF", background: "#EBEBEB" }}
                                className="flex items-center justify-center transition-colors cursor-pointer"
                                aria-label="More options"
                            >
                                <img src="/images/inv-dashboard/points.svg" alt="" className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3.5 pt-1">
                            <div className="space-y-3.5">
                                <div className="flex items-start">
                                    <span style={{ fontWeight: 400, fontSize: 12, lineHeight: "18px", letterSpacing: 0 }} className="w-[100px] text-[#4E525D] shrink-0">Object type</span>
                                    <span style={{ fontWeight: 500, fontSize: 14, lineHeight: "20px", letterSpacing: 0 }} className="text-[#1A1A1A]">{category?.objectType || "not specified"}</span>
                                </div>
                                <div className="flex items-start">
                                    <span style={{ fontWeight: 400, fontSize: 12, lineHeight: "18px", letterSpacing: 0 }} className="w-[100px] text-[#4E525D] shrink-0">Name</span>
                                    <span style={{ fontWeight: 500, fontSize: 14, lineHeight: "20px", letterSpacing: 0 }} className="text-[#1A1A1A]">{category?.propertyName || category?.title || "not specified"}</span>
                                </div>
                                <div className="flex items-start">
                                    <span style={{ fontWeight: 400, fontSize: 12, lineHeight: "18px", letterSpacing: 0 }} className="w-[100px] text-[#4E525D] shrink-0">Address</span>
                                    <span style={{ fontWeight: 500, fontSize: 14, lineHeight: "20px", letterSpacing: 0 }} className="text-[#1A1A1A]">{category?.region || "not specified"}</span>
                                </div>
                                <div className="flex items-start">
                                    <span style={{ fontWeight: 400, fontSize: 12, lineHeight: "18px", letterSpacing: 0 }} className="w-[100px] text-[#4E525D] shrink-0">Developer</span>
                                    <span style={{ fontWeight: 500, fontSize: 14, lineHeight: "20px", letterSpacing: 0 }} className="text-[#1A1A1A]">{category?.developerBrand || "not specified"}</span>
                                </div>
                                <div className="flex items-start">
                                    <span style={{ fontWeight: 400, fontSize: 12, lineHeight: "18px", letterSpacing: 0 }} className="w-[100px] text-[#4E525D] shrink-0">Banks</span>
                                    <span style={{ fontWeight: 500, fontSize: 14, lineHeight: "20px", letterSpacing: 0 }} className="text-[#1A1A1A]">{banks || "not specified"}</span>
                                </div>
                            </div>

                            <div className="space-y-3.5">
                                <div className="flex items-start">
                                    <span style={{ fontWeight: 400, fontSize: 12, lineHeight: "18px", letterSpacing: 0 }} className="w-[110px] text-[#4E525D] shrink-0">Currency</span>
                                    <span style={{ fontWeight: 500, fontSize: 14, lineHeight: "20px", letterSpacing: 0 }} className="text-[#1A1A1A]">{category?.currency || "not specified"}</span>
                                </div>
                                <div className="flex items-start">
                                    <span style={{ fontWeight: 400, fontSize: 12, lineHeight: "18px", letterSpacing: 0 }} className="w-[110px] text-[#4E525D] shrink-0">Infrastructure</span>
                                    <span style={{ fontWeight: 500, fontSize: 14, lineHeight: "20px", letterSpacing: 0 }} className="text-[#1A1A1A]">{infrastructure || "not specified"}</span>
                                </div>
                                <div className="flex items-start">
                                    <span style={{ fontWeight: 400, fontSize: 12, lineHeight: "18px", letterSpacing: 0 }} className="w-[110px] text-[#4E525D] shrink-0">Website</span>
                                    <span style={{ fontWeight: 500, fontSize: 14, lineHeight: "20px", letterSpacing: 0 }} className="text-[#1A1A1A]">{category?.website || "not specified"}</span>
                                </div>
                                <div className="flex items-start">
                                    <span style={{ fontWeight: 400, fontSize: 12, lineHeight: "18px", letterSpacing: 0 }} className="w-[110px] text-[#4E525D] shrink-0">Sales department</span>
                                    <span style={{ fontWeight: 500, fontSize: 14, lineHeight: "20px", letterSpacing: 0 }} className="text-[#1A1A1A]">{salesDepartment || "not specified"}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* General Plans Card */}
                <div className="bg-white border border-[#EAECEF] rounded-[16px] p-5 flex flex-col justify-between shadow-xs min-h-[240px]">
                    <div className="flex items-center gap-1.5 pb-4">
                        <h2 style={{ fontWeight: 500, fontSize: 14, lineHeight: "20px", letterSpacing: 0 }} className="text-[#1A1A1A]">
                            General plans
                        </h2>
                        <img src="/images/inv-dashboard/question.svg" alt="" className="w-[14px] h-[14px] cursor-help flex-shrink-0 mt-[3px]" title="Information about master plans" />
                    </div>

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,image/jpeg,image/png,image/webp"
                        multiple
                        className="hidden"
                        onChange={(e) => {
                            const files = e.target.files;
                            if (files && files.length > 0) handleFileUpload(files);
                        }}
                    />

                    {documents.length > 0 ? (
                        <div className="flex-1">
                            <div className="space-y-2 mb-4">
                                {documents.map((doc, idx) => (
                                    <div key={idx} className="flex items-center justify-between rounded-lg border border-[#EAECEF] px-3 py-2.5 group">
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            <div style={{ width: 32, height: 32, background: doc.type === "pdf" ? "#FEE2E2" : "#DBEAFE", borderRadius: 8 }} className="flex items-center justify-center flex-shrink-0">
                                                {doc.type === "pdf" ? (
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                                        <polyline points="14 2 14 8 20 8" />
                                                        <line x1="16" y1="13" x2="8" y2="13" />
                                                        <line x1="16" y1="17" x2="8" y2="17" />
                                                    </svg>
                                                ) : (
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                                        <circle cx="8.5" cy="8.5" r="1.5" />
                                                        <polyline points="21 15 16 10 5 21" />
                                                    </svg>
                                                )}
                                            </div>
                                            <span style={{ fontWeight: 400, fontSize: 13, lineHeight: "18px" }} className="text-[#1A1A1A] truncate">
                                                {doc.url.split("/").pop() || `Plan ${idx + 1}`}
                                            </span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveDoc(idx)}
                                            className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-red-50 cursor-pointer"
                                        >
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C3362B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <line x1="18" y1="6" x2="6" y2="18" />
                                                <line x1="6" y1="6" x2="18" y2="18" />
                                            </svg>
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <FormAddButton
                                icon={<span className="text-sm font-light">+</span>}
                                className="!bg-white !border !border-[#CBD5E1] !text-[#1A1C1E] hover:!bg-gray-50"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploading}
                            >
                                {uploading ? "Uploading..." : "Add master plan"}
                            </FormAddButton>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center pb-4">
                            <div style={{ width: 41.25, height: 41.25, background: "#EBEBEB", borderRadius: "16777200px" }} className="flex items-center justify-center mb-3">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#718096" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                    <circle cx="12" cy="10" r="3"></circle>
                                </svg>
                            </div>

                            <p style={{ fontWeight: 500, fontSize: 13, lineHeight: "20px", letterSpacing: 0 }} className="text-[#718096] mb-4">
                                General plans are not uploaded
                            </p>

                            <FormAddButton
                                icon={<span className="text-sm font-light">+</span>}
                                className="!bg-white !border !border-[#CBD5E1] !text-[#1A1C1E] hover:!bg-gray-50"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploading}
                            >
                                {uploading ? "Uploading..." : "Add master plan"}
                            </FormAddButton>
                        </div>
                    )}
                </div>
            </div>

            <div className="w-full flex items-center justify-between border-t border-[#F1F5F9] pt-6 mb-4">
                <h2 style={{ fontWeight: 500, fontSize: 16, lineHeight: "20px", letterSpacing: 0 }} className="text-[#1A1A1A]">
                    List of houses
                </h2>

                <FormAddButton
                    icon={<span className="text-base font-light mr-0.5">+</span>}
                    onClick={() => navigate(`/dashboard/offplan/objects/${slug}/config/properties/houses/create`)}
                >
                    Add a houses
                </FormAddButton>
            </div>

            <FormTabSwitcher
                tabs={[
                    { id: "Active", label: "Active houses" },
                    { id: "Archive", label: "Archive of houses" },
                ]}
                activeTab={activeHouseTab}
                onChange={(id) => setActiveHouseTab(id as "Active" | "Archive")}
                size="md"
            />

            {/* House Cards */}
            <div className="mt-6">
                {filteredHouses.length === 0 ? (
                    <div className="py-8 text-center text-[#999] text-sm">
                        {activeHouseTab === "Active" ? "No active houses yet" : "No archived houses"}
                    </div>
                ) : (
                    <div className="flex flex-wrap gap-4">
                        {filteredHouses.map((house) => {
                            const imageUrl = house.mainImage?.url || house.gallery?.[0]?.url;
                            return (
                                <div
                                    key={house.id}
                                    className="bg-white border border-[#EBEBEB] rounded-[16px] p-2 flex flex-col gap-2 w-[220px] shrink-0"
                                >
                                    <div className="relative w-full h-[140px] rounded-[12px] overflow-hidden bg-[#F3F4F6]">
                                        {imageUrl ? (
                                            <img
                                                src={imageUrl}
                                                alt={house.title}
                                                className="w-full h-full object-cover"
                                                loading="lazy"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-[#999] text-xs">
                                                No Image
                                            </div>
                                        )}
                                    </div>
                                    <div className="px-1 pb-1">
                                        <p className="text-[14px] font-semibold text-[#1A1A1A] truncate">{house.title}</p>
                                        <p className="text-[12px] text-[#999]">{house.totalArea} m² · {house.roomOption?.value || `${house.number || 0} rooms`}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
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
                {content}
            </main>
        );
    }

    return (
        <main className="flex-1 p-8 overflow-y-auto" style={{ background: "var(--background-primary-50, #FFFFFF80)" }}>
            {content}
        </main>
    );
}
