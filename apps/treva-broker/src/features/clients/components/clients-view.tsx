"use client";

import { ListFilter, Plus, Search, Trash2, Users } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import { TableSkeleton } from "@/components/ui/skeleton";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { interpolate } from "@/lib/i18n/interpolate";
import { useI18n } from "@/providers/i18n-provider";
import { useSession } from "@/providers/session-provider";
import { useClientsList, useDeleteClients } from "../hooks/use-clients";
import type { Client } from "../types";
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
 */
export function ClientsView() {
    const { t } = useI18n();
    const { user, can } = useSession();

    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [editing, setEditing] = useState<Client | null>(null);
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

    const data = listQuery.data;
    const items = data?.items ?? [];

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

    function handleDelete(client: Client) {
        if (!window.confirm(t.clients.deleteConfirm)) return;
        deleteClients.mutate([client.id], {
            onSuccess: () =>
                setSelected((current) => {
                    const next = new Set(current);
                    next.delete(client.id);
                    return next;
                }),
        });
    }

    function handleDeleteSelected() {
        if (!window.confirm(t.clients.deleteConfirm)) return;
        deleteClients.mutate([...selected], { onSuccess: () => setSelected(new Set()) });
    }

    function openCreate() {
        setEditing(null);
        setFormOpen(true);
    }

    function openEdit(client: Client) {
        setEditing(client);
        setFormOpen(true);
    }

    function closeForm() {
        setFormOpen(false);
        setEditing(null);
    }

    const from = data ? (data.page - 1) * data.perPage + 1 : 0;
    const to = data ? Math.min(data.page * data.perPage, data.total) : 0;

    return (
        <div className="flex flex-col gap-4 p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-content-tertiary">
                    {selected.size > 0
                        ? interpolate(t.clients.selected, { count: selected.size })
                        : interpolate(t.clients.count, { total: data?.total ?? 0 })}
                </p>

                <div className="flex items-center gap-2">
                    {selected.size > 0 && can("clients:delete") ? (
                        <Button
                            variant="danger"
                            leadingIcon={<Trash2 />}
                            onClick={handleDeleteSelected}
                            loading={deleteClients.isPending}
                        >
                            {t.common.delete}
                        </Button>
                    ) : null}

                    <Input
                        type="search"
                        value={search}
                        onChange={(event) => {
                            setSearch(event.target.value);
                            setPage(1);
                        }}
                        placeholder={t.clients.searchPlaceholder}
                        aria-label={t.clients.searchPlaceholder}
                        leadingIcon={<Search />}
                        containerClassName="w-70"
                    />

                    <Button variant="outline" leadingIcon={<ListFilter />}>
                        {t.clients.filter}
                    </Button>

                    {can("clients:create") ? (
                        <Button leadingIcon={<Plus />} onClick={openCreate}>
                            {t.clients.add}
                        </Button>
                    ) : null}
                </div>
            </div>

            {formOpen ? (
                <ClientForm client={editing} onDone={closeForm} onCancel={closeForm} />
            ) : null}

            {listQuery.isPending ? (
                <TableSkeleton rows={PER_PAGE} columns={6} />
            ) : listQuery.isError ? (
                <EmptyState
                    icon={Users}
                    title={t.common.error}
                    action={
                        <Button variant="outline" onClick={() => listQuery.refetch()}>
                            {t.common.retry}
                        </Button>
                    }
                />
            ) : items.length > 0 ? (
                <>
                    <Card className="overflow-hidden">
                        <ClientTable
                            clients={items}
                            selected={selected}
                            onToggle={toggle}
                            onToggleAll={toggleAll}
                            onEdit={openEdit}
                            onDelete={handleDelete}
                        />
                    </Card>

                    <Pagination
                        page={data!.page}
                        totalPages={data!.totalPages}
                        onPageChange={setPage}
                        summary={interpolate(t.common.showing, { from, to, total: data!.total })}
                    />
                </>
            ) : (
                <EmptyState icon={Users} title={t.common.empty} description={t.common.emptyHint} />
            )}
        </div>
    );
}
