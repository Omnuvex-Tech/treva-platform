"use client";

import { Cancel01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Panel, PanelTitle } from "@/components/ui/panel";
import { PhoneListField } from "@/components/ui/phone-list-field";
import { Select } from "@/components/ui/select";
import { routes } from "@/config/routes";
import { isApiError } from "@/lib/api/errors";
import { useI18n } from "@/providers/i18n-provider";
import { useToast } from "@/providers/toast-provider";
import {
    useCreateAgency,
    useManagerOptions,
    useUpdateAgency,
} from "../hooks/use-agencies";
import type { Agency, AgencyInput } from "../types";

export interface AgencyFormViewProps {
    /** `null` creates an agency, otherwise the form edits this one. */
    agency: Agency | null;
}

/**
 * The value the Manager select carries when the admin wants a manager who does
 * not have an account yet. Not a real id, and never sent as one.
 */
const NEW_MANAGER = "__new__";

/**
 * Real estate create and edit — the Real Estate Agencies tab's own form.
 *
 * The tab has no artboard for a form, so this one borrows the agent form's card
 * (873:48686) and fills it with the tab's five columns (873:48597): Name,
 * Manager, Contacts, Organization and E-Mail.
 *
 * Manager is a picker, not a text field: an agency's manager is the account that
 * owns it, and `Company.ownerId` is required, so the field chooses one of the
 * accounts that belongs to no agency yet. Picking "add a new manager" falls back
 * to the name and email fields, which create the account instead — the only way
 * to file an agency whose manager is not on the platform.
 */
