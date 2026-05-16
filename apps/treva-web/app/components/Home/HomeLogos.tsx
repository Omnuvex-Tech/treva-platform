"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import "./styles/home.css";
import { Swiper } from 'swiper';
import { Navigation, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

import { ButtonText } from '@/app/components/ButtonText';

// Production-parity CSS overrides
const productionStyles = `
  @font-face {
    font-family: Helveticanowdisplay;
    src: url(https://cdn.prod.website-files.com/6825d64025f8005ef1ddfc4c/68908bd9d6a08ad4a2ee21dc_HelveticaNowDisplay-Regular.ttf) format("truetype");
    font-weight: 400;
    font-style: normal;
    font-display: swap;
  }

  .section_logos .logos_intro {
    display: flex !important;
    justify-content: space-between !important;
    align-items: flex-end !important;
    margin-bottom: 63px !important;
    width: 100% !important;
  }
  
  .text-color-white60 {
    color: rgba(255, 255, 255, 0.6) !important;
  }
  
  .n-testimonials_quote {
    font-family: Helveticanowdisplay, sans-serif !important;
    letter-spacing: -0.04em !important;
    max-width: 644px !important;
    font-size: 28px !important;
    font-weight: 500 !important;
    line-height: 1.1 !important;
    color: #fff !important;
    text-transform: uppercase !important;
  }
  
  .n-testimonials_author-wrap {
    font-family: Helveticanowdisplay, sans-serif !important;
    grid-column-gap: 10px !important;
    grid-row-gap: 10px !important;
    justify-content: flex-start !important;
    align-items: center !important;
    display: flex !important;
    color: #fff !important;
    font-size: 14px !important;
    text-transform: uppercase !important;
    letter-spacing: 0.05em !important;
  }

  .section_logos h2 {
    text-transform: uppercase !important;
  }

  .text-color-white60 {
    color: rgba(255, 255, 255, 0.6) !important;
    text-transform: uppercase !important;
  }

  .n-testimonials_card {
    grid-column-gap: 43.75px !important;
    grid-row-gap: 43.75px !important;
    flex-flow: column !important;
    justify-content: center !important;
    align-items: flex-start !important;
    height: 100% !important;
    padding: 70px 38.5px 45.5px 63px !important;
    display: flex !important;
    transition: none !important;
    transform: none !important;
    box-shadow: none !important;
  }
  
  .n-testimonials_card:hover {
    transform: none !important;
    box-shadow: none !important;
  }

  .logos_cell:hover .logos_img-wrap {
    transform: none !important;
  }

  .logos_cell-decoration .icon-large svg {
    transition: none !important;
  }

  .logos_cell:hover .logos_cell-decoration .icon-large svg {
    opacity: 0.5 !important;
    transform: none !important;
  }

  .swiper-nav-testimonials {
    display: flex !important;
    align-items: center !important;
    gap: 16.8px !important;
    position: absolute !important;
    right: 63px !important;
    bottom: 45.5px !important;
    z-index: 10 !important;
  }

  .swiper-testimonials-prev, .swiper-testimonials-next {
    cursor: pointer !important;
    transition: opacity 0.3s ease !important;
  }

  .swiper-testimonials-prev:hover, .swiper-testimonials-next:hover {
    opacity: 0.6 !important;
  }

  .heading-gap-h1 {
    display: none !important;
  }

  .section_logos .logos-partnership-button {
    grid-column-gap: 5px !important;
    grid-row-gap: 5px !important;
    border: 1px solid var(--_color---white) !important;
    background-color: var(--_color---white) !important;
    color: var(--_color---blue-400) !important;
    white-space: nowrap !important;
    border-radius: 80px !important;
    justify-content: center !important;
    align-items: center !important;
    box-sizing: border-box !important;
    width: 240px !important;
    min-width: 0 !important;
    max-width: 100% !important;
    height: 29px !important;
    min-height: 29px !important;
    padding: 0 17px !important;
    font-size: 14px !important;
    line-height: 17px !important;
    text-decoration: none !important;
    transition: all .3s !important;
    display: flex !important;
    flex: none !important;
    overflow: hidden !important;
  }

  .section_logos .logos-partnership-button:hover {
    color: var(--_color---white) !important;
    background-color: #fff0 !important;
  }

  .section_logos .logos-partnership-button .button-text-wrap {
    position: relative !important;
    width: 100% !important;
    height: 17px !important;
    line-height: 17px !important;
    display: block !important;
    overflow: hidden !important;
  }

  .section_logos .logos-partnership-button .button-text {
    position: absolute !important;
    left: 0 !important;
    top: 0 !important;
    width: 100% !important;
    height: 17px !important;
    line-height: 17px !important;
    text-align: center !important;
    white-space: nowrap !important;
    margin: 0 !important;
    padding: 0 !important;
    transform: translateY(0) !important;
    transition: transform .3s ease !important;
  }

  .section_logos .logos-partnership-button .button-text + .button-text {
    top: 17px !important;
  }

  .section_logos .logos-partnership-button:hover .button-text {
    transform: translateY(-17px) !important;
  }

  @media screen and (max-width: 991px) {
    .section_logos .logos_intro {
      flex-direction: column !important;
      align-items: flex-start !important;
      gap: 21px !important;
    }
    
    .n-testimonials_quote {
      font-size: 21px !important;
    }
    
    .n-testimonials_card {
      padding: 42px 28px !important;
    }
    
    .swiper-nav-testimonials {
      right: 28px !important;
      bottom: 28px !important;
    }
  }
`;

// Reusable decorative SVG icon
const DecorativeIcon = () => (
  <svg width="21" height="21" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M-4.80825e-07 11L-4.37114e-07 10L7.0459 10L7.0459 11L-4.80825e-07 11ZM11 21L10 21L10 13.9551L11 13.9551L11 21ZM10 7.45508L10 -4.80825e-07L11 -4.37114e-07L11 7.45508L10 7.45508ZM13.5459 11L13.5459 10L21 10L21 11L13.5459 11Z"
      fill="#CBCBCB"
      fillOpacity="0.5"
    />
  </svg>
);

const testimonials = [
  {
    quote: "“TREVA ilə əməkdaşlıq etdiyimiz hər bir layihədə onlar operativ intizamı təmin edirlər. Strukturlaşdırılmış, daim yenilənən siyahılar və brokerlər üçün hazır alətlərlə Bakıdakı daşınmaz əmlak satış prosesi daha sürətli, daha şəffaf və idarəolunması asan olur.”",
    author: "ETAGI azerbaijan"
  },
  {
    quote: "“TREVA ilə aramızda formalaşan etimad hər bir layihədə daha da möhkəmlənir. Onlar qiymət strategiyasından tutmuş müştəri axınına qədər hər detala dəqiqliklə yanaşmışdırlar. Onların yaradıcı dəstəyi, layihələrin düzgün paketlənməsi və ardıcıl izləmələri bizə güclü marağı təsirli nəticələrə çevirməyə kömək etmişdir.”",
    author: "TRIDENT Investment"
  },
  {
    quote: "“TREVA-nı digərlərindən fərqləndirən iş prosesindəki aydınlıq və davamlılıqdır. Broker olaraq hər zaman məlumatlısınız: elanlar aktualdır, əlaqə çevikdir, və bütün alətlər satış prosesini asanlaşdırır.”",
    author: "rnS estate"
  },
  {
    quote: "“TREVA brokerlərə lazım olan hər şeyi təqdim edir: yüksək keyfiyyətli vizuallar və effektiv lead sistemi. Biz artıq sadəcə obyekt göstərmirik, onu düzgün təqdim edirik.”",
    author: "bazis real estate"
  },
  {
    quote: "“TREVA ilə tərəfdaşlığımız iş prosesimizə tam struktur gətirdi. Onların strateji planlaşdırması, brokerlərlə koordinasiyası və gündəlik dəstəyi satış prosesinə maneə yaratmadan çalışmaq imkanı yaradır.”",
    author: "AUF Invest"
  },
  {
    quote: "“TREVA-nın kampaniyaları məqsədli şəkildə hazırlanır və komandası brokerlərin səylərini aktiv şəkildə dəstəkləyərək izləmə, müştəriylə üzbəüz görüşlər və ağıllı mövqeləndirmə zamanı fəal iştirak edir. Bu cür tərəfdaşlıq real satışlarla nəticələnir.”",
    author: "megapolis estate"
  },
  {
    quote: "“TREVA satış prosesində etibar edə biləcəyimiz bir tərəfdaşdır. Onların komandası bir tikinti şirkətinin ehtiyaclarını yaxşı anlayır - şəffaf hesabatlılıq, bazar tələblərinə uyğun strategiya və alıcılarla real ünsiyyət. Onların hər layihəyə göstərdiyi ardıcıl və peşəkar yanaşmanı yüksək qiymətləndiririk.”",
    author: "Sabah Investment Group"
  }
];

export const HomeLogos = () => {
  useEffect(() => {
    const swiper = new Swiper('.swiper-testimonials', {
      modules: [Navigation, Autoplay],
      speed: 800,
      loop: false,
      autoplay: {
        delay: 5000,
        disableOnInteraction: false,
          stopOnLastSlide: true,        // optional: autoplay stops at last slide
      },
      navigation: {
        nextEl: '.swiper-testimonials-next',
        prevEl: '.swiper-testimonials-prev',
      },
    });

    return () => {
      swiper.destroy();
    };
  }, []);

  return (
    <section className="section_logos home-logos-section bg-color-blue100 parallax-reveal">
      <style dangerouslySetInnerHTML={{ __html: productionStyles }} />
      <div className="global-padding home-logos-padding padding-section-medium">
        <div className="container-large home-logos-container">
          <div className="logos_component home-logos-component">
            {/* Intro Section */}
            <div className="logos_intro home-logos-intro">
              <div className="home-logos-title-wrap">
                <h2 className="text-color-white home-logos-title">
                  Sahə üzrə etibarlı tərəfdaş şəbəkəsi tərəfindən dəstəklənir.
                </h2>
              </div>
              <div className="text-color-white60 home-logos-label first-child">(etibarlı tərəfdaşlar)</div>
            </div>

            {/* Logos Grid */}
            <div className="logos_wrap home-logos-grid-wrap">
              {/* Row 1 */}
              <div className="n-testimonials_row">
                <div className="logos_cell-holder">
                  <div className="logos_cell is-half"></div>
                </div>
                <div className="logos_cell-holder">
                  <div className="logos_cell">
                    <div className="logos_cell-decoration">
                      <div className="icon-large w-embed">
                        <DecorativeIcon />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="logos_cell-holder">
                  <div className="logos_cell">
                    <div className="logos_img-wrap">
                      <img
                        width="100"
                        loading="lazy"
                        alt="sig"
                        src="/cdn-assets/15ca682d3f-6880c7caac01b2176b7a2840_SIG-blue-2.png"
                        className="logos_img"
                      />
                    </div>
                    <div className="logos_cell-decoration">
                      <div className="icon-large w-embed">
                        <DecorativeIcon />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="logos_cell-holder">
                  <div className="logos_cell">
                    <div className="logos_img-wrap">
                      <img
                        width="187"
                        loading="lazy"
                        alt="seabreeze real estate"
                        src="/cdn-assets/b4ff8cd415-6887158ebff1d28bc62ec9f0_seabreeze-1.png"
                        className="logos_img"
                      />
                    </div>
                    <div className="logos_cell-decoration">
                      <div className="icon-large w-embed">
                        <DecorativeIcon />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="logos_cell-holder">
                  <div className="logos_cell">
                    <div className="logos_img-wrap">
                      <img
                        width="154"
                        loading="lazy"
                        alt="reportage properties"
                        src="/cdn-assets/38b92121c7-6880c7cfb2730b05a0143175_reportage-4.png"
                        className="logos_img"
                      />
                    </div>
                    <div className="logos_cell-decoration">
                      <div className="icon-large w-embed">
                        <DecorativeIcon />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="logos_cell-holder">
                  <div className="logos_cell"></div>
                </div>
                <div className="logos_cell-holder no-left">
                  <div className="logos_cell is-half"></div>
                </div>
              </div>

              {/* Row 2 */}
              <div className="n-testimonials_row">
                <div className="logos_cell-holder">
                  <div className="logos_cell is-half">
                    <div className="logos_cell-decoration">
                      <div className="icon-large w-embed">
                        <DecorativeIcon />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="logos_cell-holder">
                  <div className="logos_cell">
                    <div className="logos_img-wrap">
                      <img
                        width="76"
                        loading="lazy"
                        alt="etagi"
                        src="/cdn-assets/7423ec34f5-6880c7ca81f1ddf220343938_Etagi-logo-1.png"
                        className="logos_img"
                      />
                    </div>
                    <div className="logos_cell-decoration">
                      <div className="icon-large w-embed">
                        <DecorativeIcon />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="logos_cell-holder">
                  <div className="logos_cell">
                    <div className="logos_img-wrap">
                      <img
                        width="55.5"
                        loading="lazy"
                        alt="trident"
                        src="/cdn-assets/8def5f3166-6880c7cadbe0002df55f8ea0_Logo-Trident-1.png"
                        className="logos_img"
                      />
                    </div>
                    <div className="logos_cell-decoration">
                      <div className="icon-large w-embed">
                        <DecorativeIcon />
                      </div>
                    </div>
                  </div>
                </div>
                <div id="w-node-_38e37002-95f4-8d06-cfd1-4ad5658a80fd-82ace242" className="logos_cell-holder">
                  <div className="logos_cell is-half">
                    <div className="logos_cell-decoration">
                      <div className="icon-large w-embed">
                        <DecorativeIcon />
                      </div>
                    </div>
                  </div>
                </div>
                <div id="w-node-_38e37002-95f4-8d06-cfd1-4ad5658a8101-82ace242" className="logos_cell-holder">
                  <div className="logos_cell">
                    <div className="logos_img-wrap">
                      <img
                        width="81"
                        loading="lazy"
                        alt="megapolis estate"
                        src="/cdn-assets/157518584b-6880c7caaa52d1681e827451_megapolis-logo-1.png"
                        className="logos_img"
                      />
                    </div>
                    <div className="logos_cell-decoration">
                      <div className="icon-large w-embed">
                        <DecorativeIcon />
                      </div>
                    </div>
                  </div>
                </div>
                <div id="w-node-_38e37002-95f4-8d06-cfd1-4ad5658a8107-82ace242" className="logos_cell-holder">
                  <div className="logos_cell">
                    <div className="logos_img-wrap">
                      <img
                        width="215"
                        loading="lazy"
                        alt="auf invest"
                        src="/cdn-assets/7a685b68a5-688c5e4e39e6dc2ebee591e2_AUF-1.png"
                        className="logos_img"
                      />
                    </div>
                    <div className="logos_cell-decoration">
                      <div className="icon-large w-embed">
                        <DecorativeIcon />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Testimonials Swiper */}
                <div id="w-node-_38e37002-95f4-8d06-cfd1-4ad5658a810d-82ace242" className="testimonials_slider">
                  <div className="swiper swiper-testimonials">
                    <div className="swiper-wrapper swiper-wrapper-testimonials">
                      {testimonials.map((item, idx) => (
                        <div key={idx} className="swiper-slide swiper-slide-testimonials">
                        <div className="n-testimonials_card home-logos-testimonial-card">
                            <p className="n-testimonials_quote home-logos-testimonial-quote">{item.quote}</p>
                            <div className="n-testimonials_specs home-logos-testimonial-specs">
                              <div className="n-testimonials_author-wrap home-logos-testimonial-author-wrap">
                                <div className="home-logos-testimonial-author">
                                  {item.author}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="swiper-nav swiper-nav-testimonials">
                    <div className="swiper-testimonials-prev">
                      <div className="icon w-embed">
                        <svg width="10" height="15" viewBox="0 0 10 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M9.78299 1.78543C9.96665 1.97554 9.96142 2.27853 9.77131 2.46219L4.71543 7.3466C4.52067 7.53475 4.52067 7.84688 4.71543 8.03503L9.77131 12.9194C9.96142 13.1031 9.96664 13.4061 9.78299 13.5962L8.6718 14.7464C8.48814 14.9365 8.18515 14.9417 7.99504 14.7581L1.03599 8.03503C0.841227 7.84688 0.841227 7.53475 1.03599 7.3466L7.99504 0.62356C8.18515 0.439901 8.48814 0.445128 8.6718 0.635234L9.78299 1.78543Z"
                            fill="white"
                          />
                        </svg>
                      </div>
                    </div>
                    <div className="swiper-testimonials-next">
                      <div className="icon w-embed">
                        <svg width="10" height="15" viewBox="0 0 10 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M0.592012 13.5954C0.408353 13.4053 0.41358 13.1023 0.603685 12.9187L5.65956 8.03426C5.85432 7.84611 5.85432 7.53398 5.65956 7.34583L0.603685 2.46142C0.413579 2.27776 0.408352 1.97477 0.59201 1.78466L1.7032 0.634465C1.88686 0.44436 2.18985 0.439133 2.37996 0.622791L9.33901 7.34583C9.53377 7.53398 9.53377 7.84611 9.33901 8.03426L2.37996 14.7573C2.18985 14.941 1.88686 14.9357 1.7032 14.7456L0.592012 13.5954Z"
                            fill="white"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 3 */}
              <div className="n-testimonials_row">
                <div className="logos_cell-holder no-bottom">
                  <div className="logos_cell is-half"></div>
                </div>
                <div className="logos_cell-holder no-bottom">
                  <div className="logos_cell"></div>
                </div>
                <div className="logos_cell-holder no-bottom">
                  <div className="logos_cell">
                    <div className="logos_img-wrap">
                      <img
                        width="57"
                        loading="lazy"
                        alt="rns real estate"
                        src="/cdn-assets/828fcfb4ae-6880c7cad8c0aa9c2bf2abc3_Logo-RNS-1.png"
                        className="logos_img"
                      />
                    </div>
                  </div>
                </div>
                <div className="logos_cell-holder no-bottom">
                  <div className="logos_cell">
                    <div className="logos_img-wrap">
                      <img
                        width="155"
                        loading="lazy"
                        alt="villa az"
                        src="/cdn-assets/94147fe51b-6887158e4499458c3bafba1f_villa-1.png"
                        className="logos_img"
                      />
                    </div>
                    <div className="logos_cell-decoration is-up">
                      <div className="icon-large w-embed">
                        <DecorativeIcon />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="logos_cell-holder no-bottom">
                  <div className="logos_cell">
                    <div className="logos_img-wrap">
                      <img
                        width="92"
                        loading="lazy"
                        alt="bazis real estate"
                        src="/cdn-assets/4c1106d90c-6885e01df74b709059435ec2_bazis-real-estate-logo-3.png"
                        className="logos_img"
                      />
                    </div>
                    <div className="logos_cell-decoration is-up">
                      <div className="icon-large w-embed">
                        <DecorativeIcon />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="logos_cell-holder no-bottom">
                  <div className="logos_cell"></div>
                </div>
                <div className="logos_cell-holder no-left no-bottom">
                  <div className="logos_cell is-half"></div>
                </div>
              </div>

              {/* Gradients */}
              <div className="n-testimonials_black-gradient is-left"></div>
              <div className="n-testimonials_black-gradient is-top"></div>
              <div className="n-testimonials_black-gradient is-bottom"></div>
            </div>

            {/* Mobile Logos (simplified, kept as original) */}
            <div className="logos_mobile home-logos-mobile">
              <div data-w-id="3667447e-bb70-d435-2c4e-2b618901377f" className="n-testimonials_holder-mob">
                {/* Keeping original structure for brevity */}
              </div>
            </div>

            {/* CTA */}
            <div className="logos_cta-wrap home-logos-cta-wrap">
              <div className="note_wrap home-logos-note-wrap is-white">
                <div className="text-color-white60 home-logos-note-text">Tərəfdaş şəbəkəmizə qoşulmaq istəyirsiniz?</div>
              </div>
              <Link
                data-wf--button--variant="white"
                href="brokers#broker-registration"
                className="button logos-partnership-button w-variant-9209f11a-9939-4a4b-c66f-ac91791c56bc w-inline-block"
              >
                <ButtonText>TREVA ilə tərəfdaşlıq edin</ButtonText>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
