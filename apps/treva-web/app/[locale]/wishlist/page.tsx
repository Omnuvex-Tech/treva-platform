import { notFound } from "next/navigation";
import { config } from "@/config";
import WishlistPage from "@/app/components/HomeV2/WishlistPage";

export async function generateStaticParams() {
    return config.project.staticLanguages.map((language) => ({
        locale: language.code,
    }));
}

/**
 * Seçilmişlər — müqayisə səhifəsi ilə eyni V2 dizaynı.
 *
 * Müqayisə route-u kimi burada da V1 versiyası yoxdur, ona görə `?v=` nə
 * deyirsə desin V2 render olunur. Siyahı brauzerin localStorage-ındadır
 * (`saved-properties.ts`) — `WishlistV2` onu mount olanda özü oxuyur, serverdə
 * çəkiləsi məlumat yoxdur.
 */
export default async function SavedPage({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;

    if (!config.project.staticLanguages.some((language) => language.code === locale)) {
        notFound();
    }

    return <WishlistPage locale={locale} />;
}
