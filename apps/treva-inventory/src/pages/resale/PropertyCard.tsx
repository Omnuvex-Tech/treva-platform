import { useNavigate } from "react-router-dom";
import type { Apartment } from "../../api/apartments";

interface PropertyCardProps {
    apartment: Apartment;
    onDuplicate?: (apartment: Apartment) => void;
    onDelete?: (apartment: Apartment) => void;
}

const formatPrice = (p: number) =>
    p.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");

export function PropertyCard({ apartment: apt, onDuplicate, onDelete }: PropertyCardProps) {
    const navigate = useNavigate();

    const status = apt.status || "active";
    const primaryPrice = apt.prices?.[0];
    const price = primaryPrice?.priceTotal ?? apt.priceTotal ?? 0;
    const currencyCode = primaryPrice?.currency?.value || apt.currency?.value || "";
    const handleOpenListing = () => navigate(`/dashboard/resale/apartments/${apt.id}`);

    return (
        <div
            className="w-full bg-white border border-[#EBEBEB] rounded-[28px] p-2 pb-3 flex flex-col gap-3 hover:shadow-md transition-shadow group"
        >
            {/* Image */}
            <div
                className="relative w-full h-[200px] rounded-[24px] overflow-hidden bg-[#F8F9FA] cursor-pointer"
                onClick={handleOpenListing}
            >
                {apt.image ? (
                    <img
                        src={apt.image}
                        alt={apt.title}
                        className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                        loading="lazy"
                    />
                ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center text-[#999] text-sm">
                        No Image
                    </div>
                )}

                {/* View count badge - top left */}
                <div className="absolute top-3 left-3 bg-[#EBEBEB] px-2 py-1 rounded-full flex items-center gap-1">
                    <img src="/images/inv-resale/eye.svg" alt="" className="w-[13px] h-[13px]" />
                    <span className="text-[12px] font-medium text-[#666666]">0</span>
                </div>

                {/* Status badge - top right */}
                <div className="absolute top-3 right-3">
                    {status === "active" ? (
                        <span className="text-[12px] font-medium px-2 py-1 rounded-full bg-[#2D9A5B] text-white">
                            Active
                        </span>
                    ) : status === "reserved" ? (
                        <span className="text-[12px] font-medium px-2 py-1 rounded-full bg-[#FDF4E0] text-[#967B38]">
                            Reserved
                        </span>
                    ) : (
                        <span className="text-[12px] font-medium px-2 py-1 rounded-full bg-[#FDECEC] text-[#C3362B]">
                            Sold
                        </span>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col justify-between px-1.5">
                <div>
                    {/* Title */}
                    <button
                        type="button"
                        onClick={handleOpenListing}
                        className="mb-5 line-clamp-1 text-left text-[16px] font-semibold leading-[20px] text-[#1A1A1A] cursor-pointer"
                    >
                        {apt.title}
                    </button>

                    {/* Location */}
                    <div className="flex items-center gap-1 mb-3">
                        <img src="/images/inv-resale/location.svg" alt="" className="w-[14px] h-[14px]" />
                        <span className="line-clamp-1 text-[14px] font-medium text-[#4E525D] leading-[20px]">
                            {apt.locationTitle || "-"}
                        </span>
                    </div>

                    {/* Details row */}
                    <div className="flex flex-wrap items-center gap-y-2 text-[#4E525D] text-[13px] font-medium leading-[20px] mb-6">
                        <div className="flex items-center gap-1.5">
                            <img src="/images/inv-resale/bedroom.svg" alt="" className="w-[16px] h-[16px]" />
                            <span>{apt.roomCount} bed</span>
                        </div>
                        <span className="mx-3 text-[#D1D5DB]">|</span>
                        <span>
                            {apt.floorFrom && apt.floorTo
                                ? `${apt.floorFrom}-${apt.floorTo} floor`
                                : apt.floorFrom || apt.floorTo
                                    ? `${apt.floorFrom || apt.floorTo} floor`
                                    : "Floor -"}
                        </span>
                        <span className="mx-3 text-[#D1D5DB]">|</span>
                        <span>{apt.area} m2</span>
                    </div>
                </div>

                <div className="mt-auto pt-1">
                    <div className="mb-3 flex items-center justify-between gap-3 rounded-[20px] bg-[#F4F5F6] px-3 py-2.5">
                        <span className="text-[12px] font-medium text-[#808191]">Price</span>
                        <div className="flex min-w-0 items-center justify-end">
                            {currencyCode ? (
                                <span className="mr-2 inline-flex h-6 items-center rounded-full bg-white px-2 text-[11px] font-semibold text-[#4E525D]">
                                    {currencyCode}
                                </span>
                            ) : null}
                            <span className="truncate text-[16px] font-semibold leading-[20px] text-[#000000]">
                                {formatPrice(price)}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {onDuplicate ? (
                            <button
                                type="button"
                                onClick={() => onDuplicate(apt)}
                                aria-label="Duplicate"
                                title="Duplicate"
                                className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[14px] bg-[#EBEBEB] text-[#4E525D] transition-colors hover:bg-[#E0E0E0]"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                    className="h-4 w-4"
                                >
                                    <rect x="9" y="9" width="10" height="10" rx="2" />
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M15 9V7a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"
                                    />
                                </svg>
                            </button>
                        ) : null}
                        {onDelete ? (
                            <button
                                type="button"
                                onClick={() => onDelete(apt)}
                                aria-label="Delete"
                                title="Delete"
                                className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[14px] bg-[#FDECEC] text-[#C3362B] transition-colors hover:bg-[#F8DDD9]"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                    className="h-4 w-4"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 7.5h15" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.75h4.5A1.5 1.5 0 0 1 15.75 5.25V7.5h-7.5V5.25a1.5 1.5 0 0 1 1.5-1.5Z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 7.5l.675 10.125A1.5 1.5 0 0 0 8.922 19.5h6.156a1.5 1.5 0 0 0 1.497-1.875L17.25 7.5" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 10.5v5.25M13.5 10.5v5.25" />
                                </svg>
                            </button>
                        ) : null}

                        <button
                            type="button"
                            onClick={handleOpenListing}
                            className="flex h-10 flex-1 items-center justify-center rounded-[14px] bg-[#4E525D] px-4 text-[14px] font-medium leading-[20px] text-white transition-colors hover:bg-[#3A3D46] cursor-pointer"
                        >
                            Open Listing
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
