"use client";

import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeaderCell,
    TableRow,
} from "@/components/ui/table";
import { routes } from "@/config/routes";
import { interpolate } from "@/lib/i18n/interpolate";
import { useI18n } from "@/providers/i18n-provider";
import type { Client, ClientStatus } from "../types";

const STATUS_TONE: Record<ClientStatus, "positive" | "notice" | "negative"> = {
    approved: "positive",
    pending: "notice",
    rejected: "negative",
};

export interface ClientTableProps {
    clients: readonly Client[];
}

/**
 * Formats the approval date the way the status pill spells it: "05:08:2026".
 *
 * Colons rather than dots or slashes, and no locale switch — that is literally
 * what 873:49815 draws, and a date the reviewer quotes back is easier to match
 * when every locale prints it identically.
 */
function approvalDate(value: string): string {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";

    const pad = (part: number) => String(part).padStart(2, "0");
    return `${pad(date.getDate())}:${pad(date.getMonth() + 1)}:${date.getFullYear()}`;
}

/**
 * Exactly five columns, per the table block in 873:49772: a 36px row-number
 * column plus four equal content columns (36 + 4 x 263 = 1088). `table-fixed`
 * is what makes the four equal — with auto layout they would size to content.
 *
 * No selection column and no per-row actions: the artboard has neither. Delete
 * lives on the client's own screen (873:49423), which is also where the row
 * leads, so the whole row is the link target rather than just the name.
 */
export function ClientTable({ clients }: ClientTableProps) {
    const { locale, t } = useI18n();

    return (
        <Table className="table-fixed">
            <TableHead>
                <TableRow>
                    <TableHeaderCell className="w-9">{t.clients.columns.index}</TableHeaderCell>
                    <TableHeaderCell>{t.clients.columns.fullName}</TableHeaderCell>
                    <TableHeaderCell>{t.clients.columns.contacts}</TableHeaderCell>
                    <TableHeaderCell>{t.clients.columns.objectOfInterest}</TableHeaderCell>
                    <TableHeaderCell>{t.clients.columns.status}</TableHeaderCell>
                </TableRow>
            </TableHead>

            <TableBody>
                {clients.map((client, index) => (
                    <TableRow key={client.id} interactive>
                        <TableCell>{index + 1}</TableCell>

                        <TableCell className="truncate px-0">
                            {/* The link fills the cell so the row reads as one
                                target — there is no checkbox in it to swallow. */}
                            <Link
                                href={routes.clientDetail(locale, client.id)}
                                className="flex h-full items-center truncate px-3 hover:underline"
                            >
                                {client.firstName} {client.lastName}
                            </Link>
                        </TableCell>

                        <TableCell className="truncate">{client.phone}</TableCell>
                        <TableCell className="truncate">{client.objectOfInterest}</TableCell>

                        <TableCell>
                            <Badge
                                tone={STATUS_TONE[client.status]}
                                // 8px/4px padding on a 12/Medium line, not the
                                // 10px uppercase pill the news cards use.
                                className="px-2 py-1 text-xs font-medium tracking-normal normal-case"
                            >
                                {client.status === "approved" && client.approvedUntil
                                    ? interpolate(t.clients.status.approvedUntil, {
                                          date: approvalDate(client.approvedUntil),
                                      })
                                    : t.clients.status[client.status]}
                            </Badge>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
