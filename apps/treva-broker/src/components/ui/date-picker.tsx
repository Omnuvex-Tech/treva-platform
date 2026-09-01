"use client";

import { Calendar03Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from "react";

import { cn } from "@/lib/utils/cn";
import { useI18n } from "@/providers/i18n-provider";
import { AnchoredPopover } from "./popover";

export interface DatePickerProps {
    label?: string;
    error?: string;
    /** ISO calendar date, `yyyy-mm-dd`. Empty string means "no date". */
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    /** ISO bounds, inclusive. */
    min?: string;
    max?: string;
    /** Renders a hidden input so the value is submitted with a `<form>`. */
    name?: string;
    disabled?: boolean;
    id?: string;
    containerClassName?: string;
}

function pad(value: number) {
    return String(value).padStart(2, "0");
}

function toISO(date: Date) {
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function fromISO(value: string): Date | null {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    if (!match) return null;
    const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
    return Number.isNaN(date.getTime()) ? null : date;
}

function startOfDay(date: Date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, count: number) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate() + count);
}

function firstOfMonth(date: Date) {
    return new Date(date.getFullYear(), date.getMonth(), 1);
}

function sameDay(a: Date, b: Date) {
    return (
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate()
    );
}

/** Monday-first offset for a date (Mon = 0 … Sun = 6). */
function weekdayOffset(date: Date) {
    return (date.getDay() + 6) % 7;
}

/**
 * A calendar date field that matches the design system.
 *
 * Replaces `<input type="date">` because its popup calendar is browser chrome
 * and cannot be themed. The panel here is a normal styled surface on top of
 * {@link AnchoredPopover}; month names and weekday headings come from `Intl`
 * keyed to the active locale, so az / en / ru all read correctly. A hidden
 * input keeps `<form>` submission working.
 */
