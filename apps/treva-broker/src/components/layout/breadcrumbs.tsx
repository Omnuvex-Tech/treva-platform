import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import type { ReactNode } from "react";

import type { Crumb } from "@/config/page-meta";

export interface BreadcrumbsProps {
    trail: Crumb[];
}

/**
 * The header trail on the article detail screen (873:51699).
 *
 * Measured from the artboard: the row is 132 wide and 20 tall for
 * "News Feed" (71) + arrow (12) + "Detail" (37), which leaves exactly 6px on
 * each side of the arrow — hence `gap-1.5` rather than a guessed spacing.
 */
export function Breadcrumbs({ trail }: BreadcrumbsProps): ReactNode {
    return (
        <nav aria-label="Breadcrumb" className="min-w-0">
            <ol className="flex min-w-0 items-center gap-1.5 text-sm leading-5">
                {trail.map((crumb, index) => {
                    const last = index === trail.length - 1;

                    return (
                        <li
                            key={`${crumb.label}-${index}`}
                            className="flex min-w-0 items-center gap-1.5"
                        >
                            {index > 0 ? (
                                <HugeiconsIcon
                                    icon={ArrowRight01Icon}
                                    size={12}
                                    strokeWidth={1.6}
                                    className="shrink-0 text-content-tertiary"
                                />
                            ) : null}

                            {crumb.href && !last ? (
                                <Link
                                    href={crumb.href}
                                    className="truncate text-content-tertiary transition-colors hover:text-content-primary"
                                >
                                    {crumb.label}
                                </Link>
                            ) : (
                                <span
                                    aria-current={last ? "page" : undefined}
                                    className="truncate text-content-primary"
                                >
                                    {crumb.label}
                                </span>
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}
