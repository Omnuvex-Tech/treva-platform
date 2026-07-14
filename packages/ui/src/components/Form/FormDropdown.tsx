"use client";

import { useState, useEffect, useRef } from "react";
import { cn } from "../../lib/utils";

interface FormDropdownProps {
    label: string;
    value: string;
    options: { id: string; label: string }[];
    placeholder?: string;
    onChange: (id: string) => void;
    required?: boolean;
    noOptionsLabel?: string;
    onNoOptionsClick?: () => void;
    onCreateClick?: () => void;
    createLabel?: string;
}

export function FormDropdown({
    label,
    value,
    options,
    placeholder = "Select...",
    onChange,
    required,
    noOptionsLabel,
    onNoOptionsClick,
    onCreateClick,
    createLabel,
}: FormDropdownProps) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const selected = options.find((o) => o.id === value);

    return (
        <div ref={ref} className="relative">
            <label className="mb-1.5 block text-xs font-medium text-[#4E525D]">
                {label}
                {required && <span style={{ color: "#F31100" }}>*</span>}
            </label>
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="flex h-11 w-full items-center justify-between rounded-2xl border border-[#E7E9EE] bg-[#F8F9FB] px-4 text-sm text-[#1A1A1A] outline-none transition-colors focus:border-[#C8CDD8] cursor-pointer"
            >
                <span className={cn("truncate text-left", selected ? "text-[#1A1A1A]" : "text-[#999]")}>
                    {selected?.label || placeholder}
                </span>
                <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    className={cn("transition-transform", open && "rotate-180")}
                >
                    <path d="M6 9l6 6 6-6" />
                </svg>
            </button>
            {open && (
                <div className="absolute left-0 top-full z-50 mt-2 w-full overflow-hidden rounded-2xl border border-[#E7E9EE] bg-white shadow-lg">
                    <button
                        type="button"
                        className="w-full px-4 py-2.5 text-left text-sm text-[#666666] hover:bg-gray-50 hover:text-[#1A1A1A]"
                        onClick={() => {
                            onChange("");
                            setOpen(false);
                        }}
                    >
                        -- None
                    </button>
                    {options.map((opt) => (
                        <button
                            key={opt.id}
                            type="button"
                            className={cn(
                                "flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-sm transition-colors",
                                value === opt.id
                                    ? "bg-[#4E525D]/10 text-[#1A1A1A] font-medium"
                                    : "text-[#666666] hover:bg-gray-50 hover:text-[#1A1A1A]"
                            )}
                            onClick={() => {
                                onChange(opt.id);
                                setOpen(false);
                            }}
                        >
                            <span>{opt.label}</span>
                            {value === opt.id ? (
                                <span className="text-xs font-semibold text-[#4E525D]">Selected</span>
                            ) : null}
                        </button>
                    ))}
                    {options.length === 0 && ((onNoOptionsClick && noOptionsLabel) || onCreateClick) && (
                        <button
                            type="button"
                            className="w-full px-4 py-2.5 text-left text-sm font-medium text-[#4E525D] transition-colors hover:bg-gray-50 hover:text-[#1A1A1A] cursor-pointer"
                            onClick={() => {
                                if (onNoOptionsClick) onNoOptionsClick();
                                else if (onCreateClick) onCreateClick();
                                setOpen(false);
                            }}
                        >
                            {noOptionsLabel || createLabel || "Create"}
                        </button>
                    )}
                    {options.length === 0 && !noOptionsLabel && !onCreateClick && (
                        <div className="px-4 py-2.5 text-sm text-[#999]">
                            No options
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
