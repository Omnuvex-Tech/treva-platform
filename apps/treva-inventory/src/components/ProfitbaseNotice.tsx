/**
 * Shown on objects, houses and units that come from Profitbase. Profitbase is
 * the source of truth for them: its fields are read-only here and every
 * Transfer overwrites them.
 */
export function ProfitbaseNotice({ children }: { children: React.ReactNode }) {
    return (
        <div className="mb-5 flex items-start gap-3 rounded-[20px] border border-[#DCE6F5] bg-[#F4F8FD] px-4 py-3">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3C6AB0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 flex-shrink-0">
                <rect x="4" y="11" width="16" height="10" rx="2" />
                <path d="M8 11V7a4 4 0 0 1 8 0v4" />
            </svg>
            <div className="text-xs leading-5 text-[#2F4A73]">
                <span className="font-semibold">Synced from Profitbase.</span> {children}
            </div>
        </div>
    );
}

/** Wraps Profitbase-owned inputs; a disabled fieldset disables every control inside it. */
export function ProfitbaseLocked({ locked, children, className = "" }: { locked: boolean; children: React.ReactNode; className?: string }) {
    return (
        <fieldset
            disabled={locked}
            title={locked ? "Managed in Profitbase" : undefined}
            className={`m-0 min-w-0 border-0 p-0 ${locked ? "cursor-not-allowed opacity-70 [&_*]:cursor-not-allowed" : ""} ${className}`}
        >
            {children}
        </fieldset>
    );
}
