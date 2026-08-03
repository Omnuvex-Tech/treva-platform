import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import localFont from "next/font/local";
import Script from "next/script";
import { NotifyProvider, NotifyContainer } from "@repo/ui";
import { QueryProvider } from "@/app/providers";
import { config } from "@/config";
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
    preload: false,
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
};

export const viewport: Viewport = {
    themeColor: "#ffffff",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: ReactNode;
}>) {
    return (
        <html lang="az">
            <head>
                <script src="https://salesagent.treva.realestate/webchat/widget.js"
                    data-title="TREVA Assistant"
                    data-accent="#4b5563"
                    defer></script>
                <Script id="gtm" strategy="afterInteractive">
                    {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','GTM-KR9HGHTS');`}
                </Script>
            </head>
            <body className={inter.variable} suppressHydrationWarning>
                <noscript
                    dangerouslySetInnerHTML={{
                        __html: `<iframe src="https://www.googletagmanager.com/ns.html?id=GTM-KR9HGHTS" height="0" width="0" style="display:none;visibility:hidden"></iframe>`,
                    }}
                />
                <QueryProvider>
                    <NotifyProvider>
                        <div id="treva-navbar-layer" />
                        <main>{children}</main>
                        <NotifyContainer />
                    </NotifyProvider>
                </QueryProvider>
            </body>
        </html>
    );
}
