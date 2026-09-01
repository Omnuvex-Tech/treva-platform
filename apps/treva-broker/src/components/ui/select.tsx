"use client";

import { Check, ChevronDown } from "lucide-react";
import { useCallback, useEffect, useId, useRef, useState, type KeyboardEvent } from "react";

import { cn } from "@/lib/utils/cn";
import { AnchoredPopover } from "./popover";

export interface SelectOption {
    value: string;
    label: string;
    disabled?: boolean;
}

export interface SelectProps {
    label?: string;
    error?: string;
    options: readonly SelectOption[];
    placeholder?: string;
    /** Controlled value. */
    value?: string;
    /** Uncontrolled initial value — used by form-data driven forms. */
    defaultValue?: string;
    onChange?: (value: string) => void;
    /** Renders a hidden input so the value is submitted with a `<form>`. */
    name?: string;
    disabled?: boolean;
    id?: string;
    "aria-label"?: string;
    containerClassName?: string;
    className?: string;
}

/**
 * A custom single-choice dropdown that matches the design system.
 *
 * Replaces the native `<select>` because its option list is drawn by the OS and
 * cannot be themed — the popup here is a normal styled panel (radius, subtle
 * border, L2 shadow) on top of {@link AnchoredPopover}. Focus stays on the
 * trigger and the list is driven through `aria-activedescendant`, the standard
 * combobox pattern, so keyboard and screen-reader use keep working. A hidden
 * input keeps `<form>` submission intact for the uncontrolled call sites.
 */
export function Select({
    label,
    error,
    options,
    placeholder,
    value,
    defaultValue,
    onChange,
    name,
    disabled,
    id,
    "aria-label": ariaLabel,
    containerClassName,
    className,
}: SelectProps) {
    const generatedId = useId();
    const triggerId = id ?? generatedId;
    const listboxId = `${triggerId}-listbox`;

    const isControlled = value !== undefined;
    const [internalValue, setInternalValue] = useState(defaultValue ?? "");
    const current = isControlled ? value : internalValue;

    const [open, setOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);

    const triggerRef = useRef<HTMLButtonElement>(null);
    const listRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find((option) => option.value === current);

    const nextEnabled = useCallback(
        (from: number, direction: 1 | -1) => {
            for (let step = 1; step <= options.length; step += 1) {
                const index = from + direction * step;
                if (index < 0 || index >= options.length) break;
                if (!options[index]?.disabled) return index;
            }
            return from >= 0 && from < options.length ? from : 0;
        },
        [options],
    );

    const openMenu = useCallback(() => {
        if (disabled) return;
        const currentIndex = options.findIndex((option) => option.value === current);
        setActiveIndex(currentIndex >= 0 ? currentIndex : nextEnabled(-1, 1));
        setOpen(true);
    }, [current, disabled, nextEnabled, options]);

    const select = useCallback(
        (next: string) => {
            if (!isControlled) setInternalValue(next);
            onChange?.(next);
            setOpen(false);
            triggerRef.current?.focus();
        },
        [isControlled, onChange],
    );

    // Keep the highlighted option scrolled into view as the user arrows through.
    useEffect(() => {
        if (!open) return;
        const node = listRef.current?.querySelector<HTMLElement>(`[data-index="${activeIndex}"]`);
        node?.scrollIntoView({ block: "nearest" });
    }, [open, activeIndex]);

    function onKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
        if (disabled) return;

        if (!open) {
            if (["ArrowDown", "ArrowUp", "Enter", " "].includes(event.key)) {
                event.preventDefault();
                openMenu();
            }
            return;
        }

        switch (event.key) {
            case "ArrowDown":
                event.preventDefault();
                setActiveIndex((index) => nextEnabled(index, 1));
                break;
            case "ArrowUp":
                event.preventDefault();
                setActiveIndex((index) => nextEnabled(index, -1));
                break;
            case "Home":
                event.preventDefault();
                setActiveIndex(nextEnabled(-1, 1));
                break;
            case "End":
                event.preventDefault();
                setActiveIndex(nextEnabled(options.length, -1));
                break;
            case "Enter":
            case " ": {
                event.preventDefault();
                const option = options[activeIndex];
                if (option && !option.disabled) select(option.value);
                break;
            }
            case "Tab":
                setOpen(false);
                break;
            default:
                break;
        }
    }

    return (
        <div className={cn("flex w-full flex-col", containerClassName)}>
            {label ? (
                <label
                    htmlFor={triggerId}
                    className="mb-0.5 text-xs leading-3 font-medium text-content-secondary"
                >
                    {label}
                </label>
            ) : null}

            <button
                ref={triggerRef}
                id={triggerId}
                type="button"
                role="combobox"
                aria-haspopup="listbox"
                aria-expanded={open}
                aria-controls={open ? listboxId : undefined}
                aria-activedescendant={
                    open && activeIndex >= 0 ? `${listboxId}-opt-${activeIndex}` : undefined
                }
                aria-label={ariaLabel}
                aria-invalid={error ? true : undefined}
                disabled={disabled}
                onClick={() => (open ? setOpen(false) : openMenu())}
                onKeyDown={onKeyDown}
                className={cn(
                    "flex h-11 w-full items-center justify-between gap-2 rounded-md px-3 text-left text-sm",
                    "border border-transparent bg-bg-secondary text-content-primary outline-none transition-colors",
                    "focus-visible:border-border-brand focus-visible:bg-bg-primary",
                    open && "border-border-brand bg-bg-primary",
                    "disabled:cursor-not-allowed disabled:opacity-60",
                    error && "border-content-negative",
                    className,
                )}
            >
                <span className={cn("truncate", !selectedOption && "text-content-tertiary")}>
                    {selectedOption?.label ?? placeholder ?? ""}
                </span>
                <ChevronDown
                    aria-hidden
                    className={cn(
                        "size-4 shrink-0 text-content-tertiary transition-transform",
                        open && "rotate-180",
                    )}
                />
            </button>

            {name ? <input type="hidden" name={name} value={current} /> : null}

            {error ? <p className="mt-1.5 text-xs text-content-negative">{error}</p> : null}

            <AnchoredPopover
                anchorRef={triggerRef}
                open={open}
                onClose={() => {
                    setOpen(false);
                    triggerRef.current?.focus();
                }}
                matchAnchorWidth
            >
                <div
                    ref={listRef}
                    role="listbox"
                    id={listboxId}
                    aria-label={label ?? ariaLabel}
                    className="scrollbar-thin max-h-64 overflow-y-auto py-1"
                >
                    {options.map((option, index) => {
                        const isSelected = option.value === current;
                        const isActive = index === activeIndex;

                        return (
                            <div
                                key={option.value}
                                id={`${listboxId}-opt-${index}`}
                                data-index={index}
                                role="option"
                                aria-selected={isSelected}
                                aria-disabled={option.disabled || undefined}
                                onMouseEnter={() => !option.disabled && setActiveIndex(index)}
                                onClick={() => {
                                    if (!option.disabled) select(option.value);
                                }}
                                className={cn(
                                    "flex cursor-pointer items-center justify-between gap-2 px-3 py-2 text-sm text-content-secondary",
                                    isActive && "bg-bg-secondary text-content-primary",
                                    isSelected && "font-medium text-content-primary",
                                    option.disabled &&
                                        "cursor-not-allowed text-content-disabled hover:bg-transparent",
                                )}
                            >
                                <span className="truncate">{option.label}</span>
                                {isSelected ? (
                                    <Check className="size-4 shrink-0 text-content-brand" />
                                ) : null}
                            </div>
                        );
                    })}
                </div>
            </AnchoredPopover>
        </div>
    );
}
