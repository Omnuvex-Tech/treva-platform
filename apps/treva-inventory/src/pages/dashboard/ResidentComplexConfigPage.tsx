import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { categoriesApi } from "../../api/categories";
import { FormTabSwitcher } from "@repo/ui";

interface ManagementCategory {
    id: string;
    label: string;
    iconType: "properties" | "payments" | "options" | "stock";
    iconSrc: string;
}

export function ResidentComplexConfigPage({ embedded = false }: { embedded?: boolean } = {}) {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<"Sales" | "Legal">("Sales");

    const { data: response, isLoading } = useQuery({
        queryKey: ["category", id],
        queryFn: () => categoriesApi.getById(id!),
        enabled: !!id,
    });

    const category = response?.data;
    const title = category?.propertyName || category?.title || "Object";

    const categories: ManagementCategory[] = [
        { id: "properties", label: "Properties", iconType: "properties", iconSrc: "/images/inv-dashboard/inv-offplan/properties.svg" },
        { id: "payments", label: "Payment methods", iconType: "payments", iconSrc: "/images/inv-dashboard/inv-offplan/payment.svg" },
        { id: "options", label: "Options", iconType: "options", iconSrc: "/images/inv-dashboard/inv-offplan/options.svg" },
        { id: "stock", label: "Stock", iconType: "stock", iconSrc: "/images/inv-dashboard/inv-offplan/stock.svg" },
    ];

    const handleBack = () => {
        navigate("/dashboard/offplan/objects");
    };

    const content = (
        <div className="min-h-full w-full bg-[#ffffff] p-8 font-sans antialiased">
            {/* Tabs */}
            <div className="mb-8 pl-1">
                <FormTabSwitcher
                    tabs={[
                        { id: "Sales", label: "Sales" },
                        { id: "Legal", label: "Legal information" },
                    ]}
                    activeTab={activeTab}
                    onChange={(id) => setActiveTab(id as "Sales" | "Legal")}
                    size="sm"
                />
            </div>

            {/* Categories Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-[1200px]">
                {categories.map((cat) => (
                    <div
                        key={cat.id}
                        onClick={() => {
                            if (cat.id === "properties") {
                                navigate(`/dashboard/offplan/objects/${id}/config/properties`);
                            }
                        }}
                        className="bg-white border border-[#E5E7EB] rounded-[18px] aspect-[4/3] p-6 flex flex-col items-center justify-center gap-5 hover:border-[#D1D5DB] hover:shadow-xs transition-all cursor-pointer group"
                    >
                        {/* Icon */}
                        <div className="w-20 h-20 flex items-center justify-center group-hover:scale-[1.03] transition-transform duration-300">
                            <img src={cat.iconSrc} alt={cat.label} className="w-16 h-16" />
                        </div>

                        {/* Label */}
                        <span className="text-[15px] font-semibold text-[#374151] tracking-tight group-hover:text-[#111827] transition-colors">
                            {cat.label}
                        </span>
                    </div>
                ))}
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
