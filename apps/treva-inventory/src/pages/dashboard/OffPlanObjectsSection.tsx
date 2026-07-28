import { useEffect, useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { categoriesApi, type Category } from "../../api/categories";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { useMessageCenter } from "../../components/MessageCenter";
import { getApiErrorMessage } from "../../utils/apiError";
import { IoClose } from "react-icons/io5";

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

function FilterSelect({
    label,
    value,
    options,
    placeholder,
    onChange,
    disabled = false,
}: {
    label: string;
    value: string;
    options: string[];
    placeholder: string;
    onChange: (value: string) => void;
    disabled?: boolean;
}) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    return (
        <div ref={ref} className="relative">
            <label className="mb-1.5 block text-xs font-medium text-[#4E525D]">{label}</label>
            <button
                type="button"
                onClick={() => {
                    if (!disabled) setOpen((prev) => !prev);
                }}
                disabled={disabled}
                className={`flex h-11 w-full items-center justify-between rounded-2xl border border-[#E7E9EE] bg-[#F8F9FB] px-4 text-sm outline-none transition-colors ${
                    disabled
                        ? "cursor-not-allowed text-[#999]"
                        : "text-[#1A1A1A] focus:border-[#C8CDD8]"
                }`}
            >
                <span className={`truncate text-left ${value ? "text-[#1A1A1A]" : "text-[#999]"}`}>{value || placeholder}</span>
                <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    className={open ? "rotate-180 transition-transform" : "transition-transform"}
                >
                    <path d="M6 9l6 6 6-6" />
                </svg>
            </button>

            {open ? (
                <div className="absolute left-0 top-full z-50 mt-2 w-full overflow-hidden rounded-2xl border border-[#E7E9EE] bg-white shadow-lg">
                    <button
                        type="button"
                        className="w-full px-4 py-2.5 text-left text-sm text-[#666666] transition-colors hover:bg-gray-50 hover:text-[#1A1A1A]"
                        onClick={() => {
                            onChange("");
                            setOpen(false);
                        }}
                    >
                        -- None
                    </button>
                    {options.map((option) => {
                        const isSelected = value === option;
                        return (
                            <button
                                key={option}
                                type="button"
                                className={`flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-sm transition-colors ${
                                    isSelected
                                        ? "bg-[#4E525D]/10 font-medium text-[#1A1A1A]"
                                        : "text-[#666666] hover:bg-gray-50 hover:text-[#1A1A1A]"
                                }`}
                                onClick={() => {
                                    onChange(option);
                                    setOpen(false);
                                }}
                            >
                                <span>{option}</span>
                                {isSelected ? (
                                    <span className="text-xs font-semibold text-[#4E525D]">Selected</span>
                                ) : null}
                            </button>
                        );
                    })}
                    {options.length === 0 ? (
                        <div className="px-4 py-2.5 text-sm text-[#999]">No options yet</div>
                    ) : null}
                </div>
            ) : null}
        </div>
    );
}

