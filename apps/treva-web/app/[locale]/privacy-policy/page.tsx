import { Metadata } from "next";
import PrivacyPolicy from "@/app/components/PrivacyPolicy/PrivacyPolicy";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  
  const translations: Record<string, { title: string; description: string }> = {
    az: {
      title: "Məxfilik Siyasəti I TREVA Real Estate",
      description: "Azərbaycan və xaricdəki lider developerlərin layihə portfelləri ilə tanış olun. Satış və ya investisiya üçün daşınmaz əmlak tapın.",
    },
    en: {
      title: "Privacy Policy I TREVA Real Estate",
      description: "Explore project portfolios of leading developers in Azerbaijan and abroad. Find real estate for sale or investment.",
    },
    ru: {
      title: "Политика конфиденциальности I TREVA Real Estate",
      description: "Ознакомьтесь с портфелями проектов ведущих девелоперов Азербайджана и зарубежья. Найдите недвижимость для покупки или инвестиций.",
    }
  };

  const { title, description } = translations[locale] || translations.az;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: "https://cdn.prod.website-files.com/6825d64025f8005ef1ddfc4c/687dee7f7f77ffad0c85b58e_Open%20Graph.jpg",
          width: 1200,
          height: 630,
          alt: "TREVA Real Estate",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["https://cdn.prod.website-files.com/6825d64025f8005ef1ddfc4c/687dee7f7f77ffad0c85b58e_Open%20Graph.jpg"],
    },
  };
}

export default async function PrivacyPolicyPage({ params }: Props) {
  const { locale } = await params;
  return <PrivacyPolicy locale={locale} />;
}
