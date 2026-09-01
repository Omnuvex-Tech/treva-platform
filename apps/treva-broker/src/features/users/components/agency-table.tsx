"use client";

import { Delete02Icon, PencilEdit02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

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
import type { Agency } from "../types";

export interface AgencyTableProps {
    agencies: readonly Agency[];
    onEdit: (agency: Agency) => void;
    onDelete: (agency: Agency) => void;
}

/**
 * The Real Estate Agencies tab (873:48597): five equal content columns —
 * Name, Manager, Contacts, Organization, E-Mail — plus the 69px actions column,
 * in a 1072px table.
 */
export function AgencyTable({ agencies, onEdit, onDelete }: AgencyTableProps) {
    const { t } = useI18n();
    const { can } = useSession();

    const canEdit = can("users:update");
    const canDelete = can("users:delete");

    return (
        <Table>
            <TableHead>
                <TableRow>
                    <TableHeaderCell>{t.users.columns.name}</TableHeaderCell>
                    <TableHeaderCell>{t.users.columns.manager}</TableHeaderCell>
                    <TableHeaderCell>{t.users.columns.contacts}</TableHeaderCell>
                    <TableHeaderCell>{t.users.columns.organization}</TableHeaderCell>
                    <TableHeaderCell>{t.users.columns.email}</TableHeaderCell>
                    <TableHeaderCell className="w-[69px] text-right">
                        {t.users.columns.actions}
                    </TableHeaderCell>
                </TableRow>
            </TableHead>

            <TableBody>
                {agencies.map((agency) => (
                    <TableRow key={agency.id}>
                        <TableCell>{agency.name}</TableCell>
                        <TableCell className="text-content-secondary">{agency.managerName}</TableCell>
                        <TableCell className="whitespace-nowrap text-content-secondary">
                            {agency.phone}
                        </TableCell>
                        <TableCell className="text-content-secondary">{agency.organization}</TableCell>
                        <TableCell className="text-content-secondary">{agency.email}</TableCell>

                        <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                                {canEdit ? (
                                    <Button
                                        variant="ghost"
                                        size="iconSm"
                                        aria-label={`${t.common.edit}: ${agency.name}`}
                                        onClick={() => onEdit(agency)}
                                    >
                                        <HugeiconsIcon icon={PencilEdit02Icon} size={16} strokeWidth={1.6} />
                                    </Button>
                                ) : null}

                                {canDelete ? (
                                    <Button
                                        variant="ghost"
                                        size="iconSm"
                                        aria-label={`${t.common.delete}: ${agency.name}`}
                                        onClick={() => onDelete(agency)}
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