export function AgencyFormView({ agency }: AgencyFormViewProps) {
    const { locale, t } = useI18n();
    const router = useRouter();
    const toast = useToast();

    const createAgency = useCreateAgency();
    const updateAgency = useUpdateAgency();
    const managerOptions = useManagerOptions();

    const editing = agency !== null;

    // Editing opens on the current manager, who is not in the options list —
    // they belong to this agency — so the list carries them as an extra entry.
    const [managerId, setManagerId] = useState(agency?.managerId ?? "");
    const [error, setError] = useState<string | null>(null);

    const creatingManager = managerId === NEW_MANAGER;
    const pending = createAgency.isPending || updateAgency.isPending;

    const available = managerOptions.data ?? [];
    const chosen = available.find((option) => option.id === managerId);

    const options = [
        ...(editing
            ? [{ value: agency.managerId, label: agency.managerName || agency.email }]
            : []),
        ...available.map((option) => ({
            value: option.id,
            label: option.email ? `${option.fullName} — ${option.email}` : option.fullName,
        })),
        { value: NEW_MANAGER, label: t.users.agencyForm.managerNew },
    ];

    // Whose numbers the Contacts rows start from: the chosen account's, the
    // agency's current manager, or nothing at all for a manager being created.
    const phones = creatingManager ? [] : (chosen?.phones ?? agency?.phones ?? []);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError(null);

        const formData = new FormData(event.currentTarget);
        const input: AgencyInput = {
            name: String(formData.get("name") ?? "").trim(),
            managerId: creatingManager ? "" : managerId,
            phones: formData
                .getAll("phones")
                .map((value) => String(value).trim())
                .filter(Boolean),
            organization: String(formData.get("organization") ?? "").trim(),
            // The three fields below belong to a manager being created, and
            // the form does not draw them otherwise. Sending them anyway as
            // "" told the API an empty address had been supplied, which it
            // rightly refused.
            ...(creatingManager
                ? {
                      managerName: String(formData.get("managerName") ?? "").trim(),
                      email: String(formData.get("email") ?? "").trim(),
                      // Blank generates a one-time password rather than
                      // setting an empty one.
                      password: String(formData.get("password") ?? "").trim() || undefined,
                  }
                : {}),
        };

        try {
            if (editing) {
                await updateAgency.mutateAsync({ id: agency.id, input });
                toast.success(t.users.agencyUpdated);
            } else {
                await createAgency.mutateAsync(input);
                toast.success(t.users.agencyAdded);
            }
            router.push(routes.adminUsers(locale));
        } catch (submitError) {
            setError(isApiError(submitError) ? submitError.message : t.common.error);
        }
    }

    return (
        <div className="flex flex-col px-4 pt-4 pb-8">
            <form onSubmit={handleSubmit} className="px-2">
                <Panel className="flex flex-col gap-4">
                    <PanelTitle>
                        <span className="flex-1">
                            {editing
                                ? t.users.agencyForm.editTitle
                                : t.users.agencyForm.createTitle}
                        </span>

                        <button
                            type="button"
                            onClick={() => router.push(routes.adminUsers(locale))}
                            aria-label={t.common.close}
                            title={t.common.close}
                            className="flex size-8 shrink-0 items-center justify-center rounded-md border border-border-inverse bg-bg-tertiary text-content-secondary transition-colors hover:bg-border-tertiary hover:text-content-primary"
                        >
                            <HugeiconsIcon icon={Cancel01Icon} size={16} strokeWidth={1.6} />
                        </button>
                    </PanelTitle>

                    <div className="flex flex-col gap-4 md:flex-row md:gap-6">
                        <Input
                            name="name"
                            label={t.users.agencyForm.name}
                            defaultValue={agency?.name}
                            surface="form"
                            size="sm"
                            containerClassName="flex-1"
                            required
                        />
                        <Input
                            name="organization"
                            label={t.users.agencyForm.organization}
                            defaultValue={agency?.organization}
                            surface="form"
                            size="sm"
                            containerClassName="flex-1"
                        />
                    </div>

                    <div className="flex flex-col gap-4 md:flex-row md:gap-6">
                        <Select
                            label={t.users.agencyForm.manager}
                            value={managerId}
                            onChange={setManagerId}
                            options={options}
                            placeholder={t.users.agencyForm.managerPlaceholder}
                            required
                            className="h-9 border-border-tertiary bg-bg-primary pr-3 pl-4 [&_svg]:size-5"
                            containerClassName="flex-1"
                        />

                        {/* Remounted per manager so the rows reset to whoever is
                            now selected — the numbers belong to the account, not
                            to the form. */}
                        <PhoneListField
                            key={managerId}
                            name="phones"
                            label={t.users.agencyForm.phone}
                            defaultValue={phones}
                        />
                    </div>

                    {/* Only a manager being created needs a name and an address:
                        an existing account already has both, and the form must
                        not look like it can rewrite them from here. */}
                    {creatingManager ? (
                        <>
                            <div className="flex flex-col gap-4 md:flex-row md:gap-6">
                                <Input
                                    name="managerName"
                                    label={t.users.agencyForm.managerName}
                                    surface="form"
                                    size="sm"
                                    containerClassName="flex-1"
                                    required
                                />
                                <Input
                                    name="email"
                                    type="email"
                                    label={t.users.agencyForm.email}
                                    surface="form"
                                    size="sm"
                                    containerClassName="flex-1"
                                    required
                                />
                            </div>

                            {/* What the manager signs in with. Blank generates a
                                one-time password instead, which the admin then has
                                to pass on. */}
                            <div className="flex flex-col gap-4 md:flex-row md:gap-6">
                                <Input
                                    name="password"
                                    type="password"
                                    autoComplete="new-password"
                                    label={t.users.form.password}
                                    hint={t.users.form.passwordCreateHint}
                                    minLength={8}
                                    surface="form"
                                    size="sm"
                                    containerClassName="md:w-[524px]"
                                />
                            </div>
                        </>
                    ) : null}

                    <p className="max-w-[524px] text-xs leading-[18px] text-content-tertiary">
                        {t.users.agencyForm.managerNote}
                    </p>

                    {error ? (
                        <p role="alert" className="text-sm text-content-negative">
                            {error}
                        </p>
                    ) : null}

                    <div className="flex justify-end">
                        <Button type="submit" loading={pending} className="h-9 rounded-lg px-3.5">
                            {editing ? t.users.form.save : t.users.form.create}
                        </Button>
                    </div>
                </Panel>
            </form>
        </div>
    );
}
