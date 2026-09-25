/**
 * Where an imported record stands with the Transfer. A record synced from
 * Profitbase is overwritten by every Transfer until it is changed here; from
 * then on it is "edited in inventory" and the Transfer leaves it alone.
 */
interface ProfitbaseRecord {
    externalId?: string | null;
    editedInInventoryAt?: string | null;
}

/**
 * Banner for the edit forms of imported records. `children` lists what a
 * Transfer overwrites on a record that has not been edited yet.
 */
export function ProfitbaseNotice({ record, children }: { record: ProfitbaseRecord | null | undefined; children: React.ReactNode }) {
    if (!record?.externalId) return null;
    const edited = Boolean(record.editedInInventoryAt);

    return (
        <div
            className={`mb-5 flex items-start gap-3 rounded-[20px] border px-4 py-3 ${
                edited ? "border-[#D5EBDB] bg-[#F3FAF5]" : "border-[#DCE6F5] bg-[#F4F8FD]"
            }`}
        >
            <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke={edited ? "#2F7A45" : "#3C6AB0"}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mt-0.5 flex-shrink-0"
            >
                <circle cx="12" cy="12" r="9" />
                <path d="M12 16v-4M12 8h.01" />
            </svg>
            <div className={`text-xs leading-5 ${edited ? "text-[#24573A]" : "text-[#2F4A73]"}`}>
                {edited ? (
                    <>
                        <span className="font-semibold">Edited in inventory.</span> Transfers from Profitbase no longer change this record.
                    </>
                ) : (
                    <>
                        <span className="font-semibold">Synced from Profitbase.</span> {children} Once you save a change here, archiving
                        included, Transfers stop changing it.
                    </>
                )}
            </div>
        </div>
    );
}

/** Small tag for list rows and cards; nothing for records created in the panel. */
export function ProfitbaseSourceBadge({ record, className = "" }: { record: ProfitbaseRecord; className?: string }) {
    if (!record.externalId) return null;
    const edited = Boolean(record.editedInInventoryAt);

    return (
        <span
            title={edited ? "Transfers no longer change this record" : "Overwritten by every Transfer until it is edited here"}
            className={`inline-flex w-fit items-center whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-medium leading-4 ${
                edited ? "bg-[#EAF6EE] text-[#2F7A45]" : "bg-[#EAF1FB] text-[#3C6AB0]"
            } ${className}`}
        >
            {edited ? "Edited in inventory" : "Synced from Profitbase"}
        </span>
    );
}
