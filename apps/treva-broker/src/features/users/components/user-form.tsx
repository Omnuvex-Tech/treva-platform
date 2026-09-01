"use client";

import { RefreshCw } from "lucide-react";
import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { RadioGroup } from "@/components/ui/radio";
import { Switch } from "@/components/ui/switch";
import { isApiError } from "@/lib/api/errors";
import { ROLES, type Role } from "@/lib/auth/roles";
import { useI18n } from "@/providers/i18n-provider";
import { useCreateUser, useUpdateUser } from "../hooks/use-users";
import type { PlatformUser, UserInput } from "../types";

export interface UserFormProps {
    /** `null` creates a new account, otherwise the form edits this one. */
    user: PlatformUser | null;
    onDone: () => void;
    onCancel: () => void;
}

/**
 * The user create/edit card.
 *
 * Sits *above* the table rather than in an overlay — that is how the artboard
 * composes it (a 1112x552 card, with the table body shrinking underneath), and
 * it is why this is not built on the `Modal` primitive.
 *
 * Layout follows the design: a two-column grid of four input rows, then the
 * role radios and the block toggle side by side, then the action row.
 */
export function UserForm({ user, onDone, onCancel }: UserFormProps) {
    const { t } = useI18n();
    const createUser = useCreateUser();
    const updateUser = useUpdateUser();

    const [role, setRole] = useState<Role>(user?.role ?? "broker");
    const [blocked, setBlocked] = useState(user?.status === "blocked");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState<string | null>(null);

    const editing = user !== null;
    const pending = createUser.isPending || updateUser.isPending;

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError(null);

        if (password !== confirmPassword) {
            setError(t.users.form.passwordMismatch);
            return;
        }

        const formData = new FormData(event.currentTarget);
        const input: UserInput = {
            firstName: String(formData.get("firstName") ?? "").trim(),
            lastName: String(formData.get("lastName") ?? "").trim(),
            email: String(formData.get("email") ?? "").trim(),
            phone: String(formData.get("phone") ?? "").trim(),
            jobTitle: String(formData.get("jobTitle") ?? "").trim(),
            team: String(formData.get("team") ?? "").trim(),
            password,
            role,
            blocked,
        };

        try {
            if (editing) {
                // An empty password field means "leave the current one alone",
                // so it is stripped rather than sent as "".
                const { password: newPassword, ...rest } = input;
                await updateUser.mutateAsync({
                    id: user.id,
                    input: newPassword ? input : rest,
                });
            } else {
                await createUser.mutateAsync(input);
            }
            onDone();
        } catch (submitError) {
            setError(
                isApiError(submitError) ? submitError.message : t.common.error,
            );
        }
    }

    function generatePassword() {
        // Enough entropy for a first-login credential the user will change.
        const generated = Array.from(crypto.getRandomValues(new Uint8Array(9)))
            .map((byte) => byte.toString(36).padStart(2, "0"))
            .join("")
            .slice(0, 14);

        setPassword(generated);
        setConfirmPassword(generated);
    }

    return (
        <Card className="p-5">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <h2 className="text-base font-semibold text-content-primary">
                    {editing ? t.users.form.editTitle : t.users.form.createTitle}
                </h2>

                <div className="grid gap-4 md:grid-cols-2">
                    <Input
                        name="firstName"
                        label={t.users.form.firstName}
                        defaultValue={user?.firstName}
                        required
                    />
                    <Input
                        name="lastName"
                        label={t.users.form.lastName}
                        defaultValue={user?.lastName}
                        required
                    />

                    <div className="flex items-end gap-2">
                        <Input
                            name="password"
                            type="text"
                            label={t.users.form.password}
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            required={!editing}
                            autoComplete="new-password"
                        />
                        <Button
                            variant="outline"
                            size="icon"
                            className="mb-0 size-11 shrink-0"
                            onClick={generatePassword}
                            aria-label={t.users.form.generate}
                            title={t.users.form.generate}
                        >
                            <RefreshCw />
                        </Button>
                    </div>
                    <Input
                        name="confirmPassword"
                        type="text"
                        label={t.users.form.confirmPassword}
                        value={confirmPassword}
                        onChange={(event) => setConfirmPassword(event.target.value)}
                        required={!editing}
                        autoComplete="new-password"
                    />

                    <Input
                        name="email"
                        type="email"
                        label={t.users.form.email}
                        defaultValue={user?.email}
                        required
                    />
                    <Input
                        name="phone"
                        type="tel"
                        label={t.users.form.phone}
                        defaultValue={user?.phone}
                        required
                    />

                    <Input
                        name="jobTitle"
                        label={t.users.form.jobTitle}
                        defaultValue={user?.jobTitle}
                        required
                    />
                    <Input name="team" label={t.users.form.team} defaultValue={user?.team} required />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <div>
                        <RadioGroup
                            name="role"
                            legend={t.users.form.role}
                            value={role}
                            onChange={setRole}
                            options={ROLES.map((value) => ({ value, label: t.roles[value] }))}
                        />
                        <p className="mt-1.5 text-xs text-content-tertiary">{t.users.form.roleHint}</p>
                    </div>

                    <div>
                        <p className="mb-1.5 text-xs font-medium text-content-secondary">
                            {t.users.form.blockAgent}
                        </p>
                        <Switch
                            checked={blocked}
                            onChange={(event) => setBlocked(event.target.checked)}
                            label={t.users.form.blockAgent}
                        />
                        <p className="mt-1.5 text-xs text-content-tertiary">{t.users.form.blockHint}</p>
                    </div>
                </div>

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
                        {t.users.form.save}
                    </Button>
                </div>
            </form>
        </Card>
    );
}
