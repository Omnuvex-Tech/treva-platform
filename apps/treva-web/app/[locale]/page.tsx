import { notFound } from "next/navigation";
import Container from "@/app/components/Container/container";
import Navbar from "@/app/components/Navbar/navbar";
import { config } from "@/config";

export const dynamicParams = false;

export function generateStaticParams() {
    return config.project.staticLanguages.map((language) => ({
        locale: language.code,
    }));
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const languages = [...config.project.staticLanguages];

    if (!languages.some((language) => language.code === locale)) {
        notFound();
    }

    const content = config.staticContent[locale as keyof typeof config.staticContent];

    if (!content) {
        notFound();
    }

    return (
        <div>
            <Navbar locale={locale} />

            <main>

            </main>
        </div>
    );
}
