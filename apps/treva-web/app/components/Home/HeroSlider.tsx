'use client';

import React, { useState, useEffect, useCallback } from 'react';

const SLIDES = [
  { src: '/cdn-assets/4dc58b3c3a-694b8bb85b202963ab0b0f12_Panorama-001.png', alt: 'Panorama by ELIE SAAB – 001' },
  { src: '/cdn-assets/0349bbc1a3-695e5bc2c027699fc4082880_Panorama-002.png', alt: 'Panorama by ELIE SAAB – 002' },
  { src: '/cdn-assets/268dd0d04d-694b8bbbadc23654d480c2e6_Panorama-003.png', alt: 'Panorama by ELIE SAAB – 003' },
  { src: '/cdn-assets/fd57526888-694b8bd00f243580932023c9_Panorama-004.png', alt: 'Panorama by ELIE SAAB – 004' },
  { src: '/cdn-assets/17a62a3f01-694b8bc7b5c685fb23d361b7_Panorama-005.png', alt: 'Panorama by ELIE SAAB – 005' },
  { src: '/cdn-assets/2592662339-694b8bcbb71a14e707348bf2_Panorama-006.png', alt: 'Panorama by ELIE SAAB – 006' },
  { src: '/cdn-assets/0dae8f92d8-695e5cb0a51c55b235b51fbf_Panorama-007.webp', alt: 'Panorama by ELIE SAAB – 007' },
  { src: '/cdn-assets/727892c49c-69e0ca6fb39a1d49bd14574e_arabiann-5.webp', alt: 'Arabian Ranches – Sea Breeze' },
  { src: '/cdn-assets/72ead513f5-69e0c621c5a1ea6d681c685e_arabiann-12.webp', alt: 'Arabian Ranches – Exterior' },
  { src: '/cdn-assets/c1d3c9c704-69e0c621b060f52939e49dad_arabiann-4.webp', alt: 'Arabian Ranches – Interior' },
];

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % SLIDES.length);
  }, []);

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(next, 4500);
    return () => clearInterval(timer);
  }, [next]);

  return (
    <div className="hero-slider">
      <div className="hero-slider__viewport">
        <div
          className="hero-slider__track"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {SLIDES.map((slide, i) => (
            <div className="hero-slider__slide" key={i}>
              <img
                src={slide.src}
                alt={slide.alt}
                className="hero-slider__img"
                loading={i === 0 ? 'eager' : 'lazy'}
                draggable={false}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Nav arrows */}
      <button className="hero-slider__arrow hero-slider__arrow--prev" onClick={prev} aria-label="Previous slide">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </button>
      <button className="hero-slider__arrow hero-slider__arrow--next" onClick={next} aria-label="Next slide">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </button>

      {/* Dot indicators */}
      <div className="hero-slider__dots">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            className={`hero-slider__dot${i === current ? ' active' : ''}`}
            onClick={() => setCurrent(i)}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
