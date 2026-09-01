"use client";

import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeaderCell,
    TableRow,
} from "@/components/ui/table";
import { routes } from "@/config/routes";
import { formatCurrency } from "@/lib/utils/format";
import { useI18n } from "@/providers/i18n-provider";
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
}

/**
 * Exactly five columns, per the table block in 873:49772: a 36px selection
 * column plus four equal content columns (36 + 4 x 263 = 1088). `table-fixed`
 * is what makes the four equal — with auto layout they would size to content.
 *
 * There is deliberately no per-row action column: the artboard has none. Edit
 * lives on the client's own screen (the 94x44 button in 873:49423) and delete
 * is a bulk action driven by the selection column, which is the only reason a
 * 36px checkbox column exists at all.
 */
export function ClientTable({ clients, selected, onToggle, onToggleAll }: ClientTableProps) {
    const { locale, t } = useI18n();

    const allSelected = clients.length > 0 && clients.every((client) => selected.has(client.id));

    return (
        <Table className="table-fixed">
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
                </TableRow>
            </TableHead>

            <TableBody>
                {clients.map((client) => (
                    <TableRow
                        key={client.id}
                        className={selected.has(client.id) ? "bg-bg-secondary" : undefined}
                    >
                        <TableCell>
                            <Checkbox
                                checked={selected.has(client.id)}
                                onChange={() => onToggle(client.id)}
                                aria-label={`Select ${client.firstName} ${client.lastName}`}
                            />
                        </TableCell>

                        <TableCell className="truncate font-medium">
                            {/* The name is the link rather than the whole row:
                                a row-wide click target would swallow the
                                checkbox that sits inside it. */}
                            <Link
                                href={routes.clientDetail(locale, client.id)}
                                className="hover:underline"
                            >
                                {client.firstName} {client.lastName}
                            </Link>
                            <span className="block truncate text-xs font-normal text-content-tertiary">
                                {client.interest}
                            </span>
                        </TableCell>

                        <TableCell className="truncate text-content-secondary">
                            <span className="block truncate">{client.phone}</span>
                            <span className="block truncate text-xs text-content-tertiary">
                                {client.email}
                            </span>
                        </TableCell>

                        <TableCell className="truncate text-content-secondary">
                            {client.brokerName}
                            <span className="block truncate text-xs text-content-tertiary">
                                {formatCurrency(client.budget, locale)}
                            </span>
                        </TableCell>

                        <TableCell>
                            <Badge tone={STATUS_TONE[client.status]}>
                                {t.clients.status[client.status]}
                            </Badge>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
