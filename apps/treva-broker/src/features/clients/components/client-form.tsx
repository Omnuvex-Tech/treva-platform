"use client";

import { Add01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { isApiError } from "@/lib/api/errors";
import { MOCK_BROKERS } from "@/mocks/clients";
import { useI18n } from "@/providers/i18n-provider";
import { useCreateClient, useUpdateClient } from "../hooks/use-clients";
import type { Client, ClientInput } from "../types";

export interface ClientFormProps {
    client: Client | null;
    onDone: () => void;
    onCancel: () => void;
}

/**
 * The lead form (artboard 873:49381).
 *
 * Geometry read off the artboard rather than eyeballed: the card is padded 20
 * on every side, rows are 16 apart, the two columns are 24 apart, the notes
 * field is 142 tall, and the action row holds a single button pinned right —
 * the design has no Cancel next to it.
 *
 * Cancel therefore lives outside this card, on the screen that opens the form;
 * a form the user cannot back out of would be a trap, and putting the escape
 * where the artboard does not draw a button keeps this component faithful.
 *
 * The broker list is read from the mock fixtures for now; it becomes a
 * `GET /brokers` query the moment the API exists.
 */
export function ClientForm({ client, onDone, onCancel }: ClientFormProps) {
    const { t } = useI18n();
    const createClient = useCreateClient();
    const updateClient = useUpdateClient();

    const [error, setError] = useState<string | null>(null);
    const editing = client !== null;
    const pending = createClient.isPending || updateClient.isPending;

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError(null);

        const formData = new FormData(event.currentTarget);
        const input: ClientInput = {
            firstName: String(formData.get("firstName") ?? "").trim(),
            lastName: String(formData.get("lastName") ?? "").trim(),
            phone: String(formData.get("phone") ?? "").trim(),
            email: String(formData.get("email") ?? "").trim(),
            brokerId: String(formData.get("brokerId") ?? ""),
            budget: Number(formData.get("budget") ?? 0),
            interest: String(formData.get("interest") ?? "").trim(),
            notes: String(formData.get("notes") ?? "").trim(),
            marketingConsent: formData.get("marketingConsent") === "on",
        };

        try {
            if (editing) {
                await updateClient.mutateAsync({ id: client.id, input });
            } else {
                await createClient.mutateAsync(input);
            }
            onDone();
        } catch (submitError) {
            setError(isApiError(submitError) ? submitError.message : t.common.error);
        }
    }

    return (
        <Card className="p-5">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {/* 20px tall in the artboard, so 14px text — not a 16px heading. */}
                <h2 className="text-sm font-semibold text-content-primary">
                    {editing ? t.clients.form.editTitle : t.clients.form.createTitle}
                </h2>

                <div className="grid gap-x-6 gap-y-4 md:grid-cols-2">
                    <Input
                        name="firstName"
                        label={t.clients.form.firstName}
                        defaultValue={client?.firstName}
                        required
                    />
                    <Input
                        name="lastName"
                        label={t.clients.form.lastName}
                        defaultValue={client?.lastName}
                        required
                    />

                    {/* The phone column carries a 36x36 button flush with the
                        bottom of the field (873:49393) for a second number. */}
                    <div className="flex items-end gap-3">
                        <Input
                            name="phone"
                            type="tel"
                            label={t.clients.form.phone}
                            defaultValue={client?.phone}
                            required
                        />
                        <Button
                            type="button"
                            variant="outline"
                            size="iconSm"
                            className="size-9 shrink-0"
                            aria-label={t.clients.form.addPhone}
                            title={t.clients.form.addPhone}
                        >
                            <HugeiconsIcon icon={Add01Icon} size={16} strokeWidth={1.8} />
                        </Button>
                    </div>

                    <Input
                        name="email"
                        type="email"
                        label={t.clients.form.email}
                        defaultValue={client?.email}
                        required
                    />
                </div>

                <Select
                    name="brokerId"
                    label={t.clients.form.broker}
                    defaultValue={client?.brokerId ?? MOCK_BROKERS[0].id}
                    options={MOCK_BROKERS.map((broker) => ({
                        value: broker.id,
                        label: broker.name,
                    }))}
                />

                <div className="grid gap-x-6 gap-y-4 md:grid-cols-2">
                    <Input
                        name="budget"
                        type="number"
                        min={0}
                        step={1000}
                        label={t.clients.form.budget}
                        defaultValue={client?.budget ?? 0}
                        required
                    />
                    <Input
                        name="interest"
                        label={t.clients.form.interest}
                        defaultValue={client?.interest}
                        required
                    />
                </div>

                <Textarea
                    name="notes"
                    label={t.clients.form.notes}
                    placeholder={t.clients.form.notesPlaceholder}
                    defaultValue={client?.notes}
                    className="h-[142px] resize-none"
                />

                <Checkbox
                    name="marketingConsent"
                    defaultChecked={client?.marketingConsent ?? true}
                    label={t.clients.form.consent}
                />

                {error ? (
                    <p role="alert" className="text-sm text-content-negative">
                        {error}
                    </p>
                ) : null}

                <div className="flex items-center justify-end gap-3">
                    <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
                        {t.common.cancel}
                    </Button>
                    <Button type="submit" size="sm" className="h-9 min-w-[162px]" loading={pending}>
                        {t.clients.form.save}
                    </Button>
                </div>
            </form>
        </Card>
    );
}
