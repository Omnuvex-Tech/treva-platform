import Link from "next/link";
import { FileQuestion } from "lucide-react";

import { HOME_ROUTE } from "@/config/routes";
import { DEFAULT_LOCALE } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";

export default async function NotFound() {
    const t = await getDictionary(DEFAULT_LOCALE);

    return (
        <div className="flex min-h-dvh flex-col items-center justify-center gap-3 px-6 text-center">
            <span className="flex size-12 items-center justify-center rounded-pill bg-bg-secondary text-content-tertiary">
                <FileQuestion className="size-5" />
            </span>

            <h1 className="text-2xl font-medium text-content-primary">{t.errors.notFoundTitle}</h1>
            <p className="max-w-sm text-sm text-content-tertiary">{t.errors.notFoundBody}</p>

            <Link
                href={HOME_ROUTE(DEFAULT_LOCALE)}
                className="mt-2 inline-flex h-10 items-center rounded-md bg-bg-brand px-4 text-sm font-medium text-content-inverse"
            >
                {t.errors.backToDashboard}
            </Link>
        </div>
    );
}
