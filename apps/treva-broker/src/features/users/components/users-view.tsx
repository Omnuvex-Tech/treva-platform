"use client";

import { Download04Icon, PlusSignIcon, Search01Icon, UserGroup03Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import { TableSkeleton } from "@/components/ui/skeleton";
import { Tabs, type TabItem } from "@/components/ui/tabs";
import { useConfirm } from "@/hooks/use-confirm";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { interpolate } from "@/lib/i18n/interpolate";
import { useI18n } from "@/providers/i18n-provider";
import { useSession } from "@/providers/session-provider";
import { useToast } from "@/providers/toast-provider";
import { useAgencies, useDeleteAgency } from "../hooks/use-agencies";
import { useDeleteUser, useUsersList } from "../hooks/use-users";
import type { Agency, PlatformUser, UsersTab } from "../types";
import { AgencyTable } from "./agency-table";
import { UserForm } from "./user-form";
import { UserTable } from "./user-table";

const PER_PAGE = 8;

/**
 * Users.
 *
 * The tab strip switches ENTITY, not status: the artboards are two different
 * tables behind one screen — platform users (873:48476, six content columns,
 * eight rows) and real-estate agencies (873:48597, five content columns, five
 * rows). Each tab carries its own toolbar: the user tab has a wide search plus
 * two buttons, the agency tab a narrow search plus one.
 */
export function UsersView() {
    const { t } = useI18n();
    const { can } = useSession();
    const toast = useToast();

    const [tab, setTab] = useState<UsersTab>("user");
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [editing, setEditing] = useState<PlatformUser | null>(null);
    const [formOpen, setFormOpen] = useState(false);

    const debouncedSearch = useDebouncedValue(search, 300);

    const usersQuery = useUsersList({ page, perPage: PER_PAGE, search: debouncedSearch });
    const agenciesQuery = useAgencies(debouncedSearch);
    const deleteUser = useDeleteUser();
    const deleteAgency = useDeleteAgency();
    // The two tabs delete different entities, so the dialog's subject is a
    // tagged union rather than two separate pieces of state.
    const confirmDelete = useConfirm<
        { kind: "user"; user: PlatformUser } | { kind: "agency"; agency: Agency }
    >();

    const tabs: TabItem<UsersTab>[] = [
        { value: "user", label: t.users.tabs.user },
        { value: "agency", label: t.users.tabs.agency },
    ];

    function switchTab(value: UsersTab) {
        setTab(value);
        setPage(1);
        setSearch("");
        setFormOpen(false);
        setEditing(null);
    }

    function performDelete() {
        const target = confirmDelete.target;
        if (!target) return;

        if (target.kind === "user") {
            deleteUser.mutate(target.user.id, {
                onSuccess: () => toast.success(t.users.userDeleted),
                onSettled: confirmDelete.dismiss,
            });
            return;
        }

        deleteAgency.mutate(target.agency.id, {
            onSuccess: () => toast.success(t.users.agencyDeleted),
            onSettled: confirmDelete.dismiss,
        });
    }

    const onUserTab = tab === "user";
    const data = usersQuery.data;
    const agencies = agenciesQuery.data ?? [];
    const from = data ? (data.page - 1) * data.perPage + 1 : 0;
    const to = data ? Math.min(data.page * data.perPage, data.total) : 0;

    const listPending = onUserTab ? usersQuery.isPending : agenciesQuery.isPending;
    const listError = onUserTab ? usersQuery.isError : agenciesQuery.isError;
    const isEmpty = onUserTab ? !data || data.items.length === 0 : agencies.length === 0;

    return (
        <div className="flex flex-col gap-4 px-4 pt-4 pb-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <Tabs items={tabs} value={tab} onChange={switchTab} />

                <div className="flex items-center gap-2">
                    <Input
                        type="search"
                        value={search}
                        onChange={(event) => {
                            setSearch(event.target.value);
                            setPage(1);
                        }}
                        placeholder={onUserTab ? t.users.searchUsers : t.users.searchAgencies}
                        aria-label={onUserTab ? t.users.searchUsers : t.users.searchAgencies}
                        leadingIcon={<HugeiconsIcon icon={Search01Icon} size={18} strokeWidth={1.6} />}
                        // 348px on the user tab, 240px on the agency tab.
                        containerClassName={onUserTab ? "w-87" : "w-60"}
                    />

                    {/* The user tab carries a second, secondary action; the
                        agency tab has only the primary one. */}
                    {onUserTab ? (
                        <Button
                            variant="outline"
                            leadingIcon={<HugeiconsIcon icon={Download04Icon} size={18} strokeWidth={1.6} />}
                        >
                            {t.users.export}
                        </Button>
                    ) : null}

                    {can("users:create") ? (
                        <Button
                            leadingIcon={<HugeiconsIcon icon={PlusSignIcon} size={18} strokeWidth={1.8} />}
                            onClick={() => {
                                setEditing(null);
                                setFormOpen(true);
                            }}
                        >
                            {onUserTab ? t.users.addUser : t.users.addAgency}
                        </Button>
                    ) : null}
                </div>
            </div>

            {formOpen && onUserTab ? (
                <UserForm
                    user={editing}
                    onDone={() => {
                        setFormOpen(false);
                        toast.success(editing ? t.users.userUpdated : t.users.userAdded);
                        setEditing(null);
                    }}
                    onCancel={() => {
                        setFormOpen(false);
                        setEditing(null);
                    }}
                />
            ) : null}

            {listPending ? (
                <TableSkeleton rows={onUserTab ? PER_PAGE : 5} columns={onUserTab ? 7 : 6} />
            ) : listError ? (
                <EmptyState
                    icon={<HugeiconsIcon icon={UserGroup03Icon} size={20} strokeWidth={1.6} />}
                    title={t.common.error}
                    action={
                        <Button
                            variant="outline"
                            onClick={() => (onUserTab ? usersQuery.refetch() : agenciesQuery.refetch())}
                        >
                            {t.common.retry}
                        </Button>
                    }
                />
            ) : isEmpty ? (
                <EmptyState
                    icon={<HugeiconsIcon icon={UserGroup03Icon} size={20} strokeWidth={1.6} />}
                    title={t.common.empty}
                    description={t.common.emptyHint}
                />
            ) : onUserTab ? (
                <>
                    <Card className="overflow-hidden">
                        <UserTable
                            users={data!.items}
                            onEdit={(user) => {
                                setEditing(user);
                                setFormOpen(true);
                            }}
                            onDelete={(user) => confirmDelete.ask({ kind: "user", user })}
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
                <Card className="overflow-hidden">
                    <AgencyTable
                        agencies={agencies}
                        onEdit={() => {
                            // The agency form is not in the artboards yet — see
                            // the note in agency-table.tsx's ticket.
                        }}
                        onDelete={(agency) => confirmDelete.ask({ kind: "agency", agency })}
                    />
                </Card>
            )}

            <ConfirmDialog
                open={confirmDelete.isOpen}
                title={t.common.deleteTitle}
                description={t.users.deleteConfirm}
                subject={
                    confirmDelete.target?.kind === "user"
                        ? `${confirmDelete.target.user.firstName} ${confirmDelete.target.user.lastName}`
                        : confirmDelete.target?.agency.name
                }
                confirmLabel={t.common.confirmDelete}
                loading={deleteUser.isPending || deleteAgency.isPending}
                onConfirm={performDelete}
                onCancel={confirmDelete.dismiss}
            />
        </div>
    );
}
