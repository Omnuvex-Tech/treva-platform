"use client";

import { Delete02Icon, Edit03Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { Badge, StatusBadge, type StatusBadgeTone } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeaderCell,
    TableRow,
} from "@/components/ui/table";
import type { Role } from "@/lib/auth/roles";
import { formatDate } from "@/lib/utils/format";
import { useI18n } from "@/providers/i18n-provider";
import { useSession } from "@/providers/session-provider";
import type { PlatformUser, UserStatus } from "../types";

/**
 * Role pill colours (873:48542-48549).
 *
 * Broker is the one that does not fall out of a tone name: the artboard inks it
 * Content/Positive, where the `positive` tone inks Content/Positive Bold — the
 * darker step the "New" pill on a news card uses. The fill is the same, so only
 * the ink is overridden.
 */
const ROLE_BADGE: Record<Role, { tone: "info" | "positive" | "notice"; className?: string }> = {
    admin: { tone: "info" },
    broker: { tone: "positive", className: "text-content-positive" },
    top_broker: { tone: "notice" },
};

/** Active is drawn green, Deactive in Figma's "processing" blue (873:48557). */
const STATUS_TONE: Record<UserStatus, StatusBadgeTone> = {
    active: "positive",
    blocked: "info",
    invited: "notice",
};

export interface UserTableProps {
    users: readonly PlatformUser[];
    onEdit: (user: PlatformUser) => void;
    onDelete: (user: PlatformUser) => void;
}

/**
 * The User tab (873:48476).
 *
 * Six equal content columns — Name, Email, Password, Role, Status, Last Login —
 * plus the 69px actions column, which is two 34.5px cells rather than one: the
 * pencil and the bin each centre in their own half, so a single right-aligned
 * group would sit off by a couple of pixels.
 */
export function UserTable({ users, onEdit, onDelete }: UserTableProps) {
    const { locale, t } = useI18n();
    const { can } = useSession();

    const canEdit = can("users:update");
    const canDelete = can("users:delete");

    return (
        <Table>
            <TableHead>
                <TableRow>
                    {/* 167.17 x 6 + 69 in a 1072 table. */}
                    <TableHeaderCell className="w-[15.6%]">{t.users.columns.name}</TableHeaderCell>
                    <TableHeaderCell className="w-[15.6%]">{t.users.columns.email}</TableHeaderCell>
                    <TableHeaderCell className="w-[15.6%]">
                        {t.users.columns.password}
                    </TableHeaderCell>
                    <TableHeaderCell className="w-[15.6%]">{t.users.columns.role}</TableHeaderCell>
                    <TableHeaderCell className="w-[15.6%]">
                        {t.users.columns.status}
                    </TableHeaderCell>
                    <TableHeaderCell className="w-[15.6%]">
                        {t.users.columns.lastLogin}
                    </TableHeaderCell>
                    <TableHeaderCell className="w-[69px]">
                        {t.users.columns.actions}
                    </TableHeaderCell>
                </TableRow>
            </TableHead>

            <TableBody>
                {users.map((user) => {
                    const badge = ROLE_BADGE[user.role];

                    return (
                        <TableRow key={user.id}>
                            <TableCell className="truncate">
                                {user.firstName} {user.lastName}
                            </TableCell>
                            <TableCell className="truncate">{user.email}</TableCell>
                            <TableCell className="truncate">{user.password}</TableCell>

                            <TableCell>
                                <Badge tone={badge.tone} size="field" className={badge.className}>
                                    {t.roles[user.role]}
                                </Badge>
                            </TableCell>

                            <TableCell>
                                <StatusBadge tone={STATUS_TONE[user.status]}>
                                    {t.users.status[user.status]}
                                </StatusBadge>
                            </TableCell>

                            <TableCell className="whitespace-nowrap">
                                {user.lastLoginAt ? formatDate(user.lastLoginAt, locale) : "—"}
                            </TableCell>

                            <TableCell className="px-0">
                                <div className="flex items-center">
                                    <span className="flex flex-1 justify-center">
                                        {canEdit ? (
                                            <Button
                                                variant="ghost"
                                                size="iconSm"
                                                aria-label={`${t.common.edit}: ${user.email}`}
                                                onClick={() => onEdit(user)}
                                                className="text-content-secondary"
                                            >
                                                <HugeiconsIcon
                                                    icon={Edit03Icon}
                                                    size={16}
                                                    strokeWidth={1.6}
                                                />
                                            </Button>
                                        ) : null}
                                    </span>

                                    <span className="flex flex-1 justify-center">
                                        {canDelete ? (
                                            <Button
                                                variant="ghost"
                                                size="iconSm"
                                                aria-label={`${t.common.delete}: ${user.email}`}
                                                onClick={() => onDelete(user)}
                                                className="text-content-secondary hover:text-content-negative"
                                            >
                                                <HugeiconsIcon
                                                    icon={Delete02Icon}
                                                    size={16}
                                                    strokeWidth={1.6}
                                                />
                                            </Button>
                                        ) : null}
                                    </span>
                                </div>
                            </TableCell>
                        </TableRow>
                    );
                })}
            </TableBody>
        </Table>
    );
}
