import type { ReactNode } from "react";
import PageJsonLd from "@/app/components/PageJsonLd";
import { staticPageMetadata } from "@/lib/seo-fallbacks";

/**
 * `resale` siyahı səhifəsi client komponentdir, ona görə meta + JSON-LD burada,
 * route qrupu layout-unda verilir. `resale/[id]` detalları bu qrupdan kənardadır
 * və təsirlənmir.
 */
export const generateMetadata = staticPageMetadata("resale");

export default async function ResaleBrowseLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return (
    <>
      <PageJsonLd pageKey="resale" locale={locale} />
      {children}
    </>
  );
}
