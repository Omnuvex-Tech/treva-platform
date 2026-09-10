import { notFound } from "next/navigation";
import { BrokersPage } from "@/app/components/Brokers/brokers";
import { config } from "@/config";
import { staticPageMetadata } from "@/lib/seo-fallbacks";
import PageJsonLd from "@/app/components/PageJsonLd";

export const dynamicParams = false;

export function generateStaticParams() {
    return config.project.staticLanguages.map((language) => ({
        locale: language.code,
    }));
}

export const generateMetadata = staticPageMetadata("brokers");

export default async function BrokersRoute({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const languages = [...config.project.staticLanguages];

    if (!languages.some((language) => language.code === locale)) {
        notFound();
    }

    return (
        <>
            <PageJsonLd pageKey="brokers" locale={locale} />
            <BrokersPage locale={locale} />
        </>
    );
}
