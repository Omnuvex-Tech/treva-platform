"use client";

import { Add01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Panel, PanelTitle } from "@/components/ui/panel";
import { isApiError } from "@/lib/api/errors";
import { useI18n } from "@/providers/i18n-provider";
import { useSession } from "@/providers/session-provider";
import { useToast } from "@/providers/toast-provider";
import { useUpdateUser, useUser } from "../hooks/use-users";

/**
 * The signed-in account's own card (873:48750).
 *
 * Four read-only fields over one editable: Name, Surname, Primary number and
 * Email are Background/Disabled boxes with Content/Disabled labels — an account
 * cannot rename itself here — and only Password is a live field. That is the
 * whole screen; the artboard draws neither a second column beside the password
 * nor a save button, so the password commits on Enter and the submit is
 * present but visually hidden rather than invented into the layout.
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

    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);

    const account = accountQuery.data;
    // The session carries one name; the artboard splits it in two.
    const [sessionFirstName = "", ...sessionRest] = user.fullName.split(" ");

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError(null);

        if (!password) return;

        try {
            await updateUser.mutateAsync({ id: user.id, input: { password } });
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
                            value={account?.firstName ?? sessionFirstName}
                            surface="form"
                            size="sm"
                            readOnly
                            disabled
                        />
                        <Input
                            label={t.users.form.lastName}
                            value={account?.lastName ?? sessionRest.join(" ")}
                            surface="form"
                            size="sm"
                            readOnly
                            disabled
                        />
                    </div>

                    <div className="flex flex-col gap-4 md:flex-row md:gap-6">
                        <div className="flex flex-1 items-end gap-3">
                            <Input
                                type="tel"
                                label={t.users.form.phone}
                                value={account?.phone ?? ""}
                                placeholder="+994"
                                surface="form"
                                size="sm"
                                readOnly
                                disabled
                            />
                            {/* Drawn live even though the fields beside it are
                                not — 873:48779 keeps the tertiary fill. */}
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
                            value={account?.email ?? user.email}
                            surface="form"
                            size="sm"
                            readOnly
                            disabled
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

                    <button type="submit" className="sr-only" disabled={updateUser.isPending}>
                        {t.users.form.save}
                    </button>
                </Panel>
            </form>
        </div>
    );
}
