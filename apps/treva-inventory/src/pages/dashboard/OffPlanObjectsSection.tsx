import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { categoriesApi, type Category } from "../../api/categories";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { FormAddButton } from "@repo/ui";
import { useMessageCenter } from "../../components/MessageCenter";
import { getApiErrorMessage } from "../../utils/apiError";
import { FormTabSwitcher } from "@repo/ui";

const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}.${d.getFullYear()}`;
};

export function OffPlanObjectsSection() {
    const navigate = useNavigate();
    const qc = useQueryClient();
    const { showError, showSuccess } = useMessageCenter();
    const [activeTab, setActiveTab] = useState<"Active" | "Archive">("Active");

    const { data: response, isLoading } = useQuery({
        queryKey: ["categories", "object"],
        queryFn: () => categoriesApi.getAll("object"),
    });

    const deleteMut = useMutation({
        mutationFn: (id: string) => categoriesApi.delete(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["categories", "object"] });
            showSuccess({ title: "Object deleted" });
        },
        onError: (error) => {
            showError({
                title: "Object could not be deleted",
                description: getApiErrorMessage(error, "Please try again."),
            });
        },
    });

    const copyMut = useMutation({
        mutationFn: (cat: Category) => {
            return categoriesApi.create({
                title: `${cat.title} (Copy)`,
                name: `${cat.name}-copy`,
                slug: `${cat.slug}-copy-${Date.now()}`,
                type: "object",
                objectType: cat.objectType,
                propertyName: cat.propertyName,
                currency: cat.currency,
                region: cat.region,
                area: cat.area,
                city: cat.city,
                developerBrand: cat.developerBrand,
                website: cat.website,
                fedLaw214: cat.fedLaw214,
                image: cat.image,
                banks: cat.banks,
                infrastructure: cat.infrastructure,
                salesDepartment: cat.salesDepartment,
            });
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["categories", "object"] });
            showSuccess({ title: "Object copied" });
        },
        onError: (error) => {
            showError({
                title: "Object could not be copied",
                description: getApiErrorMessage(error, "Please try again."),
            });
        },
    });

    const categories: Category[] = Array.isArray(response?.data)
        ? response.data
        : [];

    const filtered = categories.filter(
        (c) => (c.status || "active") === activeTab.toLowerCase()
    );

    return (
        <main
            className="flex-1 p-8 overflow-y-auto font-sans antialiased"
            style={{ background: "var(--background-primary-50, #FFFFFF80)" }}
        >
            {/* Action Bar */}
            <div className="w-full flex items-center justify-between mb-6">
                {/* Toggle Segment Control */}
                <FormTabSwitcher
                    tabs={[
                        { id: "Active", label: "Active" },
                        { id: "Archive", label: "Archive" },
                    ]}
                    activeTab={activeTab}
                    onChange={(id) => setActiveTab(id as "Active" | "Archive")}
                    size="sm"
                />

                {/* Add Object Button */}
                <FormAddButton
                    onClick={() => navigate("/dashboard/offplan/objects/create")}
                    icon={<img src="/images/inv-resale/plus.svg" alt="" className="w-4 h-4" />}
                    className="w-[124px]"
                >
                    Add Object
                </FormAddButton>
            </div>

            {/* Card Grid */}
            {isLoading ? (
                <LoadingSpinner label="Loading objects" className="min-h-[320px]" />
            ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-[#666666]">
                    <svg
                        width="48"
                        height="48"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="mb-4 text-[#999]"
                    >
                        <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                        <circle cx="9" cy="9" r="2" />
                        <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                    </svg>
                    <p className="text-[16px] font-medium mb-1">
                        No objects found
                    </p>
                    <p className="text-[14px] text-[#999]">
                        {activeTab === "Active"
                            ? "Create your first project object"
                            : "No archived objects"}
                    </p>
                </div>
            ) : (
                <div className="flex flex-wrap gap-5 w-full">
                    {filtered.map((cat) => (
                        <div
                            key={cat.id}
                            className="bg-[#FFFFFF] border border-[#EBEBEB] rounded-[32px] pt-[8px] pr-[8px] pb-[12px] pl-[8px] flex flex-col gap-[12px] w-[265px] h-[398px] shrink-0"
                        >
                            {/* Image Container */}
                            <div className="relative w-full h-[200px] rounded-[32px] overflow-hidden bg-[#F3F4F6] shrink-0">
                                {cat.image ? (
                                    <img
                                        src={cat.image}
                                        alt={cat.title}
                                        className="w-full h-full object-cover"
                                        loading="lazy"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-[#999] text-sm">
                                        No Image
                                    </div>
                                )}

                                {/* Status Badge */}
                                <div className="absolute top-2.5 right-2.5">
                                    <span
                                        className={`inline-flex items-center justify-center w-[51px] h-[26px] rounded-full gap-[4px] py-[18px] px-[31px] text-[14px] font-medium leading-[18px] tracking-[0px] ${
                                            (cat.status || "active") === "active"
                                                ? "bg-[#D7F3E3] text-[#2D9A5B]"
                                                : "bg-[#F3F4F6] text-[#999]"
                                        }`}
                                    >
                                        {(cat.status || "active") === "active" ? "Active" : "Archive"}
                                    </span>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 flex flex-col justify-between">
                                <div className="px-0.5">
                                    {/* Title */}
                                    <h3 className="text-[16px] font-semibold text-[#1A1A1A] leading-[20px] tracking-[0px] mb-1 line-clamp-1">
                                        {cat.title}
                                    </h3>

                                    {/* Date & Edit Icon */}
                                    <div className="flex items-center gap-2 pb-4 mb-4 border-b border-[#EBEBEB]">
                                        <span className="text-[14px] font-medium text-[#4E525D] leading-[20px] tracking-[0px]">
                                            {formatDate(cat.createdAt)}
                                        </span>
                                        <button
                                            onClick={() => navigate(`/dashboard/offplan/objects/${cat.slug}/edit`)}
                                            className="transition-colors cursor-pointer flex items-center justify-center"
                                            aria-label="Edit Date"
                                        >
                                            <img src="/images/inv-dashboard/inv-offplan/edit.svg" alt="edit" className="w-4 h-4" />
                                        </button>
                                    </div>

                                    {/* Metrics Grid */}
                                    <div className="grid grid-cols-4 gap-0 text-center mb-4">
                                        <div>
                                            <span className="block text-[12px] font-normal text-[#4E525D] leading-[18px] tracking-[0px] mb-1">Houses</span>
                                            <span className="block text-[14px] font-semibold text-[#1A1A1A] leading-[20px] tracking-[0px]">
                                                {(cat.metrics?.houses ?? 0).toLocaleString()}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="block text-[12px] font-normal text-[#4E525D] leading-[18px] tracking-[0px] mb-1">Properties</span>
                                            <span className="block text-[14px] font-semibold text-[#00C274] leading-[20px] tracking-[0px]">
                                                {(cat.metrics?.properties ?? 0).toLocaleString()}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="block text-[12px] font-normal text-[#4E525D] leading-[18px] tracking-[0px] mb-1">Reserved</span>
                                            <span className="block text-[14px] font-semibold text-[#FFBB00] leading-[20px] tracking-[0px]">
                                                {(cat.metrics?.reserved ?? 0).toLocaleString()}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="block text-[12px] font-normal text-[#4E525D] leading-[18px] tracking-[0px] mb-1">Sold</span>
                                            <span className="block text-[14px] font-semibold text-[#4E525D] leading-[20px] tracking-[0px]">
                                                {(cat.metrics?.sold ?? 0).toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-center justify-between gap-2">
                                    {/* Delete Button */}
                                    <button
                                        onClick={() => deleteMut.mutate(cat.id)}
                                        aria-label="Delete"
                                        title="Delete"
                                        className="inline-flex h-[32px] w-[32px] items-center justify-center rounded-full bg-[#EBEBEB] text-[#C3362B] transition-colors hover:bg-[#FCEDEA] cursor-pointer"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14zM10 11v6M14 11v6" />
                                        </svg>
                                    </button>

                                    {/* Copy Button */}
                                    <button
                                        onClick={() => copyMut.mutate(cat)}
                                        disabled={copyMut.isPending}
                                        aria-label="Copy"
                                        title="Copy"
                                        className="inline-flex h-[32px] w-[32px] items-center justify-center rounded-full bg-[#EBEBEB] text-[#4E525D] transition-colors hover:bg-[#E0E0E0] cursor-pointer disabled:opacity-50"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
                                            <rect x="9" y="9" width="10" height="10" rx="2" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 9V7a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
                                        </svg>
                                    </button>

                                    {/* Edit Button */}
                                    <button
                                        onClick={() => navigate(`/dashboard/offplan/objects/${cat.slug}/edit`)}
                                        className="flex-1 h-[32px] bg-[#EBEBEB] rounded-[24px] flex items-center justify-center text-[14px] font-medium leading-[20px] text-[#4E525D] hover:bg-[#E0E0E0] transition-colors cursor-pointer"
                                    >
                                        Edit
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </main>
    );
}
