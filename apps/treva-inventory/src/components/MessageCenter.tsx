import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
    type ReactNode,
} from "react";

type MessageVariant = "success" | "error";

interface MessageItem {
    id: string;
    title: string;
    description?: string;
    variant: MessageVariant;
    duration: number;
}

interface ShowMessageInput {
    title: string;
    description?: string;
    duration?: number;
}

interface MessageCenterContextValue {
    showSuccess: (input: ShowMessageInput) => void;
    showError: (input: ShowMessageInput) => void;
    dismissMessage: (id: string) => void;
}

const MessageCenterContext = createContext<MessageCenterContextValue | null>(null);

function createMessageId() {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function MessageViewport({
    messages,
    onDismiss,
}: {
    messages: MessageItem[];
    onDismiss: (id: string) => void;
}) {
    return (
        <div className="pointer-events-none fixed right-6 top-6 z-[120] flex w-[min(380px,calc(100vw-32px))] flex-col gap-3">
            {messages.map((message) => (
                <div
                    key={message.id}
                    className={`message-toast pointer-events-auto overflow-hidden rounded-[22px] border bg-white/95 shadow-[0_24px_60px_rgba(15,23,42,0.16)] backdrop-blur-xl ${
                        message.variant === "success"
                            ? "border-emerald-100"
                            : "border-rose-100"
                    }`}
                    role="status"
                    aria-live="polite"
                >
                    <div className="flex items-start gap-3 px-4 py-4">
                        <div
                            className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${
                                message.variant === "success"
                                    ? "bg-emerald-50 text-emerald-600"
                                    : "bg-rose-50 text-rose-600"
                            }`}
                        >
                            {message.variant === "success" ? (
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    className="h-5 w-5"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="m5 13 4 4L19 7"
                                    />
                                </svg>
                            ) : (
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    className="h-5 w-5"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M12 9v4"
                                    />
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M12 17h.01"
                                    />
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"
                                    />
                                </svg>
                            )}
                        </div>

                        <div className="min-w-0 flex-1">
                            <p className="text-[14px] font-semibold leading-5 text-[#111827]">
                                {message.title}
                            </p>
                            {message.description ? (
                                <p className="mt-1 text-[13px] leading-5 text-[#6B7280]">
                                    {message.description}
                                </p>
                            ) : null}
                        </div>

                        <button
                            type="button"
                            onClick={() => onDismiss(message.id)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-xl text-[#9CA3AF] transition-colors hover:bg-black/5 hover:text-[#4B5563]"
                            aria-label="Dismiss message"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                className="h-4 w-4"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="m18 6-12 12M6 6l12 12"
                                />
                            </svg>
                        </button>
                    </div>

                    <div className="h-[3px] bg-black/[0.04]">
                        <div
                            className={`message-toast__progress h-full ${
                                message.variant === "success"
                                    ? "bg-emerald-500"
                                    : "bg-rose-500"
                            }`}
                            style={{ animationDuration: `${message.duration}ms` }}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
}

export function MessageCenterProvider({ children }: { children: ReactNode }) {
    const [messages, setMessages] = useState<MessageItem[]>([]);

    const dismissMessage = useCallback((id: string) => {
        setMessages((current) => current.filter((item) => item.id !== id));
    }, []);

    const pushMessage = useCallback(
        (variant: MessageVariant, input: ShowMessageInput) => {
            const id = createMessageId();
            const duration = input.duration ?? 3800;

            setMessages((current) => [
                ...current,
                {
                    id,
                    title: input.title,
                    description: input.description,
                    variant,
                    duration,
                },
            ]);

            window.setTimeout(() => {
                dismissMessage(id);
            }, duration);
        },
        [dismissMessage]
    );

    const value = useMemo<MessageCenterContextValue>(
        () => ({
            showSuccess: (input) => pushMessage("success", input),
            showError: (input) => pushMessage("error", input),
            dismissMessage,
        }),
        [dismissMessage, pushMessage]
    );

    return (
        <MessageCenterContext.Provider value={value}>
            {children}
            <MessageViewport messages={messages} onDismiss={dismissMessage} />
        </MessageCenterContext.Provider>
    );
}

export function useMessageCenter() {
    const context = useContext(MessageCenterContext);

    if (!context) {
        throw new Error("useMessageCenter must be used within MessageCenterProvider");
    }

    return context;
}
