import React from "react";
import PulseArticleDetail from "@/app/components/Pulse/PulseArticleDetail";

type Props = {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
};

export default async function Page({ params }: Props) {
  const { locale, slug } = await params;

  // In a real app, you might fetch data based on the slug.
  // For this migration, we're serving the specific article we've built.
  // We can add a check if needed, but since it's a dynamic route, it will catch this specific slug.
  
  return <PulseArticleDetail locale={locale} />;
}

// Optional: Generate static params for the known article
export async function generateStaticParams() {
  return [
    { locale: "az", slug: "menzil-almaq-ucun-ilkin-odenis-ne-qeder-olmalidir" },
    { locale: "en", slug: "menzil-almaq-ucun-ilkin-odenis-ne-qeder-olmalidir" },
    { locale: "ru", slug: "menzil-almaq-ucun-ilkin-odenis-ne-qeder-olmalidir" },
  ];
}
