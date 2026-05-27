import { notFound } from "next/navigation";
import AboutUs from "@/app/components/Home/AboutUs/AboutUs";
import Navbar from "@/app/components/Home/TrevaHero/navbar";
import { HomeFooter } from "@/app/components/Home/HomeFooter";
import { config } from "@/config";

export const dynamicParams = false;

export function generateStaticParams() {
    return config.project.staticLanguages.map((language) => ({
        locale: language.code,
    }));
}

export default async function AboutUsRoute({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const languages = [...config.project.staticLanguages];

    if (!languages.some((language) => language.code === locale)) {
        notFound();
    }

    return (
        <div data-locale={locale}>
            <Navbar locale={locale} variant="solid" />
            <AboutUs />
            <HomeFooter locale={locale} />
        </div>
    );
}
