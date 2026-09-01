"use client";

import {
    useCallback,
    useEffect,
    useRef,
    useState,
    type ReactNode,
    type RefObject,
} from "react";
import { createPortal } from "react-dom";

import { cn } from "@/lib/utils/cn";

export interface AnchoredPopoverProps {
    anchorRef: RefObject<HTMLElement | null>;
    open: boolean;
    onClose: () => void;
    children: ReactNode;
    className?: string;
    /** Stretch the panel to the anchor's width — the select does this. */
    matchAnchorWidth?: boolean;
    /** Gap between the anchor and the panel, in px. */
    gap?: number;
}

interface Position {
    left: number;
    top: number;
    width?: number;
    placement: "bottom" | "top";
}

/**
 * A floating panel anchored to a trigger element.
 *
 * Rendered in a portal with fixed positioning so it is never clipped by a card
 * or by `main`'s scroll container, flips above the anchor when there is no room
 * below, and dismisses on an outside pointer press or Escape. Both the custom
 * select and the date picker sit on this so their open/placement/dismiss
 * behaviour stays identical.
 */
export function AnchoredPopover({
    anchorRef,
    open,
    onClose,
    children,
    className,
    matchAnchorWidth = false,
    gap = 6,
}: AnchoredPopoverProps) {
    const panelRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState<Position | null>(null);

    const measure = useCallback(() => {
        const anchor = anchorRef.current;
        if (!anchor) return;

        const rect = anchor.getBoundingClientRect();
        const panelHeight = panelRef.current?.offsetHeight ?? 0;
        const panelWidth = matchAnchorWidth
            ? rect.width
            : (panelRef.current?.offsetWidth ?? 0);

        const spaceBelow = window.innerHeight - rect.bottom;
        const placement: Position["placement"] =
            spaceBelow < panelHeight + gap && rect.top > spaceBelow ? "top" : "bottom";

        const maxLeft = window.innerWidth - panelWidth - 8;

        setPosition({
            left: Math.max(8, Math.min(rect.left, maxLeft)),
            top:
                placement === "bottom"
                    ? rect.bottom + gap
                    : Math.max(8, rect.top - gap - panelHeight),
            width: matchAnchorWidth ? rect.width : undefined,
            placement,
        });
    }, [anchorRef, gap, matchAnchorWidth]);

    useEffect(() => {
        if (!open) {
            setPosition(null);
            return;
        }

        measure();
        // Second pass once the panel has painted and its size is known.
        const raf = requestAnimationFrame(measure);

        const reflow = () => measure();
        window.addEventListener("scroll", reflow, true);
        window.addEventListener("resize", reflow);

        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener("scroll", reflow, true);
            window.removeEventListener("resize", reflow);
        };
    }, [open, measure]);

    useEffect(() => {
        if (!open) return;

        const onPointerDown = (event: PointerEvent) => {
            const target = event.target as Node | null;
            if (!target) return;
            if (anchorRef.current?.contains(target) || panelRef.current?.contains(target)) return;
            onClose();
        };

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                event.stopPropagation();
                onClose();
            }
        };

        document.addEventListener("pointerdown", onPointerDown, true);
        document.addEventListener("keydown", onKeyDown, true);

        return () => {
            document.removeEventListener("pointerdown", onPointerDown, true);
            document.removeEventListener("keydown", onKeyDown, true);
        };
    }, [open, onClose, anchorRef]);

    if (!open || typeof document === "undefined") return null;

    return createPortal(
        <div
            ref={panelRef}
            data-placement={position?.placement}
            style={{
                position: "fixed",
                left: position?.left ?? 0,
                top: position?.top ?? 0,
                width: position?.width,
                visibility: position ? "visible" : "hidden",
            }}
            className={cn(
                "z-50 rounded-md border border-border-subtle bg-bg-primary shadow-l2",
                className,
            )}
        >
            {children}
        </div>,
        document.body,
    );
}
