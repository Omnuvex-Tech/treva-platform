"use client";

import { Download, Plus, Search, Users as UsersIcon } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import { TableSkeleton } from "@/components/ui/skeleton";
import { Tabs, type TabItem } from "@/components/ui/tabs";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { interpolate } from "@/lib/i18n/interpolate";
import { useI18n } from "@/providers/i18n-provider";
import { useSession } from "@/providers/session-provider";
import { useDeleteUser, useUsersList } from "../hooks/use-users";
import type { PlatformUser, UserListQuery } from "../types";
import { UserForm } from "./user-form";
import { UserTable } from "./user-table";

type StatusTab = NonNullable<UserListQuery["status"]>;

const PER_PAGE = 8;

/**
 * Admin Panel > Users.
 *
 * Composition follows the artboard: a toolbar with the status segmented control
 * on the left and search + actions on the right, and — while creating or
 * editing — a form card that opens *above* the table rather than over it.
 */
export function UsersView() {
    const { t } = useI18n();
    const { can } = useSession();

    const [status, setStatus] = useState<StatusTab>("all");
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [editing, setEditing] = useState<PlatformUser | null>(null);
    const [formOpen, setFormOpen] = useState(false);

    // Without this every keystroke fires a request; 300ms is short enough that
    // the table still feels live.
    const debouncedSearch = useDebouncedValue(search, 300);

    const listQuery = useUsersList({
        page,
        perPage: PER_PAGE,
        search: debouncedSearch,
        status,
    });
    const deleteUser = useDeleteUser();

    const tabs: TabItem<StatusTab>[] = [
        { value: "all", label: t.users.tabs.all },
        { value: "active", label: t.users.tabs.active },
        { value: "blocked", label: t.users.tabs.blocked },
        { value: "invited", label: t.users.tabs.invited },
    ];

    function openCreate() {
        setEditing(null);
        setFormOpen(true);
    }

    function openEdit(user: PlatformUser) {
        setEditing(user);
        setFormOpen(true);
    }

    function closeForm() {
        setFormOpen(false);
        setEditing(null);
    }

    function handleDelete(user: PlatformUser) {
        if (!window.confirm(t.users.deleteConfirm)) return;
        deleteUser.mutate(user.id);
    }

    const data = listQuery.data;
    const from = data ? (data.page - 1) * data.perPage + 1 : 0;
    const to = data ? Math.min(data.page * data.perPage, data.total) : 0;

    return (
        <div className="flex flex-col gap-4 p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <Tabs
                    items={tabs}
                    value={status}
                    onChange={(value) => {
                        setStatus(value);
                        setPage(1);
                    }}
                />

                <div className="flex items-center gap-2">
                    <Input
                        type="search"
                        value={search}
                        onChange={(event) => {
                            setSearch(event.target.value);
                            setPage(1);
                        }}
                        placeholder={t.users.searchPlaceholder}
                        aria-label={t.users.searchPlaceholder}
                        leadingIcon={<Search />}
                        containerClassName="w-87"
                    />

                    <Button variant="outline" leadingIcon={<Download />}>
                        {t.users.export}
                    </Button>

                    {can("users:create") ? (
                        <Button leadingIcon={<Plus />} onClick={openCreate}>
                            {t.users.add}
                        </Button>
                    ) : null}
                </div>
            </div>

            {formOpen ? (
                <UserForm user={editing} onDone={closeForm} onCancel={closeForm} />
            ) : null}

            {listQuery.isPending ? (
                <TableSkeleton rows={PER_PAGE} columns={7} />
            ) : listQuery.isError ? (
                <EmptyState
                    icon={UsersIcon}
                    title={t.common.error}
                    action={
                        <Button variant="outline" onClick={() => listQuery.refetch()}>
                            {t.common.retry}
                        </Button>
                    }
                />
            ) : data && data.items.length > 0 ? (
                <>
                    <Card className="overflow-hidden">
                        <UserTable users={data.items} onEdit={openEdit} onDelete={handleDelete} />
                    </Card>

                    <Pagination
                        page={data.page}
                        totalPages={data.totalPages}
                        onPageChange={setPage}
                        summary={interpolate(t.common.showing, { from, to, total: data.total })}
                    />
                </>
            ) : (
                <EmptyState icon={UsersIcon} title={t.common.empty} description={t.common.emptyHint} />
            )}
        </div>
    );
}
