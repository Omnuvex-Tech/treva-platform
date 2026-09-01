"use client";

import { CheckmarkCircle02Icon, Alert02Icon, Cancel01Icon } from "@hugeicons/core-free-icons";
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
 * action — "User Successfully Added" in the Users artboard.
 *
 * Deliberately tiny: one queue, two tones, auto-dismiss plus a close button.
 * Anything more (actions inside a toast, promise integration) can be added when
 * a screen actually needs it.
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
                className="pointer-events-none fixed top-22 right-6 z-50 flex flex-col gap-2"
            >
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className={cn(
                            "pointer-events-auto flex items-center gap-2.5 rounded-md border bg-bg-primary py-2.5 pr-2.5 pl-3 shadow-l7",
                            toast.tone === "success"
                                ? "border-content-positive"
                                : "border-content-negative",
                        )}
                    >
                        <HugeiconsIcon
                            icon={toast.tone === "success" ? CheckmarkCircle02Icon : Alert02Icon}
                            size={18}
                            strokeWidth={1.8}
                            className={
                                toast.tone === "success"
                                    ? "text-content-positive"
                                    : "text-content-negative"
                            }
                        />

                        <p className="text-sm text-content-primary">{toast.message}</p>

                        <button
                            type="button"
                            onClick={() => dismiss(toast.id)}
                            aria-label="Dismiss"
                            className="ml-2 flex size-6 items-center justify-center rounded-s text-content-tertiary transition-colors hover:bg-bg-secondary hover:text-content-primary"
                        >
                            <HugeiconsIcon icon={Cancel01Icon} size={14} strokeWidth={1.8} />
                        </button>
                    </div>
                ))}
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
