"use client";

import { Cancel01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { Badge, StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Panel, PanelTitle } from "@/components/ui/panel";
import { PhoneListField } from "@/components/ui/phone-list-field";
import { RadioGroup } from "@/components/ui/radio";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeaderCell,
    TableRow,
} from "@/components/ui/table";
import { routes } from "@/config/routes";
import { isApiError } from "@/lib/api/errors";
import { ROLES, type Role } from "@/lib/auth/roles";
import { formatLongDate } from "@/lib/utils/format";
import { useI18n } from "@/providers/i18n-provider";
import { useToast } from "@/providers/toast-provider";
import { useAgencies } from "../hooks/use-agencies";
import { useCreateUser, useUpdateUser, useUserAgencyLink } from "../hooks/use-users";
import type { PlatformUser, UserInput } from "../types";

const ACCESS_PERMISSIONS = ["full", "extended", "standard"] as const;

export interface UserFormViewProps {
    /** `null` creates a new account, otherwise the form edits this one. */
    user: PlatformUser | null;
}

/**
 * Agent create (873:48686) and Agent edit (873:48814).
 *
 * One screen, two artboards: the fields, their order and their widths are
 * identical, and edit adds three things — a status badge beside the title, a
 * "Save" label on the action, and the agency row below the card (873:48887).
 *
 * The card is the 1112px Modal panel: 20px padding, 16px between blocks, its
 * two columns 24 apart. Every field is the 36px form input — an 18px label, 4px
 * of air, then a 36px white box on a Border/Tertiary edge — which is why a row
 * measures 58 and consecutive rows sit 74 apart.
 *
 * There is no Cancel: the artboards draw a single action, and the breadcrumb is
 * the way back.
 */
