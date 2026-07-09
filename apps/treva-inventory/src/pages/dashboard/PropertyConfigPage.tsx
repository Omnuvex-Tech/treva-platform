import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { categoriesApi } from "../../api/categories";
import { FormTabSwitcher } from "@repo/ui";

export function PropertyConfigPage({ embedded = false }: { embedded?: boolean } = {}) {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [activeHouseTab, setActiveHouseTab] = useState<"Active" | "Archive">("Active");

    const { data: response, isLoading } = useQuery({
        queryKey: ["category", id],
        queryFn: () => categoriesApi.getById(id!),
        enabled: !!id,
    });

    const category = response?.data;
    const title = category?.propertyName || category?.title || "Object";

    const handleBack = () => {
        navigate(`/dashboard/offplan/objects/${id}/config`);
    };

    const content = (
        <div className="min-h-full w-full bg-[#ffffff] p-8 font-sans antialiased text-[#1A1C1E]">
            {/* Back Button */}
            <div className="mb-6">
                <button
                    type="button"
                    onClick={handleBack}
                    className="flex items-center gap-2 text-[14px] text-[#666666] hover:text-[#333333] transition-colors cursor-pointer"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="15 18 9 12 15 6"></polyline>
                    </svg>
                    Back to config
                </button>
            </div>

            {/* Main Page Header Title */}
            <h1 className="text-[24px] font-bold tracking-tight mb-6">
                {title}
            </h1>

            {/* Top Split Management Section Panel Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10 items-stretch">

                {/* Left Side: Property Information Metadata Card */}
                <div className="bg-white border border-[#EAECEF] rounded-[16px] p-5 flex flex-col justify-between shadow-xs">
                    <div>
                        {/* Inner Header with Options Dropdown Trigger Button */}
                        <div className="flex items-center justify-between border-b border-[#F4F5F7] pb-4 mb-4">
                            <h2 className="text-[15px] font-bold text-[#1A1C1E]">
                                Property information
                            </h2>
                            <button
                                type="button"
                                className="w-7 h-7 bg-[#EAECEF]/60 hover:bg-[#EAECEF] text-[#718096] rounded-full flex items-center justify-center transition-colors text-xs font-bold pb-2 tracking-tighter"
                                aria-label="More options"
                            >
                                ...
                            </button>
                        </div>

                        {/* Split Key-Value Presentation Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3.5 text-[13px] pt-1">

                            {/* Left Configuration Column Block */}
                            <div className="space-y-3.5">
                                <div className="flex items-start">
                                    <span className="w-[100px] text-[#8A94A6] shrink-0 font-medium">Object type</span>
                                    <span className="font-semibold text-[#1A1C1E]">{category?.objectType || "not specified"}</span>
                                </div>
                                <div className="flex items-start">
                                    <span className="w-[100px] text-[#8A94A6] shrink-0 font-medium">Name</span>
                                    <span className="font-semibold text-[#1A1C1E]">{title}</span>
                                </div>
                                <div className="flex items-start">
                                    <span className="w-[100px] text-[#8A94A6] shrink-0 font-medium">Address</span>
                                    <span className="font-semibold text-[#1A1C1E]">{category?.region || "not specified"}</span>
                                </div>
                                <div className="flex items-start">
                                    <span className="w-[100px] text-[#8A94A6] shrink-0 font-medium">Developer</span>
                                    <span className="font-semibold text-[#1A1C1E]">{category?.developerBrand || "not specified"}</span>
                                </div>
                                <div className="flex items-start">
                                    <span className="w-[100px] text-[#8A94A6] shrink-0 font-medium">Banks</span>
                                    <span className="font-semibold text-[#1A1C1E]">not specified</span>
                                </div>
                            </div>

                            {/* Right Configuration Column Block */}
                            <div className="space-y-3.5">
                                <div className="flex items-start">
                                    <span className="w-[110px] text-[#8A94A6] shrink-0 font-medium">Currency</span>
                                    <span className="font-semibold text-[#1A1C1E]">{category?.currency || "not specified"}</span>
                                </div>
                                <div className="flex items-start">
                                    <span className="w-[110px] text-[#8A94A6] shrink-0 font-medium">Infrastructure</span>
                                    <span className="font-semibold text-[#1A1C1E]">not specified</span>
                                </div>
                                <div className="flex items-start">
                                    <span className="w-[110px] text-[#8A94A6] shrink-0 font-medium">Website</span>
                                    <span className="font-semibold text-[#1A1C1E]">{category?.website || "not specified"}</span>
                                </div>
                                <div className="flex items-start">
                                    <span className="w-[110px] text-[#8A94A6] shrink-0 font-medium">Sales department</span>
                                    <span className="font-semibold text-[#1A1C1E]">not specified</span>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>

                {/* Right Side: General Plans Empty Operational State State Card */}
                <div className="bg-white border border-[#EAECEF] rounded-[16px] p-5 flex flex-col justify-between shadow-xs min-h-[240px]">
                    {/* Card Header with Feature Tooltip Marker */}
                    <div className="flex items-center gap-1.5 pb-4">
                        <h2 className="text-[15px] font-bold text-[#1A1C1E]">
                            General plans
                        </h2>
                        <div className="text-[#A0AEC0] hover:text-[#718096] cursor-help transition-colors mt-0.5" title="Information about master plans">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="12" y1="16" x2="12" y2="12"></line>
                                <line x1="12" y1="8" x2="12.01" y2="8"></line>
                            </svg>
                        </div>
                    </div>

                    {/* Center Blueprint Placement Canvas Flow Block */}
                    <div className="flex-1 flex flex-col items-center justify-center text-center pb-4">
                        <div className="w-10 h-10 bg-[#EAECEF]/70 rounded-full flex items-center justify-center text-[#718096] mb-3">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                <circle cx="12" cy="10" r="3"></circle>
                            </svg>
                        </div>

                        <p className="text-[13px] font-medium text-[#718096] mb-4 tracking-normal">
                            General plans are not uploaded
                        </p>

                        {/* Document Inline Custom Creation Button */}
                        <button className="flex items-center gap-1.5 px-[18px] h-[38px] bg-white border border-[#CBD5E1] hover:border-[#4A4E5A] text-[#1A1C1E] rounded-full text-xs font-semibold transition-colors shadow-xs cursor-pointer">
                            <span className="text-sm font-light text-[#718096]">+</span>
                            <span>Add master plan</span>
                        </button>
                    </div>
                </div>

            </div>

            {/* Section Subheader: Primary Entity Management Strip Row */}
            <div className="w-full flex items-center justify-between border-t border-[#F1F5F9] pt-6 mb-4">
                <h2 className="text-[18px] font-bold text-[#1A1C1E] tracking-tight">
                    List of houses
                </h2>

                {/* Dynamic Global Action Matrix Button */}
                <button className="flex items-center gap-1.5 px-4 h-[38px] bg-[#4E525F] hover:bg-[#3B3E49] text-white rounded-xl text-xs font-semibold transition-colors shadow-xs cursor-pointer">
                    <span className="text-base font-light mr-0.5">+</span>
                    <span>Add a houses</span>
                </button>
            </div>

            {/* Nested Segment Categorization Pill Navigation Switcher */}
            <FormTabSwitcher
                tabs={[
                    { id: "Active", label: "Active houses" },
                    { id: "Archive", label: "Archive of houses" },
                ]}
                activeTab={activeHouseTab}
                onChange={(id) => setActiveHouseTab(id as "Active" | "Archive")}
                size="md"
            />
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
