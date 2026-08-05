import { useState } from "react";
import type { House } from "../../api/houses";

function displayValue(value?: string | number | null) {
    if (value === null || value === undefined) return "Not specified";
    const stringValue = String(value).trim();
    return stringValue ? stringValue : "Not specified";
}

function getFileNameFromUrl(url: string, fallback: string) {
    try {
        const path = new URL(url, window.location.origin).pathname;
        const name = path.split("/").pop();
        return name && name.includes(".") ? name : fallback;
    } catch {
        return fallback;
    }
}

export function HouseInformationCard({
    house,
    onEdit,
    onCancel,
}: {
    house: House;
    onEdit: () => void;
    onCancel: () => void;
}) {
    const imageUrl = house.mainImage?.url || house.gallery?.[0]?.url || "";
    const address = [house.street, house.houseNumber].filter(Boolean).join(", ");
    const [downloading, setDownloading] = useState(false);

    const handleDownloadImage = async () => {
        if (!imageUrl || downloading) return;
        setDownloading(true);
        try {
            const res = await fetch(imageUrl);
            const blob = await res.blob();
            const blobUrl = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = blobUrl;
            link.download = getFileNameFromUrl(imageUrl, `${house.name || house.title || "house"}.jpg`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            URL.revokeObjectURL(blobUrl);
        } catch {
            window.open(imageUrl, "_blank", "noreferrer");
        } finally {
            setDownloading(false);
        }
    };
    const aboveGroundFloors =
        house.numberOfFloors?.end || house.numberOfFloors?.start || 0;

    const details = [
        { label: "Name", value: displayValue(house.name || house.title) },
        { label: "Type of building", value: displayValue(house.typeOfBuilding) },
        { label: "Address", value: displayValue(address) },
        { label: "Number of entrances", value: "0" },
        { label: "Number above ground floors", value: String(aboveGroundFloors) },
        { label: "Underground floors", value: "Not specified" },
        { label: "Construction stage", value: displayValue(house.constructionStage) },
    ];

    const leftColumn = details.slice(0, 6);
    const rightColumn = details.slice(6);

    return (
        <div className="rounded-[28px] border border-[#E9ECF2] bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.03)]">
            <div className="mb-4 flex items-center justify-between">
                <h3 className="text-base font-semibold text-[#1A1A1A]">House information</h3>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="inline-flex items-center rounded-full border border-[#D8DCE5] bg-white px-4 py-2 text-sm font-medium text-[#4E525D] transition-colors hover:bg-[#F8F9FB]"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={onEdit}
                        className="inline-flex items-center gap-2 rounded-full bg-[#4E525D] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#3A3D46]"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 3.487a2.25 2.25 0 113.182 3.182L8.25 18.463 3 19.5l1.037-5.25L16.862 3.487z" />
                        </svg>
                        Edit
                    </button>
                </div>
            </div>

            <div className="overflow-hidden rounded-[22px] border border-[#E9ECF2] bg-[#FBFBFC]">
                <div className="grid lg:grid-cols-[240px_minmax(0,1fr)]">
                    <div className="border-b border-[#E9ECF2] p-4 lg:border-b-0 lg:border-r">
                        <div className="aspect-square w-full overflow-hidden rounded-[18px] bg-white">
                            {imageUrl ? (
                                <img src={imageUrl} alt={house.title} className="h-full w-full object-cover" />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center text-xs text-[#999]">
                                    No image
                                </div>
                            )}
                        </div>

                        <p className="mt-4 text-center text-xs leading-5 text-[#808191]">
                            Preview in the CRM widget and Smart Catalog. The image is expected to update.
                        </p>

                        <button
                            type="button"
                            onClick={handleDownloadImage}
                            disabled={!imageUrl || downloading}
                            className={`mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#BFC4CF] px-4 py-2 text-sm font-medium text-[#4E525D] transition-colors ${
                                imageUrl ? "hover:bg-[#F8F9FB]" : "pointer-events-none opacity-50"
                            } ${downloading ? "pointer-events-none opacity-70" : ""}`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v12m0 0 4-4m-4 4-4-4M5 21h14" />
                            </svg>
                            {downloading ? "Downloading..." : "Download image"}
                        </button>
                    </div>

                    <div className="grid md:grid-cols-2">
                        {[leftColumn, rightColumn].map((column, index) => (
                            <div
                                key={index}
                                className={index === 0 ? "border-b border-[#E9ECF2] p-4 md:border-b-0 md:border-r" : "p-4"}
                            >
                                <div className="space-y-4">
                                    {column.map((item) => (
                                        <div key={item.label} className="grid grid-cols-[130px_minmax(0,1fr)] gap-4">
                                            <span className="text-xs text-[#666]">{item.label}</span>
                                            <span className="text-sm font-medium text-[#1A1A1A]">{item.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
