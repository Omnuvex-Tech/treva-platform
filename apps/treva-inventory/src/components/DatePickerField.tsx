import { useEffect, useMemo, useRef, useState } from "react";
import { FiCalendar, FiChevronLeft, FiChevronRight } from "react-icons/fi";

const WEEKDAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function parseISODate(value: string): Date | null {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value ?? "");
    if (!match) return null;
    const [, y, m, d] = match;
    const date = new Date(Number(y), Number(m) - 1, Number(d));
    return Number.isNaN(date.getTime()) ? null : date;
}

function toISODate(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

function isSameDay(a: Date, b: Date): boolean {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function getMonthMatrix(year: number, month: number): Date[][] {
    const firstOfMonth = new Date(year, month, 1);
    const start = new Date(year, month, 1 - firstOfMonth.getDay());
    const weeks: Date[][] = [];
    for (let w = 0; w < 6; w++) {
        const week: Date[] = [];
        for (let d = 0; d < 7; d++) {
            week.push(new Date(start.getFullYear(), start.getMonth(), start.getDate() + w * 7 + d));
        }
        weeks.push(week);
    }
    return weeks;
}

export function DatePickerField({
    value,
    onChange,
    placeholder = "Select date",
    className = "",
}: {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}) {
    const selectedDate = useMemo(() => parseISODate(value), [value]);
    const today = useMemo(() => new Date(), []);
    const [open, setOpen] = useState(false);
    const [viewDate, setViewDate] = useState(() => selectedDate ?? today);
    const containerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (open) setViewDate(selectedDate ?? today);
    }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const weeks = useMemo(() => getMonthMatrix(viewDate.getFullYear(), viewDate.getMonth()), [viewDate]);
    const monthLabel = viewDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });

    const goToMonth = (offset: number) => {
        setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
    };

    const displayValue = selectedDate
        ? selectedDate.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })
        : "";

    return (
        <div ref={containerRef} className={`relative ${className}`}>
            <button
                type="button"
                onClick={() => setOpen((prev) => !prev)}
                className="flex h-11 w-full cursor-pointer items-center justify-between rounded-2xl border border-[#E7E9EE] bg-[#F8F9FB] px-4 text-left text-sm outline-none transition-colors focus:border-[#C8CDD8]"
            >
                <span className={displayValue ? "text-[#1A1A1A]" : "text-[#A3A3A3]"}>
                    {displayValue || placeholder}
                </span>
                <FiCalendar className="h-4 w-4 flex-shrink-0 text-[#808191]" />
            </button>

            {open ? (
                <div className="absolute left-0 top-full z-50 mt-2 w-[280px] rounded-2xl border border-[#E7E9EE] bg-white p-4 shadow-[0_20px_40px_rgba(17,24,39,0.12)]">
                    <div className="mb-3 flex items-center justify-between">
                        <button
                            type="button"
                            onClick={() => goToMonth(-1)}
                            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-[#4E525D] transition-colors hover:bg-[#F4F5F6]"
                            aria-label="Previous month"
                        >
                            <FiChevronLeft className="h-4 w-4" />
                        </button>
                        <span className="text-sm font-semibold text-[#1A1A1A]">{monthLabel}</span>
                        <button
                            type="button"
                            onClick={() => goToMonth(1)}
                            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-[#4E525D] transition-colors hover:bg-[#F4F5F6]"
                            aria-label="Next month"
                        >
                            <FiChevronRight className="h-4 w-4" />
                        </button>
                    </div>

                    <div className="mb-1 grid grid-cols-7 gap-1">
                        {WEEKDAY_LABELS.map((label) => (
                            <div key={label} className="flex h-8 items-center justify-center text-[11px] font-medium text-[#A0AEC0]">
                                {label}
                            </div>
                        ))}
                    </div>

                    <div className="space-y-1">
                        {weeks.map((week, wIndex) => (
                            <div key={wIndex} className="grid grid-cols-7 gap-1">
                                {week.map((day) => {
                                    const inCurrentMonth = day.getMonth() === viewDate.getMonth();
                                    const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
                                    const isToday = isSameDay(day, today);

                                    return (
                                        <button
                                            key={day.toISOString()}
                                            type="button"
                                            onClick={() => {
                                                onChange(toISODate(day));
                                                setOpen(false);
                                            }}
                                            className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-[13px] font-medium transition-colors ${
                                                isSelected
                                                    ? "bg-[#4E525D] text-white"
                                                    : inCurrentMonth
                                                        ? "text-[#1A1A1A] hover:bg-[#F4F5F6]"
                                                        : "text-[#C9CDD5] hover:bg-[#F8F9FB]"
                                            } ${isToday && !isSelected ? "ring-1 ring-inset ring-[#C8CDD8]" : ""}`}
                                        >
                                            {day.getDate()}
                                        </button>
                                    );
                                })}
                            </div>
                        ))}
                    </div>

                    <div className="mt-3 flex items-center justify-between border-t border-[#EEF1F4] pt-3">
                        <button
                            type="button"
                            onClick={() => {
                                onChange("");
                                setOpen(false);
                            }}
                            className="cursor-pointer text-xs font-medium text-[#808191] transition-colors hover:text-[#4E525D]"
                        >
                            Clear
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                onChange(toISODate(today));
                                setOpen(false);
                            }}
                            className="cursor-pointer text-xs font-medium text-[#4E525D] transition-colors hover:text-[#3A3D46]"
                        >
                            Today
                        </button>
                    </div>
                </div>
            ) : null}
        </div>
    );
}
