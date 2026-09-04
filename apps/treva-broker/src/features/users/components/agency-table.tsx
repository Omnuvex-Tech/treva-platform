"use client";

import { Delete02Icon, Edit03Icon } from "@hugeicons/core-free-icons";
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
 * The Real Estate Agencies tab (873:48597 / 907:14578).
 *
 * Five equal content columns — Name, Manager, Contacts, Organization, E-Mail —
 * at 200.6 each, plus the same 69px two-cell actions column the User tab uses.
 * Every cell is Content/Brand Bold: the artboard does not step the secondary
 * columns down a tone.
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
                    <TableHeaderCell className="w-[18.7%]">{t.users.columns.name}</TableHeaderCell>
                    <TableHeaderCell className="w-[18.7%]">
                        {t.users.columns.manager}
                    </TableHeaderCell>
                    <TableHeaderCell className="w-[18.7%]">
                        {t.users.columns.contacts}
                    </TableHeaderCell>
                    <TableHeaderCell className="w-[18.7%]">
                        {t.users.columns.organization}
                    </TableHeaderCell>
                    <TableHeaderCell className="w-[18.7%]">
                        {t.users.columns.emailAgency}
                    </TableHeaderCell>
                    <TableHeaderCell className="w-[69px]">
                        {t.users.columns.actions}
                    </TableHeaderCell>
                </TableRow>
            </TableHead>

            <TableBody>
                {agencies.map((agency) => (
                    <TableRow key={agency.id}>
                        <TableCell className="truncate">{agency.name}</TableCell>
                        <TableCell className="truncate">{agency.managerName}</TableCell>
                        <TableCell className="whitespace-nowrap">{agency.phone}</TableCell>
                        <TableCell className="truncate">{agency.organization}</TableCell>
                        <TableCell className="truncate">{agency.email}</TableCell>

                        <TableCell className="px-0">
                            <div className="flex items-center">
                                <span className="flex flex-1 justify-center">
                                    {canEdit ? (
                                        <Button
                                            variant="ghost"
                                            size="iconSm"
                                            aria-label={`${t.common.edit}: ${agency.name}`}
                                            onClick={() => onEdit(agency)}
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
                                            aria-label={`${t.common.delete}: ${agency.name}`}
                                            onClick={() => onDelete(agency)}
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
                ))}
            </TableBody>
        </Table>
    );
}
