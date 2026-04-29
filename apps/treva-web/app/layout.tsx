import type { Metadata } from "next";
import type { ReactNode } from "react";
import localFont from "next/font/local";
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
});

export const metadata: Metadata = {
    title: config.project.projectName,
    description: config.project.projectDescription,
    keywords: [...config.project.keywords],
};

export default function RootLayout({
    children,
}: Readonly<{
    children: ReactNode;
}>) {
    return (
        <html lang="az" className="w-mod-js">
            <head>
                <link
                    rel="preconnect"
                    href="https://cdn.prod.website-files.com"
                    crossOrigin="anonymous"
                />
                <link
                    rel="stylesheet"
                    href="https://cdn.prod.website-files.com/6825d64025f8005ef1ddfc4c/css/treva-2025.webflow.shared.01e61ec63.min.css"
                    crossOrigin="anonymous"
                />
                <link
                    rel="stylesheet"
                    href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css"
                    integrity="sha512-1ycn6IcaQQ40/MKBW2W4Rhis/DbILU74C1vSrLJxCq57o941Ym01SwNsOMqvEBFlcgUa6xLiPY/NS5R+E6ztJQ=="
                    crossOrigin="anonymous"
                    referrerPolicy="no-referrer"
                />
            </head>
            <body className={`${inter.variable} body`}>
                <QueryProvider>
                    <NotifyProvider>
                        <main>{children}</main>
                        <NotifyContainer />
                    </NotifyProvider>
                </QueryProvider>
            </body>
        </html>
    );
}
