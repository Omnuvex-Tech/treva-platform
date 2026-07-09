import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { categoriesApi } from "../../api/categories";
import { FormTabSwitcher, FormAddButton } from "@repo/ui";

export function PropertyConfigPage({ embedded = false }: { embedded?: boolean } = {}) {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const [activeHouseTab, setActiveHouseTab] = useState<"Active" | "Archive">("Active");

    const { data: response, isLoading } = useQuery({
        queryKey: ["category", slug],
        queryFn: () => categoriesApi.getBySlug(slug!),
        enabled: !!slug,
    });

    const category = response?.data;

    const handleBack = () => {
        navigate(`/dashboard/offplan/objects/${slug}/config`);
    };

    const content = (
        <div className="min-h-full w-full bg-[#ffffff] p-8 font-sans antialiased text-[#1A1A1A]">
            {/* Main Page Header Title */}
            <h1 style={{ fontWeight: 500, fontSize: 16, lineHeight: "20px", letterSpacing: 0 }} className="mb-6">
                Properties
            </h1>

            {/* Top Split Management Section Panel Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10 items-stretch">

                {/* Left Side: Property Information Metadata Card */}
                <div className="bg-white border border-[#EAECEF] rounded-[16px] p-5 flex flex-col justify-between shadow-xs">
                    <div>
                        {/* Inner Header with Options Dropdown Trigger Button */}
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

                        {/* Split Key-Value Presentation Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3.5 pt-1">

                            {/* Left Configuration Column Block */}
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
                                    <span style={{ fontWeight: 500, fontSize: 14, lineHeight: "20px", letterSpacing: 0 }} className="text-[#1A1A1A]">{category?.banks || "not specified"}</span>
                                </div>
                            </div>

                            {/* Right Configuration Column Block */}
                            <div className="space-y-3.5">
                                <div className="flex items-start">
                                    <span style={{ fontWeight: 400, fontSize: 12, lineHeight: "18px", letterSpacing: 0 }} className="w-[110px] text-[#4E525D] shrink-0">Currency</span>
                                    <span style={{ fontWeight: 500, fontSize: 14, lineHeight: "20px", letterSpacing: 0 }} className="text-[#1A1A1A]">{category?.currency || "not specified"}</span>
                                </div>
                                <div className="flex items-start">
                                    <span style={{ fontWeight: 400, fontSize: 12, lineHeight: "18px", letterSpacing: 0 }} className="w-[110px] text-[#4E525D] shrink-0">Infrastructure</span>
                                    <span style={{ fontWeight: 500, fontSize: 14, lineHeight: "20px", letterSpacing: 0 }} className="text-[#1A1A1A]">{category?.infrastructure || "not specified"}</span>
                                </div>
                                <div className="flex items-start">
                                    <span style={{ fontWeight: 400, fontSize: 12, lineHeight: "18px", letterSpacing: 0 }} className="w-[110px] text-[#4E525D] shrink-0">Website</span>
                                    <span style={{ fontWeight: 500, fontSize: 14, lineHeight: "20px", letterSpacing: 0 }} className="text-[#1A1A1A]">{category?.website || "not specified"}</span>
                                </div>
                                <div className="flex items-start">
                                    <span style={{ fontWeight: 400, fontSize: 12, lineHeight: "18px", letterSpacing: 0 }} className="w-[110px] text-[#4E525D] shrink-0">Sales department</span>
                                    <span style={{ fontWeight: 500, fontSize: 14, lineHeight: "20px", letterSpacing: 0 }} className="text-[#1A1A1A]">{category?.salesDepartment || "not specified"}</span>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>

                {/* Right Side: General Plans Empty Operational State State Card */}
                <div className="bg-white border border-[#EAECEF] rounded-[16px] p-5 flex flex-col justify-between shadow-xs min-h-[240px]">
                    {/* Card Header with Feature Tooltip Marker */}
                    <div className="flex items-center gap-1.5 pb-4">
                        <h2 style={{ fontWeight: 500, fontSize: 14, lineHeight: "20px", letterSpacing: 0 }} className="text-[#1A1A1A]">
                            General plans
                        </h2>
                        <img src="/images/inv-dashboard/question.svg" alt="" className="w-[14px] h-[14px] cursor-help flex-shrink-0 mt-[3px]" title="Information about master plans" />
                    </div>

                    {/* Center Blueprint Placement Canvas Flow Block */}
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

                        {/* Document Inline Custom Creation Button */}
                        <FormAddButton
                            icon={<span className="text-sm font-light">+</span>}
                            className="!bg-white !border !border-[#CBD5E1] !text-[#1A1C1E] hover:!bg-gray-50"
                        >
                            Add master plan
                        </FormAddButton>
                    </div>
                </div>

            </div>

            {/* Section Subheader: Primary Entity Management Strip Row */}
            <div className="w-full flex items-center justify-between border-t border-[#F1F5F9] pt-6 mb-4">
                <h2 style={{ fontWeight: 500, fontSize: 16, lineHeight: "20px", letterSpacing: 0 }} className="text-[#1A1A1A]">
                    List of houses
                </h2>

                {/* Dynamic Global Action Matrix Button */}
                <FormAddButton
                    icon={<span className="text-base font-light mr-0.5">+</span>}
                >
                    Add a houses
                </FormAddButton>
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
