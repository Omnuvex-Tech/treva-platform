import { useState, type FormEvent } from "react";

function getPageNumbers(current: number, total: number, siblingCount = 1): (number | "ellipsis")[] {
    const totalNumbersToShow = siblingCount * 2 + 5;

    if (totalNumbersToShow >= total) {
        return Array.from({ length: total }, (_, i) => i + 1);
    }

    const leftSiblingIndex = Math.max(current - siblingCount, 1);
    const rightSiblingIndex = Math.min(current + siblingCount, total);

    const showLeftEllipsis = leftSiblingIndex > 2;
    const showRightEllipsis = rightSiblingIndex < total - 1;

    if (!showLeftEllipsis && showRightEllipsis) {
        const leftItemCount = 3 + siblingCount * 2;
        const leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1);
        return [...leftRange, "ellipsis", total];
    }

    if (showLeftEllipsis && !showRightEllipsis) {
        const rightItemCount = 3 + siblingCount * 2;
        const rightRange = Array.from({ length: rightItemCount }, (_, i) => total - rightItemCount + i + 1);
        return [1, "ellipsis", ...rightRange];
    }

    const middleRange = Array.from(
        { length: rightSiblingIndex - leftSiblingIndex + 1 },
        (_, i) => leftSiblingIndex + i,
    );
    return [1, "ellipsis", ...middleRange, "ellipsis", total];
}

export function Pagination({
    page,
    totalPages,
    onPageChange,
}: {
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}) {
    const [jumpValue, setJumpValue] = useState("");

    if (totalPages <= 1) return null;

    const pages = getPageNumbers(page, totalPages);

    const goToPage = (target: number) => {
        const clamped = Math.min(Math.max(Math.trunc(target), 1), totalPages);
        onPageChange(clamped);
    };

    const handleJumpSubmit = (e: FormEvent) => {
        e.preventDefault();
        const parsed = parseInt(jumpValue, 10);
        if (Number.isFinite(parsed)) goToPage(parsed);
        setJumpValue("");
    };

    return (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
            <div className="flex items-center gap-1">
                <button
                    type="button"
                    onClick={() => goToPage(page - 1)}
                    disabled={page <= 1}
                    aria-label="Previous page"
                    className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-[#666666] transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="15 18 9 12 15 6" />
                    </svg>
                </button>

                {pages.map((item, index) =>
                    item === "ellipsis" ? (
                        <span key={`ellipsis-${index}`} className="flex h-9 w-9 items-center justify-center text-sm text-[#999]">
                            …
                        </span>
                    ) : (
                        <button
                            key={item}
                            type="button"
                            onClick={() => goToPage(item)}
                            className={`flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                                item === page ? "bg-[#4E525D] text-white" : "text-[#666666] hover:bg-gray-100"
                            }`}
                        >
                            {item}
                        </button>
                    ),
                )}

                <button
                    type="button"
                    onClick={() => goToPage(page + 1)}
                    disabled={page >= totalPages}
                    aria-label="Next page"
                    className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-[#666666] transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6" />
                    </svg>
                </button>
            </div>

            <form onSubmit={handleJumpSubmit} className="flex items-center gap-2">
                <span className="text-xs text-[#999]">Go to page</span>
                <input
                    type="number"
                    min={1}
                    max={totalPages}
                    value={jumpValue}
                    onChange={(e) => setJumpValue(e.target.value)}
                    placeholder={String(page)}
                    className="h-9 w-16 rounded-lg border border-[#E2E8F0] bg-white px-2 text-center text-sm text-[#1A1A1A] outline-none transition-colors focus:border-[#C8CDD8]"
                />
            </form>
        </div>
    );
}
