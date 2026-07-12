import { useState, useEffect, useCallback, useRef } from "react";

interface UseFormDraftOptions<T> {
    key: string;
    initialState: T;
    enabled?: boolean;
}

interface UseFormDraftReturn<T> {
    state: T;
    setState: React.Dispatch<React.SetStateAction<T>>;
    clearDraft: () => void;
}

const DEBOUNCE_MS = 500;

export function useFormDraft<T extends Record<string, unknown>>({
    key,
    initialState,
    enabled = true,
}: UseFormDraftOptions<T>): UseFormDraftReturn<T> {
    const [state, setState] = useState<T>(() => {
        if (!enabled) return initialState;
        try {
            const saved = localStorage.getItem(key);
            if (saved) {
                const parsed = JSON.parse(saved);
                return { ...initialState, ...parsed };
            }
        } catch {
            // ignore parse errors
        }
        return initialState;
    });

    const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isInitialMount = useRef(true);

    useEffect(() => {
        if (!enabled) return;

        // Skip the first render — we already restored from localStorage in the initializer
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }

        if (saveTimerRef.current) clearTimeout(saveTimerRef.current);

        saveTimerRef.current = setTimeout(() => {
            try {
                localStorage.setItem(key, JSON.stringify(state));
            } catch {
                // ignore quota errors
            }
        }, DEBOUNCE_MS);

        return () => {
            if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
        };
    }, [state, key, enabled]);

    const clearDraft = useCallback(() => {
        try {
            localStorage.removeItem(key);
        } catch {
            // ignore
        }
    }, [key]);

    return { state, setState, clearDraft };
}