export function OffPlanObjectsSection() {
    const navigate = useNavigate();
    const qc = useQueryClient();
    const { showError, showSuccess } = useMessageCenter();
    const [activeTab, setActiveTab] = useState<"Active" | "Archive">("Active");
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [filterOpen, setFilterOpen] = useState(false);
    const filterPanelRef = useRef<HTMLDivElement>(null);
    const [filters, setFilters] = useState({
        city: "",
        region: "",
    });
    const [draftFilters, setDraftFilters] = useState({
        city: "",
        region: "",
    });

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

    const filtered = categories.filter((c) => {
        if ((c.status || "active") !== activeTab.toLowerCase()) return false;
        if (filters.city && !c.city?.toLowerCase().includes(filters.city.toLowerCase())) return false;
        if (filters.region && !c.region?.toLowerCase().includes(filters.region.toLowerCase())) return false;
        return true;
    });
    const activeFilterCount = Object.values(filters).filter((value) => value.trim() !== "").length;
    const cityOptions = [...new Set(categories.map((category) => category.city?.trim()).filter(Boolean) as string[])].sort((a, b) => a.localeCompare(b));
    const regionOptions = [...new Set(categories
        .filter((category) => !draftFilters.city || category.city?.trim() === draftFilters.city)
        .map((category) => category.region?.trim())
        .filter(Boolean) as string[])].sort((a, b) => a.localeCompare(b));

    useEffect(() => {
        if (!filterOpen) return;

        const handleOutsideClick = (event: MouseEvent) => {
            if (filterPanelRef.current && !filterPanelRef.current.contains(event.target as Node)) {
                setFilterOpen(false);
            }
        };

        document.addEventListener("mousedown", handleOutsideClick);
        return () => document.removeEventListener("mousedown", handleOutsideClick);
    }, [filterOpen]);

    const applyFilters = () => {
        setFilters(draftFilters);
        setFilterOpen(false);
    };

    const clearFilters = () => {
        const emptyFilters = {
            city: "",
            region: "",
        };
        setDraftFilters(emptyFilters);
        setFilters(emptyFilters);
        setFilterOpen(false);
    };

    return (
        <main
            className="flex-1 overflow-y-auto p-8 font-sans antialiased selection:bg-[#4A4E5A]/10"
            style={{ background: "var(--background-primary-50, #FFFFFF80)" }}
        >
            <div className="relative mb-8 flex w-full items-center justify-between gap-3">
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

                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => setFilterOpen((prev) => !prev)}
                        className="flex h-[44px] w-[85px] items-center justify-center gap-2 rounded-[16px] border border-white bg-[#EBEBEB] px-3.5 py-2 text-[14px] font-medium leading-[20px] text-[#4E525D] transition-colors hover:bg-[#E0E0E0] cursor-pointer"
                    >
                        <img src="/images/inv-resale/filter.svg" alt="" className="h-4 w-4" />
                        <span>Filter</span>
                        {activeFilterCount > 0 ? (
                            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#4E525D] px-1 text-[11px] font-semibold text-white">
                                {activeFilterCount}
                            </span>
                        ) : null}
                    </button>

                    <div className="flex h-[46px] items-center rounded-full border border-[#E2E8F0] bg-white p-1 shadow-sm">
                        <button
                            type="button"
                            onClick={() => setViewMode("grid")}
                            className={`flex h-[40px] w-[80px] items-center justify-center gap-2 rounded-[24px] px-3.5 text-[14px] font-medium leading-[20px] transition-all cursor-pointer ${
                                viewMode === "grid"
                                    ? "border border-white bg-[#EBEBEB] text-[#4E525D]"
                                    : "border border-transparent bg-transparent text-[#718096] hover:bg-[#F1F5F9]"
                            }`}
                        >
                            <img src="/images/inv-resale/grid.svg" alt="" className="h-4 w-4" />
                            <span>Grid</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setViewMode("list")}
                            className={`flex h-[40px] w-[80px] items-center justify-center gap-2 rounded-[24px] px-3.5 text-[14px] font-medium leading-[20px] transition-all cursor-pointer ${
                                viewMode === "list"
                                    ? "border border-white bg-[#EBEBEB] text-[#4E525D]"
                                    : "border border-transparent bg-transparent text-[#718096] hover:bg-[#F1F5F9]"
                            }`}
                        >
                            <img src="/images/inv-resale/list.svg" alt="" className="h-4 w-4" />
                            <span>List</span>
                        </button>
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

                {filterOpen ? (
                    <div
                        ref={filterPanelRef}
                        className="absolute right-0 top-[56px] z-20 w-full max-w-[440px] rounded-[28px] border border-[#E7E9EE] bg-white p-5 shadow-[0_20px_50px_rgba(17,24,39,0.12)]"
                    >
                        <div className="mb-4 flex items-center justify-between">
                            <div>
                                <h4 className="text-[16px] font-semibold text-[#1A1A1A]">Filter Objects</h4>
                                <p className="mt-1 text-[13px] text-[#808191]">First choose city, then region</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setFilterOpen(false)}
                                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F4F5F6] text-[#4E525D] transition-colors hover:bg-[#E9ECF2]"
                            >
                                <IoClose size={18} />
                            </button>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <FilterSelect
                                label="City"
                                value={draftFilters.city}
                                options={cityOptions}
                                placeholder="All cities"
                                onChange={(value) => setDraftFilters((prev) => ({ ...prev, city: value, region: "" }))}
                            />
                            <FilterSelect
                                label="Region"
                                value={draftFilters.region}
                                options={regionOptions}
                                placeholder={draftFilters.city ? "All regions" : "Select city first"}
                                onChange={(value) => setDraftFilters((prev) => ({ ...prev, region: value }))}
                                disabled={!draftFilters.city}
                            />
                        </div>

                        <div className="mt-5 flex items-center justify-end gap-3">
                            <button
                                type="button"
                                onClick={clearFilters}
                                className="rounded-2xl border border-[#E7E9EE] px-4 py-2.5 text-sm font-medium text-[#4E525D] transition-colors hover:bg-[#F8F9FB]"
                            >
                                Clear
                            </button>
                            <button
                                type="button"
                                onClick={applyFilters}
                                className="rounded-2xl bg-[#4E525D] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#3D404A]"
                            >
                                Apply Filters
                            </button>
                        </div>
                    </div>
                ) : null}
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
            ) : viewMode === "grid" ? (
                <div className="flex w-full flex-wrap gap-5">
                    {filtered.map((cat) => (
                        <div key={cat.id} className="group flex w-[280px] shrink-0 flex-col gap-3 rounded-[28px] border border-[#EBEBEB] bg-white p-2 pb-3 transition-shadow hover:shadow-md">
                            <div
                                className="relative h-[200px] w-full shrink-0 cursor-pointer overflow-hidden rounded-[24px] bg-[#F8F9FA]"
                                onClick={() => navigate(`/dashboard/offplan/objects/${cat.slug}/edit`)}
                            >
                                {cat.image ? (
                                    <img
                                        src={cat.image}
                                        alt={cat.title}
                                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                                        loading="lazy"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center bg-gray-100 text-sm text-[#999]">
                                        No Image
                                    </div>
                                )}

                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        statusMut.mutate({ id: cat.id, status: (cat.status || "active") === "active" ? "archive" : "active" });
                                    }}
                                    disabled={statusMut.isPending}
                                    aria-label={(cat.status || "active") === "active" ? "Archive" : "Restore"}
                                    title={(cat.status || "active") === "active" ? "Move to Archive" : "Restore"}
                                    className="absolute left-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#EBEBEB] text-[#4E525D] transition-colors hover:bg-[#E0E0E0] disabled:opacity-50"
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
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        deleteMut.mutate(cat.id);
                                    }}
                                    aria-label="Delete"
                                    title="Delete"
                                    className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#FDECEC] text-[#C3362B] transition-colors hover:bg-[#F8DDD9]"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14zM10 11v6M14 11v6" />
                                    </svg>
                                </button>
                            </div>

                            <div className="flex flex-1 flex-col justify-between px-1.5">
                                <div>
                                    <button
                                        type="button"
                                        onClick={() => navigate(`/dashboard/offplan/objects/${cat.slug}/edit`)}
                                        className="mb-5 line-clamp-1 text-left text-[16px] font-semibold leading-[20px] text-[#1A1A1A] cursor-pointer"
                                    >
                                        {cat.title}
                                    </button>

                                    <div className="mb-3 flex items-center gap-1">
                                        <img src="/images/inv-resale/location.svg" alt="" className="h-[14px] w-[14px]" />
                                        <span className="line-clamp-1 text-[14px] font-medium leading-[20px] text-[#4E525D]">
                                            {getObjectLocation(cat) || cat.locationTitle || "-"}
                                        </span>
                                    </div>

                                    <div className="mb-6 flex flex-wrap items-center gap-y-2 text-[13px] font-medium leading-[20px] text-[#4E525D]">
                                        <span>{cat.developerBrand?.trim() || "Developer -"}</span>
                                        <span className="mx-3 text-[#D1D5DB]">|</span>
                                        <span>{formatDate(cat.createdAt)}</span>
                                    </div>

                                    <div className="mb-3 rounded-[20px] bg-[#F4F5F6] px-3 py-2.5">
                                        <div className="grid grid-cols-4 gap-2 text-center">
                                            <div>
                                                <span className="mb-1 block text-[11px] font-medium leading-[16px] text-[#808191]">Units</span>
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
                                        onClick={() => copyMut.mutate(cat)}
                                        disabled={copyMut.isPending}
                                        className="flex h-10 flex-1 items-center justify-center rounded-[14px] border border-[#E2E8F0] px-4 text-[14px] font-medium leading-[20px] text-[#4E525D] transition-colors hover:bg-gray-50 cursor-pointer disabled:opacity-50"
                                    >
                                        Copy
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => navigate(`/dashboard/offplan/objects/${cat.slug}/edit`)}
                                        className="flex h-10 flex-1 items-center justify-center rounded-[14px] bg-[#4E525D] px-4 text-[14px] font-medium leading-[20px] text-white transition-colors hover:bg-[#3A3D46] cursor-pointer"
                                    >
                                        Edit
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="overflow-hidden rounded-[24px] border border-[#EBEBEB] bg-white">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[980px] text-left text-sm">
                            <thead className="border-b border-[#EBEBEB] bg-[#F8F9FA]">
                                <tr>
                                    <th className="px-5 py-4 font-medium text-[#4E525D]">Object</th>
                                    <th className="px-4 py-4 font-medium text-[#4E525D]">Developer</th>
                                    <th className="px-4 py-4 font-medium text-[#4E525D]">Location</th>
                                    <th className="px-4 py-4 font-medium text-[#4E525D]">Units</th>
                                    <th className="px-4 py-4 font-medium text-[#4E525D]">Status</th>
                                    <th className="px-5 py-4 text-right font-medium text-[#4E525D]">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((cat) => (
                                    <tr
                                        key={cat.id}
                                        className="border-b border-[#F1F2F4] align-middle transition-colors hover:bg-[#FAFAFB]"
                                    >
                                        <td className="px-5 py-4">
                                            <button
                                                type="button"
                                                onClick={() => navigate(`/dashboard/offplan/objects/${cat.slug}/edit`)}
                                                className="flex items-center gap-3 text-left cursor-pointer"
                                            >
                                                <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[#F4F5F6]">
                                                    {cat.image ? (
                                                        <img
                                                            src={cat.image}
                                                            alt={cat.title}
                                                            className="h-full w-full object-cover"
                                                            loading="lazy"
                                                        />
                                                    ) : (
                                                        <div className="flex h-full w-full items-center justify-center text-[11px] text-[#999999]">
                                                            No Image
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="truncate font-semibold text-[#1A1A1A]">{cat.title}</div>
                                                    <div className="mt-1 truncate text-xs text-[#808191]">{formatDate(cat.createdAt)}</div>
                                                </div>
                                            </button>
                                        </td>
                                        <td className="px-4 py-4 text-[#4E525D]">{cat.developerBrand || "—"}</td>
                                        <td className="px-4 py-4 text-[#4E525D]">{getObjectLocation(cat) || cat.locationTitle || "—"}</td>
                                        <td className="px-4 py-4 text-[#4E525D]">{(cat.metrics?.houses ?? 0).toLocaleString()}</td>
                                        <td className="px-4 py-4">
                                            <span
                                                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                                                    (cat.status || "active") === "active"
                                                        ? "bg-[#E7F6ED] text-[#2D9A5B]"
                                                        : "bg-[#F4F5F6] text-[#718096]"
                                                }`}
                                            >
                                                {(cat.status || "active") === "active" ? "Active" : "Archive"}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => statusMut.mutate({ id: cat.id, status: (cat.status || "active") === "active" ? "archive" : "active" })}
                                                    disabled={statusMut.isPending}
                                                    aria-label={(cat.status || "active") === "active" ? "Archive" : "Restore"}
                                                    title={(cat.status || "active") === "active" ? "Move to Archive" : "Restore"}
                                                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-[#4E525D] transition-colors hover:bg-gray-100 disabled:opacity-50"
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
                                                    onClick={() => copyMut.mutate(cat)}
                                                    disabled={copyMut.isPending}
                                                    aria-label="Copy"
                                                    title="Copy"
                                                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-[#4E525D] transition-colors hover:bg-gray-100 disabled:opacity-50"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
                                                        <rect x="9" y="9" width="10" height="10" rx="2" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 9V7a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
                                                    </svg>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => deleteMut.mutate(cat.id)}
                                                    aria-label="Delete"
                                                    title="Delete"
                                                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-[#C3362B] transition-colors hover:bg-[#FCEDEA]"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 7.5h15" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.75h4.5A1.5 1.5 0 0 1 15.75 5.25V7.5h-7.5V5.25a1.5 1.5 0 0 1 1.5-1.5Z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 7.5l.675 10.125A1.5 1.5 0 0 0 8.922 19.5h6.156a1.5 1.5 0 0 0 1.497-1.875L17.25 7.5" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 10.5v5.25M13.5 10.5v5.25" />
                                                    </svg>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => navigate(`/dashboard/offplan/objects/${cat.slug}/edit`)}
                                                    className="inline-flex h-9 items-center justify-center rounded-lg px-3 text-sm font-medium text-[#4E525D] transition-colors hover:bg-gray-100"
                                                >
                                                    Edit
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </main>
    );
}
