"use client";

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
 * Client create/edit card. Mirrors the artboard: two input rows, a full-width
 * broker select, one more input row, a tall notes field and a consent
 * checkbox above the action row.
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
                <h2 className="text-base font-semibold text-content-primary">
                    {editing ? t.clients.form.editTitle : t.clients.form.createTitle}
                </h2>

                <div className="grid gap-4 md:grid-cols-2">
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
                    <Input
                        name="phone"
                        type="tel"
                        label={t.clients.form.phone}
                        defaultValue={client?.phone}
                        required
                    />
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
                    options={MOCK_BROKERS.map((broker) => ({ value: broker.id, label: broker.name }))}
                />

                <div className="grid gap-4 md:grid-cols-2">
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
                    rows={5}
                    label={t.clients.form.notes}
                    placeholder={t.clients.form.notesPlaceholder}
                    defaultValue={client?.notes}
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

                <div className="flex items-center justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={onCancel}>
                        {t.common.cancel}
                    </Button>
                    <Button type="submit" size="sm" loading={pending}>
                        {t.clients.form.save}
                    </Button>
                </div>
            </form>
        </Card>
    );
}
