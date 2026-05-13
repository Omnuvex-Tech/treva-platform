import type { ElementType, ReactNode } from "react";
import "./container.css";

type ContainerProps<T extends ElementType = "div"> = {
    as?: T;
    children: ReactNode;
    className?: string;
};

export default function Container<T extends ElementType = "div">({
    as,
    children,
    className = "",
}: ContainerProps<T>) {
    const Component = as ?? "div";
    const classes = className ? `container ${className}` : "container";

    return <Component className={classes}>{children}</Component>;
}
