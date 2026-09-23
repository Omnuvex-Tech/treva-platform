"use client";

import { Add01Icon, MinusIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/providers/i18n-provider";

export interface PhoneListFieldProps {
    /** Posted once per row, so `new FormData(form).getAll(name)` is the list. */
    name: string;
    label: string;
    /** Existing numbers; an empty list still draws one blank row to type into. */
    defaultValue?: readonly string[];
    /** The first row carries the asterisk and cannot be removed. */
    required?: boolean;
    disabled?: boolean;
}

/**
 * The phone field with its "add another number" button (873:48716).
 *
 * The artboard draws one 36px field with a 36px square button beside it,
 * bottom-aligned so the button clears the label. Extra rows repeat the field
 * without the label, and their button is a minus that takes the row away — the
 * artboard never draws a second row, so the minus is the one invention here,
 * and it borrows the plus button's box exactly.
 *
 * Rows are keyed by a counter rather than by index: removing the middle row of
 * three must not hand its value to the row that shifts up into its place.
 */
export function PhoneListField({
    name,
    label,
    defaultValue,
    required,
    disabled,
}: PhoneListFieldProps) {
    const { t } = useI18n();

    const [rows, setRows] = useState<{ key: number; value: string }[]>(() => {
        const values = (defaultValue ?? []).filter(Boolean);
        return (values.length > 0 ? values : [""]).map((value, index) => ({
            key: index,
            value,
        }));
    });
    const [nextKey, setNextKey] = useState(() => Math.max(rows.length, 1));

    function addRow() {
        setRows((current) => [...current, { key: nextKey, value: "" }]);
        setNextKey((key) => key + 1);
    }

    function removeRow(key: number) {
        setRows((current) => current.filter((row) => row.key !== key));
    }

    function setValue(key: number, value: string) {
        setRows((current) =>
            current.map((row) => (row.key === key ? { ...row, value } : row)),
        );
    }

    return (
        // flex-1, not w-full: the card lays its fields out two to a row and
        // every half declares a 0 basis, so a half that declared its width
        // instead would starve the other one.
        <div className="flex flex-1 flex-col gap-3">
            {rows.map((row, index) => {
                const first = index === 0;

                return (
                    <div key={row.key} className="flex items-end gap-3">
                        <Input
                            name={name}
                            type="tel"
                            // Only the first row is labelled: the rows below it
                            // are the same field, not new ones.
                            label={first ? label : undefined}
                            aria-label={first ? undefined : label}
                            value={row.value}
                            onChange={(event) => setValue(row.key, event.target.value)}
                            placeholder="+994"
                            surface="form"
                            size="sm"
                            required={required && first}
                            disabled={disabled}
                        />

                        <Button
                            type="button"
                            variant="secondary"
                            disabled={disabled}
                            aria-label={first ? t.users.form.addPhone : t.users.form.removePhone}
                            title={first ? t.users.form.addPhone : t.users.form.removePhone}
                            onClick={() => (first ? addRow() : removeRow(row.key))}
                            className="h-9 shrink-0 rounded-md border border-border-inverse bg-bg-tertiary px-2.5"
                        >
                            <HugeiconsIcon
                                icon={first ? Add01Icon : MinusIcon}
                                size={16}
                                strokeWidth={1.8}
                            />
                        </Button>
                    </div>
                );
            })}
        </div>
    );
}
