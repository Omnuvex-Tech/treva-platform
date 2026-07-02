import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";
import "./page-container.css";

type PageContainerProps<T extends ElementType = "div"> = {
    as?: T;
    children: ReactNode;
    className?: string;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "children" | "className">;

export default function PageContainer<T extends ElementType = "div">({
    as,
    children,
    className = "",
    ...restProps
}: PageContainerProps<T>) {
    const Component = as ?? "div";
    const classes = className
        ? `page-container ${className}`
        : "page-container";

    return <Component className={classes} {...restProps}>{children}</Component>;
}
