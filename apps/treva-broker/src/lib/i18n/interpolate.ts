/**
 * Fills `{placeholder}` slots in a dictionary string.
 *
 *   interpolate(t.common.showing, { from: 1, to: 10, total: 42 })
 *   // "Showing 1–10 of 42"
 *
 * Deliberately tiny: the app has no plural- or gender-dependent copy yet, so a
 * full ICU MessageFormat runtime would be dead weight. Swap this out (not the
 * call sites) if that changes.
 */
export function interpolate(template: string, values: Record<string, string | number>): string {
    return template.replace(/\{(\w+)\}/g, (match, key: string) =>
        key in values ? String(values[key]) : match,
    );
}
