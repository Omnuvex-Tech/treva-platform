"use client";

import { Pencil, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeaderCell,
    TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils/format";
import { useI18n } from "@/providers/i18n-provider";
import { useSession } from "@/providers/session-provider";
import type { Client, ClientStatus } from "../types";

const STATUS_TONE: Record<ClientStatus, "positive" | "negative" | "notice" | "info" | "neutral"> = {
    lead: "info",
    active: "positive",
    negotiating: "notice",
    closed: "neutral",
    lost: "negative",
};

export interface ClientTableProps {
    clients: readonly Client[];
    selected: ReadonlySet<string>;
    onToggle: (id: string) => void;
    onToggleAll: () => void;
    onEdit: (client: Client) => void;
    onDelete: (client: Client) => void;
}

/**
 * Five columns, matching the artboard: a 36px selection column plus four
 * equal-width content columns (36 + 4 x 263 in a 1088px table).
 */
export function ClientTable({
    clients,
    selected,
    onToggle,
    onToggleAll,
    onEdit,
    onDelete,
}: ClientTableProps) {
    const { locale, t } = useI18n();
    const { can } = useSession();

    const canEdit = can("clients:update");
    const canDelete = can("clients:delete");
    const allSelected = clients.length > 0 && clients.every((client) => selected.has(client.id));

    return (
        <Table>
            <TableHead>
                <TableRow>
                    <TableHeaderCell className="w-9">
                        <Checkbox
                            checked={allSelected}
                            onChange={onToggleAll}
                            aria-label="Select all rows"
                        />
                    </TableHeaderCell>
                    <TableHeaderCell>{t.clients.columns.client}</TableHeaderCell>
                    <TableHeaderCell>{t.clients.columns.contact}</TableHeaderCell>
                    <TableHeaderCell>{t.clients.columns.broker}</TableHeaderCell>
                    <TableHeaderCell>{t.clients.columns.status}</TableHeaderCell>
                    <TableHeaderCell className="w-[69px] text-right">
                        <span className="sr-only">{t.common.edit}</span>
                    </TableHeaderCell>
                </TableRow>
            </TableHead>

            <TableBody>
                {clients.map((client) => (
                    <TableRow key={client.id} className={selected.has(client.id) ? "bg-bg-secondary" : undefined}>
                        <TableCell>
                            <Checkbox
                                checked={selected.has(client.id)}
                                onChange={() => onToggle(client.id)}
                                aria-label={`Select ${client.firstName} ${client.lastName}`}
                            />
                        </TableCell>

                        <TableCell className="font-medium">
                            {client.firstName} {client.lastName}
                            <span className="block text-xs text-content-tertiary">
                                {client.interest}
                            </span>
                        </TableCell>

                        <TableCell className="text-content-secondary">
                            <span className="block whitespace-nowrap">{client.phone}</span>
                            <span className="block text-xs text-content-tertiary">{client.email}</span>
                        </TableCell>

                        <TableCell className="text-content-secondary">
                            {client.brokerName}
                            <span className="block text-xs text-content-tertiary">
                                {formatCurrency(client.budget, locale)}
                            </span>
                        </TableCell>

                        <TableCell>
                            <Badge tone={STATUS_TONE[client.status]}>
                                {t.clients.status[client.status]}
                            </Badge>
                        </TableCell>

                        <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                                {canEdit ? (
                                    <Button
                                        variant="ghost"
                                        size="iconSm"
                                        aria-label={`${t.common.edit}: ${client.firstName} ${client.lastName}`}
                                        onClick={() => onEdit(client)}
                                    >
                                        <Pencil />
                                    </Button>
                                ) : null}

                                {canDelete ? (
                                    <Button
                                        variant="ghost"
                                        size="iconSm"
                                        aria-label={`${t.common.delete}: ${client.firstName} ${client.lastName}`}
                                        onClick={() => onDelete(client)}
                                        className="text-content-tertiary hover:text-content-negative"
                                    >
                                        <Trash2 />
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
