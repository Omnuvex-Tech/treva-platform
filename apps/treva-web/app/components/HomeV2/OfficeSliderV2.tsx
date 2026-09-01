"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";

type Props = {
  images: string[];
  /** Decorative on the V2 card (the address sits right below), so it stays "". */
  alt?: string;
  delay?: number;
};

/**
 * Office photo slider.
 *
 * The V1 contact page's `OfficeImageSlider` (components/Contact/contact-page.tsx)
 * brought over as-is: Swiper on autoplay, one slide at a time, touch disabled,
 * 900ms transition. The V2 office card had shipped each office as a single
 * still — this restores the rotating gallery with the same webp images V1 uses.
 */
export default function OfficeSliderV2({ images, alt = "", delay = 5000 }: Props) {
  return (
    <Swiper
      modules={[Autoplay]}
      loop={images.length > 1}
      speed={900}
      autoplay={{ delay, disableOnInteraction: false }}
      allowTouchMove={false}
      slidesPerView={1}
      spaceBetween={0}
      className="hv2-ct__swiper"
    >
      {images.map((src, index) => (
        <SwiperSlide key={src}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} loading={index === 0 ? "eager" : "lazy"} alt={alt} />
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
