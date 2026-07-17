"use client";

import React from "react";
import PageContainer from "@/app/components/Container/PageContainer";
import "./about-team.css";

type Locale = "az" | "en" | "ru";

type TeamMemberContent = {
  id: number;
  image: string;
  name: string;
  role: string;
};

const teamDictionary: Record<
  Locale,
  {
    title: string;
    description: string;
    ctaLabel: string;
    ctaHref: string;
    members: TeamMemberContent[];
  }
> = {
  az: {
    title: "İlham verən komanda",
    description:
      "Biz tipik bir marketinq şirkəti deyilik! Bir çox brendlər trendləri izləməyə çalışdığı zaman, biz sizə trendi yaratmağa kömək edəcəyik. Biz tipik bir marketinq şirkəti deyilik! Bir çox brendlər trendləri izləməyə çalışdığı zaman, biz sizə trendi yaratmağa kömək edəcəyik.",
    ctaLabel: "Keçid edin →",
    ctaHref: "/OurTeam",
    members: [
      { id: 1, image: "/images/about-team/team3.jpg", name: "Cavid Axundov", role: "Baş İcraçı Direktor" },
      { id: 2, image: "/images/about-team/team4.jpg", name: "Fuada Isgəndər-Rəhimli", role: "Marketinq Direktoru" },
      { id: 3, image: "/images/about-team/team5.png", name: "Kanan Akhbarov", role: "Aparıcı Qrafik Dizayner" },
      { id: 4, image: "/images/about-team/team6.jpg", name: "Cəmilə Əhmədova", role: "Baş Aparıcı İdarəedici" },
      { id: 5, image: "/images/about-team/testimonials1.jpg", name: "Səbinə Akhundov", role: "Marketinq Direktoru" },
      { id: 6, image: "/images/about-team/team3.jpg", name: "Kanan Akhbarov", role: "Aparıcı Qrafik Dizayner" },
    ],
  },
  en: {
    title: "Our inspiring team",
    description:
      "We are not a typical marketing company! While many brands try to follow trends, we help you create the trend. We are not a typical marketing company! While many brands try to follow trends, we help you create the trend.",
    ctaLabel: "View more →",
    ctaHref: "/OurTeam",
    members: [
      { id: 1,image: "/images/about-team/team3.jpg", name: "Cavid Axundov", role: "Chief Executive Officer" },
      { id: 2, image: "/images/about-team/team4.jpg", name: "Fuada Isgəndər-Rəhimli", role: "Marketing Director" },
      { id: 3,  image: "/images/about-team/team5.png", name: "Kanan Akhbarov", role: "Lead Graphic Designer" },
      { id: 4, image: "/images/about-team/team6.jpg", name: "Cəmilə Əhmədova", role: "Head Manager" },
      { id: 5, image: "/images/about-team/testimonials1.jpg",name: "Səbinə Akhundov", role: "Marketing Director" },
      { id: 6,  image: "/images/about-team/team3.jpg", name: "Kanan Akhbarov", role: "Lead Graphic Designer" },
    ],
  },
  ru: {
    title: "Вдохновляющая команда",
    description:
      "Мы не типичная маркетинговая компания! Пока многие бренды пытаются следовать трендам, мы помогаем вам создавать тренды. Мы не типичная маркетинговая компания! Пока многие бренды пытаются следовать трендам, мы помогаем вам создавать тренды.",
    ctaLabel: "Перейти →",
    ctaHref: "/OurTeam",
    members: [
      { id: 1,image: "/images/about-team/team3.jpg", name: "Cavid Axundov", role: "Генеральный директор" },
      { id: 2,image: "/images/about-team/team4.jpg", name: "Fuada Isgəndər-Rəhimli", role: "Директор по маркетингу" },
      { id: 3, image: "/images/about-team/team5.png", name: "Kanan Akhbarov", role: "Ведущий графический дизайнер" },
      { id: 4, image: "/images/about-team/team6.jpg", name: "Cəmilə Əhmədova", role: "Главный руководитель" },
      { id: 5, image: "/images/about-team/testimonials1.jpg",name: "Səbinə Akhundov", role: "Директор по маркетингу" },
      { id: 6, image: "/images/about-team/team3.jpg", name: "Kanan Akhbarov", role: "Ведущий графический дизайнер" },
    ],
  },
};

type AboutTeamProps = {
  locale?: string;
};

export default function AboutTeam({ locale = "az" }: AboutTeamProps) {
  const activeLocale: Locale =
    locale === "en" || locale === "ru" ? locale : "az";

  const content = teamDictionary[activeLocale];

  return (
    <section className="about-team">
      <PageContainer>
        <div className="about-team__inner">
          <div className="about-team__left">
            <h2 className="about-team__title">{content.title}</h2>
          <p className="about-team__description">{content.description}</p>
          </div>

          <div className="about-team__grid">
            {content.members.map((member) => (
              <div key={member.id} className="about-team__card">
                <img
                  src={member.image}
                  alt={member.name}
                  className="about-team__card-img"
                />
                <div className="about-team__card-info">
                  <span className="about-team__member-name">{member.name}</span>
                  <span className="about-team__member-role">{member.role}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </PageContainer>
    </section>
  );
}