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

const getObjectLocation = (category: Category) => {
    return [category.city, category.region, category.area]
        .map((item) => item?.trim())
        .filter(Boolean)
        .join(" · ");
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

    const statusMut = useMutation({
        mutationFn: ({ id, status }: { id: string; status: string }) =>
            categoriesApi.update(id, { status }),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["categories", "object"] });
            showSuccess({ title: "Status updated" });
        },
        onError: (error) => {
            showError({
                title: "Failed to update status",
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
            className="flex-1 overflow-y-auto p-8 font-sans antialiased selection:bg-[#4A4E5A]/10"
            style={{ background: "var(--background-primary-50, #FFFFFF80)" }}
        >
            <div className="mb-8 flex w-full items-center justify-between gap-3">
                <div className="flex h-[46px] items-center rounded-full border border-[#E2E8F0] bg-white p-1 shadow-sm">
                    {(["Active", "Archive"] as const).map((tab) => (
                        <button
                            key={tab}
                            type="button"
                            onClick={() => setActiveTab(tab)}
                            className={`flex h-[40px] min-w-[92px] items-center justify-center rounded-[24px] px-4 text-[14px] font-medium leading-[20px] transition-all cursor-pointer ${
                                activeTab === tab
                                    ? "border border-white bg-[#EBEBEB] text-[#4E525D]"
                                    : "border border-transparent bg-transparent text-[#718096] hover:bg-[#F1F5F9]"
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                <button
                    type="button"
                    onClick={() => {
                        localStorage.removeItem("treva-object-create-draft");
                        navigate("/dashboard/offplan/objects/create");
                    }}
                    className="flex h-[44px] w-[124px] items-center justify-center gap-2 rounded-[16px] border border-white bg-[#4E525D] px-3.5 py-2 text-[13px] font-medium leading-[20px] text-white transition-colors hover:bg-[#3D404A] cursor-pointer"
                >
                    <img src="/images/inv-resale/plus.svg" alt="" className="h-4 w-4" />
                    <span>Add Object</span>
                </button>
            </div>

            {isLoading ? (
                <LoadingSpinner label="Loading objects" className="min-h-[320px]" />
            ) : filtered.length === 0 ? (
                <div className="flex h-64 flex-col items-center justify-center text-[#666666]">
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
                    <p className="mb-1 text-[16px] font-medium">No objects found</p>
                    <p className="text-[14px] text-[#999]">
                        {activeTab === "Active"
                            ? "Create your first project object"
                            : "No archived objects"}
                    </p>
                </div>
            ) : (
                <div className="flex w-full flex-wrap gap-5">
                    {filtered.map((cat) => (
                        <div key={cat.id} className="group flex w-[280px] shrink-0 flex-col gap-3 rounded-[28px] border border-[#EBEBEB] bg-white p-2 pb-3 transition-shadow hover:shadow-md">
                            <div className="relative w-full h-[200px] rounded-[32px] overflow-hidden bg-[#F3F4F6] shrink-0">
                                {cat.image ? (
                                    <img
                                        src={cat.image}
                                        alt={cat.title}
                                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                                        loading="lazy"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center text-sm text-[#999]">
                                        No Image
                                    </div>
                                )}

                                {cat.objectType ? (
                                    <div className="absolute left-3 top-3">
                                        <span className="inline-flex items-center rounded-full bg-[#EBEBEB] px-2 py-1 text-[12px] font-medium text-[#666666]">
                                            {cat.objectType}
                                        </span>
                                    </div>
                                ) : null}

                                <div className="absolute right-3 top-3">
                                    <span
                                        className={`inline-flex items-center rounded-full px-2 py-1 text-[12px] font-medium ${
                                            (cat.status || "active") === "active"
                                                ? "bg-[#2D9A5B] text-white"
                                                : "bg-[#F4F5F6] text-[#718096]"
                                        }`}
                                    >
                                        {(cat.status || "active") === "active" ? "Active" : "Archive"}
                                    </span>
                                </div>
                            </div>

                            <div className="flex flex-1 flex-col justify-between px-1.5">
                                <div>
                                    <button
                                        type="button"
                                        onClick={() => navigate(`/dashboard/offplan/objects/${cat.slug}/edit`)}
                                        className="mb-4 line-clamp-1 text-left text-[16px] font-semibold leading-[20px] text-[#1A1A1A] cursor-pointer"
                                    >
                                        {cat.title}
                                    </button>

                                    <div className="mb-3 flex items-center gap-1">
                                        <img src="/images/inv-resale/location.svg" alt="" className="h-[14px] w-[14px]" />
                                        <span className="line-clamp-1 text-[14px] font-medium leading-[20px] text-[#4E525D]">
                                            {getObjectLocation(cat) || cat.locationTitle || "-"}
                                        </span>
                                    </div>

                                    <div className="mb-5 flex flex-wrap items-center gap-y-2 text-[13px] font-medium leading-[20px] text-[#4E525D]">
                                        <span>{cat.developerBrand?.trim() || "Developer -"}</span>
                                        <span className="mx-3 text-[#D1D5DB]">|</span>
                                        <span>{cat.currency || "Currency -"}</span>
                                        <span className="mx-3 text-[#D1D5DB]">|</span>
                                        <span>{formatDate(cat.createdAt)}</span>
                                    </div>

                                    <div className="mb-3 rounded-[20px] bg-[#F4F5F6] px-3 py-2.5">
                                        <div className="grid grid-cols-4 gap-2 text-center">
                                        <div>
                                                <span className="mb-1 block text-[11px] font-medium leading-[16px] text-[#808191]">Unit Layouts</span>
                                            <span className="block text-[14px] font-semibold leading-[20px] text-[#1A1A1A]">
                                                {(cat.metrics?.houses ?? 0).toLocaleString()}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="mb-1 block text-[11px] font-medium leading-[16px] text-[#808191]">Properties</span>
                                            <span className="block text-[14px] font-semibold leading-[20px] text-[#00C274]">
                                                {(cat.metrics?.properties ?? 0).toLocaleString()}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="mb-1 block text-[11px] font-medium leading-[16px] text-[#808191]">Reserved</span>
                                            <span className="block text-[14px] font-semibold leading-[20px] text-[#C98A00]">
                                                {(cat.metrics?.reserved ?? 0).toLocaleString()}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="mb-1 block text-[11px] font-medium leading-[16px] text-[#808191]">Sold</span>
                                            <span className="block text-[14px] font-semibold leading-[20px] text-[#C3362B]">
                                                {(cat.metrics?.sold ?? 0).toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                </div>

                                <div className="mt-auto flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => deleteMut.mutate(cat.id)}
                                        aria-label="Delete"
                                        title="Delete"
                                        className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[14px] bg-[#FDECEC] text-[#C3362B] transition-colors hover:bg-[#F8DDD9] cursor-pointer"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14zM10 11v6M14 11v6" />
                                        </svg>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => copyMut.mutate(cat)}
                                        disabled={copyMut.isPending}
                                        aria-label="Copy"
                                        title="Copy"
                                        className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[14px] bg-[#EBEBEB] text-[#4E525D] transition-colors hover:bg-[#E0E0E0] cursor-pointer disabled:opacity-50"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
                                            <rect x="9" y="9" width="10" height="10" rx="2" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 9V7a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
                                        </svg>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => statusMut.mutate({ id: cat.id, status: (cat.status || "active") === "active" ? "archive" : "active" })}
                                        disabled={statusMut.isPending}
                                        aria-label={(cat.status || "active") === "active" ? "Archive" : "Restore"}
                                        title={(cat.status || "active") === "active" ? "Move to Archive" : "Restore"}
                                        className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[14px] bg-[#EBEBEB] text-[#4E525D] transition-colors hover:bg-[#E0E0E0] cursor-pointer disabled:opacity-50"
                                    >
                                        {(cat.status || "active") === "active" ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                                            </svg>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                                            </svg>
                                        )}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => navigate(`/dashboard/offplan/objects/${cat.slug}/edit`)}
                                        className="flex h-10 flex-1 items-center justify-center rounded-[14px] bg-[#4E525D] px-4 text-[14px] font-medium leading-[20px] text-white transition-colors hover:bg-[#3A3D46] cursor-pointer"
                                    >
                                        Edit Object
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
