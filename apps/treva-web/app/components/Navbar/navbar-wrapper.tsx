"use client";

import { useCallback, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { Language, Translation } from "@repo/types/types";
import { LanguageSwitcher as LanguageSwitcherUI } from "@repo/ui";
import { config } from "@/config";
import { api } from "@/lib/api";
import { useLanguageStore } from "@/stores";

interface NavbarWrapperProps {
    logo?: ReactNode;
    phone?: string;
    locale: string;
    languages: Language[];
    searchPlaceholder?: string;
}

const NavbarWrapper = ({ logo, phone, locale, languages }: NavbarWrapperProps) => {
    const router = useRouter();
    const pathname = usePathname();
    const { locale: storeLocale, setLocale } = useLanguageStore();

    const handleLocaleChange = useCallback(
        (nextLocale: string) => {
            const segments = pathname.split("/").filter(Boolean);
            if (segments.length === 0) {
                router.push(`/${nextLocale}`);
            } else {
                segments[0] = nextLocale;
                router.push(`/${segments.join("/")}`);
            }
        },
        [pathname, router],
    );

    const fetchTranslations = useCallback(async (locale: string): Promise<Translation[]> => {
        const response = await api.get<Translation[]>(config.endpoints.translations.list, { locale });
        return response.success && response.data ? response.data : [];
    }, []);

    return (
        <div className="w-full">
            <div className="flex items-center justify-between p-4">
                <div>{logo ?? null}</div>

                <div className="ml-auto flex items-center gap-4">
                    <LanguageSwitcherUI
                        languages={languages}
                        initialTranslations={[]}
                        defLang={config.project.defLang}
                        fetchTranslations={fetchTranslations}
                        locale={storeLocale || locale}
                        variant="desktop"
                        onLocaleChange={(newLocale: string) => {
                            setLocale(newLocale);
                            handleLocaleChange(newLocale);
                        }}
                    />
                </div>
            </div>

            <div className="hidden lg:block w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] h-px bg-gray-200" />
        </div>
    );
};

export { NavbarWrapper };
