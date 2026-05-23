import type { ElementType, ReactNode } from "react";
import "./page-container.css";

type PageContainerProps<T extends ElementType = "div"> = {
    as?: T;
    children: ReactNode;
    className?: string;
};

export default function PageContainer<T extends ElementType = "div">({
    as,
    children,
    className = "",
}: PageContainerProps<T>) {
    const Component = as ?? "div";
    const classes = className
        ? `page-container ${className}`
        : "page-container";

    return <Component className={classes}>{children}</Component>;
}
