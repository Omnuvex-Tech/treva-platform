"use client";

import { X } from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";

import { cn } from "@/lib/utils/cn";
import { Button } from "./button";

export interface ModalProps {
    open: boolean;
    onClose: () => void;
    title: string;
    description?: string;
    children: ReactNode;
    footer?: ReactNode;
    size?: "sm" | "md" | "lg";
    className?: string;
}

const sizeClasses: Record<NonNullable<ModalProps["size"]>, string> = {
    sm: "max-w-md",
    md: "max-w-2xl",
    lg: "max-w-4xl",
};

/**
 * Built on `<dialog>` rather than a portal + manual focus trap.
 *
 * `showModal()` gives focus trapping, inertness of the background, Escape
 * handling and the top-layer stacking context for free — all the parts a
 * hand-rolled modal usually gets subtly wrong.
 */
export function Modal({
    open,
    onClose,
    title,
    description,
    children,
    footer,
    size = "md",
    className,
}: ModalProps) {
    const dialogRef = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;

        if (open && !dialog.open) {
            dialog.showModal();
        } else if (!open && dialog.open) {
            dialog.close();
        }
    }, [open]);

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;

        // Fires for Escape and for form[method=dialog] submits, so the parent
        // state stays in sync with closures the component did not initiate.
        const handleClose = () => onClose();
        dialog.addEventListener("close", handleClose);

        return () => dialog.removeEventListener("close", handleClose);
    }, [onClose]);

    return (
        <dialog
            ref={dialogRef}
            aria-labelledby="modal-title"
            className={cn(
                "m-auto w-[calc(100vw-2rem)] rounded-lg bg-bg-primary p-0 text-content-primary shadow-l7",
                sizeClasses[size],
                className,
            )}
            onClick={(event) => {
                // A click on the dialog element itself (not its content box) is
                // a backdrop click — ::backdrop cannot receive its own handler.
                if (event.target === dialogRef.current) onClose();
            }}
        >
            <div className="flex items-start justify-between gap-4 border-b border-border-subtle px-5 py-4">
                <div className="min-w-0">
                    <h2 id="modal-title" className="text-base font-semibold text-content-primary">
                        {title}
                    </h2>
                    {description ? (
                        <p className="mt-0.5 text-xs text-content-tertiary">{description}</p>
                    ) : null}
                </div>

                <Button variant="ghost" size="iconSm" onClick={onClose} aria-label="Close">
                    <X />
                </Button>
            </div>

            <div className="scrollbar-thin max-h-[70vh] overflow-y-auto px-5 py-4">{children}</div>

            {footer ? (
                <div className="flex items-center justify-end gap-2 border-t border-border-subtle px-5 py-4">
                    {footer}
                </div>
            ) : null}
        </dialog>
    );
}
