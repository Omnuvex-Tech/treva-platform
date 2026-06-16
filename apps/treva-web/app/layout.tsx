import type { Metadata } from "next";
import type { ReactNode } from "react";
import localFont from "next/font/local";
import { NotifyProvider, NotifyContainer } from "@repo/ui";
import { QueryProvider } from "@/app/providers";
import { config } from "@/config";
import { SmoothScrollRoot } from "@/app/components/SmoothScrollRoot";
import "./globals.css";

const inter = localFont({
    src: [
        {
            path: "./fonts/Inter-VariableFont_opsz,wght.ttf",
            style: "normal",
        },
        {
            path: "./fonts/Inter-Italic-VariableFont_opsz,wght.ttf",
            style: "italic",
        },
    ],
    variable: "--font-inter",
    display: "swap",
});

export const metadata: Metadata = {
    title: config.project.projectName,
    description: config.project.projectDescription,
    keywords: [...config.project.keywords],
    applicationName: "TREVA Real Estate",
    manifest: "/site.webmanifest",
    icons: {
        icon: [
            { url: "/favicon.svg", type: "image/svg+xml" },
            { url: "/favicon-96x96.png", type: "image/png", sizes: "96x96" },
        ],
        apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
    },
    themeColor: "#ffffff",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: ReactNode;
}>) {
    const baseUrl = config.project.url.endsWith("/")
        ? config.project.url.slice(0, -1)
        : config.project.url;

    const organizationSchema = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "@id": `${baseUrl}#organization`,
        name: "TREVA Real Estate",
        url: baseUrl,
        description:
            "TREVA — Azərbaycanda ən böyük daşınmaz əmlak platformasıdır. Biz developer və brokerləri birləşdirərək, satış və marketinq həlləri ilə gəlirinizi artırırıq.",
        logo: {
            "@type": "ImageObject",
            url: "https://cdn.prod.website-files.com/6825d64025f8005ef1ddfc4c/68601701254d965462ec0172_Treva%20colors-02.png",
        },
        address: {
            "@type": "PostalAddress",
            streetAddress: "Ziya Yusifzade 10, Sabah Residence",
            addressLocality: "Bakı",
            addressCountry: "AZ",
        },
        telephone: "+994502772662",
        email: "info@treva.realestate",
        sameAs: [
            "https://www.linkedin.com/company/trevarealestate",
            "https://www.instagram.com/treva.realestate",
            "https://www.facebook.com/people/Trevarealestate/61576234409540/",
            "https://youtube.com/@trevarealestate",
            "https://www.tiktok.com/@treva.realestate",
        ],
    };

    const devBackForwardReloadScript =
        process.env.NODE_ENV === "development"
            ? `(function(){try{var KEY="__treva_dev_back_forward_reload__";var nav=performance.getEntriesByType("navigation")[0];if(nav&&nav.type==="back_forward"){if(sessionStorage.getItem(KEY)!=="1"){sessionStorage.setItem(KEY,"1");location.replace(location.href);return;}}sessionStorage.removeItem(KEY);window.addEventListener("popstate",function(){sessionStorage.removeItem(KEY);location.replace(location.href);});window.addEventListener("pagehide",function(){sessionStorage.removeItem(KEY);});window.addEventListener("beforeunload",function(){sessionStorage.removeItem(KEY);});}catch(e){}})();`
            : null;

    return (
        <html lang="az">
            <head>
                {devBackForwardReloadScript && (
                    <script
                        dangerouslySetInnerHTML={{
                            __html: devBackForwardReloadScript,
                        }}
                    />
                )}
                <link
                    rel="stylesheet"
                    href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css"
                    integrity="sha512-1ycn6IcaQQ40/MKBW2W4Rhis/DbILU74C1vSrLJxCq57o941Ym01SwNsOMqvEBFlcgUa6xLiPY/NS5R+E6ztJQ=="
                    crossOrigin="anonymous"
                    referrerPolicy="no-referrer"
                />
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify(organizationSchema),
                    }}
                />
            </head>
            <body className={inter.variable} suppressHydrationWarning>
                <QueryProvider>
                    <NotifyProvider>
                        <div id="treva-navbar-layer" />
                        <SmoothScrollRoot>
                            <main>{children}</main>
                        </SmoothScrollRoot>
                        <NotifyContainer />
                    </NotifyProvider>
                </QueryProvider>
            </body>
        </html>
    );
}
