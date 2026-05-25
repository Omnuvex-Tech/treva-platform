"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import "./vision-hero.css";

export default function VisionHero() {
  return (
    <section className="vision-hero">
      {/* Arxa fon şəkli */}
      <div className="vision-hero__bg-wrapper">
        <Image
          src="/images/projects/project1.jpg" 
          alt="Treva Panorama Banner"
          fill
          priority
          quality={100}
          className="vision-hero__bg-img"
        />
      </div>
      
      {/* Şəklin üzərindəki eleqant qaraltma qatı */}
      <div className="vision-hero__overlay"></div>

      {/* Əsas Hero Məzmunu */}
      <div className="vision-hero__container">
        <div className="vision-hero__content">
          <h1 className="vision-hero__title">
            PANORAMA BY ELIE SAAB
          </h1>
          
          {/* Desktop mətni */}
          <p className="vision-hero__description vision-hero__description--desktop">
            A<span className="lowercase-text"> sophisticated blend of high-fashion aesthetics and modern luxury.</span>
          </p>
          
          {/* Mobil mətni */}
          <p className="vision-hero__description vision-hero__description--mobile">
            C<span className="lowercase-text">urated real estate investments and tailored lifestyle solutions.</span>
          </p>

          {/* Konsultasiya Düyməsi */}
          <Link href="/consultation" className="vision-hero__cta">
            <span className="vision-hero__cta-text">GET A CONSULTATION</span>
            <span className="vision-hero__cta-icon">
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M13 1M13 1H5M13 1V9M13 1L1 13" stroke="#0A0A0A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
          </Link>
        </div>

        {/* Slayder Oxları (Sağ tərəfdə) */}
        <div className="vision-hero__slider-arrows">
          <button className="vision-hero__arrow vision-hero__arrow--prev" aria-label="Previous slide">
            <svg width="18" height="12" viewBox="0 0 18 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 11L1 6M1 6L6 1M1 6H17" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button className="vision-hero__arrow vision-hero__arrow--next" aria-label="Next slide">
            <svg width="18" height="12" viewBox="0 0 18 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 1L17 6M17 6L12 11M17 6H1" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>

      {/* SƏTİR ÜZRƏ BÜTÜN EKRANI TUTAN 3 SEQMNTLİ XƏTT (YALNIZ DESKTOP) */}
      <div className="vision-hero__bottom-timeline">
        <span className="vision-hero__segment vision-hero__segment--active"></span>
        <span className="vision-hero__segment"></span>
        <span className="vision-hero__segment"></span>
      </div>
    </section>
  );
}