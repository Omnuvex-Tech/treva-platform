"use client";

import React, { useState } from "react";
import Link from "next/link";
import PageContainer from "@/app/components/Container/PageContainer";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade, Navigation } from "swiper/modules";
import type SwiperClass from "swiper";
import { DirectionButton } from "@/app/components/Buttons/PortfolioButtons";
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/navigation";
import "./vision-hero.css";

export interface ProjectHeroImage {
  url: string;
  alt: string;
}

interface Props {
  title: string;
  desktopDescription: string;
  mobileDescription: string;
  images: ProjectHeroImage[];
  ctaText?: string;
  ctaLink?: string;
  onCtaClick?: React.MouseEventHandler<HTMLAnchorElement | HTMLButtonElement>;
  getImageUrl: (url: string) => string;
}

export default function ProjectHero({
  title,
  desktopDescription,
  mobileDescription,
  images,
  ctaText,
  ctaLink,
  onCtaClick,
  getImageUrl,
}: Props) {
  const validImages = images?.filter((img) => img.url) || [];
  const [activeIndex, setActiveIndex] = useState(0);

  const handleSlideChange = (swiper: SwiperClass) => {
    setActiveIndex(swiper.realIndex);
  };

  return (
    <section className="vision-hero">
      {/* Background Swiper */}
      {validImages.length > 0 ? (
        <Swiper
          modules={[Autoplay, EffectFade, Navigation]}
          effect="fade"
          fadeEffect={{ crossFade: true }}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          loop={validImages.length > 1}
          navigation={{
            prevEl: ".vision-hero__prev",
            nextEl: ".vision-hero__next",
          }}
          onSlideChange={handleSlideChange}
          className="vision-hero__bg-wrapper"
        >
          {validImages.map((img, idx) => (
            <SwiperSlide key={idx}>
              <img
                src={getImageUrl(img.url)}
                alt={img.alt || title || "Project Banner"}
                className="vision-hero__bg-img"
              />
            </SwiperSlide>
          ))}
        </Swiper>
      ) : (
        <div className="vision-hero__bg-wrapper" />
      )}

      {/* Elegant overlay */}
      <div className="vision-hero__overlay"></div>

      {/* Main Content */}
      <PageContainer className="vision-hero__container">
        <div className="vision-hero__content">
          <h1 className="vision-hero__title">{title}</h1>

          {desktopDescription && (
            <p className="vision-hero__description vision-hero__description--desktop">
              {desktopDescription}
            </p>
          )}

          {mobileDescription && (
            <p className="vision-hero__description vision-hero__description--mobile">
              {mobileDescription}
            </p>
          )}

          {ctaText && (ctaLink || onCtaClick) && (
            onCtaClick ? (
              <button type="button" className="vision-hero__cta" onClick={onCtaClick}>
                <span className="vision-hero__cta-text">{ctaText}</span>
                <span className="vision-hero__cta-icon">
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 14 14"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M13 1M13 1H5M13 1V9M13 1L1 13"
                      stroke="#0A0A0A"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </button>
            ) : (
              <Link href={ctaLink!} className="vision-hero__cta">
                <span className="vision-hero__cta-text">{ctaText}</span>
                <span className="vision-hero__cta-icon">
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 14 14"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M13 1M13 1H5M13 1V9M13 1L1 13"
                      stroke="#0A0A0A"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </Link>
            )
          )}
        </div>

        {/* Slider Controls */}
        {validImages.length > 1 && (
          <div className="vision-hero__slider-arrows">
            <DirectionButton
              direction="previous"
              label="Previous slide"
              className="vision-hero__prev"
            />
            <DirectionButton
              direction="next"
              label="Next slide"
              className="vision-hero__next"
            />
          </div>
        )}
      </PageContainer>

      {/* Progress Timeline */}
      {validImages.length > 1 && (
        <div className="vision-hero__bottom-timeline">
          {validImages.map((_, idx) => (
            <span
              key={idx}
              className={`vision-hero__segment ${idx === activeIndex ? "vision-hero__segment--active" : ""}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
