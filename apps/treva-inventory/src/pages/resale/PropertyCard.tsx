import { useNavigate } from "react-router-dom";
import type { Apartment } from "../../api/apartments";

interface PropertyCardProps {
    apartment: Apartment;
}

const formatPrice = (p: number) =>
    p.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");

export function PropertyCard({ apartment: apt }: PropertyCardProps) {
    const navigate = useNavigate();

    const status = apt.status || "active";
    const price = apt.prices?.[0]?.priceTotal ?? apt.priceTotal ?? 0;

    return (
        <div
            className="w-[280px] bg-white border border-[#EBEBEB] rounded-[28px] p-2 pb-3 flex flex-col gap-3 hover:shadow-md transition-shadow group cursor-pointer"
            onClick={() => navigate(`/dashboard/resale/apartments/${apt.id}`)}
        >
            {/* Image */}
            <div className="relative w-full h-[200px] rounded-[24px] overflow-hidden bg-[#F8F9FA]">
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
                    ) : status === "pending" ? (
                        <span className="text-[12px] font-medium px-2 py-1 rounded-full bg-[#FDF4E0] text-[#967B38]">
                            Pending
                        </span>
                    ) : (
                        <span className="text-[12px] font-medium px-2 py-1 rounded-full bg-[#FDECEC] text-[#C3362B]">
                            Non Active
                        </span>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col justify-between px-1.5">
                <div>
                    {/* Title */}
                    <h3 className="text-[16px] font-semibold text-[#1A1A1A] leading-[20px] line-clamp-1 mb-5">
                        {apt.title}
                    </h3>

                    {/* Location */}
                    <div className="flex items-center gap-1 mb-3">
                        <img src="/images/inv-resale/location.svg" alt="" className="w-[14px] h-[14px]" />
                        <span className="text-[14px] font-medium text-[#4E525D] leading-[20px]">{apt.locationTitle || "—"}</span>
                    </div>

                    {/* Details row */}
                    <div className="flex items-center text-[#4E525D] text-[13px] font-medium leading-[20px] mb-6">
                        {/* Bed */}
                        <div className="flex items-center gap-1.5">
                            <img src="/images/inv-resale/bedroom.svg" alt="" className="w-[16px] h-[16px]" />
                            <span>{apt.roomCount} bed</span>
                        </div>

                        {/* Şaquli Ayırıcı Simvol */}
                        <span className="mx-3 text-[#D1D5DB]">|</span>

                        {/* Bath */}
                        <span>2 bath</span>

                        {/* Şaquli Ayırıcı Simvol */}
                        <span className="mx-3 text-[#D1D5DB]">|</span>

                        {/* Area */}
                        <span>{apt.area} m²</span>
                    </div>
                </div>

                {/* Bottom row - Qiymət və Düymə arasındakı sahə */}
                <div className="flex items-center justify-between gap-4 mt-auto pt-1">
                    {/* Price */}
                    <div className="bg-[#EBEBEB] px-3 py-1 rounded-3xl flex items-center justify-center min-w-[96px] h-[32px]">
                        <span className="text-[14px] font-semibold text-[#000000] leading-[20px] whitespace-nowrap">
                            ₼ {formatPrice(price)}
                        </span>
                    </div>

                    {/* View Details button */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/dashboard/resale/apartments/${apt.id}`);
                        }}
                        className="bg-[#4E525D] hover:bg-[#3A3D46] text-white text-[14px] font-medium leading-[20px] px-4 h-[32px] rounded-3xl transition-colors flex items-center justify-center whitespace-nowrap"
                    >
                        View Details
                    </button>
                </div>
            </div>
        </div>
    );
}