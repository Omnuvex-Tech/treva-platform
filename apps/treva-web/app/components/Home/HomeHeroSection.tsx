'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import "./styles/home.css";

import { ButtonText } from '@/app/components/ButtonText';
import { HomeLiveCard, type HomeLiveCardItem } from './HomeLiveCard';

if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

const newsItems: HomeLiveCardItem[] = [
    {
        title: "Bakıda Mənzil Qiymətləri 2026: Sərfəli Layihələr",
        category: "Bloq",
        date: "23.04.2026",
        img: "https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/69e9dc5d25a4d7cb27fafcbc_leyla cover.webp",
        author: "Leyla Bağırzadə",
        authorImg: "https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/69eb87ce2666e56cda7df5f6_leyla-autor.webp",
        link: "bakida-menzil-qiymetleri-2026-serfeli-layiheler"
    },
    {
        title: "Bakıda Daşınmaz Əmlakda Satış Uğurunu Nə Müəyyən Edir?",
        category: "Bloq",
        date: "17.04.2026",
        img: "https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/69e23b2e65222dfa1568b506_javid cover.webp",
        author: "Cavid Axundov",
        authorImg: "https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/69b1127e23e0494e172f15d1_freepik__keep-everything-exactly-the-same-in-the-image-the-__62478.webp",
        link: "bakida-dasinmaz-emlak-satis-ugurunu-ne-mueyyen-edir"
    },
    {
        title: "Bakıda İnvestisiya Üçün Ən Uğurlu Layihələr Hansılardır?",
        category: "Bloq",
        date: "10.04.2026",
        img: "https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/69d8fa41ad243257771d2882_Nezrin Kerimli cover (1) (1).webp",
        author: "Nəzrin Kərimli",
        authorImg: "https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/69d8f643447acae0af6ad0cd_Nezrin Kərimli (1).webp",
        link: "bakida-investisiya-ucun-en-ugurlu-layiheler-hansilardir"
    },
    {
        title: "İnvestisiya üçün niyə məhz Sea Breeze?",
        category: "Bloq",
        date: "06.04.2026",
        img: "https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/69d387faabd8941c551800fa_turkan cover (1).webp",
        author: "Türkan Mamedova",
        authorImg: "https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/69d39344f03dd689a3df5f48_Turkan Mamedova (1)d.webp",
        link: "investisiya-ucun-niye-mehz-sea-breeze"
    },
    {
        title: "Satışdan Sonrakı Şəffaflıq: Müştəri Məmnuniyyəti Şirkətin Nüfuzunu Necə Müəyyən Edir?",
        category: "Bloq",
        date: "19.03.2026",
        img: "https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/69bbea28ae4fb211e7614275_cover sebine.webp",
        author: "Səbinə Muxtarova",
        authorImg: "https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/69bbd13d1d6e953bdfa53e4f_Sebine.webp",
        link: "satisdan-sonraki-seffafliq"
    },
    {
        title: "Bakı Daşınmaz Əmlak Bazarı: İnvestisiya İmkanları və Off-plan Trendi",
        category: "Bloq",
        date: "13.03.2026",
        img: "https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/69b419b1ccd29af57469cce0_batula cover.webp",
        author: "Batula Mohubbi",
        authorImg: "https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/69b40fd1699b4c83ff918f97_batula.webp",
        link: "baki-dasinmaz-emlak-bazari"
    },
    {
        title: "Daşınmaz əmlak almaq istəyən insanlar ilk növbədə nə ilə maraqlanırlar?",
        category: "Bloq",
        date: "04.03.2026",
        img: "https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/69b0356bc47fd3803791ac60_Gemini_Generated_Image_tcieq9tcieq9tcie.webp",
        author: "Ilhamə Paşazadə",
        authorImg: "https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/69a7d6a31b4102cd82150c58_1x1 size qadin (1).webp",
        link: "dasinmaz-emlak-almaq-isteyen-insanlar-ilk-novbede-ne-ile-maraqlanirlar"
    },
    {
        title: "Daşınmaz əmlak bazarında brokerlərlə işləmək niyə daha aktualdır?",
        category: "Bloq",
        date: "10.02.2026",
        img: "https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/698b3024d7c6aebd7f7d6138_freepik_medium_shot_of_an_azerbaijani_real_estate_broker_i_96816.webp",
        author: "Tərlan Kərimov",
        authorImg: "https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/6989c5263e93fc7d31871a9e_IMAGE.jpeg",
        link: "dasinmaz-emlak-bazarinda-brokerlerle-islemek"
    },
    {
        title: "Sizə uyğun mənzil növü hansıdır?",
        category: "Bloq",
        date: "02.02.2026",
        img: "https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/6985f7a8016aab013f18eb73_Narmin_sazmani_upscale_upscales (1) (1) (1) (1) (1) (1).png",
        author: "Həcər Nağıyeva",
        authorImg: "https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/69b4284aff4b24810b7251ff_hecer.webp",
        link: "size-uygun-menzil-novu-hansidir"
    },
    {
        title: "2026 Vizyonu: TREVA və Azərbaycanın Daşınmaz Əmlak Bazarının Sistemli Transformasiyası",
        category: "Bloq",
        date: "26.01.2026",
        img: "https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/697773c2eeb67ee81daa27ef_Treva 02.webp",
        author: "Cavid Axundov",
        authorImg: "https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/69b1127e23e0494e172f15d1_freepik__keep-everything-exactly-the-same-in-the-image-the-__62478.webp",
        link: "2026-baxisi-treva-ve-azerbaycanin-dasinmaz-emlak-bazarinin-sistemli-transformasiyasi"
    },
    {
        title: "Dəniz mənzərəli townhouse nədir və niyə Sea Breeze-də bu qədər seçilir?",
        category: "Bloq",
        date: "22.01.2026",
        img: "https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/6989e187812b56c36e0e41d1_farid.png",
        author: "Fərid Əlipənahov",
        authorImg: "https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/6971fdc542706589755deb51_profil photo.webp",
        link: "deniz-menzereli-townhouse-nedir"
    }
];

