"use client";

import { Add01Icon, ArrowDown01Icon, Search01Icon, UserGroupIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Image from "next/image";
import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import { AnchoredPopover } from "@/components/ui/popover";
import { TableSkeleton } from "@/components/ui/skeleton";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { interpolate } from "@/lib/i18n/interpolate";
import { useI18n } from "@/providers/i18n-provider";
import { useSession } from "@/providers/session-provider";
import { useClientsList } from "../hooks/use-clients";
import type { ClientStatus } from "../types";
import { ClientForm } from "./client-form";
import { ClientTable } from "./client-table";

const PER_PAGE = 8;
const STATUSES: readonly (ClientStatus | "all")[] = ["all", "pending", "approved", "rejected"];

/**
 * Clients, for all three roles.
 *
 * The one behavioural difference is scope, not layout: a broker without
 * `clients:read_all` is pinned to their own book by passing their id as
 * `brokerId`. That is a UI convenience — the real API must enforce the same
 * scope from the token regardless of what this sends.
 *
 * Three states, all drawn in the file: the table (873:49737), the lead form
 * (873:49363) and the empty screen (873:49336). The form is not a panel above
 * the table — the artboard gives it the whole content area — so opening it
 * replaces the list.
 *
 * The headline is 60 tall with its 44px row inset 8px, and the card starts
 * immediately under it: 873:49765 sits at y60 with no gap, the 8px of breathing
 * room coming from the headline's own padding.
 */
export function ClientsView() {
    const { t } = useI18n();
    const { user, can } = useSession();

    const [search, setSearch] = useState("");
    const [status, setStatus] = useState<ClientStatus | "all">("all");
    const [page, setPage] = useState(1);
    const [formOpen, setFormOpen] = useState(false);

    const debouncedSearch = useDebouncedValue(search, 300);
    const seesEveryone = can("clients:read_all");

    const listQuery = useClientsList({
        page,
        perPage: PER_PAGE,
        search: debouncedSearch,
        status,
        brokerId: seesEveryone ? undefined : user.id,
    });

    const data = listQuery.data;
    const items = data?.items ?? [];

    // "No clients at all" and "no matches for this search" look the same in the
    // list but are different screens: the artboard's empty state drops the
    // search box, which would strand a user who has typed a query they could
    // then no longer clear. Only the unfiltered case gets that treatment.
    const filtered = debouncedSearch.trim() !== "" || status !== "all";
    const blank = !listQuery.isPending && !listQuery.isError && items.length === 0 && !filtered;

    const from = data ? (data.page - 1) * data.perPage + 1 : 0;
    const to = data ? Math.min(data.page * data.perPage, data.total) : 0;

    if (formOpen) {
        return (
            <div className="flex flex-col px-4 pt-4 pb-8">
                <div className="px-2">
                    <ClientForm
                        client={null}
                        onDone={() => setFormOpen(false)}
                        onCancel={() => setFormOpen(false)}
                    />
                </div>
            </div>
        );
    }

    const registerButton = can("clients:create") ? (
        <Button
            size="lg"
            className="shrink-0 rounded-lg border border-border-inverse px-3.5"
            leadingIcon={<HugeiconsIcon icon={Add01Icon} size={16} strokeWidth={1.8} />}
            onClick={() => setFormOpen(true)}
        >
            {t.clients.add}
        </Button>
    ) : null;

    return (
        <div className="flex flex-col px-4 pt-4 pb-8">
            {/* 60px headline: the title sits left and the search / status / add
                group right, 12px apart, all 44 tall (873:49757). The empty
                screen drops everything but the button (873:49354). */}
            <div className="flex h-15 items-center gap-3 px-2">
                {blank ? null : (
                    <p className="flex-1 truncate text-base font-medium text-content-primary">
                        {t.clients.allClients}
                    </p>
                )}

                {blank ? (
                    <div className="flex flex-1 justify-end">{registerButton}</div>
                ) : (
                    <>
                        <Input
                            type="search"
                            value={search}
                            onChange={(event) => {
                                setSearch(event.target.value);
                                setPage(1);
                            }}
                            placeholder={t.common.search}
                            aria-label={t.clients.searchPlaceholder}
                            leadingIcon={
                                <HugeiconsIcon icon={Search01Icon} size={20} strokeWidth={1.6} />
                            }
                            surface="outlined"
                            containerClassName="w-70 shrink-0"
                        />

                        <StatusFilter
                            value={status}
                            onChange={(next) => {
                                setStatus(next);
                                setPage(1);
                            }}
                        />

                        {registerButton}
                    </>
                )}
            </div>

            <div className="px-2">
                {listQuery.isPending ? (
                    <TableSkeleton rows={PER_PAGE} columns={5} />
                ) : listQuery.isError ? (
                    <EmptyState
                        icon={<HugeiconsIcon icon={UserGroupIcon} strokeWidth={1.6} />}
                        title={t.common.error}
                        action={
                            <Button variant="outline" onClick={() => listQuery.refetch()}>
                                {t.common.retry}
                            </Button>
                        }
                    />
                ) : items.length > 0 ? (
                    <>
                        {/* The table is inset 20px inside its card (873:49772). */}
                        <Card className="p-5">
                            <ClientTable clients={items} />
                        </Card>

                        {/* Hidden in the artboard (873:49823) because eight rows
                            fit on one page there — it still has to exist. */}
                        {data!.totalPages > 1 ? (
                            <Pagination
                                className="mt-4"
                                page={data!.page}
                                totalPages={data!.totalPages}
                                onPageChange={setPage}
                                summary={interpolate(t.common.showing, {
                                    from,
                                    to,
                                    total: data!.total,
                                })}
                            />
                        ) : null}
                    </>
                ) : (
                    <EmptyState
                        media={
                            <Image
                                src="/illustrations/no-clients.png"
                                alt=""
                                width={60}
                                height={60}
                                className="size-15 object-cover"
                            />
                        }
                        title={filtered ? t.clients.noMatches : t.clients.noClients}
                    />
                )}
            </div>
        </div>
    );
}

/**
 * The 100x44 "Status" control in the headline (873:49762).
 *
 * Drawn as an outlined button with a chevron rather than a field, so it is one
 * — a `Select` would bring a label slot and a field's fill with it. The panel
 * below reuses `AnchoredPopover`, the same primitive `Select` sits on.
 */
function StatusFilter({
    value,
    onChange,
}: {
    value: ClientStatus | "all";
    onChange: (value: ClientStatus | "all") => void;
}) {
    const { t } = useI18n();
    const [open, setOpen] = useState(false);
    const triggerRef = useRef<HTMLButtonElement>(null);

    return (
        <>
            <Button
                ref={triggerRef}
                variant="outline"
                size="lg"
                aria-haspopup="listbox"
                aria-expanded={open}
                className="w-25 shrink-0 justify-center rounded-lg border-border-brand px-3.5 text-content-brand"
                trailingIcon={<HugeiconsIcon icon={ArrowDown01Icon} size={16} strokeWidth={1.6} />}
                onClick={() => setOpen((current) => !current)}
            >
                {t.clients.columns.status}
            </Button>

            <AnchoredPopover
                anchorRef={triggerRef}
                open={open}
                onClose={() => {
                    setOpen(false);
                    triggerRef.current?.focus();
                }}
                className="min-w-40 p-1"
            >
                <ul role="listbox" className="flex flex-col">
                    {STATUSES.map((option) => (
                        <li key={option}>
                            <button
                                type="button"
                                role="option"
                                aria-selected={option === value}
                                onClick={() => {
                                    onChange(option);
                                    setOpen(false);
                                }}
                                className={
                                    option === value
                                        ? "w-full rounded-sm bg-bg-secondary px-3 py-2 text-left text-sm text-content-primary"
                                        : "w-full rounded-sm px-3 py-2 text-left text-sm text-content-secondary hover:bg-bg-secondary"
                                }
                            >
                                {option === "all" ? t.common.all : t.clients.status[option]}
                            </button>
                        </li>
                    ))}
                </ul>
            </AnchoredPopover>
        </>
    );
}
