import { type TextareaHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

interface FormTextAreaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "onChange"> {
    label: string;
    value: string;
    onChange: (value: string) => void;
    required?: boolean;
    rows?: number;
}

export function FormTextArea({
    label,
    value,
    onChange,
    required,
    placeholder,
    rows = 4,
    className,
    ...props
}: FormTextAreaProps) {
    return (
        <div className="flex flex-col">
            <label
                className="mb-1 block text-xs font-semibold text-[#333333]"
                style={{ lineHeight: "18px" }}
            >
                {label}
                {required && <span style={{ color: "#F31100" }}>*</span>}
            </label>
            <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                rows={rows}
                className={cn(
                    "w-full rounded-xl border border-gray-200 bg-[#F4F5F6] px-4 py-3 text-sm text-[#1A1A1A] placeholder-[#999] outline-none focus:bg-white focus:border-gray-400 transition-colors resize-none",
                    className
                )}
                style={{ lineHeight: "20px" }}
                {...props}
            />
        </div>
    );
}
