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
            className="w-[260px] h-[368px] bg-white border border-[#EBEBEB] rounded-[28px] p-2 pb-3 flex flex-col gap-3 hover:shadow-md transition-shadow group cursor-pointer"
            onClick={() => navigate(`/dashboard/resale/apartments/${apt.id}`)}
        >
            {/* Image */}
            <div className="relative w-full aspect-[4/3] rounded-[18px] overflow-hidden mb-4 bg-[#F8F9FA]">
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
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-xs">
                    <img src="/images/inv-resale/eye.svg" alt="" className="w-[13px] h-[13px]" />
                    <span className="text-[11px] font-bold text-[#4A5568]">0</span>
                </div>

                {/* Status badge - top right */}
                <div className="absolute top-3 right-3">
                    <span
                        className={`text-[11px] font-bold px-3 py-1 rounded-full shadow-xs tracking-wide ${
                            status === "active"
                                ? "bg-[#E6F7ED] text-[#27AE60]"
                                : status === "pending"
                                ? "bg-[#FFF4EC] text-[#D35400]"
                                : "bg-[#FDECEC] text-[#C3362B]"
                        }`}
                    >
                        {status === "active" ? "Active" : status === "pending" ? "Pending" : "Non Active"}
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col justify-between px-1">
                <div>
                    {/* Title */}
                    <h3 className="text-[16px] font-bold text-[#1A1C1E] tracking-tight leading-snug line-clamp-1 mb-1.5">
                        {apt.title}
                    </h3>

                    {/* Location */}
                    <div className="flex items-center gap-1 text-[#718096] mb-3">
                        <img src="/images/inv-resale/location.svg" alt="" className="w-[14px] h-[14px]" />
                        <span className="text-xs font-medium">{apt.locationTitle || "—"}</span>
                    </div>

                    {/* Details row */}
                    <div className="flex items-center gap-2.5 text-xs font-medium text-[#718096] mb-4">
                        {/* Bed */}
                        <div className="flex items-center gap-1">
                            <img src="/images/inv-resale/bedroom.svg" alt="" className="w-[13px] h-[13px]" />
                            <span>{apt.roomCount} bed</span>
                        </div>

                        {/* Bath */}
                        <div className="flex items-center gap-1">
                            <span>1 bath</span>
                        </div>

                        {/* Area */}
                        <div>
                            <span>{apt.area} m²</span>
                        </div>
                    </div>
                </div>

                {/* Bottom row */}
                <div className="flex items-center justify-between">
                    {/* Price */}
                    <div className="bg-[#F1F5F9] px-3.5 py-1.5 rounded-full flex items-center justify-center">
                        <span className="text-[14px] font-bold text-[#1A1C1E] tracking-tight">
                            ₼ {formatPrice(price)}
                        </span>
                    </div>

                    {/* View Details button */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/dashboard/resale/apartments/${apt.id}`);
                        }}
                        className="bg-[#4A4E5A] hover:bg-[#3A3D46] text-white text-xs font-semibold px-4 h-8 rounded-full transition-colors shadow-xs"
                    >
                        View Details
                    </button>
                </div>
            </div>
        </div>
    );
}
