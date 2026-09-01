"use client";

import Image from "next/image";
import { Eye, ImageOff } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { interpolate } from "@/lib/i18n/interpolate";
import { formatCurrency, formatNumber } from "@/lib/utils/format";
import { useI18n } from "@/providers/i18n-provider";
import type { Listing, ListingStatus } from "../types";

const STATUS_TONE: Record<ListingStatus, "positive" | "notice" | "neutral"> = {
    published: "positive",
    draft: "notice",
    archived: "neutral",
};

/**
 * One 260x324 listing card: a 244x200 cover carrying the status pill and the
 * view counter, then name, price and the location / specs row.
 */
export function ListingCard({ listing }: { listing: Listing }) {
    const { locale, t } = useI18n();

    return (
        <article className="flex flex-col overflow-hidden rounded-lg border border-border-subtle bg-bg-primary transition-shadow hover:shadow-l2">
            <div className="relative aspect-[244/200] w-full bg-bg-secondary">
                {listing.coverImageUrl ? (
                    <Image
                        src={listing.coverImageUrl}
                        alt=""
                        fill
                        sizes="(max-width: 768px) 100vw, 260px"
                        className="object-cover"
                    />
                ) : (
                    <span className="flex size-full items-center justify-center text-content-disabled">
                        <ImageOff className="size-7" />
                    </span>
                )}

                <Badge tone={STATUS_TONE[listing.status]} className="absolute top-3 left-3">
                    {t.listings.status[listing.status]}
                </Badge>

                <span className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-pill bg-bg-primary/85 px-2 py-0.5 text-2xs font-medium text-content-secondary">
                    <Eye className="size-3" />
                    {interpolate(t.listings.views, {
                        count: formatNumber(listing.views, locale),
                    })}
                </span>
            </div>

            <div className="flex flex-1 flex-col gap-1 p-4">
                <h3 className="truncate text-sm font-semibold text-content-primary">
                    {listing.unitName}
                    <span className="font-normal text-content-tertiary"> · {listing.projectName}</span>
                </h3>

                <p className="text-base font-semibold text-content-primary">
                    {formatCurrency(listing.price, locale)}
                    {listing.dealType === "rent" ? (
                        <span className="text-xs font-normal text-content-tertiary">
                            {t.listings.perMonth}
                        </span>
                    ) : null}
                </p>

                <p className="mt-auto truncate text-xs text-content-tertiary">
                    {listing.location}
                    {" · "}
                    {interpolate(t.listings.specs, {
                        beds: listing.bedrooms,
                        baths: listing.bathrooms,
                        area: listing.areaSqm,
                    })}
                </p>
            </div>
        </article>
    );
}
