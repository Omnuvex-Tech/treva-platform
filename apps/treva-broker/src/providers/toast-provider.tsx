"use client";

import { Alert02Icon, Cancel01Icon, Tick02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
    type ReactNode,
} from "react";

import { cn } from "@/lib/utils/cn";

type ToastTone = "success" | "error";

interface Toast {
    id: number;
    tone: ToastTone;
    message: string;
}

interface ToastContextValue {
    success: (message: string) => void;
    error: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const DISMISS_AFTER = 4000;

/**
 * The confirmation banner that appears under the app header after a successful
 * action — "User Successfully Added" (937:11623).
 *
 * Measured off that artboard: a 370x52 grey slab flush to the right edge at
 * y79, so it hangs off the header's rule rather than floating inside the page.
 * No radius and no border — what reads as an outline is a 14px coloured bar
 * parked 12px below the bottom edge, of which 2px survives the clip. Inside,
 * the tone is carried by a 28px halo around a 20px filled disc, not by the text.
 *
 * Deliberately tiny otherwise: one queue, two tones, auto-dismiss plus a close
 * button. Anything more (actions inside a toast, promise integration) can be
 * added when a screen actually needs it.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const dismiss = useCallback((id: number) => {
        setToasts((current) => current.filter((toast) => toast.id !== id));
    }, []);

    const push = useCallback(
        (tone: ToastTone, message: string) => {
            // Date.now() collides when two toasts land in the same millisecond,
            // which duplicate-keys the list; a counter cannot.
            const id = nextId();
            setToasts((current) => [...current, { id, tone, message }]);
            setTimeout(() => dismiss(id), DISMISS_AFTER);
        },
        [dismiss],
    );

    const value = useMemo<ToastContextValue>(
        () => ({
            success: (message) => push("success", message),
            error: (message) => push("error", message),
        }),
        [push],
    );

    return (
        <ToastContext.Provider value={value}>
            {children}

            <div
                aria-live="polite"
                className="pointer-events-none fixed top-20 right-0 z-50 flex flex-col gap-2"
            >
                {toasts.map((toast) => {
                    const positive = toast.tone === "success";

                    return (
                        <div
                            key={toast.id}
                            className="pointer-events-auto relative flex w-[370px] items-center gap-4 overflow-hidden bg-bg-secondary p-3"
                        >
                            {/* 937:11626 — a 28px halo, its disc inset 4. */}
                            <span
                                className={cn(
                                    "flex size-7 shrink-0 items-center justify-center rounded-pill",
                                    positive ? "bg-bg-positive-subtle" : "bg-bg-negative-subtle",
                                )}
                            >
                                <span
                                    className={cn(
                                        "flex size-5 items-center justify-center rounded-pill text-content-inverse",
                                        positive
                                            ? "bg-content-positive"
                                            : "bg-content-negative",
                                    )}
                                >
                                    <HugeiconsIcon
                                        icon={positive ? Tick02Icon : Alert02Icon}
                                        size={16}
                                        strokeWidth={2}
                                    />
                                </span>
                            </span>

                            <p className="flex-1 text-sm tracking-[0.25px] text-content-tertiary">
                                {toast.message}
                            </p>

                            <button
                                type="button"
                                onClick={() => dismiss(toast.id)}
                                aria-label="Dismiss"
                                className="flex size-5 shrink-0 items-center justify-center rounded-sm text-content-tertiary transition-colors hover:text-content-primary"
                            >
                                <HugeiconsIcon icon={Cancel01Icon} size={20} strokeWidth={1.8} />
                            </button>

                            {/* 937:11631 — the bar is 14 tall and sits 12 past
                                the bottom edge, so the clip leaves the 2px rule
                                the artboard shows. */}
                            <span
                                aria-hidden
                                className={cn(
                                    "absolute -inset-x-5 -bottom-3 h-3.5 rounded-[10px]",
                                    positive ? "bg-content-positive" : "bg-content-negative",
                                )}
                            />
                        </div>
                    );
                })}
            </div>
        </ToastContext.Provider>
    );
}

let counter = 0;
function nextId(): number {
    counter += 1;
    return counter;
}

export function useToast(): ToastContextValue {
    const context = useContext(ToastContext);

    if (!context) {
        throw new Error("useToast must be used inside a ToastProvider (dashboard layout).");
    }

    return context;
}
