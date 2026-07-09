import { type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "../../lib/utils";

interface FormAddButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    icon?: ReactNode;
    children: ReactNode;
}

export function FormAddButton({
    icon,
    className,
    children,
    ...props
}: FormAddButtonProps) {
    return (
        <button
            className={cn(
                "flex items-center justify-center gap-2 h-[44px] bg-[#4E525D] border border-white rounded-[16px] py-2 px-3.5 text-[13px] font-medium text-white hover:bg-[#3D404A] transition-colors cursor-pointer",
                className
            )}
            style={{ lineHeight: "20px", letterSpacing: "0px" }}
            {...props}
        >
            {icon}
            <span>{children}</span>
        </button>
    );
}
