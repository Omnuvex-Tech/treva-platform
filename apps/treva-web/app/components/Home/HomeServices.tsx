'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './styles/home.css';

if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

export const HomeServices = () => {
    const sectionRef = useRef<HTMLElement | null>(null);
    const headingRef = useRef<HTMLHeadingElement | null>(null);
    const firstChildRef = useRef<HTMLDivElement | null>(null);
    const ctaWrapRef = useRef<HTMLDivElement | null>(null);
    const imgWrapRef = useRef<HTMLDivElement | null>(null);
    const listRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // 1) BAŞLIQ — söz-söz aşağıdan reveal (scroll trigger ilə)
            if (headingRef.current) {
                const heading = headingRef.current;
                const gapSpan = heading.querySelector('.heading-gap-h1');
                const gapHTML = gapSpan ? gapSpan.outerHTML : '';
                const rawText = heading.textContent?.trim() || '';
                const words = rawText.split(/\s+/);

                heading.innerHTML =
                    gapHTML +
                    words
                        .map(
                            (w: string) =>
                                `<span class="word-mask" style="display:inline-block;overflow:hidden;vertical-align:bottom;line-height:1.05;padding-bottom:0.05em;"><span class="word-inner" style="display:inline-block;will-change:transform;">${w}</span></span>`
                        )
                        .join(' ');

                const wordInnerElements = heading.querySelectorAll('.word-inner');
                gsap.from(wordInnerElements, {
                    yPercent: 115,
                    duration: 1,
                    ease: 'power3.out',
                    stagger: 0.05,
                    scrollTrigger: {
                        trigger: heading,
                        start: 'top 85%',
                        toggleActions: 'play none none reverse',
                    },
                });
            }

            // 2) "(xidmətlər)" etiketi — solddan fade-in
            if (firstChildRef.current) {
                gsap.from(firstChildRef.current, {
                    x: -30,
                    opacity: 0,
                    duration: 0.9,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: firstChildRef.current,
                        start: 'top 90%',
                        toggleActions: 'play none none reverse',
                    },
                });
            }

            // 3) CTA blok (qeyd + buton) — aşağıdan yuxarı
            if (ctaWrapRef.current?.children) {
                gsap.from(ctaWrapRef.current.children, {
                    y: 40,
                    opacity: 0,
                    duration: 0.9,
                    ease: 'power3.out',
                    stagger: 0.15,
                    scrollTrigger: {
                        trigger: ctaWrapRef.current,
                        start: 'top 88%',
                        toggleActions: 'play none none reverse',
                    },
                });
            }

            // 4) ŞƏKİL BLOKU — clip-path reveal
            if (imgWrapRef.current) {
                gsap.fromTo(
                    imgWrapRef.current,
                    { clipPath: 'inset(100% 0% 0% 0%)' },
                    {
                        clipPath: 'inset(0% 0% 0% 0%)',
                        duration: 1.2,
                        ease: 'power3.out',
                        scrollTrigger: {
                            trigger: imgWrapRef.current,
                            start: 'top 85%',
                            toggleActions: 'play none none reverse',
                        },
                    }
                );
            }

            // 5) SERVICES LIST — sağdan içəri (animate-right)
            if (listRef.current) {
                const items = listRef.current.querySelectorAll('.services_item');
                gsap.from(items, {
                    x: 60,
                    opacity: 0,
                    duration: 0.8,
                    ease: 'power3.out',
                    stagger: 0.12,
                    scrollTrigger: {
                        trigger: listRef.current,
                        start: 'top 85%',
                        toggleActions: 'play none none reverse',
                    },
                });

                // 6) HOVER — data-index uyğunluğu ilə şəkil dəyişdirmə
                const images = imgWrapRef.current
                    ? (imgWrapRef.current.querySelectorAll('.services_img') as NodeListOf<HTMLElement>)
                    : [];

                const activateImage = (index: string) => {
                    images.forEach((img) => {
                        const isActive = img.getAttribute('data-index') === index;
                        gsap.to(img, {
                            opacity: isActive ? 1 : 0,
                            scale: isActive ? 1 : 1.05,
                            duration: 0.6,
                            ease: 'power3.out',
                            onStart: () => {
                                if (isActive) img.classList.add('active');
                                else img.classList.remove('active');
                            },
                        });
                    });
                };

                // Başlanğıc vəziyyət — yalnız 1-ci aktiv
                images.forEach((img) => {
                    const isFirst = img.getAttribute('data-index') === '1';
                    gsap.set(img, {
                        opacity: isFirst ? 1 : 0,
                        scale: isFirst ? 1 : 1.05,
                    });
                });

                type HandlerEntry = {
                    item: Element;
                    enter?: (e: Event) => void;
                    onIn?: () => void;
                    onOut?: () => void;
                };
                const handlers: HandlerEntry[] = [];

                items.forEach((item) => {
                    const idx = item.getAttribute('data-index');
                    if (idx) {
                        const enter = () => activateImage(idx);
                        item.addEventListener('mouseenter', enter);
                        handlers.push({ item, enter });
                    }

                    // İkona yumşaq fırlanma + item üzərinə hover effekti
                    const icon = item.querySelector('.services_icon') as HTMLElement | null;
                    const title = item.querySelector('.services_item-title') as HTMLElement | null;
                    const onIn = () => {
                        if (icon) gsap.to(icon, { rotate: 45, duration: 0.4, ease: 'power2.out' });
                        if (title) gsap.to(title, { x: 8, duration: 0.4, ease: 'power2.out' });
                    };
                    const onOut = () => {
                        if (icon) gsap.to(icon, { rotate: 0, duration: 0.4, ease: 'power2.out' });
                        if (title) gsap.to(title, { x: 0, duration: 0.4, ease: 'power2.out' });
                    };
                    item.addEventListener('mouseenter', onIn);
                    item.addEventListener('mouseleave', onOut);
                    handlers.push({ item, onIn, onOut });
                });

                return () => {
                    handlers.forEach(({ item, enter, onIn, onOut }) => {
                        if (enter) item.removeEventListener('mouseenter', enter);
                        if (onIn) item.removeEventListener('mouseenter', onIn);
                        if (onOut) item.removeEventListener('mouseleave', onOut);
                    });
                };
            }
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section id="services" className="section_services" ref={sectionRef}>
            <div className="global-padding padding-section-medium">
                <div className="container-large">
                    <div className="services_component">
                        <div className="services_wrap">
                            <div className="services_top-wrap">
                                <div className="max-width-54rem is-large-tablet is-az">
                                    <h2 ref={headingRef} className="heading-style-h2-medium">
                                        <span className="heading-gap-h1">    </span>AZƏRBAYCANIN BÖYÜK DAŞINMAZ ƏMLAK PLATFORMASI TREVA İLƏ ƏMƏKDAŞLIQ EDİN VƏ İNKİŞAF POTENSİALINIZI TAM AÇIN.
                                    </h2>
                                </div>
                                <div ref={firstChildRef} className="first-child">(xidmətlər)</div>
                            </div>
                            <div className="services_bottom-wrap">
                                <div ref={ctaWrapRef} className="services_cta-wrap">
                                    <div className="note_wrap is-medium-wide">
                                        <div>Satış imkanlarınızı genişləndirmək istəyirsiniz?</div>
                                    </div>
                                    <Link data-wf--button--variant="blue" href="brokers#broker-registration" className="button w-inline-block">
                                        <div className="button-text-wrap">
                                            <div className="button-text">Satış şəbəkəmizə qoşulun</div>
                                            <div className="button-text">Satış şəbəkəmizə qoşulun</div>
                                        </div>
                                    </Link>
                                </div>
                                <div className="services_block">
                                    <div ref={imgWrapRef} className="services_img-wrap img-reveal">
                                        <img
                                            className="services_img _1 active"
                                            src="/cdn-assets/8e8382ba3f-6878d8559bf006e7ed8f4aa8_SALE&MARKETING.avif"
                                            width="313"
                                            alt="A black and white photo of a model of a city."
                                            data-index="1"
                                            sizes="(max-width: 479px) 100vw, 313px"
                                            loading="lazy"
                                            srcSet="/cdn-assets/3338834a9c-6878d8559bf006e7ed8f4aa8_SALE&MARKETING-p-500.avif 500w, /cdn-assets/f45df44ded-6878d8559bf006e7ed8f4aa8_SALE&MARKETING-p-800.avif 800w, /cdn-assets/dccaba2a20-6878d8559bf006e7ed8f4aa8_SALE&MARKETING-p-1080.avif 1080w, /cdn-assets/116aad6b33-6878d8559bf006e7ed8f4aa8_SALE&MARKETING-p-1600.avif 1600w, /cdn-assets/8e8382ba3f-6878d8559bf006e7ed8f4aa8_SALE&MARKETING.avif 3000w"
                                        />
                                        <img
                                            className="services_img _2"
                                            src="/cdn-assets/70296bc49c-6878d855e5db3d2303249ad9_CRM&LEAD-MANAGEMENT.avif"
                                            width="1360"
                                            alt="Two people sitting at a table working on a piece of paper."
                                            data-index="2"
                                            sizes="100vw"
                                            loading="lazy"
                                            srcSet="/cdn-assets/909c949510-6878d855e5db3d2303249ad9_CRM&LEAD-MANAGEMENT-p-500.avif 500w, /cdn-assets/540d828ae8-6878d855e5db3d2303249ad9_CRM&LEAD-MANAGEMENT-p-800.avif 800w, /cdn-assets/40691ede88-6878d855e5db3d2303249ad9_CRM&LEAD-MANAGEMENT-p-1080.avif 1080w, /cdn-assets/70296bc49c-6878d855e5db3d2303249ad9_CRM&LEAD-MANAGEMENT.avif 3000w"
                                        />
                                        <img
                                            className="services_img _3"
                                            src="/cdn-assets/99731f464c-6878d8556de5fcd8ff72dc34_BROKER-NETWORK-ACTIVATION.avif"
                                            width="600"
                                            alt="A couple of people shaking hands over a table."
                                            data-index="3"
                                            sizes="(max-width: 767px) 100vw, 600px"
                                            loading="lazy"
                                            srcSet="/cdn-assets/9db9a9ae65-6878d8556de5fcd8ff72dc34_BROKER-NETWORK-ACTIVATION-p-500.avif 500w, /cdn-assets/b3609042b5-6878d8556de5fcd8ff72dc34_BROKER-NETWORK-ACTIVATION-p-800.avif 800w, /cdn-assets/cb1b8bd6d9-6878d8556de5fcd8ff72dc34_BROKER-NETWORK-ACTIVATION-p-1080.avif 1080w, /cdn-assets/99731f464c-6878d8556de5fcd8ff72dc34_BROKER-NETWORK-ACTIVATION.avif 3000w"
                                        />
                                        <img
                                            className="services_img _4"
                                            src="/cdn-assets/1b70c5fed4-6878d8558e4caaaacfa6814a_INVESTMENT-ADVISORY.avif"
                                            width="313"
                                            alt="A group of people sitting around a table with a tablet."
                                            data-index="4"
                                            sizes="(max-width: 479px) 100vw, 313px"
                                            loading="lazy"
                                            srcSet="/cdn-assets/23072616d7-6878d8558e4caaaacfa6814a_INVESTMENT-ADVISORY-p-500.avif 500w, /cdn-assets/ccd35ab189-6878d8558e4caaaacfa6814a_INVESTMENT-ADVISORY-p-800.avif 800w, /cdn-assets/dcfc9ddc84-6878d8558e4caaaacfa6814a_INVESTMENT-ADVISORY-p-1080.avif 1080w, /cdn-assets/f7cae59c3d-6878d8558e4caaaacfa6814a_INVESTMENT-ADVISORY-p-1600.avif 1600w, /cdn-assets/1b70c5fed4-6878d8558e4caaaacfa6814a_INVESTMENT-ADVISORY.avif 3000w"
                                        />
                                        <div className="img-cover"></div>
                                    </div>
                                    <div ref={listRef} className="services_list">
                                        <Link data-index="1" href="/developers" className="services_item animate-right w-inline-block">
                                            <div className="services_item-title">
                                                <div>(01)</div>
                                                <div className="text-color-blue400">Satış və Marketinq</div>
                                            </div>
                                            <div className="services_icon w-embed">
                                                <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M17.1879 5.5V14.4375C17.1879 14.6198 17.1154 14.7947 16.9865 14.9236C16.8576 15.0526 16.6827 15.125 16.5004 15.125C16.318 15.125 16.1432 15.0526 16.0142 14.9236C15.8853 14.7947 15.8129 14.6198 15.8129 14.4375V7.15945L5.98679 16.9864C5.85779 17.1154 5.68282 17.1879 5.50038 17.1879C5.31794 17.1879 5.14298 17.1154 5.01398 16.9864C4.88497 16.8574 4.8125 16.6824 4.8125 16.5C4.8125 16.3176 4.88497 16.1426 5.01398 16.0136L14.8409 6.1875H7.56288C7.38055 6.1875 7.20568 6.11507 7.07675 5.98614C6.94782 5.8572 6.87538 5.68234 6.87538 5.5C6.87538 5.31766 6.94782 5.1428 7.07675 5.01386C7.20568 4.88493 7.38055 4.8125 7.56288 4.8125H16.5004C16.6827 4.8125 16.8576 4.88493 16.9865 5.01386C17.1154 5.1428 17.1879 5.31766 17.1879 5.5Z" fill="#4C525E" />
                                                </svg>
                                            </div>
                                        </Link>
                                        <Link data-index="2" href="/developers" className="services_item animate-right w-inline-block">
                                            <div className="services_item-title">
                                                <div>(02)</div>
                                                <div className="text-color-blue400">CRM və Leadlərin İdarəolunması</div>
                                            </div>
                                            <div className="services_icon w-embed">
                                                <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M17.1879 5.5V14.4375C17.1879 14.6198 17.1154 14.7947 16.9865 14.9236C16.8576 15.0526 16.6827 15.125 16.5004 15.125C16.318 15.125 16.1432 15.0526 16.0142 14.9236C15.8853 14.7947 15.8129 14.6198 15.8129 14.4375V7.15945L5.98679 16.9864C5.85779 17.1154 5.68282 17.1879 5.50038 17.1879C5.31794 17.1879 5.14298 17.1154 5.01398 16.9864C4.88497 16.8574 4.8125 16.6824 4.8125 16.5C4.8125 16.3176 4.88497 16.1426 5.01398 16.0136L14.8409 6.1875H7.56288C7.38055 6.1875 7.20568 6.11507 7.07675 5.98614C6.94782 5.8572 6.87538 5.68234 6.87538 5.5C6.87538 5.31766 6.94782 5.1428 7.07675 5.01386C7.20568 4.88493 7.38055 4.8125 7.56288 4.8125H16.5004C16.6827 4.8125 16.8576 4.88493 16.9865 5.01386C17.1154 5.1428 17.1879 5.31766 17.1879 5.5Z" fill="#4C525E" />
                                                </svg>
                                            </div>
                                        </Link>
                                        <Link data-index="3" href="/developers" className="services_item animate-right w-inline-block">
                                            <div className="services_item-title">
                                                <div>(03)</div>
                                                <div className="text-color-blue400">Broker Şəbəkəsinin Aktivləşdirilməsi</div>
                                            </div>
                                            <div className="services_icon w-embed">
                                                <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M17.1879 5.5V14.4375C17.1879 14.6198 17.1154 14.7947 16.9865 14.9236C16.8576 15.0526 16.6827 15.125 16.5004 15.125C16.318 15.125 16.1432 15.0526 16.0142 14.9236C15.8853 14.7947 15.8129 14.6198 15.8129 14.4375V7.15945L5.98679 16.9864C5.85779 17.1154 5.68282 17.1879 5.50038 17.1879C5.31794 17.1879 5.14298 17.1154 5.01398 16.9864C4.88497 16.8574 4.8125 16.6824 4.8125 16.5C4.8125 16.3176 4.88497 16.1426 5.01398 16.0136L14.8409 6.1875H7.56288C7.38055 6.1875 7.20568 6.11507 7.07675 5.98614C6.94782 5.8572 6.87538 5.68234 6.87538 5.5C6.87538 5.31766 6.94782 5.1428 7.07675 5.01386C7.20568 4.88493 7.38055 4.8125 7.56288 4.8125H16.5004C16.6827 4.8125 16.8576 4.88493 16.9865 5.01386C17.1154 5.1428 17.1879 5.31766 17.1879 5.5Z" fill="#4C525E" />
                                                </svg>
                                            </div>
                                        </Link>
                                        <Link data-index="4" href="/developers" className="services_item animate-right w-inline-block">
                                            <div className="services_item-title">
                                                <div>(04)</div>
                                                <div className="text-color-blue400">İnvestisiya Konsultasiyası</div>
                                            </div>
                                            <div className="services_icon w-embed">
                                                <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M17.1879 5.5V14.4375C17.1879 14.6198 17.1154 14.7947 16.9865 14.9236C16.8576 15.0526 16.6827 15.125 16.5004 15.125C16.318 15.125 16.1432 15.0526 16.0142 14.9236C15.8853 14.7947 15.8129 14.6198 15.8129 14.4375V7.15945L5.98679 16.9864C5.85779 17.1154 5.68282 17.1879 5.50038 17.1879C5.31794 17.1879 5.14298 17.1154 5.01398 16.9864C4.88497 16.8574 4.8125 16.6824 4.8125 16.5C4.8125 16.3176 4.88497 16.1426 5.01398 16.0136L14.8409 6.1875H7.56288C7.38055 6.1875 7.20568 6.11507 7.07675 5.98614C6.94782 5.8572 6.87538 5.68234 6.87538 5.5C6.87538 5.31766 6.94782 5.1428 7.07675 5.01386C7.20568 4.88493 7.38055 4.8125 7.56288 4.8125H16.5004C16.6827 4.8125 16.8576 4.88493 16.9865 5.01386C17.1154 5.1428 17.1879 5.31766 17.1879 5.5Z" fill="#4C525E" />
                                                </svg>
                                            </div>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
