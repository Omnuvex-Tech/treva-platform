"use client";

import { useEffect, useId, useState, type FormEvent } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { UploadDropzone } from "@/components/ui/upload-dropzone";
import { interpolate } from "@/lib/i18n/interpolate";
import { formatDate } from "@/lib/utils/format";
import { useI18n } from "@/providers/i18n-provider";
import type { SaleRow } from "../types";

/** The formats the dropzone's own hint promises (382:13518). */
const ACCEPT = "image/jpeg,image/png,application/pdf,video/mp4";
const MAX_BYTES = 60 * 1024 * 1024;

export interface SaleRequestValues {
    name: string;
    surname: string;
    number: string;
    finId: string;
    listingPrice: string;
    salesPrice: string;
    downPayment: string;
    creditTerm: string;
    receivable: string;
    paid: string;
    remaining: string;
    files: File[];
}

export interface SaleRequestModalProps {
    open: boolean;
    onClose: () => void;
    /** The sale the request is about — it names the modal and fills the money. */
    sale: SaleRow | null;
    onSubmit: (values: SaleRequestValues) => void;
}

/**
 * `Modal` (1173:18646) — the request raised against one sale.
 *
 * The artboard sits immediately to the right of Finance (1173:17952), and its
 * title is the sale's own identity: "Project name , Building name, Unity name,
 * Sales Date". That is a template, not a label, so it is filled from the row
 * rather than printed literally — a modal that titled every sale the same would
 * be the one thing the title exists to prevent.
 *
 * Twelve slots in three rows of four (250px wide, 24px apart), but only eleven
 * take input: Last Payment Date carries a pill instead of a field (1173:18675),
 * because the date belongs to the approved payment plan and is not the broker's
 * to type.
 *
 * The fields are uncontrolled and read back through `FormData` on submit. With
 * eleven of them, controlled state would be eleven `useState` calls and eleven
 * handlers for a form that is read exactly once.
 */
export function SaleRequestModal({ open, onClose, sale, onSubmit }: SaleRequestModalProps) {
    const { locale, t } = useI18n();
    const consentId = useId();
    const [files, setFiles] = useState<File[]>([]);

    // `defaultValue` only seeds the first render, so the form is remounted per
    // opening rather than left holding the previous sale's numbers.
    const formKey = open ? (sale?.id ?? "none") : "closed";

    useEffect(() => {
        if (open) setFiles([]);
    }, [open, sale?.id]);

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const data = new FormData(event.currentTarget);
        const read = (field: string) => String(data.get(field) ?? "").trim();

        onSubmit({
            name: read("name"),
            surname: read("surname"),
            number: read("number"),
            finId: read("finId"),
            listingPrice: read("listingPrice"),
            salesPrice: read("salesPrice"),
            downPayment: read("downPayment"),
            creditTerm: read("creditTerm"),
            receivable: read("receivable"),
            paid: read("paid"),
            remaining: read("remaining"),
            files,
        });

        onClose();
    }

    const title = sale
        ? `${sale.projectName} , ${sale.buildingName}, ${sale.unit}, ${formatDate(sale.salesDate, locale)}`
        : "";

    return (
        <Modal
            open={open}
            onClose={onClose}
            variant="plain"
            // 1112px in the artboard — far past the `sm`/`md`/`lg` ladder, which
            // stops at 896.
            className="max-w-278"
            title={title}
            closeLabel={t.common.close}
        >
            <form key={formKey} onSubmit={handleSubmit} className="flex flex-col gap-4">
                {/* Three rows of four, 250px apart by 24 (1173:18653). */}
                <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 xl:grid-cols-4">
                    <Input surface="light" size="sm" name="name" label={t.finance.request.name} />
                    <Input
                        surface="light"
                        size="sm"
                        name="surname"
                        label={t.finance.request.surname}
                    />
                    <Input
                        surface="light"
                        size="sm"
                        name="number"
                        type="tel"
                        label={t.finance.request.number}
                    />
                    <Input surface="light" size="sm" name="finId" label={t.finance.request.finId} />

                    <Input
                        surface="light"
                        size="sm"
                        name="listingPrice"
                        label={t.finance.columns.listingPrice}
                        defaultValue={sale ? String(sale.listingPrice) : ""}
                    />
                    <Input
                        surface="light"
                        size="sm"
                        name="salesPrice"
                        label={t.finance.columns.salesPrice}
                        defaultValue={sale ? String(sale.salesPrice) : ""}
                    />
                    <Input
                        surface="light"
                        size="sm"
                        name="downPayment"
                        label={t.finance.request.downPayment}
                        defaultValue={sale ? String(sale.downPayment) : ""}
                    />
                    <Input
                        surface="light"
                        size="sm"
                        name="creditTerm"
                        label={t.finance.request.creditTerm}
                        defaultValue={sale?.creditTerm ?? ""}
                    />

                    <Input
                        surface="light"
                        size="sm"
                        name="receivable"
                        label={t.finance.columns.receivable}
                        defaultValue={sale ? String(sale.receivable) : ""}
                    />
                    <Input
                        surface="light"
                        size="sm"
                        name="paid"
                        label={t.finance.columns.paid}
                        defaultValue={sale ? String(sale.paid) : ""}
                    />
                    <Input
                        surface="light"
                        size="sm"
                        name="remaining"
                        label={t.finance.columns.remaining}
                        defaultValue={sale ? String(sale.remaining) : ""}
                    />

                    {/* The one slot that reads rather than takes (1173:18667):
                        the label of a field over a 36px row ruled only along the
                        bottom, holding the plan's standing approval. */}
                    <div className="flex w-full flex-col">
                        <span className="mb-1 text-xs font-semibold text-content-secondary">
                            {t.finance.request.lastPaymentDate}
                        </span>
                        <div className="flex h-9 items-center border-b border-border-subtle bg-bg-primary px-3">
                            {sale ? (
                                <Badge tone="positive" size="field">
                                    {interpolate(t.finance.request.approvedUntil, {
                                        date: formatDate(sale.approvedUntil, locale),
                                    })}
                                </Badge>
                            ) : null}
                        </div>
                    </div>
                </div>

                <UploadDropzone
                    accept={ACCEPT}
                    multiple
                    title={t.common.upload.dragDrop}
                    hint={t.common.upload.formats}
                    orLabel={t.common.upload.or}
                    buttonLabel={t.common.upload.selectFile}
                    onFiles={(picked) =>
                        setFiles(picked.filter((file) => file.size <= MAX_BYTES))
                    }
                />

                {/* 4px between the box and the sentence, and the label is inked
                    Content/Secondary rather than the checkbox default. */}
                <div className="flex items-center gap-1">
                    <Checkbox id={consentId} name="consent" required />
                    <label
                        htmlFor={consentId}
                        className="cursor-pointer text-sm text-content-secondary"
                    >
                        {t.finance.request.consentPrefix}
                        <span className="text-content-link">{t.finance.request.consentLink}</span>
                        {t.finance.request.consentSuffix}
                    </label>
                </div>

                <div className="flex justify-end">
                    <Button
                        type="submit"
                        // 116x36 on the 3XL radius with 14px of side padding —
                        // `md` is the nearest step at 40px and 12px (1173:18680).
                        className="h-9 rounded-lg px-3.5"
                    >
                        {t.finance.request.submit}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
