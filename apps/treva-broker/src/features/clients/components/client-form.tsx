"use client";

import { Add01Icon, MinusSignIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useId, useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { isApiError } from "@/lib/api/errors";
import { MOCK_PROJECTS } from "@/mocks/projects";
import { useI18n } from "@/providers/i18n-provider";
import { useSession } from "@/providers/session-provider";
import { useCreateClient, useUpdateClient } from "../hooks/use-clients";
import type { Client, ClientInput } from "../types";

export interface ClientFormProps {
    client: Client | null;
    onDone: () => void;
    onCancel: () => void;
}

/**
 * The lead form (artboard 873:49382).
 *
 * Geometry read off the artboard rather than eyeballed: the card is padded 20
 * on every side with 16 between rows, the two columns are 24 apart, every field
 * is 36 tall under a 12/Semibold label, the comments box is 120 tall with a
 * 3XL radius, and the action row is 36 tall with its button pinned right.
 *
 * There is no "Assigned broker" field: the design dropped it because whoever
 * registers the lead owns it, so the broker id comes from the session.
 *
 * Cancel is the one addition. The artboard draws a single "Submit for approval"
 * button, but this form replaces the whole list rather than opening over it, so
 * without a way back the user would be stranded.
 */
export function ClientForm({ client, onDone, onCancel }: ClientFormProps) {
    const { t } = useI18n();
    const { user } = useSession();
    const createClient = useCreateClient();
    const updateClient = useUpdateClient();

    const consentId = useId();
    const [error, setError] = useState<string | null>(null);
    // Extra numbers behind the 36x36 "+" (873:49393). Held as state because the
    // artboard only draws the collapsed row — the count is a runtime thing.
    const [extraPhones, setExtraPhones] = useState<string[]>(client?.additionalPhones ?? []);

    const editing = client !== null;
    const pending = createClient.isPending || updateClient.isPending;

    const projectOptions = MOCK_PROJECTS.map((project) => ({
        value: project.name,
        label: project.name,
    }));

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError(null);

        const formData = new FormData(event.currentTarget);
        const input: ClientInput = {
            firstName: String(formData.get("firstName") ?? "").trim(),
            lastName: String(formData.get("lastName") ?? "").trim(),
            phone: String(formData.get("phone") ?? "").trim(),
            additionalPhones: extraPhones.map((value) => value.trim()).filter(Boolean),
            email: String(formData.get("email") ?? "").trim(),
            brokerId: client?.brokerId ?? user.id,
            objectOfInterest: String(formData.get("objectOfInterest") ?? ""),
            developerBrand: String(formData.get("developerBrand") ?? "").trim(),
            website: String(formData.get("website") ?? "").trim(),
            comments: String(formData.get("comments") ?? "").trim(),
            consent: formData.get("consent") === "on",
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
        <div className="rounded-md bg-bg-primary p-5 shadow-l1">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <h2 className="text-base font-bold text-content-secondary">
                    {editing ? t.clients.form.editTitle : t.clients.form.createTitle}
                </h2>

                <div className="grid gap-x-6 gap-y-4 md:grid-cols-2">
                    <Input
                        name="firstName"
                        label={t.clients.form.name}
                        surface="form"
                        size="sm"
                        defaultValue={client?.firstName}
                        required
                    />
                    <Input
                        name="lastName"
                        label={t.clients.form.surname}
                        surface="form"
                        size="sm"
                        defaultValue={client?.lastName}
                    />

                    {/* The phone column carries a 36x36 button flush with the
                        bottom of the field (873:49393) for a second number. */}
                    <div className="flex flex-col gap-3">
                        <div className="flex items-end gap-3">
                            <Input
                                name="phone"
                                type="tel"
                                label={t.clients.form.primaryNumber}
                                placeholder="+994"
                                surface="form"
                                size="sm"
                                defaultValue={client?.phone}
                                required
                            />
                            <Button
                                type="button"
                                variant="secondary"
                                size="iconSm"
                                className="size-9 shrink-0 rounded-md border border-border-inverse bg-bg-tertiary"
                                aria-label={t.clients.form.addPhone}
                                title={t.clients.form.addPhone}
                                onClick={() => setExtraPhones((current) => [...current, ""])}
                            >
                                <HugeiconsIcon icon={Add01Icon} size={16} strokeWidth={1.8} />
                            </Button>
                        </div>

                        {extraPhones.map((value, index) => (
                            // Index is the identity here: the fields are
                            // interchangeable, and the values are controlled so
                            // removing one takes its value with it rather than
                            // leaving it behind in the field that shifts up.
                            <div key={index} className="flex items-end gap-3">
                                <Input
                                    type="tel"
                                    placeholder="+994"
                                    surface="form"
                                    size="sm"
                                    value={value}
                                    onChange={(event) =>
                                        setExtraPhones((current) =>
                                            current.map((entry, entryIndex) =>
                                                entryIndex === index ? event.target.value : entry,
                                            ),
                                        )
                                    }
                                    aria-label={t.clients.form.addPhone}
                                />
                                <Button
                                    type="button"
                                    variant="secondary"
                                    size="iconSm"
                                    className="size-9 shrink-0 rounded-md border border-border-inverse bg-bg-tertiary"
                                    aria-label={t.clients.form.removePhone}
                                    title={t.clients.form.removePhone}
                                    onClick={() =>
                                        setExtraPhones((current) =>
                                            current.filter(
                                                (_, entryIndex) => entryIndex !== index,
                                            ),
                                        )
                                    }
                                >
                                    <HugeiconsIcon
                                        icon={MinusSignIcon}
                                        size={16}
                                        strokeWidth={1.8}
                                    />
                                </Button>
                            </div>
                        ))}
                    </div>

                    <Input
                        name="email"
                        type="email"
                        label={t.clients.form.email}
                        surface="form"
                        size="sm"
                        defaultValue={client?.email}
                    />
                </div>

                <Select
                    name="objectOfInterest"
                    label={t.clients.form.objectOfInterest}
                    placeholder={t.clients.form.objectOfInterestPlaceholder}
                    defaultValue={client?.objectOfInterest ?? ""}
                    options={projectOptions}
                    className="h-9 border-border-tertiary bg-bg-primary pr-3 pl-4"
                    required
                />

                <div className="grid gap-x-6 gap-y-4 md:grid-cols-2">
                    <Input
                        name="developerBrand"
                        label={t.clients.form.developerBrand}
                        placeholder={t.clients.form.developerBrand}
                        surface="form"
                        size="sm"
                        defaultValue={client?.developerBrand}
                    />
                    <Input
                        name="website"
                        label={t.clients.form.website}
                        placeholder={t.clients.form.website}
                        surface="form"
                        size="sm"
                        defaultValue={client?.website}
                    />
                </div>

                <Textarea
                    name="comments"
                    label={t.clients.form.comments}
                    defaultValue={client?.comments}
                    className="h-[120px] rounded-lg border-border-tertiary bg-bg-primary p-3"
                />

                {/* The consent line carries a link, so the label is written out
                    here rather than passed to Checkbox as a string. */}
                <div className="flex items-center gap-1">
                    <Checkbox
                        id={consentId}
                        name="consent"
                        defaultChecked={client?.consent ?? false}
                    />
                    <label htmlFor={consentId} className="cursor-pointer text-content-secondary">
                        {t.clients.form.consentBefore}{" "}
                        <span className="text-content-link">{t.clients.form.consentLink}</span>{" "}
                        {t.clients.form.consentAfter}
                    </label>
                </div>

                {error ? (
                    <p role="alert" className="text-sm text-content-negative">
                        {error}
                    </p>
                ) : null}

                <div className="flex h-9 items-center justify-end gap-2">
                    <Button type="button" variant="ghost" size="sm" className="h-9" onClick={onCancel}>
                        {t.common.cancel}
                    </Button>
                    <Button
                        type="submit"
                        size="sm"
                        className="h-9 min-w-[162px] rounded-lg px-3.5"
                        loading={pending}
                    >
                        {t.clients.form.submit}
                    </Button>
                </div>
            </form>
        </div>
    );
}
