import { Compass } from "lucide-react";

export interface ComingSoonProps {
    /**
     * Figma node ids for this screen, one per role section. Kept in the code so
     * the next person to build the screen does not have to hunt through a
     * 28,000px canvas to find it.
     */
    figmaNodes: {
        admin?: string;
        topBroker?: string;
        broker?: string;
    };
}

const FIGMA_FILE = "https://www.figma.com/design/SJRCdsOsEa1DCArrbghoPr/TREVA-Real-Estate-Admin-Crm";

/**
 * Placeholder for a route that is wired up — guarded, navigable, titled — but
 * whose content has not been built yet.
 *
 * It exists so the shell, the RBAC and the navigation can be reviewed as a
 * whole before any single screen is finished, and so an unfinished screen is
 * obviously unfinished rather than silently blank.
 */
export function ComingSoon({ figmaNodes }: ComingSoonProps) {
    const entries: [string, string][] = (
        [
            ["Admin", figmaNodes.admin],
            ["Top Broker", figmaNodes.topBroker],
            ["Broker", figmaNodes.broker],
        ] satisfies [string, string | undefined][]
    ).flatMap(([role, nodeId]) => (nodeId ? [[role, nodeId] as [string, string]] : []));

    return (
        <div className="flex h-full items-center justify-center p-6">
            <div className="flex max-w-md flex-col items-center gap-3 rounded-lg border border-dashed border-border-subtle px-8 py-12 text-center">
                <span className="flex size-11 items-center justify-center rounded-pill bg-bg-secondary text-content-tertiary">
                    <Compass className="size-5" />
                </span>

                <p className="text-base font-semibold text-content-primary">Screen not built yet</p>
                <p className="text-sm text-content-tertiary">
                    The route, permissions and navigation for this screen are in place. The layout
                    itself is still to come.
                </p>

                {entries.length ? (
                    <ul className="mt-2 flex flex-wrap justify-center gap-2">
                        {entries.map(([role, nodeId]) => (
                            <li key={role}>
                                <a
                                    href={`${FIGMA_FILE}?node-id=${nodeId.replace(":", "-")}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center rounded-pill bg-bg-secondary px-3 py-1 text-xs font-medium text-content-link hover:bg-bg-tertiary"
                                >
                                    {role} design
                                </a>
                            </li>
                        ))}
                    </ul>
                ) : null}
            </div>
        </div>
    );
}
