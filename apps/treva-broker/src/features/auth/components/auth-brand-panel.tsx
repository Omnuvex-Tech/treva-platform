"use client";

import { useI18n } from "@/providers/i18n-provider";

/**
 * The right half of the auth screens, a 1:1 visual copy of the treva-inventory
 * login panel: the same diagonal dark gradient and the same three feature
 * rows. Only the copy is TREVA Broker's own (from the i18n dictionary).
 */
export function AuthBrandPanel() {
    const { t } = useI18n();

    const features = [
        { title: t.auth.feature1Title, body: t.auth.feature1Body },
        { title: t.auth.feature2Title, body: t.auth.feature2Body },
        { title: t.auth.feature3Title, body: t.auth.feature3Body },
    ];

    return (
        <div
            className="hidden w-1/2 items-center justify-center px-16 py-16 md:flex lg:px-24"
            style={{ background: "linear-gradient(135deg, #1A1A1A 0%, #4E525D 50%, #666666 100%)" }}
        >
            <div className="w-full max-w-[520px]">
                <h2 className="mb-5 text-white" style={{ fontSize: 40, fontWeight: 600, lineHeight: "48px", letterSpacing: 0 }}>
                    {t.auth.panelTitle}
                </h2>
                <p className="mb-12 text-[19px] leading-relaxed text-[#B2B3BD]">
                    {t.auth.panelSubtitle}
                </p>

                <div className="flex flex-col gap-7">
                    {features.map(({ title, body }) => (
                        <div key={title} className="flex items-start gap-4">
                            <div className="mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full" style={{ background: "#FFFFFF1F" }}>
                                <div className="h-3 w-3 rounded-full bg-white" />
                            </div>
                            <div>
                                <h3 className="m-0 text-white" style={{ fontWeight: 500, fontSize: 20, lineHeight: "28px", letterSpacing: 0 }}>
                                    {title}
                                </h3>
                                <p className="mt-1 m-0" style={{ fontWeight: 400, fontSize: 16, lineHeight: "20px", letterSpacing: 0, color: "#C8C9CD" }}>
                                    {body}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
