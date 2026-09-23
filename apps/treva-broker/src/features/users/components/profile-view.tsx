"use client";

import { Add01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEffect, useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Panel, PanelTitle } from "@/components/ui/panel";
import { isApiError } from "@/lib/api/errors";
import { useI18n } from "@/providers/i18n-provider";
import { useSession } from "@/providers/session-provider";
import { useToast } from "@/providers/toast-provider";
import { useUpdateUser, useUser } from "../hooks/use-users";

/**
 * The signed-in account's own card (873:48750) — the account edits its own
 * Name, Surname, Primary number and Email here, with Password alongside as
 * the only field that stays blank between visits.
 *
 * The artboard is the collapsed-rail state, but the rail's width is a stored
 * preference, so this screen does not force it.
 */
export function ProfileView() {
    const { t } = useI18n();
    const { user } = useSession();
    const toast = useToast();

    const accountQuery = useUser(user.id);
    const updateUser = useUpdateUser();

    // The session carries one name; the artboard splits it in two.
    const [sessionFirstName = "", ...sessionRest] = user.fullName.split(" ");

    const [firstName, setFirstName] = useState(sessionFirstName);
    const [lastName, setLastName] = useState(sessionRest.join(" "));
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState(user.email);
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);

    const account = accountQuery.data;

    // Fields start from the session and swap to the fetched account once it
    // lands, so the fields the account edits reflect what will actually save.
    useEffect(() => {
        if (!account) return;
        setFirstName(account.firstName);
        setLastName(account.lastName);
        setPhone(account.phones[0] ?? "");
        setEmail(account.email);
    }, [account]);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError(null);

        try {
            await updateUser.mutateAsync({
                id: user.id,
                input: {
                    firstName,
                    lastName,
                    email,
                    phones: phone ? [phone] : [],
                    ...(password ? { password } : {}),
                },
            });
            setPassword("");
            toast.success(t.users.userUpdated);
        } catch (submitError) {
            setError(isApiError(submitError) ? submitError.message : t.common.error);
        }
    }

    return (
        <div className="flex flex-col px-4 pt-4 pb-8">
            <form onSubmit={handleSubmit} className="px-2">
                <Panel className="flex flex-col gap-4">
                    <PanelTitle>{t.users.profile.title}</PanelTitle>

                    <div className="flex flex-col gap-4 md:flex-row md:gap-6">
                        <Input
                            label={t.users.form.firstName}
                            value={firstName}
                            onChange={(event) => setFirstName(event.target.value)}
                            surface="form"
                            size="sm"
                        />
                        <Input
                            label={t.users.form.lastName}
                            value={lastName}
                            onChange={(event) => setLastName(event.target.value)}
                            surface="form"
                            size="sm"
                        />
                    </div>

                    <div className="flex flex-col gap-4 md:flex-row md:gap-6">
                        <div className="flex flex-1 items-end gap-3">
                            <Input
                                type="tel"
                                label={t.users.form.phone}
                                value={phone}
                                onChange={(event) => setPhone(event.target.value)}
                                placeholder="+994"
                                surface="form"
                                size="sm"
                            />
                            <Button
                                variant="secondary"
                                aria-label={t.users.form.addPhone}
                                title={t.users.form.addPhone}
                                className="h-9 shrink-0 rounded-md border border-border-inverse bg-bg-tertiary px-2.5"
                            >
                                <HugeiconsIcon icon={Add01Icon} size={16} strokeWidth={1.8} />
                            </Button>
                        </div>

                        <Input
                            type="email"
                            label={t.users.form.email}
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            surface="form"
                            size="sm"
                            containerClassName="flex-1"
                        />
                    </div>

                    {/* Half width and alone on its row (873:48781). */}
                    <div className="flex flex-col gap-4 md:flex-row md:gap-6">
                        <Input
                            type="password"
                            name="password"
                            label={t.users.form.password}
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            autoComplete="new-password"
                            surface="form"
                            size="sm"
                            containerClassName="flex-1"
                        />
                        <div className="hidden flex-1 md:block" />
                    </div>

                    {error ? (
                        <p role="alert" className="text-sm text-content-negative">
                            {error}
                        </p>
                    ) : null}

                    <div className="flex justify-end">
                        <Button type="submit" disabled={updateUser.isPending}>
                            {t.users.form.save}
                        </Button>
                    </div>
                </Panel>
            </form>
        </div>
    );
}