export function UserFormView({ user }: UserFormViewProps) {
    const { locale, t } = useI18n();
    const router = useRouter();
    const toast = useToast();

    const createUser = useCreateUser();
    const updateUser = useUpdateUser();
    // Unfiltered: the field is a picker, not a search — the tab next door
    // holds every agency there is.
    const agencies = useAgencies("");

    const editing = user !== null;
    const agencyLink = useUserAgencyLink(user?.id ?? "");

    // 873:48735-48737 draw all three options empty on the create artboard —
    // Role carries no asterisk, so nothing is preselected. Edit opens on the
    // account's own role (873:48865).
    const [role, setRole] = useState<Role | "">(user?.role ?? "");
    const [blocked, setBlocked] = useState(user?.status === "blocked");
    const [accessPermission, setAccessPermission] = useState(user?.accessPermission ?? "");
    // An agency is chosen by name because that is what the API stores and
    // matches on; "" detaches the account, which is a real choice here and so
    // is a row in the list rather than a placeholder.
    const [agency, setAgency] = useState(user?.agency ?? "");
    const [error, setError] = useState<string | null>(null);

    const pending = createUser.isPending || updateUser.isPending;

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError(null);

        const formData = new FormData(event.currentTarget);
        const input: UserInput = {
            firstName: String(formData.get("firstName") ?? "").trim(),
            lastName: String(formData.get("lastName") ?? "").trim(),
            email: String(formData.get("email") ?? "").trim(),
            // Blank is not a password: it is the absence of one, so the key
            // is dropped rather than sent as "" for the API to reject.
            password: String(formData.get("password") ?? "").trim() || undefined,
            phones: formData
                .getAll("phone")
                .map((value) => String(value).trim())
                .filter(Boolean),
            jobTitle: user?.jobTitle ?? "",
            organization: agency,
            cooperationType: String(formData.get("cooperationType") ?? "").trim(),
            agency,
            accessPermission,
            // Nothing is preselected, and the field is not required; an
            // account created without one gets the least-privileged role,
            // the same fallback the sign-in adapter uses.
            role: role || "broker",
            blocked,
        };

        try {
            if (editing) {
                await updateUser.mutateAsync({ id: user.id, input });
                toast.success(t.users.userUpdated);
            } else {
                await createUser.mutateAsync(input);
                toast.success(t.users.userAdded);
            }
            router.push(routes.adminUsers(locale));
        } catch (submitError) {
            setError(isApiError(submitError) ? submitError.message : t.common.error);
        }
    }

    const link = agencyLink.data;

    return (
        <div className="flex flex-col px-4 pt-4 pb-8">
            <form onSubmit={handleSubmit} className="px-2">
                <Panel className="flex flex-col gap-4">
                    <PanelTitle>
                        <span className="flex-1">
                            {editing ? t.users.form.editTitle : t.users.form.createTitle}
                        </span>

                        {/* 873:48840 — only the edit artboard carries it. */}
                        {editing ? (
                            <StatusBadge
                                tone={user.status === "active" ? "positive" : "info"}
                                className="font-normal"
                            >
                                {t.users.status[user.status]}
                            </StatusBadge>
                        ) : null}

                        {/* The way out, drawn as the rail's close (873:59096):
                            a 32px Background/Tertiary square on a Border/Inverse
                            edge. The breadcrumb goes to the same place; this is
                            the one the eye finds. */}
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
                            name="firstName"
                            label={t.users.form.firstName}
                            defaultValue={user?.firstName}
                            surface="form"
                            size="sm"
                            containerClassName="flex-1"
                            required
                        />
                        <Input
                            name="lastName"
                            label={t.users.form.lastName}
                            defaultValue={user?.lastName}
                            surface="form"
                            size="sm"
                            containerClassName="flex-1"
                        />
                    </div>

                    <div className="flex flex-col gap-4 md:flex-row md:gap-6">
                        {/* 873:48716 — the field and the 36px add button are
                            bottom-aligned, so the button clears the label. The
                            button used to be drawn and dead; it adds a row now. */}
                        <PhoneListField
                            name="phone"
                            label={t.users.form.phone}
                            defaultValue={user?.phones}
                            required
                        />

                        <Input
                            name="email"
                            type="email"
                            label={t.users.form.email}
                            defaultValue={user?.email}
                            surface="form"
                            size="sm"
                            containerClassName="flex-1"
                        />
                    </div>

                    <div className="flex flex-col gap-4 md:flex-row md:gap-6">
                        <Input
                            name="cooperationType"
                            label={t.users.form.cooperationType}
                            defaultValue={user?.cooperationType}
                            surface="form"
                            size="sm"
                            containerClassName="flex-1"
                        />
                        {/* The agencies on the tab next door, not a name typed
                            from memory: the API matches this against a real
                            agency and refuses anything else, so a free field
                            could only ever produce that error. */}
                        <Select
                            label={t.users.form.agency}
                            value={agency}
                            onChange={setAgency}
                            options={[
                                { value: "", label: t.users.form.agencyNone },
                                ...(agencies.data ?? []).map((entry) => ({
                                    value: entry.name,
                                    label: entry.name,
                                })),
                            ]}
                            disabled={agencies.isPending}
                            className="h-9 border-border-tertiary bg-bg-primary pr-3 pl-4 [&_svg]:size-5"
                            containerClassName="flex-1"
                        />
                    </div>

                    {/* Access Permissions had Agency beside it until Agency moved up
                        into the row above — the artboard's "Agentlik" (873:48722) was
                        the same agency named twice, so it is gone. Password takes the
                        half it left: the artboard draws no password field anywhere on
                        this screen, yet the account it creates has to be signed in
                        with something. */}
                    <div className="flex flex-col gap-4 md:flex-row md:gap-6">
                        <Select
                            label={t.users.form.accessPermissions}
                            value={accessPermission}
                            onChange={setAccessPermission}
                            options={ACCESS_PERMISSIONS.map((value) => ({
                                value,
                                label: t.users.form.accessPermissionOptions[value],
                            }))}
                            // The form select draws a 20px direction-down glyph
                            // where the shared trigger fixes its chevron at 16
                            // (I873:48725;8154:5401).
                            className="h-9 border-border-tertiary bg-bg-primary pr-3 pl-4 [&_svg]:size-5"
                            containerClassName="flex-1"
                        />

                        {/* Optional in both directions: blank creates the account
                            with a generated one-time password, and blank on edit
                            leaves the existing password alone. */}
                        <Input
                            name="password"
                            type="password"
                            autoComplete="new-password"
                            label={t.users.form.password}
                            hint={
                                editing
                                    ? t.users.form.passwordEditHint
                                    : t.users.form.passwordCreateHint
                            }
                            minLength={8}
                            surface="form"
                            size="sm"
                            containerClassName="flex-1"
                        />
                    </div>

                    {/* Both blocks are 524 wide — half the card — and stop
                        there; they do not stretch to the second column. */}
                    <RadioGroup
                        name="role"
                        legend={t.users.form.role}
                        value={role}
                        onChange={setRole}
                        options={ROLES.map((value) => ({
                            value,
                            label: t.users.form.roleOptions[value],
                        }))}
                        className="w-full md:w-[524px]"
                    />

                    {/* 873:48741 heads this block "Role" too, a verbatim copy of
                        the legend above it. Dropped: the switch's own label says
                        what it does, and the repeat read as a mistake. The heading
                        also did the spacing work, so the block takes the card's
                        24px step itself — the card's own gap alone left the switch
                        crowding the radios above it. */}
                    <div className="mt-2 w-full md:w-[524px]">
                        <Switch
                            checked={blocked}
                            onChange={(event) => setBlocked(event.target.checked)}
                            label={t.users.form.blockAgent}
                        />
                    </div>

                    {error ? (
                        <p role="alert" className="text-sm text-content-negative">
                            {error}
                        </p>
                    ) : null}

                    <div className="flex justify-end">
                        <Button
                            type="submit"
                            loading={pending}
                            className="h-9 rounded-lg px-3.5"
                        >
                            {editing ? t.users.form.save : t.users.form.create}
                        </Button>
                    </div>
                </Panel>
            </form>

            {/* 873:48880 — the agency the account is attached to, 24 below the
                card. Read-only: the artboard draws no actions on the row. */}
            {editing && link ? (
                <div className="mt-6 px-2">
                    <Panel>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableHeaderCell className="w-1/5">
                                        {t.users.agencyColumns.status}
                                    </TableHeaderCell>
                                    <TableHeaderCell className="w-1/5">
                                        {t.users.agencyColumns.marketingName}
                                    </TableHeaderCell>
                                    <TableHeaderCell className="w-1/5">
                                        {t.users.agencyColumns.city}
                                    </TableHeaderCell>
                                    <TableHeaderCell className="w-1/5">
                                        {t.users.agencyColumns.registrationDate}
                                    </TableHeaderCell>
                                    <TableHeaderCell className="w-1/5">
                                        {t.users.agencyColumns.crmConnection}
                                    </TableHeaderCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                <TableRow>
                                    <TableCell>
                                        <Badge
                                            tone="positive"
                                            size="field"
                                            className="text-content-positive"
                                        >
                                            {t.users.agencyStatus[link.status]}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="truncate">
                                        {link.marketingName}
                                    </TableCell>
                                    <TableCell className="truncate">{link.city}</TableCell>
                                    <TableCell className="whitespace-nowrap">
                                        {formatLongDate(link.registrationDate, locale)}
                                    </TableCell>
                                    <TableCell>{link.crmConnection}</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </Panel>
                </div>
            ) : null}
        </div>
    );
}
