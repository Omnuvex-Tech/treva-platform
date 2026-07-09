import { type InputHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

interface FormTextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange"> {
    label: string;
    value: string;
    onChange: (value: string) => void;
    required?: boolean;
}

export function FormTextField({
    label,
    value,
    onChange,
    required,
    placeholder,
    className,
    ...props
}: FormTextFieldProps) {
    return (
        <div className="flex flex-col">
            <label
                className="mb-1 block text-xs font-semibold text-[#333333]"
                style={{ lineHeight: "18px" }}
            >
                {label}
                {required && <span style={{ color: "#F31100" }}>*</span>}
            </label>
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className={cn(
                    "w-full h-[36px] rounded-xl border border-[#CCCCCC] bg-white px-4 text-[14px] font-normal text-[#333333] placeholder-[#666666] outline-none focus:border-[#4A4E5A] transition-colors",
                    className
                )}
                style={{ lineHeight: "20px" }}
                {...props}
            />
        </div>
    );
}
