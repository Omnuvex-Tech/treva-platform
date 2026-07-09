import { cn } from "../../lib/utils";

interface Tab {
    id: string;
    label: string;
}

interface FormTabSwitcherProps {
    tabs: Tab[];
    activeTab: string;
    onChange: (id: string) => void;
    size?: "sm" | "md";
    className?: string;
}

const sizeStyles = {
    sm: "px-5 py-2 text-sm",
    md: "px-5 py-2 text-sm",
};

export function FormTabSwitcher({
    tabs,
    activeTab,
    onChange,
    size = "sm",
    className,
}: FormTabSwitcherProps) {
    return (
        <div className={cn("flex items-center gap-2", className)}>
            <div
                style={{
                    backgroundColor: "#FFFFFF",
                    borderRadius: "9999px",
                    padding: "4px",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    border: "1px solid #E5E7EB",
                }}
            >
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => onChange(tab.id)}
                            className={cn(
                                "rounded-full font-semibold transition-all cursor-pointer",
                                sizeStyles[size]
                            )}
                            style={{
                                backgroundColor: isActive ? "#EAECEF" : "transparent",
                                color: isActive ? "#1A1C1E" : "#A0AEC0",
                            }}
                        >
                            {tab.label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
