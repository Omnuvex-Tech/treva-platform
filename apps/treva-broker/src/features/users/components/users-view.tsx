"use client";

import { Add01Icon, Search01Icon, UserGroup03Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import { Panel } from "@/components/ui/panel";
import { Select } from "@/components/ui/select";
import { TableSkeleton } from "@/components/ui/skeleton";
import { Tabs, type TabItem } from "@/components/ui/tabs";
import { routes } from "@/config/routes";
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
import { UserTable } from "./user-table";

const PER_PAGE = 8;

const COOPERATION_TYPES = ["exclusive", "partner", "external"] as const;

/**
 * Users.
 *
 * The tab strip switches ENTITY, not status: the artboards are two different
 * tables behind one screen — platform users (873:48476, six content columns,
 * eight rows) and real-estate agencies (873:48597, five content columns, five
 * rows). Both tabs carry the same primary action; only the User tab adds the
 * Cooperation Type filter, and its search box is 348 against the agency tab's
 * 240.
 *
 * The 60px headline sits directly on the card with no gap — 873:48494 ends at
 * 76 and 873:48501 starts at 76 — so the breathing room under the toolbar is
 * the headline's own 8px padding, exactly as on Projects.
 *
 * Creating and editing are their own screens (873:48686 / 873:48814), not a
 * panel above the table: the artboards give each a breadcrumb trail of its own,
 * which a screen embedded in the list cannot have.
 */
export function UsersView() {
    const { locale, t } = useI18n();
    const { can } = useSession();
    const router = useRouter();
    const toast = useToast();

    const [tab, setTab] = useState<UsersTab>("user");
    const [search, setSearch] = useState("");
    const [cooperationType, setCooperationType] = useState("");
    const [page, setPage] = useState(1);

    const debouncedSearch = useDebouncedValue(search, 300);

    const usersQuery = useUsersList({
        page,
        perPage: PER_PAGE,
        search: debouncedSearch,
        cooperationType: cooperationType || undefined,
    });
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
        setCooperationType("");
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
        <div className="flex flex-col px-4 pt-4 pb-8">
            {/* 873:48494 — 60 tall, its row inset 8: the tab panel left, the
                search bar and actions right, 12 apart. */}
            <div className="flex h-15 items-center justify-between gap-3 px-2">
                <Tabs variant="pill" size="sm" items={tabs} value={tab} onChange={switchTab} />

                <div className="flex shrink-0 items-center gap-3">
                    <Input
                        type="search"
                        value={search}
                        onChange={(event) => {
                            setSearch(event.target.value);
                            setPage(1);
                        }}
                        placeholder={onUserTab ? t.users.searchUsers : t.users.searchAgencies}
                        aria-label={onUserTab ? t.users.searchUsers : t.users.searchAgencies}
                        surface="outlined"
                        leadingIcon={
                            <HugeiconsIcon icon={Search01Icon} size={18} strokeWidth={1.6} />
                        }
                        // 348px on the user tab, 240px on the agency tab.
                        containerClassName={onUserTab ? "w-[348px]" : "w-[240px]"}
                    />

                    {/* 873:48499 — the User tab's only filter. Drawn as a
                        brand-outlined 166x44 pill, so the trigger takes the
                        button's edge and ink rather than the Select's grey
                        field. */}
                    {onUserTab ? (
                        <Select
                            value={cooperationType}
                            onChange={(value) => {
                                setCooperationType(value);
                                setPage(1);
                            }}
                            options={[
                                // The resting label IS the field name in the
                                // artboard, so "no filter" is spelled that way
                                // rather than as an "All" the design never
                                // draws.
                                { value: "", label: t.users.cooperationType },
                                ...COOPERATION_TYPES.map((value) => ({
                                    value,
                                    label: t.users.cooperationTypes[value],
                                })),
                            ]}
                            aria-label={t.users.cooperationType}
                            className="justify-center gap-2 rounded-lg border-border-brand bg-bg-primary px-3.5 text-content-brand [&>span]:text-content-brand [&_svg]:text-content-brand"
                            containerClassName="w-[166px] shrink-0"
                        />
                    ) : null}

                    {can("users:create") ? (
                        <Button
                            size="lg"
                            className="shrink-0 rounded-lg border border-border-inverse px-3.5"
                            leadingIcon={
                                <HugeiconsIcon icon={Add01Icon} size={16} strokeWidth={1.8} />
                            }
                            onClick={() => router.push(routes.adminUserNew(locale))}
                        >
                            {t.users.addUser}
                        </Button>
                    ) : null}
                </div>
            </div>

            <div className="px-2">
                {listPending ? (
                    <Panel>
                        <TableSkeleton
                            rows={onUserTab ? PER_PAGE : 5}
                            columns={onUserTab ? 7 : 6}
                        />
                    </Panel>
                ) : listError ? (
                    <EmptyState
                        icon={<HugeiconsIcon icon={UserGroup03Icon} size={20} strokeWidth={1.6} />}
                        title={t.common.error}
                        action={
                            <Button
                                variant="outline"
                                onClick={() =>
                                    onUserTab ? usersQuery.refetch() : agenciesQuery.refetch()
                                }
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
                        <Panel>
                            <UserTable
                                users={data!.items}
                                onEdit={(user) =>
                                    router.push(routes.adminUserEdit(locale, user.id))
                                }
                                onDelete={(user) => confirmDelete.ask({ kind: "user", user })}
                            />
                        </Panel>

                        {/* The artboard hides the pager — eight rows fill the
                            body exactly — so it appears only once the fixtures
                            run past a page. */}
                        {data!.totalPages > 1 ? (
                            <Pagination
                                className="mt-6"
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
                    <Panel>
                        <AgencyTable
                            agencies={agencies}
                            onEdit={() => {
                                // The agency form is not in the artboards yet —
                                // the pencil is drawn, the screen behind it is
                                // not.
                            }}
                            onDelete={(agency) => confirmDelete.ask({ kind: "agency", agency })}
                        />
                    </Panel>
                )}
            </div>

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
