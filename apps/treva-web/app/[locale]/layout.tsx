import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { config } from "@/config";

export const dynamicParams = false;

export function generateStaticParams() {
  return config.project.staticLanguages.map((language) => ({
    locale: language.code,
  }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!config.project.staticLanguages.some((language) => language.code === locale)) {
    notFound();
  }

  return children;
}
