"use client";

import { X } from "lucide-react";
import { useEffect, useRef, type ReactNode, type SVGProps } from "react";

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
    /**
     * `panel` is the chrome-heavy form — a ruled header, a scrolling body and a
     * ruled footer. `plain` is the one the file's own Modal component draws
     * (873:49824): 20px of padding, a 16px gap between blocks, and no rules at
     * all. Use `plain` for anything traced from an artboard; `panel` predates
     * it and stays the default so existing dialogs are untouched.
     */
    variant?: "panel" | "plain";
    /** Accessible name of the close control. Pass the translated string. */
    closeLabel?: string;
    className?: string;
}

/**
 * The `remove` glyph the artboard's close control uses (I873:49830;4104:33757),
 * inlined from its own export. It is a filled X, not a stroked one — lucide's
 * `X` is drawn as two 2px strokes and reads noticeably lighter at the 10px the
 * design sets it at, so the `plain` header keeps the exported geometry.
 */
function CloseGlyph(props: SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 9.98529 9.98532" fill="none" aria-hidden focusable="false" {...props}>
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M8.70496 9.76561C8.99785 10.0585 9.47273 10.0585 9.76562 9.76561C10.0585 9.47272 10.0585 8.99784 9.76562 8.70495L6.05333 4.99266L9.76561 1.28037C10.0585 0.987481 10.0585 0.512607 9.76561 0.219714C9.47272 -0.0731792 8.99784 -0.0731792 8.70495 0.219714L4.99267 3.932L1.28034 0.21967C0.987445 -0.0732235 0.512572 -0.0732232 0.219679 0.21967C-0.0732144 0.512563 -0.0732148 0.987437 0.219679 1.28033L3.93201 4.99266L0.21967 8.705C-0.0732235 8.99789 -0.0732232 9.47276 0.21967 9.76566C0.512563 10.0585 0.987437 10.0585 1.28033 9.76566L4.99267 6.05332L8.70496 9.76561Z"
                fill="currentColor"
            />
        </svg>
    );
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
    variant = "panel",
    closeLabel = "Close",
    className,
}: ModalProps) {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const isPlain = variant === "plain";

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
                "m-auto w-[calc(100vw-2rem)] bg-bg-primary text-content-primary",
                isPlain
                    ? // The scroll cap is not in the artboard — that one is a
                      // fixed 359px box. It only ever engages on a viewport
                      // shorter than the dialog, where the alternative is a
                      // modal whose bottom cannot be reached at all.
                      "scrollbar-thin max-h-[calc(100dvh-4rem)] overflow-y-auto rounded-md p-5 shadow-l1"
                    : "rounded-lg p-0 shadow-l7",
                sizeClasses[size],
                className,
            )}
            onClick={(event) => {
                // A click on the dialog element itself (not its content box) is
                // a backdrop click — ::backdrop cannot receive its own handler.
                if (event.target === dialogRef.current) onClose();
            }}
        >
            {isPlain ? (
                <div className="flex flex-col gap-4">
                    {/* The head row is 32px tall because the close control is,
                        and the 20px title centres against it. */}
                    <div className="flex items-center gap-2">
                        <h2
                            id="modal-title"
                            className="min-w-0 flex-1 text-base font-bold text-content-secondary"
                        >
                            {title}
                        </h2>

                        <button
                            type="button"
                            onClick={onClose}
                            aria-label={closeLabel}
                            className="flex h-8 w-6 shrink-0 cursor-pointer items-center justify-center rounded-md text-content-brand transition-colors hover:text-content-primary"
                        >
                            <CloseGlyph className="size-2.5" />
                        </button>
                    </div>

                    {description ? (
                        <p className="text-xs text-content-tertiary">{description}</p>
                    ) : null}

                    {children}

                    {footer ? (
                        <div className="flex items-center justify-end gap-2">{footer}</div>
                    ) : null}
                </div>
            ) : (
                <>
                    <div className="flex items-start justify-between gap-4 border-b border-border-subtle px-5 py-4">
                        <div className="min-w-0">
                            <h2
                                id="modal-title"
                                className="text-base font-semibold text-content-primary"
                            >
                                {title}
                            </h2>
                            {description ? (
                                <p className="mt-0.5 text-xs text-content-tertiary">
                                    {description}
                                </p>
                            ) : null}
                        </div>

                        <Button
                            variant="ghost"
                            size="iconSm"
                            onClick={onClose}
                            aria-label={closeLabel}
                        >
                            <X />
                        </Button>
                    </div>

                    <div className="scrollbar-thin max-h-[70vh] overflow-y-auto px-5 py-4">
                        {children}
                    </div>

                    {footer ? (
                        <div className="flex items-center justify-end gap-2 border-t border-border-subtle px-5 py-4">
                            {footer}
                        </div>
                    ) : null}
                </>
            )}
        </dialog>
    );
}
