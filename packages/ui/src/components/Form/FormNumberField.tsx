import { type InputHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

interface FormNumberFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange" | "type"> {
    label: string;
    value: number | string;
    onChange: (value: number) => void;
    required?: boolean;
}

export function FormNumberField({
    label,
    value,
    onChange,
    required,
    placeholder,
    className,
    ...props
}: FormNumberFieldProps) {
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
                type="number"
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
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
