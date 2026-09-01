"use client";

import { Building2, HandCoins, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { useI18n } from "@/providers/i18n-provider";

/**
 * The right half of the Welcome artboard (873:72389): a dark panel carrying the
 * product headline and three feature rows.
 *
 * The headline and subheading are the copy written in the design. The three
 * feature titles/descriptions are placeholders there ("Feature 1 Title",
 * "Feature 1 Description"), so the wording below is ours — replace it with
 * marketing's copy when there is any.
 */
export function AuthBrandPanel() {
    const { t } = useI18n();

    const features: { icon: LucideIcon; title: string; body: string }[] = [
        { icon: Building2, title: t.auth.feature1Title, body: t.auth.feature1Body },
        { icon: Users, title: t.auth.feature2Title, body: t.auth.feature2Body },
        { icon: HandCoins, title: t.auth.feature3Title, body: t.auth.feature3Body },
    ];

    return (
        <div className="relative flex size-full flex-col justify-center overflow-hidden bg-bg-dark px-16 py-12 text-content-inverse">
            {/* Soft light bloom, standing in for the artwork layer that sits
                behind this panel in the artboard. */}
            <div
                aria-hidden
                className="pointer-events-none absolute -top-1/4 -right-1/4 size-[80vh] rounded-pill bg-white/5"
            />

            <div className="relative max-w-lg">
                <h2 className="text-3xl leading-tight font-medium text-balance">
                    {t.auth.panelTitle}
                </h2>
                <p className="mt-3 text-sm text-white/70">{t.auth.panelSubtitle}</p>

                <ul className="mt-10 flex flex-col gap-6">
                    {features.map(({ icon: Icon, title, body }) => (
                        <li key={title} className="flex gap-3">
                            <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-pill bg-white/10">
                                <Icon className="size-3.5" />
                            </span>

                            <div className="min-w-0">
                                <p className="text-base font-medium">{title}</p>
                                <p className="mt-0.5 text-sm text-white/60">{body}</p>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
