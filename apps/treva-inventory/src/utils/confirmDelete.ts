/**
 * Asks before an off-plan record is deleted. A synced record is gone for good:
 * the Transfer remembers the deletion and does not import it again.
 */
export function confirmDelete(
    record: { title?: string | null; name?: string | null; externalId?: string | null },
    what: string,
    consequence?: string,
): boolean {
    const label = record.title || record.name || `this ${what}`;
    const lines = [`Delete ${what} "${label}"?`];
    if (consequence) lines.push(consequence);
    if (record.externalId) lines.push("It came from Profitbase and will not be imported again.");
    return window.confirm(lines.join("\n\n"));
}
