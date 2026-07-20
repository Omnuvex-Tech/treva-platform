import React from "react";
import Link from "next/link";
import PageContainer from "@/app/components/Container/PageContainer";
import { toAbsUrl, type ApiAuthor } from "@/lib/pulse-api";
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
    title: "İlham verən komanda",
    description:
      "Biz tipik bir marketinq şirkəti deyilik! Bir çox brendlər trendləri izləməyə çalışdığı zaman, biz sizə trendi yaratmağa kömək edəcəyik. Biz tipik bir marketinq şirkəti deyilik! Bir çox brendlər trendləri izləməyə çalışdığı zaman, biz sizə trendi yaratmağa kömək edəcəyik.",
  },
  en: {
    title: "Our inspiring team",
    description:
      "We are not a typical marketing company! While many brands try to follow trends, we help you create the trend. We are not a typical marketing company! While many brands try to follow trends, we help you create the trend.",
  },
  ru: {
    title: "Вдохновляющая команда",
    description:
      "Мы не типичная маркетинговая компания! Пока многие бренды пытаются следовать трендам, мы помогаем вам создавать тренды. Мы не типичная маркетинговая компания! Пока многие бренды пытаются следовать трендам, мы помогаем вам создавать тренды.",
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

          <div className="about-team__grid">
            {authors.map((author) => (
              <Link
                key={author.id}
                href={`/${locale}/authors/${author.slug}`}
                className="about-team__card"
              >
                <img
                  src={toAbsUrl(author.avatar || "") || AUTHOR_IMAGE_FALLBACK}
                  alt={author.name}
                  className="about-team__card-img"
                />
                <div className="about-team__card-info">
                  <span className="about-team__member-name">{author.name}</span>
                  <span className="about-team__member-role">{author.title || ""}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </PageContainer>
    </section>
  );
}
