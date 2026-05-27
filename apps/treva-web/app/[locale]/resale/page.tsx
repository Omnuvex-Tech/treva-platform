import { notFound } from "next/navigation";
import Navbar from "@/app/components/Home/TrevaHero/navbar";
import { HomeFooter } from "@/app/components/Home/HomeFooter";
import { config } from "@/config";

export const dynamicParams = false;

export function generateStaticParams() {
    return config.project.staticLanguages.map((language) => ({
        locale: language.code,
    }));
}

export default async function ResaleRoute({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const languages = [...config.project.staticLanguages];

    if (!languages.some((language) => language.code === locale)) {
        notFound();
    }

    return (
        <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column" }} data-locale={locale}>
            <Navbar locale={locale} variant="solid" />
            <main
                style={{
                    flex: 1,
                    marginTop: "var(--treva-nav-height, 64px)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "24px",
                    textAlign: "center",
                }}
            >
                <h1 style={{ fontSize: "clamp(28px, 4vw, 48px)", margin: 0, letterSpacing: "-0.5px" }}>
                    Coming Soon
                </h1>
            </main>
            <HomeFooter locale={locale} />
        </div>
    );
}
