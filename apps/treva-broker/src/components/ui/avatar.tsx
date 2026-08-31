import Image from "next/image";

import { cn } from "@/lib/utils/cn";
import { initials } from "@/lib/utils/format";

export interface AvatarProps {
    name: string;
    src?: string | null;
    size?: "sm" | "md" | "lg";
    className?: string;
}

const sizeClasses: Record<NonNullable<AvatarProps["size"]>, string> = {
    sm: "size-8 text-2xs",
    md: "size-10 text-xs",
    lg: "size-12 text-sm",
};

const sizePx: Record<NonNullable<AvatarProps["size"]>, number> = {
    sm: 32,
    md: 40,
    lg: 48,
};

export function Avatar({ name, src, size = "md", className }: AvatarProps) {
    return (
        <span
            className={cn(
                "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-pill bg-bg-tertiary font-semibold text-content-secondary",
                sizeClasses[size],
                className,
            )}
        >
            {src ? (
                <Image
                    src={src}
                    alt={name}
                    width={sizePx[size]}
                    height={sizePx[size]}
                    className="size-full object-cover"
                />
            ) : (
                <span aria-hidden>{initials(name)}</span>
            )}
        </span>
    );
}