export function DatePicker({
    label,
    error,
    value,
    onChange,
    placeholder,
    min,
    max,
    name,
    disabled,
    id,
    containerClassName,
}: DatePickerProps) {
    const { locale, t } = useI18n();
    const generatedId = useId();
    const triggerId = id ?? generatedId;

    const selectedDate = fromISO(value);
    const minDate = min ? fromISO(min) : null;
    const maxDate = max ? fromISO(max) : null;

    const [open, setOpen] = useState(false);
    const [viewMonth, setViewMonth] = useState(() => firstOfMonth(selectedDate ?? new Date()));
    const [focusedDate, setFocusedDate] = useState(() => startOfDay(selectedDate ?? new Date()));

    const triggerRef = useRef<HTMLButtonElement>(null);
    const gridRef = useRef<HTMLDivElement>(null);

    const monthFormat = useMemo(
        () => new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }),
        [locale],
    );
    const displayFormat = useMemo(
        () => new Intl.DateTimeFormat(locale, { day: "2-digit", month: "short", year: "numeric" }),
        [locale],
    );
    const fullDateFormat = useMemo(
        () => new Intl.DateTimeFormat(locale, { dateStyle: "full" }),
        [locale],
    );

    const weekdays = useMemo(() => {
        // 2024-01-01 is a Monday.
        const format = new Intl.DateTimeFormat(locale, { weekday: "short" });
        return Array.from({ length: 7 }, (_, index) => format.format(new Date(2024, 0, 1 + index)));
    }, [locale]);

    const days = useMemo(() => {
        const start = addDays(viewMonth, -weekdayOffset(viewMonth));
        return Array.from({ length: 42 }, (_, index) => addDays(start, index));
    }, [viewMonth]);

    const isOutOfRange = useCallback(
        (date: Date) => {
            if (minDate && startOfDay(date) < startOfDay(minDate)) return true;
            if (maxDate && startOfDay(date) > startOfDay(maxDate)) return true;
            return false;
        },
        [minDate, maxDate],
    );

    const openCalendar = useCallback(() => {
        if (disabled) return;
        const base = startOfDay(fromISO(value) ?? new Date());
        setViewMonth(firstOfMonth(base));
        setFocusedDate(base);
        setOpen(true);
    }, [disabled, value]);

    const close = useCallback(() => {
        setOpen(false);
        triggerRef.current?.focus();
    }, []);

    const commit = useCallback(
        (date: Date) => {
            if (isOutOfRange(date)) return;
            onChange(toISO(date));
            close();
        },
        [close, isOutOfRange, onChange],
    );

    // Move DOM focus onto the focused day so arrow-key navigation reads out.
    useEffect(() => {
        if (!open) return;
        const node = gridRef.current?.querySelector<HTMLButtonElement>(
            `[data-date="${toISO(focusedDate)}"]`,
        );
        node?.focus();
    }, [open, focusedDate]);

    function onGridKeyDown(event: KeyboardEvent<HTMLDivElement>) {
        let next: Date | null = null;

        switch (event.key) {
            case "ArrowLeft":
                next = addDays(focusedDate, -1);
                break;
            case "ArrowRight":
                next = addDays(focusedDate, 1);
                break;
            case "ArrowUp":
                next = addDays(focusedDate, -7);
                break;
            case "ArrowDown":
                next = addDays(focusedDate, 7);
                break;
            case "Home":
                next = addDays(focusedDate, -weekdayOffset(focusedDate));
                break;
            case "End":
                next = addDays(focusedDate, 6 - weekdayOffset(focusedDate));
                break;
            case "PageUp":
                next = new Date(
                    focusedDate.getFullYear(),
                    focusedDate.getMonth() - 1,
                    focusedDate.getDate(),
                );
                break;
            case "PageDown":
                next = new Date(
                    focusedDate.getFullYear(),
                    focusedDate.getMonth() + 1,
                    focusedDate.getDate(),
                );
                break;
            case "Enter":
            case " ":
                event.preventDefault();
                commit(focusedDate);
                return;
            default:
                return;
        }

        event.preventDefault();
        setFocusedDate(next);
        if (next.getMonth() !== viewMonth.getMonth() || next.getFullYear() !== viewMonth.getFullYear()) {
            setViewMonth(firstOfMonth(next));
        }
    }

    const displayValue = selectedDate ? displayFormat.format(selectedDate) : "";

    return (
        <div className={cn("flex w-full flex-col gap-1.5", containerClassName)}>
            {label ? (
                <label htmlFor={triggerId} className="text-xs font-medium text-content-secondary">
                    {label}
                </label>
            ) : null}

            <button
                ref={triggerRef}
                id={triggerId}
                type="button"
                aria-haspopup="dialog"
                aria-expanded={open}
                aria-invalid={error ? true : undefined}
                disabled={disabled}
                onClick={() => (open ? close() : openCalendar())}
                className={cn(
                    "flex h-11 w-full items-center gap-2 rounded-md px-3 text-left text-sm",
                    "border border-transparent bg-bg-secondary text-content-primary outline-none transition-colors",
                    "focus-visible:border-border-brand focus-visible:bg-bg-primary",
                    open && "border-border-brand bg-bg-primary",
                    "disabled:cursor-not-allowed disabled:opacity-60",
                    error && "border-content-negative",
                )}
            >
                <span className={cn("flex-1 truncate", !displayValue && "text-content-tertiary")}>
                    {displayValue || placeholder || t.common.datePicker.placeholder}
                </span>
                <HugeiconsIcon
                    icon={Calendar03Icon}
                    size={16}
                    strokeWidth={1.6}
                    className="shrink-0 text-content-tertiary"
                />
            </button>

            {name ? <input type="hidden" name={name} value={value} /> : null}

            {error ? <p className="text-xs text-content-negative">{error}</p> : null}

            <AnchoredPopover anchorRef={triggerRef} open={open} onClose={close}>
                <div className="w-[288px] p-3">
                    <div className="flex items-center justify-between">
                        <button
                            type="button"
                            aria-label={t.common.datePicker.previousMonth}
                            onClick={() =>
                                setViewMonth(
                                    new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1),
                                )
                            }
                            className="flex size-8 items-center justify-center rounded-s text-content-secondary transition-colors hover:bg-bg-secondary hover:text-content-primary"
                        >
                            <ChevronLeft className="size-4" />
                        </button>

                        <span className="text-sm font-semibold capitalize text-content-primary">
                            {monthFormat.format(viewMonth)}
                        </span>

                        <button
                            type="button"
                            aria-label={t.common.datePicker.nextMonth}
                            onClick={() =>
                                setViewMonth(
                                    new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1),
                                )
                            }
                            className="flex size-8 items-center justify-center rounded-s text-content-secondary transition-colors hover:bg-bg-secondary hover:text-content-primary"
                        >
                            <ChevronRight className="size-4" />
                        </button>
                    </div>

                    <div className="mt-2 grid grid-cols-7">
                        {weekdays.map((weekday) => (
                            <span
                                key={weekday}
                                className="flex h-8 items-center justify-center text-2xs font-medium uppercase text-content-tertiary"
                            >
                                {weekday}
                            </span>
                        ))}
                    </div>

                    <div ref={gridRef} className="grid grid-cols-7 gap-0.5" onKeyDown={onGridKeyDown}>
                        {days.map((day) => {
                            const outside = day.getMonth() !== viewMonth.getMonth();
                            const isSelected = selectedDate ? sameDay(day, selectedDate) : false;
                            const isToday = sameDay(day, new Date());
                            const outOfRange = isOutOfRange(day);

                            return (
                                <button
                                    key={toISO(day)}
                                    type="button"
                                    data-date={toISO(day)}
                                    aria-label={fullDateFormat.format(day)}
                                    aria-pressed={isSelected}
                                    aria-current={isToday ? "date" : undefined}
                                    tabIndex={sameDay(day, focusedDate) ? 0 : -1}
                                    disabled={outOfRange}
                                    onClick={() => commit(day)}
                                    className={cn(
                                        "flex h-9 items-center justify-center rounded-s text-sm transition-colors",
                                        "text-content-secondary hover:bg-bg-secondary hover:text-content-primary",
                                        outside && "text-content-disabled",
                                        isToday &&
                                            !isSelected &&
                                            "font-semibold text-content-brand",
                                        isSelected &&
                                            "bg-bg-brand font-medium text-content-inverse hover:bg-content-brand-bold hover:text-content-inverse",
                                        outOfRange &&
                                            "cursor-not-allowed text-content-disabled hover:bg-transparent hover:text-content-disabled",
                                    )}
                                >
                                    {day.getDate()}
                                </button>
                            );
                        })}
                    </div>

                    <div className="mt-2 flex items-center justify-between border-t border-border-subtle pt-2">
                        <button
                            type="button"
                            onClick={() => commit(startOfDay(new Date()))}
                            className="rounded-s px-2 py-1 text-xs font-medium text-content-link transition-colors hover:bg-bg-secondary"
                        >
                            {t.common.datePicker.today}
                        </button>

                        {value ? (
                            <button
                                type="button"
                                onClick={() => {
                                    onChange("");
                                    close();
                                }}
                                className="rounded-s px-2 py-1 text-xs font-medium text-content-tertiary transition-colors hover:bg-bg-secondary hover:text-content-primary"
                            >
                                {t.common.datePicker.clear}
                            </button>
                        ) : null}
                    </div>
                </div>
            </AnchoredPopover>
        </div>
    );
}
