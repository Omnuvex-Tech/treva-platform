import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

const buttonVariants = cva(
    [
        "inline-flex items-center justify-center gap-2 whitespace-nowrap",
        "font-medium transition-colors duration-150",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-brand",
        "disabled:pointer-events-none disabled:opacity-50",
        "[&_svg]:shrink-0",
    ],
    {
        variants: {
            variant: {
                /** Dark pill — "Sign in to dashboard", "Add news", "Edit". */
                primary: "bg-bg-brand text-content-inverse hover:bg-content-brand-bold",
                /** Light grey fill on white surfaces — secondary table actions. */
                secondary: "bg-bg-secondary text-content-primary hover:bg-bg-tertiary",
                outline:
                    "border border-border-subtle bg-bg-primary text-content-primary hover:bg-bg-secondary",
                ghost: "text-content-secondary hover:bg-bg-secondary hover:text-content-primary",
                danger: "bg-content-negative text-content-inverse hover:brightness-95",
                link: "text-content-link underline-offset-4 hover:underline",
            },
            size: {
                sm: "h-8 rounded-s px-3 text-xs [&_svg]:size-3.5",
                md: "h-10 rounded-md px-4 text-sm [&_svg]:size-4",
                lg: "h-11 rounded-md px-5 text-sm [&_svg]:size-4",
                /** Square icon-only buttons in the app header (44x44 in Figma). */
                icon: "size-11 rounded-md [&_svg]:size-4",
                iconSm: "size-8 rounded-s [&_svg]:size-3.5",
            },
            pill: {
                true: "rounded-pill",
                false: "",
            },
            block: {
                true: "w-full",
                false: "",
            },
        },
        defaultVariants: {
            variant: "primary",
            size: "md",
            pill: false,
            block: false,
        },
    },
);

export interface ButtonProps
    extends ButtonHTMLAttributes<HTMLButtonElement>,
        VariantProps<typeof buttonVariants> {
    leadingIcon?: ReactNode;
    trailingIcon?: ReactNode;
    /** Renders a spinner and blocks interaction without changing the width. */
    loading?: boolean;
}

export function Button({
    className,
    variant,
    size,
    pill,
    block,
    leadingIcon,
    trailingIcon,
    loading = false,
    disabled,
    children,
    type = "button",
    ...props
}: ButtonProps) {
    return (
        <button
            type={type}
            className={cn(buttonVariants({ variant, size, pill, block }), className)}
            disabled={disabled || loading}
            aria-busy={loading || undefined}
            {...props}
        >
            {loading ? <Spinner /> : leadingIcon}
            {children}
            {loading ? null : trailingIcon}
        </button>
    );
}

function Spinner() {
    return (
        <span
            aria-hidden
            className="size-4 animate-spin rounded-pill border-2 border-current border-t-transparent"
        />
    );
}

export { buttonVariants };
