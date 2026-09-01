"use client";

import {
    Add01Icon,
    Delete02Icon,
    FilterHorizontalIcon,
    Search01Icon,
    UserGroupIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import { TableSkeleton } from "@/components/ui/skeleton";
import { useConfirm } from "@/hooks/use-confirm";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { interpolate } from "@/lib/i18n/interpolate";
import { useI18n } from "@/providers/i18n-provider";
import { useSession } from "@/providers/session-provider";
import { useClientsList, useDeleteClients } from "../hooks/use-clients";
import { ClientForm } from "./client-form";
import { ClientTable } from "./client-table";

const PER_PAGE = 8;

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
 */
export function ClientsView() {
    const { t } = useI18n();
    const { user, can } = useSession();

    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [formOpen, setFormOpen] = useState(false);

    const debouncedSearch = useDebouncedValue(search, 300);
    const seesEveryone = can("clients:read_all");

    const listQuery = useClientsList({
        page,
        perPage: PER_PAGE,
        search: debouncedSearch,
        brokerId: seesEveryone ? undefined : user.id,
    });
    const deleteClients = useDeleteClients();
    const confirmDelete = useConfirm<"selected">();

    const data = listQuery.data;
    const items = data?.items ?? [];

    // "No clients at all" and "no matches for this search" look the same in the
    // list but are different screens: the artboard's empty state drops the
    // search box, which would strand a user who has typed a query they could
    // then no longer clear. Only the unfiltered case gets that treatment.
    const filtered = debouncedSearch.trim() !== "";
    const blank = !listQuery.isPending && !listQuery.isError && items.length === 0 && !filtered;

    function toggle(id: string) {
        setSelected((current) => {
            const next = new Set(current);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    }

    function toggleAll() {
        setSelected((current) => {
            const allSelected = items.length > 0 && items.every((client) => current.has(client.id));
            if (allSelected) return new Set();
            return new Set(items.map((client) => client.id));
        });
    }

    function performDelete() {
        deleteClients.mutate([...selected], {
            onSuccess: () => setSelected(new Set()),
            onSettled: confirmDelete.dismiss,
        });
    }

    const from = data ? (data.page - 1) * data.perPage + 1 : 0;
    const to = data ? Math.min(data.page * data.perPage, data.total) : 0;

    if (formOpen) {
        return (
            <div className="flex flex-col gap-4 px-4 pt-4 pb-8">
                <ClientForm
                    client={null}
                    onDone={() => setFormOpen(false)}
                    onCancel={() => setFormOpen(false)}
                />
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4 px-4 pt-4 pb-8">
            {/* 60px headline: the counter sits left, the search / filter / add
                group right, 12px apart, all 44 tall (873:49757). */}
            <div className="flex min-h-11 flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-content-tertiary">
                    {selected.size > 0
                        ? interpolate(t.clients.selected, { count: selected.size })
                        : interpolate(t.clients.count, { total: data?.total ?? 0 })}
                </p>

                <div className="flex items-center gap-3">
                    {selected.size > 0 && can("clients:delete") ? (
                        <Button
                            variant="danger"
                            size="lg"
                            leadingIcon={
                                <HugeiconsIcon icon={Delete02Icon} size={16} strokeWidth={1.6} />
                            }
                            onClick={() => confirmDelete.ask("selected")}
                            loading={deleteClients.isPending}
                        >
                            {t.common.delete}
                        </Button>
                    ) : null}

                    {blank ? null : (
                        <>
                            <Input
                                type="search"
                                value={search}
                                onChange={(event) => {
                                    setSearch(event.target.value);
                                    setPage(1);
                                }}
                                placeholder={t.clients.searchPlaceholder}
                                aria-label={t.clients.searchPlaceholder}
                                leadingIcon={
                                    <HugeiconsIcon
                                        icon={Search01Icon}
                                        size={18}
                                        strokeWidth={1.6}
                                    />
                                }
                                surface="outlined"
                                containerClassName="w-70 shrink-0"
                            />

                            <Button
                                variant="outline"
                                size="lg"
                                leadingIcon={
                                    <HugeiconsIcon
                                        icon={FilterHorizontalIcon}
                                        size={16}
                                        strokeWidth={1.6}
                                    />
                                }
                            >
                                {t.clients.filter}
                            </Button>
                        </>
                    )}

                    {can("clients:create") ? (
                        <Button
                            size="lg"
                            leadingIcon={
                                <HugeiconsIcon icon={Add01Icon} size={16} strokeWidth={1.8} />
                            }
                            onClick={() => setFormOpen(true)}
                        >
                            {t.clients.add}
                        </Button>
                    ) : null}
                </div>
            </div>

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
                        <ClientTable
                            clients={items}
                            selected={selected}
                            onToggle={toggle}
                            onToggleAll={toggleAll}
                        />
                    </Card>

                    {data!.totalPages > 1 ? (
                        <Pagination
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
                    icon={<HugeiconsIcon icon={UserGroupIcon} strokeWidth={1.6} />}
                    title={filtered ? t.clients.noMatches : t.clients.noClients}
                />
            )}

            <ConfirmDialog
                open={confirmDelete.isOpen}
                title={t.common.deleteSelectedTitle}
                description={t.clients.deleteConfirm}
                confirmLabel={t.common.confirmDelete}
                loading={deleteClients.isPending}
                onConfirm={performDelete}
                onCancel={confirmDelete.dismiss}
            />
        </div>
    );
}
