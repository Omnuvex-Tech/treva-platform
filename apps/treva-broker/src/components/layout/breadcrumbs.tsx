import Link from "next/link";
import type { ReactNode } from "react";

import { AssetIcon } from "@/components/ui/asset-icon";
import type { Crumb } from "@/config/page-meta";
import { cn } from "@/lib/utils/cn";

export interface BreadcrumbsProps {
    trail: Crumb[];
}

/**
 * The header trail on the article detail screen (873:51699).
 *
 * Measured from the artboard: the row is 132 wide and 20 tall for
 * "News Feed" (71) + arrow (12) + "Detail" (37), which leaves exactly 6px on
 * each side of the arrow — hence `gap-1.5` rather than a guessed spacing.
 *
 * The earlier crumbs are 14/Regular on Content/Tertiary Inverse, the current
 * one 14/Medium on Content/Primary. The arrow is the artboard's own 12px
 * chevron-up turned to point right (-90° and flipped), in the same #b2b2b2.
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
                                <AssetIcon
                                    src="/images/layout/icon-breadcrumb-arrow.svg"
                                    size={12}
                                    className="-scale-y-100 -rotate-90 text-[var(--color-content-tertiary-inverse)]"
                                />
                            ) : null}

                            {crumb.href && !last ? (
                                <Link
                                    href={crumb.href}
                                    className="truncate text-[var(--color-content-tertiary-inverse)] transition-colors hover:text-content-primary"
                                >
                                    {crumb.label}
                                </Link>
                            ) : (
                                <span
                                    aria-current={last ? "page" : undefined}
                                    className={cn(
                                        "truncate",
                                        last
                                            ? "font-medium text-content-primary"
                                            : "text-[var(--color-content-tertiary-inverse)]",
                                    )}
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
