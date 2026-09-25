"use client";

import { UserGroupIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Image from "next/image";
import { useRef, useState } from "react";

import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { AssetIcon } from "@/components/ui/asset-icon";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import { AnchoredPopover } from "@/components/ui/popover";
import { TableSkeleton } from "@/components/ui/skeleton";
import { useConfirm } from "@/hooks/use-confirm";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { interpolate } from "@/lib/i18n/interpolate";
import { useI18n } from "@/providers/i18n-provider";
import { useSession } from "@/providers/session-provider";
import { useClientsList, useDeleteClients } from "../hooks/use-clients";
import type { Client, ClientStatus } from "../types";
import { ClientForm } from "./client-form";
import { ClientTable } from "./client-table";

const PER_PAGE = 8;
const STATUSES: readonly (ClientStatus | "all")[] = ["all", "deal_created", "already_in_bitrix", "pending"];

/**
 * Clients, for all three roles.
 *
 * The one behavioural difference is scope, not layout: anyone without
 * `clients:read_all` (everyone but an admin) is pinned to their own leads by
 * passing their id as `brokerId`. That is a UI convenience — the real API must enforce the same
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

    const deleteClients = useDeleteClients();
    const confirmDelete = useConfirm<Client>();

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

    function performDelete() {
        if (!confirmDelete.target) return;
        deleteClients.mutate([confirmDelete.target.id], { onSettled: confirmDelete.dismiss });
    }

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
            // 182px is the artboard's hug width (873:49764). The label there is
            // misspelt "Resgister", which is what makes it that wide; a floor
            // keeps the headline group where the file puts it, and a longer
            // translation still grows past it. Content starts at the artboard's
            // 14px (13 + the 1px edge Figma counts inside) rather than centring
            // in the extra width.
            className="min-w-[182px] shrink-0 justify-start rounded-lg border border-border-inverse pr-3.5 pl-[13px]"
            leadingIcon={<AssetIcon src="/images/news/icon-plus.svg" size={16} />}
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
                            // Same 20px search-03 glyph as the app header; it sits
                            // 16px in (873:49761): 1 of border, 12 of padding, 3 here.
                            leadingIcon={
                                <AssetIcon
                                    src="/images/layout/icon-search.svg"
                                    size={20}
                                    className="ml-[3px] text-content-brand"
                                />
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
                        {/* `content` (873:49771): 12px radius, and the table
                            20px in from the card's outer edge — Figma draws
                            the stroke inside, so 19 of padding plus the 1px
                            border. The card is as wide as the whole headline
                            (1128) but starts 8px in, so it runs 16px past the
                            buttons on the right, exactly as the artboard lays
                            it (x 304 → 1432 at 1440). */}
                        <Card className="-mr-4 rounded-md p-[19px]">
                            <ClientTable clients={items} onDelete={confirmDelete.ask} />
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

            <ConfirmDialog
                open={confirmDelete.isOpen}
                title={t.common.deleteTitle}
                description={t.clients.deleteConfirm}
                subject={
                    confirmDelete.target
                        ? `${confirmDelete.target.firstName} ${confirmDelete.target.lastName}`
                        : undefined
                }
                confirmLabel={t.common.confirmDelete}
                loading={deleteClients.isPending}
                onConfirm={performDelete}
                onCancel={confirmDelete.dismiss}
            />
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
                trailingIcon={<AssetIcon src="/images/layout/icon-chevron-down.svg" size={16} />}
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
