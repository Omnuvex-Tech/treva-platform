"use client";

import { Alert02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { cn } from "@/lib/utils/cn";
import { useI18n } from "@/providers/i18n-provider";

export interface ConfirmDialogProps {
    open: boolean;
    title: string;
    /** What will happen, in the user's terms. Keep it one or two sentences. */
    description?: string;
    /** The thing being acted on — rendered verbatim so the user can check it. */
    subject?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    /** `danger` is the destructive default; `neutral` for reversible actions. */
    tone?: "danger" | "neutral";
    loading?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

/**
 * The confirmation dialog that replaces `window.confirm`.
 *
 * No artboard exists for it — the Figma file has form modals but no
 * confirmation — so rather than invent a new visual language this reuses the
 * modal anatomy the file does define: a header row with the title and a 24x32
 * close control, a body, and a right-aligned action row of 36px buttons. The
 * width is the one judgement call; the file's narrowest modal is 600, which is
 * too wide for two lines of text, so this sits at 480.
 *
 * Built on the `Modal` primitive, so it inherits `<dialog>`'s focus trap,
 * Escape handling and backdrop — the things a hand-rolled confirm gets wrong.
 */
export function ConfirmDialog({
    open,
    title,
    description,
    subject,
    confirmLabel,
    cancelLabel,
    tone = "danger",
    loading = false,
    onConfirm,
    onCancel,
}: ConfirmDialogProps) {
    const { t } = useI18n();

    return (
        <Modal
            open={open}
            onClose={onCancel}
            title={title}
            size="sm"
            className="max-w-120"
            footer={
                <>
                    <Button variant="outline" size="sm" onClick={onCancel} disabled={loading}>
                        {cancelLabel ?? t.common.cancel}
                    </Button>

                    <Button
                        variant={tone === "danger" ? "danger" : "primary"}
                        size="sm"
                        onClick={onConfirm}
                        loading={loading}
                    >
                        {confirmLabel ?? t.common.delete}
                    </Button>
                </>
            }
        >
            <div className="flex gap-3">
                <span
                    className={cn(
                        "flex size-9 shrink-0 items-center justify-center rounded-pill",
                        tone === "danger"
                            ? "bg-bg-negative-subtle text-content-negative"
                            : "bg-bg-secondary text-content-secondary",
                    )}
                >
                    <HugeiconsIcon icon={Alert02Icon} size={18} strokeWidth={1.8} />
                </span>

                <div className="min-w-0 space-y-1">
                    {description ? (
                        <p className="text-sm text-content-secondary">{description}</p>
                    ) : null}

                    {subject ? (
                        <p className="truncate text-sm font-medium text-content-primary">
                            {subject}
                        </p>
                    ) : null}
                </div>
            </div>
        </Modal>
    );
}
