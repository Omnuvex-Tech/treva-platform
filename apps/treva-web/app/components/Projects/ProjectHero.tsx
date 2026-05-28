"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import PageContainer from "@/app/components/Container/PageContainer";
import { DirectionButton } from "@/app/components/Buttons/PortfolioButtons";
import { ProjectHeroData } from "@/lib/projects.types";
import "./vision-hero.css";

interface Props {
  data: ProjectHeroData;
}

export default function ProjectHero({ data }: Props) {
  return (
    <section className="vision-hero">
      {/* Background Image */}
      <div className="vision-hero__bg-wrapper">
        <Image
          src={data.backgroundImage}
          alt={typeof data.title === "string" ? data.title : "Project Banner"}
          fill
          priority
          quality={100}
          className="vision-hero__bg-img"
        />
      </div>
      
      {/* Elegant overlay */}
      <div className="vision-hero__overlay"></div>

      {/* Main Content */}
      <PageContainer className="vision-hero__container">
        <div className="vision-hero__content">
          <h1 className="vision-hero__title">
            {data.title}
          </h1>
          
          {/* Desktop Description */}
          <p className="vision-hero__description vision-hero__description--desktop">
            {data.desktopDescription}
          </p>
          
          {/* Mobile Description */}
          <p className="vision-hero__description vision-hero__description--mobile">
            {data.mobileDescription}
          </p>

          {/* CTA Button */}
          {data.ctaText && data.ctaLink && (
            <Link href={data.ctaLink} className="vision-hero__cta">
              <span className="vision-hero__cta-text">{data.ctaText}</span>
              <span className="vision-hero__cta-icon">
                <svg width="12" height="12" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13 1M13 1H5M13 1V9M13 1L1 13" stroke="#0A0A0A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
            </Link>
          )}
        </div>

        {/* Slider Controls */}
        <div className="vision-hero__slider-arrows">
          <DirectionButton direction="previous" label="Previous slide" />
          <DirectionButton direction="next" label="Next slide" />
        </div>
      </PageContainer>

      {/* Progress Timeline (Desktop Only) */}
      <div className="vision-hero__bottom-timeline">
        <span className="vision-hero__segment vision-hero__segment--active"></span>
        <span className="vision-hero__segment"></span>
        <span className="vision-hero__segment"></span>
      </div>
    </section>
  );
}
