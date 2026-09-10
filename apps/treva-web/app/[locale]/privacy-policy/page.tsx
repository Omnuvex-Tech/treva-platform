import { Metadata } from "next";
import PrivacyPolicy from "@/app/components/PrivacyPolicy/PrivacyPolicy";
import PageJsonLd from "@/app/components/PageJsonLd";
import { buildPageMetadata } from "@/lib/seo";

type Props = {
  params: Promise<{ locale: string }>;
};

/** Admin "SEO" bölməsi boşdursa istifadə olunan mətnlər. */
const FALLBACK: Record<string, { title: string; description: string }> = {
  az: {
    title: "Məxfilik Siyasəti I TREVA Real Estate",
    description:
      "Azərbaycan və xaricdəki lider developerlərin layihə portfelləri ilə tanış olun. Satış və ya investisiya üçün daşınmaz əmlak tapın.",
  },
  en: {
    title: "Privacy Policy I TREVA Real Estate",
    description:
      "Explore project portfolios of leading developers in Azerbaijan and abroad. Find real estate for sale or investment.",
  },
  ru: {
    title: "Политика конфиденциальности I TREVA Real Estate",
    description:
      "Ознакомьтесь с портфелями проектов ведущих девелоперов Азербайджана и зарубежья. Найдите недвижимость для покупки или инвестиций.",
  },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const fb = FALLBACK[locale] ?? FALLBACK.az;
  return buildPageMetadata({
    pageKey: "privacy-policy",
    locale,
    fallback: { title: fb?.title, description: fb?.description },
  });
}

export default async function PrivacyPolicyPage({ params }: Props) {
  const { locale } = await params;
  return (
    <>
      <PageJsonLd pageKey="privacy-policy" locale={locale} />
      <PrivacyPolicy locale={locale} />
    </>
  );
}
