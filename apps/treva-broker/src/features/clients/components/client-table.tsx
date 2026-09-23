"use client";

import { Delete02Icon, Edit03Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { MouseEvent } from "react";

import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
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
import { cn } from "@/lib/utils/cn";
import { useI18n } from "@/providers/i18n-provider";
import { useSession } from "@/providers/session-provider";
import type { Client, ClientStatus } from "../types";

const STATUS_TONE: Record<ClientStatus, "positive" | "notice" | "negative"> = {
    approved: "positive",
    pending: "notice",
    rejected: "negative",
};

export interface ClientTableProps {
    clients: readonly Client[];
    /** Asks before deleting; the list owns the confirmation dialog. */
    onDelete: (client: Client) => void;
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
 * No selection column. The actions column is the one addition to the artboard:
 * Edit opens the lead form for the row (873:49378) and Delete asks first. They
 * are the Broker Role rows' 28px chips (873:49494), so row actions look the
 * same across the app, and each shows only with its permission. The column is
 * wide enough for the longest labels (Russian) with the chips set right.
 */
export function ClientTable({ clients, onDelete }: ClientTableProps) {
    const { locale, t } = useI18n();
    const router = useRouter();
    const { can } = useSession();

    const canEdit = can("clients:update");
    const canDelete = can("clients:delete");
    const hasActions = canEdit || canDelete;

    // The whole row opens the client (873:49403). A click that lands on one of
    // the row's own controls — the name link, Edit, Delete — is theirs, and a
    // modified click is left to the name link so "open in new tab" still works.
    function openRow(event: MouseEvent<HTMLTableRowElement>, client: Client) {
        if (event.defaultPrevented || event.button !== 0) return;
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        if ((event.target as HTMLElement).closest("a, button")) return;
        router.push(routes.clientDetail(locale, client.id));
    }

    return (
        <Table className="table-fixed">
            <TableHead>
                <TableRow>
                    <TableHeaderCell className="w-9">{t.clients.columns.index}</TableHeaderCell>
                    <TableHeaderCell>{t.clients.columns.fullName}</TableHeaderCell>
                    <TableHeaderCell>{t.clients.columns.contacts}</TableHeaderCell>
                    <TableHeaderCell>{t.clients.columns.objectOfInterest}</TableHeaderCell>
                    <TableHeaderCell>{t.clients.columns.status}</TableHeaderCell>
                    {hasActions ? (
                        <TableHeaderCell className="w-[272px]">
                            <span className="sr-only">{t.clients.columns.actions}</span>
                        </TableHeaderCell>
                    ) : null}
                </TableRow>
            </TableHead>

            <TableBody>
                {clients.map((client, index) => (
                    <TableRow key={client.id} interactive onClick={(event) => openRow(event, client)}>
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
                                // 10px uppercase pill the news cards use. The
                                // green is Content/Positive (873:49815), not the
                                // Bold shade the tone carries elsewhere.
                                className={cn(
                                    "px-2 py-1 text-xs font-medium tracking-normal normal-case",
                                    client.status === "approved" && "text-content-positive",
                                )}
                            >
                                {client.status === "approved" && client.approvedUntil
                                    ? interpolate(t.clients.status.approvedUntil, {
                                          date: approvalDate(client.approvedUntil),
                                      })
                                    : t.clients.status[client.status]}
                            </Badge>
                        </TableCell>

                        {hasActions ? (
                            <TableCell>
                                <div className="flex items-center justify-end gap-2">
                                    {canEdit ? (
                                        // A link, not a button: Edit is a place
                                        // (/clients/:id/edit), so it opens in a new
                                        // tab and survives a reload like any page.
                                        <Link
                                            href={routes.clientEdit(locale, client.id)}
                                            className={cn(
                                                buttonVariants({ variant: "brandOutline", size: "chip" }),
                                                "shrink-0",
                                            )}
                                        >
                                            <HugeiconsIcon icon={Edit03Icon} size={16} strokeWidth={1.5} />
                                            {t.common.edit}
                                        </Link>
                                    ) : null}

                                    {canDelete ? (
                                        <Button
                                            variant="dangerOutline"
                                            size="chip"
                                            className="shrink-0"
                                            leadingIcon={
                                                <HugeiconsIcon icon={Delete02Icon} size={16} strokeWidth={1.5} />
                                            }
                                            onClick={() => onDelete(client)}
                                        >
                                            {t.common.delete}
                                        </Button>
                                    ) : null}
                                </div>
                            </TableCell>
                        ) : null}
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