export const HomeHeroSection = () => {
    const sectionRef = useRef<HTMLElement>(null);
    const headingRef = useRef<HTMLHeadingElement>(null);
    const ctaBlockRef = useRef<HTMLDivElement>(null);
    const imgWrapRef = useRef<HTMLDivElement>(null);
    const trackRef = useRef<HTMLDivElement>(null);
    const firstBlockRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // 1) SƏHİFƏ FADE-IN — body.gsap-hidden-i söndür
        document.body.classList.remove('gsap-hidden');
        gsap.fromTo(
            document.body,
            { opacity: 0, visibility: 'hidden' },
            { opacity: 1, visibility: 'visible', duration: 0.6, ease: 'power2.out' }
        );

        const ctx = gsap.context(() => {
            // 2) BAŞLIQ ANİMASİYASI — söz-söz aşağıdan yuxarı reveal
            if (headingRef.current) {
                const heading = headingRef.current;
                const original = heading.textContent || '';
                const words = original.trim().split(/\s+/);
                heading.innerHTML = words
                    .map((w: string) =>
                        `<span class="word-mask" style="display:inline-block;overflow:hidden;vertical-align:bottom;line-height:1.18;padding-top:0.14em;padding-bottom:0.14em;margin-top:-0.14em;margin-bottom:-0.14em;"><span class="word-inner" style="display:inline-block;will-change:transform;">${w}</span></span>`
                    )
                    .join(' ');

                gsap.from(heading.querySelectorAll('.word-inner'), {
                    yPercent: 115,
                    duration: 1.1,
                    ease: 'power3.out',
                    stagger: 0.07,
                    delay: 0.25,
                });
            }

            // 3) HEADER ŞƏKLİ — yumşaq scale + opacity giriş
            if (imgWrapRef.current) {
                gsap.from(imgWrapRef.current, {
                    scale: 1.08,
                    opacity: 0,
                    duration: 1.4,
                    ease: 'power3.out',
                    delay: 0.2,
                });
            }

            // 4) CTA BLOK — aşağıdan yuxarı (data-gsap-delay="0.6")
            if (ctaBlockRef.current) {
                const delay = parseFloat(
                    ctaBlockRef.current.getAttribute('data-gsap-delay') || '0.6'
                );
                gsap.from(ctaBlockRef.current, {
                    y: 60,
                    opacity: 0,
                    duration: 1,
                    ease: 'power3.out',
                    delay,
                });
            }

            // 5) KARUSEL — sonsuz scroll (loop)
            if (trackRef.current && firstBlockRef.current) {
                const track = trackRef.current;
                const setX = gsap.quickSetter(track, 'x', 'px');
                let blockWidth = firstBlockRef.current.offsetWidth;
                let pos = 0;
                const speed = 60; // px/saniyə — sürəti dəyişmək üçün

                const tick = (time: number, deltaTime: number) => {
                    pos -= (speed * deltaTime) / 1000;
                    if (Math.abs(pos) >= blockWidth) pos += blockWidth;
                    setX(pos);
                };
                gsap.ticker.add(tick);

                // Pəncərə ölçüsü dəyişəndə yenidən hesabla
                const onResize = () => {
                    if (firstBlockRef.current) {
                        blockWidth = firstBlockRef.current.offsetWidth;
                    }
                };
                window.addEventListener('resize', onResize);

                // Hover-də dayan
                const pause = () => gsap.ticker.remove(tick);
                const resume = () => {
                    gsap.ticker.remove(tick);
                    gsap.ticker.add(tick);
                };
                track.addEventListener('mouseenter', pause);
                track.addEventListener('mouseleave', resume);

                return () => {
                    gsap.ticker.remove(tick);
                    window.removeEventListener('resize', onResize);
                    track.removeEventListener('mouseenter', pause);
                    track.removeEventListener('mouseleave', resume);
                };
            }
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    const renderBlock = (keyPrefix: string, blockRef?: React.Ref<HTMLDivElement>) => (
        <div className="live_block" ref={blockRef as React.RefObject<HTMLDivElement>}>
            {newsItems.map((item, index) => (
                <HomeLiveCard key={`${keyPrefix}-${index}`} item={item} />
            ))}
        </div>
    );

    return (
        <section className="section_header" ref={sectionRef}>
            <div className="global-padding">
                <div className="container-large">
                    <div className="header_component">
                        <div data-w-id="e4074abf-c232-ac8e-2a04-e835a6611a3a" className="header_wrap">
                            <div className="header_content-wrap">
                                <div className="max-width-48rem is-az">
                                    <h1 ref={headingRef} className="indented-heading-h1">
                                        DAŞINMAZ ƏMLAK SATIŞLARINIZI BİZİMLƏ MAKSİMUMA ÇATDIRIN
                                    </h1>
                                </div>
                                <div
                                    ref={ctaBlockRef}
                                    data-gsap-delay="0.6"
                                    className="header_cta-block animate-instant animate-up"
                                >
                                    <a href="#services" className="cs_scroll-wrap hide-landscape w-inline-block">
                                        <ButtonText>SÜRÜŞDÜRÜN</ButtonText>
                                        <div className="button-icon-wrap is-small">
                                            <div className="button-icon w-embed">
                                                <svg width="0.75rem" height="0.875rem" viewBox="0 0 12 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M5.37586 13.3742L0.501599 8.49998C0.402158 8.40054 0.346293 8.26567 0.346293 8.12504C0.346293 7.98441 0.402158 7.84954 0.5016 7.7501C0.601041 7.65065 0.735913 7.59479 0.876544 7.59479C1.01717 7.59479 1.15205 7.65065 1.25149 7.7501L5.22073 11.7193L5.22026 1.00111C5.22026 0.860404 5.27616 0.725457 5.37566 0.62596C5.47515 0.526464 5.6101 0.470568 5.75081 0.470568C5.89152 0.470568 6.02646 0.526464 6.12596 0.625961C6.22546 0.725457 6.28135 0.860403 6.28135 1.00111L6.28089 11.7193L10.2501 7.7501C10.3496 7.65065 10.4844 7.59479 10.6251 7.59479C10.7657 7.59479 10.9006 7.65065 11 7.7501C11.0995 7.84954 11.1553 7.98441 11.1553 8.12504C11.1553 8.26567 11.0995 8.40054 11 8.49998L6.12575 13.3742C6.02631 13.4737 5.89144 13.5296 5.75081 13.5296C5.61018 13.5296 5.47531 13.4737 5.37586 13.3742Z" fill="#4C525E" />
                                                </svg>
                                            </div>
                                            <div className="button-icon w-embed">
                                                <svg width="0.75rem" height="0.875rem" viewBox="0 0 12 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M5.37586 13.3742L0.501599 8.49998C0.402158 8.40054 0.346293 8.26567 0.346293 8.12504C0.346293 7.98441 0.402158 7.84954 0.5016 7.7501C0.601041 7.65065 0.735913 7.59479 0.876544 7.59479C1.01717 7.59479 1.15205 7.65065 1.25149 7.7501L5.22073 11.7193L5.22026 1.00111C5.22026 0.860404 5.27616 0.725457 5.37566 0.62596C5.47515 0.526464 5.6101 0.470568 5.75081 0.470568C5.89152 0.470568 6.02646 0.526464 6.12596 0.625961C6.22546 0.725457 6.28135 0.860403 6.28135 1.00111L6.28089 11.7193L10.2501 7.7501C10.3496 7.65065 10.4844 7.59479 10.6251 7.59479C10.7657 7.59479 10.9006 7.65065 11 7.7501C11.0995 7.84954 11.1553 7.98441 11.1553 8.12504C11.1553 8.26567 11.0995 8.40054 11 8.49998L6.12575 13.3742C6.02631 13.4737 5.89144 13.5296 5.75081 13.5296C5.61018 13.5296 5.47531 13.4737 5.37586 13.3742Z" fill="#4C525E" />
                                                </svg>
                                            </div>
                                        </div>
                                    </a>
                                    <div className="header_cta-wrap is-home">
                                        <Link data-wf--button--variant="blue" href="brokers#broker-registration" className="button w-inline-block">
                                            <ButtonText>Satış şəbəkəmizə qoşulun</ButtonText>
                                        </Link>
                                        <Link data-wf--button--variant="ghost" href="/developers" className="button w-variant-bc0192ac-8f77-bda0-587a-2ac5ad6e5e49 w-inline-block">
                                            <ButtonText>Satışlarınızı artırmaq üçün tərəfdaşlıq edin</ButtonText>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                            <div className="header_img-wrap" ref={imgWrapRef}></div>
                            <div className="live_carousel">
                                <div className="live_track" ref={trackRef} style={{ display: 'flex', willChange: 'transform' }}>
                                    {renderBlock('orig', firstBlockRef)}
                                    {renderBlock('dup', null)}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
