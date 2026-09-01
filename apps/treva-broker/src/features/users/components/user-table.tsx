"use client";

import { Delete02Icon, PencilEdit02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeaderCell,
    TableRow,
} from "@/components/ui/table";
import { useI18n } from "@/providers/i18n-provider";
import { useSession } from "@/providers/session-provider";
import type { PlatformUser, UserStatus } from "../types";

const STATUS_TONE: Record<UserStatus, "positive" | "negative" | "notice"> = {
    active: "positive",
    blocked: "negative",
    invited: "notice",
};

export interface UserTableProps {
    users: readonly PlatformUser[];
    onEdit: (user: PlatformUser) => void;
    onDelete: (user: PlatformUser) => void;
}

/**
 * The User tab (873:48476): six equal-width content columns plus the narrow
 * trailing actions column (167px x 6 + 69px in a 1072px table). Column names
 * follow the vocabulary the Agencies tab spells out — Contacts, Organization,
 * E-Mail — so the two tables read as one screen.
 */
export function UserTable({ users, onEdit, onDelete }: UserTableProps) {
    const { t } = useI18n();
    const { can } = useSession();

    const canEdit = can("users:update");
    const canDelete = can("users:delete");

    return (
        <Table>
            <TableHead>
                <TableRow>
                    <TableHeaderCell>{t.users.columns.name}</TableHeaderCell>
                    <TableHeaderCell>{t.users.columns.contacts}</TableHeaderCell>
                    <TableHeaderCell>{t.users.columns.organization}</TableHeaderCell>
                    <TableHeaderCell>{t.users.columns.email}</TableHeaderCell>
                    <TableHeaderCell>{t.users.columns.role}</TableHeaderCell>
                    <TableHeaderCell>{t.users.columns.status}</TableHeaderCell>
                    <TableHeaderCell className="relative w-[69px] text-right">
                        <span className="sr-only">{t.users.columns.actions}</span>
                    </TableHeaderCell>
                </TableRow>
            </TableHead>

            <TableBody>
                {users.map((user) => (
                    <TableRow key={user.id}>
                        <TableCell className="font-medium">
                            {user.firstName} {user.lastName}
                            <span className="block text-xs text-content-tertiary">{user.jobTitle}</span>
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-content-secondary">
                            {user.phone}
                        </TableCell>
                        <TableCell className="text-content-secondary">{user.organization}</TableCell>
                        <TableCell className="text-content-secondary">{user.email}</TableCell>
                        <TableCell>{t.roles[user.role]}</TableCell>
                        <TableCell>
                            <Badge tone={STATUS_TONE[user.status]}>{t.users.status[user.status]}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                                {canEdit ? (
                                    <Button
                                        variant="ghost"
                                        size="iconSm"
                                        aria-label={`${t.common.edit}: ${user.email}`}
                                        onClick={() => onEdit(user)}
                                    >
                                        <HugeiconsIcon icon={PencilEdit02Icon} size={16} strokeWidth={1.6} />
                                    </Button>
                                ) : null}

                                {canDelete ? (
                                    <Button
                                        variant="ghost"
                                        size="iconSm"
                                        aria-label={`${t.common.delete}: ${user.email}`}
                                        onClick={() => onDelete(user)}
                                        className="text-content-tertiary hover:text-content-negative"
                                    >
                                        <HugeiconsIcon icon={Delete02Icon} size={16} strokeWidth={1.6} />
                                    </Button>
                                ) : null}
                            </div>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
