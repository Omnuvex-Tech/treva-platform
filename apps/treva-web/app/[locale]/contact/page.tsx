import { notFound } from "next/navigation";
import ContactPageV2 from "@/app/components/HomeV2/ContactPage";
import { config } from "@/config";
import { staticPageMetadata } from "@/lib/seo-fallbacks";
import PageJsonLd from "@/app/components/PageJsonLd";

export function generateStaticParams() {
    return config.project.staticLanguages.map((language) => ({
        locale: language.code,
    }));
}

export const generateMetadata = staticPageMetadata("contact");

/**
 * Contact — the V2 redesign, served straight from `/[locale]/contact`. The old
 * V1 page (`components/Contact/contact-page`) stays in the tree but no route
 * points at it; the `?v=2` switch is gone.
 */
export default async function ContactRoute({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    const languages = [...config.project.staticLanguages];

    if (!languages.some((language) => language.code === locale)) {
        notFound();
    }

    return (
        <>
            <PageJsonLd pageKey="contact" locale={locale} />
            <ContactPageV2 locale={locale} />
        </>
    );
}
