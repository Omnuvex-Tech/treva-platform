"use client";

import { ListChecks, Plus, Search } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { interpolate } from "@/lib/i18n/interpolate";
import { useI18n } from "@/providers/i18n-provider";
import { useSession } from "@/providers/session-provider";
import { useListingSections } from "../hooks/use-listings";
import type { Listing } from "../types";
import { ListingCard } from "./listing-card";

/** Admin Panel > Listings — two card sections, per artboard 886:15740. */
export function ListingsView() {
    const { t } = useI18n();
    const { can } = useSession();

    const [search, setSearch] = useState("");
    const debouncedSearch = useDebouncedValue(search, 300);
    const query = useListingSections({ search: debouncedSearch });

    const data = query.data;

    return (
        <div className="flex flex-col gap-6 px-4 pt-4 pb-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-content-tertiary">
                    {interpolate(t.listings.count, { total: data?.total ?? 0 })}
                </p>

                <div className="flex items-center gap-2">
                    <Input
                        type="search"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder={t.listings.searchPlaceholder}
                        aria-label={t.listings.searchPlaceholder}
                        leadingIcon={<Search />}
                        containerClassName="w-70"
                    />

                    {can("listings:manage") ? (
                        <Button leadingIcon={<Plus />}>{t.listings.add}</Button>
                    ) : null}
                </div>
            </div>

            {query.isPending ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {Array.from({ length: 8 }, (_, index) => (
                        <Skeleton key={index} className="h-81 rounded-lg" />
                    ))}
                </div>
            ) : query.isError ? (
                <EmptyState
                    icon={<ListChecks />}
                    title={t.common.error}
                    action={
                        <Button variant="outline" onClick={() => query.refetch()}>
                            {t.common.retry}
                        </Button>
                    }
                />
            ) : data && data.total > 0 ? (
                <>
                    <ListingSection title={t.listings.sections.sale} listings={data.sale} />
                    <ListingSection title={t.listings.sections.rent} listings={data.rent} />
                </>
            ) : (
                <EmptyState
                    icon={<ListChecks />}
                    title={t.common.empty}
                    description={t.common.emptyHint}
                />
            )}
        </div>
    );
}

function ListingSection({ title, listings }: { title: string; listings: readonly Listing[] }) {
    // An empty section is dropped rather than rendered as a heading over
    // nothing — searching for a sale unit should not leave a stranded
    // "For rent" title behind.
    if (listings.length === 0) return null;

    return (
        <section className="flex flex-col gap-3">
            <h2 className="text-sm font-semibold text-content-primary">{title}</h2>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {listings.map((listing) => (
                    <ListingCard key={listing.id} listing={listing} />
                ))}
            </div>
        </section>
    );
}
