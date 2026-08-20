import React from "react";
import PageContainer from "@/app/components/Container/PageContainer";
import { type ApiAuthor } from "@/lib/pulse-api";
import TeamGrid from "./TeamGrid";
import "./about-team.css";

type Locale = "az" | "en" | "ru";

const teamDictionary: Record<
  Locale,
  {
    title: string;
    description: string;
  }
> = {
  az: {
    title: "Komandamızla tanış olun",
    description:
      "Daşınmaz əmlak, satış və investisiya sahələrində təcrübəmizi birləşdiririk. Hər layihəyə rəqəmlərlə yanaşırıq — məqsəd sizin üçün doğru qərarı tapmaqdır.",
  },
  en: {
    title: "Meet our team",
    description:
      "We bring together expertise in real estate, sales and investment. Every project starts with the numbers — so the decision you make is the right one.",
  },
  ru: {
    title: "Знакомьтесь с командой",
    description:
      "Мы объединяем опыт в сфере недвижимости, продаж и инвестиций. Каждый проект начинается с цифр — чтобы ваше решение было верным.",
  },
};

type AboutTeamProps = {
  locale?: string;
  authors?: ApiAuthor[];
};

const AUTHOR_IMAGE_FALLBACK =
  "/assets/webflow-placeholder.svg";

export default function AboutTeam({
  locale = "az",
  authors = [],
}: AboutTeamProps) {
  const activeLocale: Locale =
    locale === "en" || locale === "ru" ? locale : "az";

  const content = teamDictionary[activeLocale];

  if (!authors.length) {
    return null;
  }

  return (
    <section className="about-team">
      <PageContainer className="about-page-container">
        <div className="about-team__inner">
          <div className="about-team__left">
            <h2 className="about-team__title">{content.title}</h2>
          <p className="about-team__description">{content.description}</p>
          </div>

          <TeamGrid authors={authors} locale={locale} />
        </div>
      </PageContainer>
    </section>
  );
}
