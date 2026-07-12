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
            <label
                className="mb-1 block text-xs font-semibold text-[#333333]"
                style={{ lineHeight: "18px" }}
            >
                {label}
                {required && <span style={{ color: "#F31100" }}>*</span>}
            </label>
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="flex w-full items-center justify-between rounded-xl border border-gray-200 bg-[#F4F5F6] px-4 h-10 text-sm text-[#1A1A1A] placeholder-[#999] focus:bg-white focus:border-gray-400 focus:outline-none cursor-pointer"
                style={{ lineHeight: "20px" }}
            >
                <span className={selected ? "text-[#1A1A1A]" : "text-[#999]"}>
                    {selected?.label || placeholder}
                </span>
                <img
                    src="/images/inv-dashboard/inv-offplan/arrow.svg"
                    alt=""
                    className={cn("transition-transform", open && "rotate-180")}
                />
            </button>
            {open && (
                <div className="absolute left-0 top-full z-50 mt-1 w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
                    {onCreateClick && (
                        <>
                            <button
                                type="button"
                                className="w-full px-4 py-2.5 text-left text-sm font-medium text-[#4E525D] hover:bg-gray-50 transition-colors cursor-pointer"
                                style={{ lineHeight: "20px" }}
                                onClick={() => {
                                    onCreateClick();
                                    setOpen(false);
                                }}
                            >
                                {createLabel || "+ Create new"}
                            </button>
                            <div className="h-px bg-gray-100" />
                        </>
                    )}
                    {options.map((opt) => (
                        <button
                            key={opt.id}
                            type="button"
                            className={cn(
                                "w-full px-4 py-2.5 text-left text-sm font-normal transition-colors",
                                value === opt.id
                                    ? "bg-[#4E525D]/10 text-[#1A1A1A] font-medium"
                                    : "text-[#1A1A1A] hover:bg-gray-50"
                            )}
                            style={{ lineHeight: "20px" }}
                            onClick={() => {
                                onChange(opt.id);
                                setOpen(false);
                            }}
                        >
                            {opt.label}
                        </button>
                    ))}
                    {options.length === 0 && noOptionsLabel && onNoOptionsClick && (
                        <button
                            type="button"
                            className="w-full px-4 py-2.5 text-left text-sm font-normal text-[#1A1A1A] hover:bg-gray-50 transition-colors cursor-pointer"
                            style={{ lineHeight: "20px" }}
                            onClick={() => {
                                onNoOptionsClick();
                                setOpen(false);
                            }}
                        >
                            {noOptionsLabel}
                        </button>
                    )}
                    {options.length === 0 && !noOptionsLabel && (
                        <div className="px-4 py-2.5 text-sm text-[#999]" style={{ lineHeight: "20px" }}>
                            No options
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
