"use client";

import {
    Add01Icon,
    ArrowDown01Icon,
    ArrowLeft02Icon,
    ArrowRight02Icon,
    Building03Icon,
    Building06Icon,
    Search01Icon,
    Tick02Icon,
    User03Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { routes } from "@/config/routes";
import { interpolate } from "@/lib/i18n/interpolate";
import { cn } from "@/lib/utils/cn";
import { useI18n } from "@/providers/i18n-provider";

/** The two cards in the top row (873:60407 / 873:60417). */
export type RegistrationType = "individual" | "company";

/** The two rows that appear under "Company setup" (873:60433 / 873:60445). */
type CompanySetup = "create" | "join";

const TOTAL_STEPS = 3;

export interface RegisterTypeViewProps {
    /** Called with the completed choice once Continue is pressed. */
    onContinue: (choice: { type: RegistrationType; setup: CompanySetup | null }) => void;
}

/**
 * Step 1-2 of sign-up — "Choose Registration Type".
 *
 * Five artboards (873:60083, 60130, 60215, 60300, 60389) are five STATES of this
 * one screen, not five screens: pick Individual and the card stops at the two
 * type tiles (step 1); pick Company and a "Company setup" block unfolds under
 * them with two more rows, which is what moves the meter to step 2. Choosing
 * "Join Existing Company" grows that row again to hold a company field.
 *
 * The card is 540 wide and centred on the page — no brand panel — which is why
 * this route sits outside the (auth) group and its 50/50 layout.
 *
 * Measurements are off the artboards: a 16px-radius card on Shadow/L2, a header
 * inset 32 with a 24px bottom pad, a body inset 32/24, and a footer inset 32
 * with 4 above and 32 below. The type tiles are a 2x232 grid 12 apart, 157 tall,
 * on a 14px radius with a 2px edge; the setup rows are full width on the same
 * radius. Selection is carried by fill + edge + a 20px tick, never by the label
 * colour — the artboards disagree on that one (Individual is inked Content/Brand
 * when selected in 873:60101 but also when *un*selected in 873:60417), so it is
 * left alone rather than copied inconsistently.
 */
export function RegisterTypeView({ onContinue }: RegisterTypeViewProps) {
    const { locale, t } = useI18n();
    const router = useRouter();
    const copy = t.auth.registerType;

    const [type, setType] = useState<RegistrationType>("individual");
    const [setup, setSetup] = useState<CompanySetup | null>(null);
    const [company, setCompany] = useState("");

    const onCompany = type === "company";
    // The meter fills its second segment once the company branch is open — that
    // branch IS the second step in the artboards.
    const step = onCompany ? 2 : 1;
    const canContinue = onCompany ? setup !== null : true;

    function choose(next: RegistrationType) {
        setType(next);
        if (next === "individual") {
            setSetup(null);
            setCompany("");
        }
    }

    function goBack() {
        // Back walks out of the company branch first, then off the screen.
        if (onCompany) {
            choose("individual");
            return;
        }
        router.push(routes.login(locale));
    }

    return (
        <div className="flex min-h-dvh items-center justify-center bg-bg-primary px-4 py-12">
            {/* The artboard lays a pale swirl behind the card; it is artwork, not
                a token, so it is stood in for the same way the auth brand panel
                does rather than shipped as a raster. */}
            <div
                aria-hidden
                className="pointer-events-none fixed -top-1/3 -left-1/4 -z-10 size-[120vh] rounded-pill bg-bg-secondary/60 blur-3xl"
            />

            <div className="w-full max-w-[540px]">
                <div className="overflow-hidden rounded-lg border border-border-subtle bg-bg-primary shadow-l2">
                    {/* 873:60393 — the rule under the header is drawn only once
                        the company branch is open. */}
                    <header
                        className={cn(
                            "px-8 pt-8 pb-6",
                            onCompany && "border-b border-border-subtle",
                        )}
                    >
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                                {Array.from({ length: TOTAL_STEPS }, (_, index) => {
                                    const done = index < step;

                                    return (
                                        <span
                                            key={index}
                                            className={cn(
                                                "h-1 rounded-pill transition-all",
                                                // 24px once reached, 16 while pending.
                                                done ? "w-6 bg-bg-brand" : "w-4 bg-border-tertiary",
                                            )}
                                        />
                                    );
                                })}
                            </div>

                            <p className="pl-1 text-xs text-content-tertiary">
                                {interpolate(copy.step, { current: step, total: TOTAL_STEPS })}
                            </p>
                        </div>

                        <h1 className="pt-5 text-2xl font-semibold text-content-primary">
                            {copy.title}
                        </h1>
                        <p className="pt-1 text-sm text-content-tertiary">{copy.subtitle}</p>
                    </header>

                    <div className="px-8 py-6">
                        <div className="grid grid-cols-2 gap-3">
                            <TypeCard
                                icon={User03Icon}
                                title={copy.individual}
                                description={copy.individualHint}
                                selected={type === "individual"}
                                onSelect={() => choose("individual")}
                            />
                            <TypeCard
                                icon={Building03Icon}
                                title={copy.company}
                                description={copy.companyHint}
                                selected={onCompany}
                                onSelect={() => choose("company")}
                            />
                        </div>

                        {onCompany ? (
                            <div className="pt-4">
                                {/* 873:60427 — a rule either side of the label,
                                    12 apart, on Content/Tertiary Inverse. */}
                                <div className="flex items-center gap-3">
                                    <span className="h-px flex-1 bg-border-subtle" />
                                    <p className="text-xs text-[var(--color-content-tertiary-inverse)]">
                                        {copy.companySetup}
                                    </p>
                                    <span className="h-px flex-1 bg-border-subtle" />
                                </div>

                                <div className="flex flex-col gap-3 pt-3">
                                    <ActionCard
                                        icon={Add01Icon}
                                        title={copy.createCompany}
                                        description={copy.createCompanyHint}
                                        selected={setup === "create"}
                                        onSelect={() => setSetup("create")}
                                    />

                                    <ActionCard
                                        icon={Building06Icon}
                                        title={copy.joinCompany}
                                        description={copy.joinCompanyHint}
                                        selected={setup === "join"}
                                        onSelect={() => setSetup("join")}
                                    >
                                        {/* 873:60466 — the field belongs to the
                                            card and appears only with it. There
                                            is no public company endpoint yet, so
                                            this stays the text field the artboard
                                            actually composes (search glyph +
                                            chevron) rather than a picker wired to
                                            a list that does not exist. */}
                                        <Input
                                            value={company}
                                            onChange={(event) => setCompany(event.target.value)}
                                            placeholder={copy.searchCompany}
                                            aria-label={copy.searchCompany}
                                            surface="outlined"
                                            iconSize={20}
                                            leadingIcon={
                                                <HugeiconsIcon
                                                    icon={Search01Icon}
                                                    size={20}
                                                    strokeWidth={1.6}
                                                />
                                            }
                                            trailingIcon={
                                                <HugeiconsIcon
                                                    icon={ArrowDown01Icon}
                                                    size={20}
                                                    strokeWidth={1.6}
                                                />
                                            }
                                        />
                                    </ActionCard>
                                </div>
                            </div>
                        ) : null}
                    </div>

                    <div className="flex items-end justify-between px-8 pt-1 pb-8">
                        <button
                            type="button"
                            onClick={goBack}
                            className="flex items-center gap-1 rounded-[14px] px-4 py-3 text-sm font-medium text-content-brand transition-colors hover:bg-bg-secondary"
                        >
                            {/* Both arrows sit in a 24px frame in the artboard,
                                but the glyph inside it is inset to roughly 10x13
                                — which is what the shared button renders at 16.
                                Back is drawn directly, so it is pinned to the
                                same 16 rather than filling its frame. */}
                            <HugeiconsIcon icon={ArrowLeft02Icon} size={16} strokeWidth={1.8} />
                            {copy.back}
                        </button>

                        <Button
                            size="lg"
                            disabled={!canContinue}
                            onClick={() => onContinue({ type, setup })}
                            className="rounded-lg border border-border-inverse px-3.5"
                            trailingIcon={
                                <HugeiconsIcon icon={ArrowRight02Icon} size={16} strokeWidth={1.8} />
                            }
                        >
                            {copy.continue}
                        </Button>
                    </div>
                </div>

                <p className="pt-4 text-center text-xs text-[var(--color-content-tertiary-inverse)]">
                    {copy.legalPrefix}{" "}
                    <Link href={routes.login(locale)} className="text-content-tertiary underline">
                        {copy.terms}
                    </Link>{" "}
                    {copy.legalAnd}{" "}
                    <Link href={routes.login(locale)} className="text-content-tertiary underline">
                        {copy.privacy}
                    </Link>
                    .
                </p>
            </div>
        </div>
    );
}

interface CardProps {
    icon: IconSvgElement;
    title: string;
    description: string;
    selected: boolean;
    onSelect: () => void;
}

/** The 232x157 tile in the top row (873:60407). */
function TypeCard({ icon, title, description, selected, onSelect }: CardProps) {
    return (
        <button
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={onSelect}
            className={cn(
                "relative flex h-[157px] flex-col items-start rounded-[14px] border-2 p-[22px] text-left transition-colors",
                selected
                    ? "border-border-brand bg-bg-secondary"
                    : "border-border-subtle bg-bg-primary hover:border-border-tertiary",
            )}
        >
            <span
                className={cn(
                    "mb-3 flex size-10 items-center justify-center rounded-md text-content-primary",
                    selected ? "bg-bg-tertiary" : "bg-bg-secondary",
                )}
            >
                <HugeiconsIcon icon={icon} size={24} strokeWidth={1.6} />
            </span>

            <span className="text-sm font-semibold text-content-primary">{title}</span>
            <span className="pt-0.5 text-xs text-content-tertiary">{description}</span>

            {selected ? <CheckDot className="absolute top-3.5 right-3.5" /> : null}
        </button>
    );
}

/** A full-width row under "Company setup" (873:60433). */
function ActionCard({
    icon,
    title,
    description,
    selected,
    onSelect,
    children,
}: CardProps & { children?: ReactNode }) {
    return (
        <div
            className={cn(
                "rounded-[14px] transition-colors",
                // The selected row swaps a 1px edge for 2px and fills; the extra
                // pixel comes off the padding so the content never shifts.
                selected
                    ? "border-2 border-border-brand bg-bg-secondary"
                    : "border border-border-subtle bg-bg-primary",
            )}
        >
            <button
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={onSelect}
                className={cn(
                    "flex w-full items-center gap-4 text-left",
                    selected ? "p-4" : "p-[17px]",
                )}
            >
                <span
                    className={cn(
                        "flex size-10 shrink-0 items-center justify-center rounded-[14px] text-content-primary",
                        selected ? "bg-bg-tertiary" : "bg-bg-secondary",
                    )}
                >
                    <HugeiconsIcon icon={icon} size={20} strokeWidth={1.6} />
                </span>

                <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2">
                        <span className="truncate text-sm font-bold text-content-primary">
                            {title}
                        </span>
                        {selected ? <CheckDot /> : null}
                    </span>
                    <span className="block pt-0.5 text-xs text-content-secondary">
                        {description}
                    </span>
                </span>
            </button>

            {selected && children ? <div className="px-4 pb-4">{children}</div> : null}
        </div>
    );
}

/** The 20px brand disc with a 12px tick (873:60414). */
function CheckDot({ className }: { className?: string }) {
    return (
        <span
            aria-hidden
            className={cn(
                "flex size-5 shrink-0 items-center justify-center rounded-pill bg-bg-brand text-content-inverse",
                className,
            )}
        >
            <HugeiconsIcon icon={Tick02Icon} size={12} strokeWidth={2.5} />
        </span>
    );
}
