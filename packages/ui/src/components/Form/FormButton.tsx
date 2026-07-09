import { type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "../../lib/utils";

interface FormButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "ghost";
    loading?: boolean;
    children: ReactNode;
}

const variantStyles = {
    primary: "bg-[#43464E] hover:bg-[#33363D] text-white",
    secondary: "border border-gray-200 bg-white text-[#666666] hover:bg-gray-50",
    ghost: "bg-transparent text-[#666666] hover:bg-gray-100",
};

export function FormButton({
    variant = "primary",
    loading = false,
    disabled,
    className,
    children,
    ...props
}: FormButtonProps) {
    return (
        <button
            disabled={disabled || loading}
            className={cn(
                "inline-flex items-center justify-center rounded-[27px] px-5 h-[52px] text-[16px] font-medium transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer",
                variantStyles[variant],
                className
            )}
            style={{ lineHeight: "20px" }}
            {...props}
        >
            {loading ? "Loading..." : children}
        </button>
    );
}
