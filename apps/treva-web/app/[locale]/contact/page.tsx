import { notFound } from "next/navigation";
import { ContactPage }  from "@/app/components/Contact/contact-page";
import { config } from "@/config";

export const dynamicParams = false;

export function generateStaticParams() {
    return config.project.staticLanguages.map((language) => ({
        locale: language.code,
    }));
}

export default async function ContactRoute({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const languages = [...config.project.staticLanguages];

    if (!languages.some((language) => language.code === locale)) {
        notFound();
    }

    return (
        <div data-locale={locale}>
            <ContactPage locale={locale} />
        </div>
    );
}
