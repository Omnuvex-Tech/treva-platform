import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { categoriesApi, type Category } from "../../api/categories";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { useMessageCenter } from "../../components/MessageCenter";
import { getApiErrorMessage } from "../../utils/apiError";

const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}.${d.getFullYear()}`;
};

export function OffPlanObjectsSection() {
    const navigate = useNavigate();
    const qc = useQueryClient();
    const { showError, showSuccess } = useMessageCenter();
    const [activeTab, setActiveTab] = useState<"active" | "archive">("active");

    const { data: response, isLoading } = useQuery({
        queryKey: ["categories"],
        queryFn: () => categoriesApi.getAll(),
    });

    const deleteMut = useMutation({
        mutationFn: (id: string) => categoriesApi.delete(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["categories"] });
            showSuccess({ title: "Object deleted" });
        },
        onError: (error) => {
            showError({
                title: "Object could not be deleted",
                description: getApiErrorMessage(error, "Please try again."),
            });
        },
    });

    const categories: Category[] = Array.isArray(response?.data)
        ? response.data
        : [];

    const filtered = categories.filter(
        (c) => (c.status || "active") === activeTab
    );

    return (
        <main
            className="flex-1 p-8 overflow-y-auto font-sans antialiased"
            style={{ background: "var(--background-primary-50, #FFFFFF80)" }}
        >
            {/* Action Bar */}
            <div className="w-full flex items-center justify-between mb-8">
                {/* Active / Archive Toggle */}
                <div className="flex bg-[#EBEBEB] p-1 rounded-xl">
                    <button
                        onClick={() => setActiveTab("active")}
                        className={`px-5 h-[38px] text-[14px] font-medium rounded-lg transition-all cursor-pointer ${
                            activeTab === "active"
                                ? "bg-white text-[#1A1A1A] shadow-sm"
                                : "text-[#666666] hover:text-[#1A1A1A]"
                        }`}
                    >
                        Active
                    </button>
                    <button
                        onClick={() => setActiveTab("archive")}
                        className={`px-5 h-[38px] text-[14px] font-medium rounded-lg transition-all cursor-pointer ${
                            activeTab === "archive"
                                ? "bg-white text-[#1A1A1A] shadow-sm"
                                : "text-[#666666] hover:text-[#1A1A1A]"
                        }`}
                    >
                        Archive
                    </button>
                </div>

                {/* Add Object Button */}
                <button
                    onClick={() => navigate("/dashboard/offplan/categories")}
                    className="flex items-center gap-1.5 px-4 h-[40px] bg-[#4E525D] hover:bg-[#3D404A] text-white rounded-xl text-[13px] font-medium transition-colors cursor-pointer"
                >
                    <span className="text-sm font-light">+</span>
                    <span>Add Object</span>
                </button>
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
                        {activeTab === "active"
                            ? "Create your first project object"
                            : "No archived objects"}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6 w-full">
                    {filtered.map((cat) => (
                        <div
                            key={cat.id}
                            className="bg-white rounded-[28px] p-4 flex flex-col justify-between shadow-md group"
                        >
                            {/* Image */}
                            <div className="relative w-full h-[200px] rounded-[24px] overflow-hidden mb-4 bg-[#F3F4F6]">
                                {cat.image ? (
                                    <img
                                        src={cat.image}
                                        alt={cat.title}
                                        className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                                        loading="lazy"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-[#999] text-sm">
                                        No Image
                                    </div>
                                )}

                                {/* Status Badge */}
                                <div className="absolute top-3 right-3">
                                    <span
                                        className={`text-[11px] font-bold px-3 py-1 rounded-full shadow-xs tracking-wide ${
                                            activeTab === "active"
                                                ? "bg-[#E6F7ED] text-[#27AE60]"
                                                : "bg-[#F3F4F6] text-[#999]"
                                        }`}
                                    >
                                        {activeTab === "active" ? "Active" : "Archive"}
                                    </span>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 flex flex-col justify-between">
                                <div className="px-1">
                                    {/* Title */}
                                    <h3 className="text-[16px] font-bold text-[#1A1C1E] tracking-tight leading-snug line-clamp-1 mb-1">
                                        {cat.title}
                                    </h3>

                                    {/* Date */}
                                    <div className="flex items-center gap-1.5 text-[#718096] mb-5">
                                        <span className="text-xs font-medium tracking-wide">
                                            {formatDate(cat.createdAt)}
                                        </span>
                                        <button
                                            onClick={() => navigate("/dashboard/offplan/categories")}
                                            className="text-[#A0AEC0] hover:text-[#4A4E5A] transition-colors cursor-pointer"
                                            aria-label="Edit Date"
                                        >
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                                <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4Z" />
                                            </svg>
                                        </button>
                                    </div>

                                    {/* Metrics */}
                                    <div className="grid grid-cols-4 gap-1 text-center mb-5 bg-[#F8F9FA] py-2.5 px-1 rounded-xl">
                                        <div>
                                            <span className="block text-[11px] font-medium text-[#A0AEC0] mb-1">Houses</span>
                                            <span className="text-xs font-bold text-[#2D3748]">
                                                {cat.metrics?.houses ?? 0}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="block text-[11px] font-medium text-[#A0AEC0] mb-1">Properties</span>
                                            <span className="text-xs font-bold text-[#27AE60]">
                                                {cat.metrics?.properties ?? 0}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="block text-[11px] font-medium text-[#A0AEC0] mb-1">Reserved</span>
                                            <span className={`text-xs font-bold ${(cat.metrics?.reserved ?? 0) > 0 ? "text-[#F1C40F]" : "text-[#A0AEC0]"}`}>
                                                {cat.metrics?.reserved ?? 0}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="block text-[11px] font-medium text-[#A0AEC0] mb-1">Sold</span>
                                            <span className={`text-xs font-bold ${(cat.metrics?.sold ?? 0) > 0 ? "text-[#2D3748]" : "text-[#A0AEC0]"}`}>
                                                {cat.metrics?.sold ?? 0}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Edit Button */}
                                <button
                                    onClick={() => navigate("/dashboard/offplan/categories")}
                                    className="w-full bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#4A5568] text-xs font-bold py-2.5 rounded-xl transition-colors tracking-wide cursor-pointer"
                                >
                                    Edit
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </main>
    );
}
