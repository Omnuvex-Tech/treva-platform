 'use client'

import { ButtonText } from '@/app/components/ButtonText';

import { useEffect, useRef, useState } from 'react'
import Script from 'next/script'
import Link from 'next/link'
import Navbar from '@/app/components/Navbar/navbar'
import { HomeFooter } from '@/app/components/Home/HomeFooter'
import './developers.css'

declare global {
  interface Window {
    gsap?: any
    ScrollTrigger?: any
    ScrollSmoother?: any
    SplitText?: any
  }
}

type DevelopersPageProps = {
  locale: string
}

export function DevelopersPage({ locale }: DevelopersPageProps) {
  const smoothWrapRef = useRef<HTMLDivElement | null>(null)
  const gsapReady = useRef(false)

  const [openDropdown, setOpenDropdown] = useState<number | null>(0)

  const toggleDropdown = (index: number) => {
    setOpenDropdown(openDropdown === index ? null : index)
  }

  const initGSAP = () => {
    if (gsapReady.current) return
    if (typeof window === 'undefined') return
    if (!window.gsap || !window.ScrollTrigger) return
    gsapReady.current = true

    const { gsap, ScrollTrigger, ScrollSmoother, SplitText } = window

    if (ScrollTrigger) gsap.registerPlugin(ScrollTrigger)
    if (SplitText)     gsap.registerPlugin(SplitText)

    gsap.to('body', { autoAlpha: 1, duration: 0.3 })

    const isMobile  = window.matchMedia('(max-width: 768px)').matches
    const noSmooth  = window.location.pathname.includes('/treva-live')

    if (!isMobile && !noSmooth && ScrollSmoother) {
      const smoother = ScrollSmoother.create({
        wrapper:  '#smooth-wrapper',
        content:  '#smooth-content',
        smooth:   1.6,
        effects:  true,
      })
      const hash = window.location.hash
      if (hash) {
        setTimeout(() => {
          const target = document.querySelector(hash)
          if (target) smoother.scrollTo(target, true)
        }, 500)
      }
      document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', () => {
          document.documentElement.classList.add('disable-smooth-scroll')
          setTimeout(() => document.documentElement.classList.remove('disable-smooth-scroll'), 100)
        })
      })
    }

    function getAttr(el: Element, name: string, fallback: number) {
      return el.hasAttribute(name) ? parseFloat(el.getAttribute(name) ?? `${fallback}`) : fallback
    }

    const animTypes = [
      { cls: '.animate-up',    y:  40, x:  0 },
      { cls: '.animate-down',  y: -40, x:  0 },
      { cls: '.animate-right', y:   0, x: -40 },
      { cls: '.animate-fade',  y:   0, x:  0 },
    ]
    animTypes.forEach(({ cls, y, x }) => {
      document.querySelectorAll(cls).forEach(el => {
        const duration = getAttr(el, 'data-gsap-duration', 0.8)
        const delay    = getAttr(el, 'data-gsap-delay', 0.1)
        const props: { opacity: number; duration: number; delay: number; ease: string; y?: number; x?: number } = { opacity: 0, duration, delay, ease: 'power2.out' }
        if (y !== 0) props.y = y
        if (x !== 0) props.x = x

        if (el.classList.contains('animate-instant')) {
          gsap.from(el, props)
        } else {
          gsap.from(el, {
            ...props,
            scrollTrigger: { trigger: el, start: 'top 90%', toggleActions: 'play none none none' },
          })
        }
      })
    })

    if (!isMobile && SplitText) {
      document.querySelectorAll('h1, h2, h3, p').forEach(el => {
        if (el.classList.contains('no-animate')) return
        if (el.closest('.w-richtext')) return

        const split = new SplitText(el, { type: 'lines', lineClass: 'line-wrap' })
        split.lines.forEach((line: HTMLElement) => {
          const wrapper = document.createElement('div')
          wrapper.classList.add('line-mask')
          if (!line.parentNode) return
          line.parentNode.insertBefore(wrapper, line)
          wrapper.appendChild(line)
        })
        gsap.from(split.lines, {
          scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none none' },
          yPercent: 100,
          duration:  getAttr(el, 'data-gsap-duration', 0.8),
          delay:     getAttr(el, 'data-gsap-delay', 0.1),
          ease:      'power3.out',
          stagger:   0.08,
        })
      })
    }

    document.querySelectorAll('.img-reveal').forEach(wrapper => {
      const cover = wrapper.querySelector('.img-cover')
      if (!cover) return
      gsap.set(cover, { opacity: 1, yPercent: 0 })
      gsap.timeline({
        scrollTrigger: { trigger: wrapper, start: 'top 95%', toggleActions: 'play none none none' },
      }).to(cover, {
        yPercent: -100,
        duration: getAttr(wrapper, 'data-gsap-duration', 1),
        delay:    getAttr(wrapper, 'data-gsap-delay', 0.1),
        ease:     'power2.out',
      })
    })

    document.querySelectorAll(".parallax-reveal").forEach((el) => {
      gsap.from(el, {
          scrollTrigger: {
              trigger: el,
              start: "top bottom",
              end: "bottom top",
              scrub: true
          },
          y: 50,
          ease: "none"
      });
    });

    if (window.innerWidth <= 991) {
      gsap.utils.toArray(".projects_overlay").forEach((el: any) => {
        gsap.to(el, {
          opacity: 1,
          duration: 0.5,
          delay: 0.5,
          ease: "power2.out",
          scrollTrigger: {
            trigger: el,
            start: "top 90%",
            once: true
          }
        });
      });
    }
  }

  useEffect(() => {
    if (window.gsap && window.ScrollTrigger) {
      initGSAP()
    }
    const onLoad = () => initGSAP()
    window.addEventListener('gsap-ready', onLoad)
    return () => window.removeEventListener('gsap-ready', onLoad)
  }, [])

  return (
    <>
      <Script
        src="https://cdn.jsdelivr.net/npm/gsap@3/dist/gsap.min.js"
        strategy="afterInteractive"
        onLoad={() => {
          if (window.gsap && window.ScrollTrigger) {
            window.dispatchEvent(new Event('gsap-ready'))
          }
        }}
      />
      <Script
        src="https://cdn.prod.website-files.com/gsap/3.15.0/SplitText.min.js"
        strategy="afterInteractive"
        onLoad={() => window.dispatchEvent(new Event('gsap-ready'))}
      />
      <Script
        src="https://cdn.jsdelivr.net/npm/gsap@3/dist/ScrollTrigger.min.js"
        strategy="afterInteractive"
        onLoad={() => window.dispatchEvent(new Event('gsap-ready'))}
      />
      <Script
        src="https://cdn.jsdelivr.net/npm/gsap@3/dist/ScrollSmoother.min.js"
        strategy="afterInteractive"
        onLoad={() => {
          setTimeout(initGSAP, 100)
        }}
      />

      <div id="smooth-wrapper" className="smooth-wrapper" ref={smoothWrapRef}>
        <div id="smooth-content" className="page-wrapper">
          <Navbar locale={locale} />
          
          <main className="main-wrapper">
            <section className="section_header-services">
              <div className="global-padding padding-section-medium">
                <div className="container-large">
                  <div className="header-services_component">
                    <div className="header-services_wrap is-services">
                      <div className="header-services_title">
                        <p>(xidmətlərimiz)</p>
                        <div className="max-width-60rem">
                          <h1>
                            <span className="heading-gap-h1"> &nbsp;&nbsp;&nbsp;&nbsp;</span>
                            Əmlak Satışlarını Gücləndiririk — Strategiyadan işin icrasına qədər
                          </h1>
                        </div>
                      </div>
                      <div className="header-services_bottom is-services">
                        <div className="header-services_video-wrap img-reveal">
                          <div className="header-services_img-wrap">
                            <div className="header_bg-video w-embed">
                              <video id="myVideo" width="100%" height="100%" style={{ objectFit: 'cover' }} src="https://cdn.prod.website-files.com/6825d64025f8005ef1ddfc4c%2F68ca8e5a67ef60d728ebc041_video-transcode.mp4" autoPlay muted playsInline loop preload="auto"></video>
                            </div>
                          </div>
                          <div className="header-services_video-overlay"></div>
                          <div className="img-cover"></div>
                        </div>
                        <div className="header-services_content-wrap is-services">
                          <p>TREVA DEVELOPERLƏRƏ ƏMLAK LAYİHƏLƏRİNİ BAZARA ÇIXARMAQDA STRATEJİ SATIŞ VƏ MARKETİNQ DƏSTƏYİ GÖSTƏRİR. BAZARA ÇIXIŞ PLANLAMASINDAN MÜRACİƏTLƏRİN İDARƏETMƏSİNƏ QƏDƏR SATIŞLARI ARTIRMAQ VƏ LAYİHƏNİN UĞURUNU YÜKSƏLTMƏK ÜÇÜN HƏRTƏRƏFLİ HƏLLƏR TƏQDİM EDİRİK.</p>
                          <div className="button-group animate-up">
                            <Link href="#services" className="button w-inline-block" data-wf--button--variant="blue">
                              <ButtonText>Xidmətlərlə tanış olun</ButtonText>
                            </Link>
                            <Link href={`/${locale}/projects`} className="button w-variant-bc0192ac-8f77-bda0-587a-2ac5ad6e5e49 w-inline-block" data-wf--button--variant="ghost">
                              <ButtonText>Layihələrlə tanış olun</ButtonText>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="section_features bg-color-blue100 parallax-reveal">
              <div className="global-padding padding-section-medium">
                <div className="container-large">
                  <div id="services" className="features_component">
                    <div className="features_intro-wrap">
                      <p className="text-color-white60">(TREVA-nın xidmətləri)</p>
                    </div>
                    <div className="features_wrap">
                      
                      <div data-gsap-delay="0.4" className={`features_dropdown animate-right ${openDropdown === 0 ? 'is-open' : ''}`}>
                        <div className="features_toggle" onClick={() => toggleDropdown(0)}>
                          <div className="features_toggle-title">
                            <div className="features_toggle-text">Bazara çıxış planlaması</div>
                            <div className="features_toggle-text is-bottom">Bazara çıxış planlaması</div>
                          </div>
                          <div className="features_plus w-embed">
                            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M27.998 16C27.998 16.2652 27.8927 16.5196 27.7052 16.7071C27.5176 16.8946 27.2633 17 26.998 17H16.998V27C16.998 27.2652 16.8927 27.5196 16.7052 27.7071C16.5176 27.8946 16.2633 28 15.998 28C15.7328 28 15.4785 27.8946 15.2909 27.7071C15.1034 27.5196 14.998 27.2652 14.998 27V17H4.99805C4.73283 17 4.47848 16.8946 4.29094 16.7071C4.1034 16.5196 3.99805 16.2652 3.99805 16C3.99805 15.7348 4.1034 15.4804 4.29094 15.2929C4.47848 15.1054 4.73283 15 4.99805 15H14.998V5C14.998 4.73478 15.1034 4.48043 15.2909 4.29289C15.4785 4.10536 15.7328 4 15.998 4C16.2633 4 16.5176 4.10536 16.7052 4.29289C16.8927 4.48043 16.998 4.73478 16.998 5V15H26.998C27.2633 15 27.5176 15.1054 27.7052 15.2929C27.8927 15.4804 27.998 15.7348 27.998 16Z" fill="white"/>
                            </svg>
                          </div>
                        </div>
                        <div className="features_dropdown-nav" style={{ height: openDropdown === 0 ? 'auto' : '0px' }}>
                          <div className="features_content-holder">
                            <div className="features_number">(01)</div>
                            <div className="features_content-wrap">
                              <div className="features_content">
                                <div>Treva layihənizin satış uğurunu maksimum səviyyəyə çatdırmaq üçün data əsaslı bazara çıxış strategiyaları hazırlayırıq. Yanaşmamıza hədəflənmiş tədqiqat, rəqabət analizi və auditoriyanıza uyğunlaşdırılmış strateji qiymət planları daxildir.</div>
                                <div className="features_list-wrap">
                                  <div>(Nə daxildir)</div>
                                  <div className="features_list">
                                    <div className="features_item">
                                      <div className="text-color-white60">(01)</div><div>Bazar Araşdırması və Təhlili</div>
                                    </div>
                                    <div className="features_item">
                                      <div className="text-color-white60">(02)</div><div>Rəqabətçi Mövqeləndirmə</div>
                                    </div>
                                    <div className="features_item">
                                      <div className="text-color-white60">(03)</div><div>Satış Strategiyasının Hazırlanması</div>
                                    </div>
                                    <div className="features_item is-last">
                                      <div className="text-color-white60">(04)</div><div>Qiymət və Ödəniş Planları</div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="features_img-wrap img-reveal">
                                <img src="https://cdn.prod.website-files.com/6825d64025f8005ef1ddfc4c/6883624137663009b5fd7563_Go-to-market-planning.avif" loading="eager" alt="A wooden table topped with three cubes of different colors." className="fullwidth-img"/>
                                <div className="img-cover bg-color-blue100"></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div data-gsap-delay="0.4" className={`features_dropdown animate-right ${openDropdown === 1 ? 'is-open' : ''}`}>
                        <div className="features_toggle" onClick={() => toggleDropdown(1)}>
                          <div className="features_toggle-title">
                            <div className="features_toggle-text">Satışın İcrası</div>
                            <div className="features_toggle-text is-bottom">Satışın İcrası</div>
                          </div>
                          <div className="features_plus w-embed">
                            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M27.998 16C27.998 16.2652 27.8927 16.5196 27.7052 16.7071C27.5176 16.8946 27.2633 17 26.998 17H16.998V27C16.998 27.2652 16.8927 27.5196 16.7052 27.7071C16.5176 27.8946 16.2633 28 15.998 28C15.7328 28 15.4785 27.8946 15.2909 27.7071C15.1034 27.5196 14.998 27.2652 14.998 27V17H4.99805C4.73283 17 4.47848 16.8946 4.29094 16.7071C4.1034 16.5196 3.99805 16.2652 3.99805 16C3.99805 15.7348 4.1034 15.4804 4.29094 15.2929C4.47848 15.1054 4.73283 15 4.99805 15H14.998V5C14.998 4.73478 15.1034 4.48043 15.2909 4.29289C15.4785 4.10536 15.7328 4 15.998 4C16.2633 4 16.5176 4.10536 16.7052 4.29289C16.8927 4.48043 16.998 4.73478 16.998 5V15H26.998C27.2633 15 27.5176 15.1054 27.7052 15.2929C27.8927 15.4804 27.998 15.7348 27.998 16Z" fill="white"/>
                            </svg>
                          </div>
                        </div>
                        <div className="features_dropdown-nav" style={{ height: openDropdown === 1 ? 'auto' : '0px' }}>
                          <div className="features_content-holder">
                            <div className="features_number">(02)</div>
                            <div className="features_content-wrap">
                              <div className="features_content">
                                <div>Bakıdakı təcrübəli satış komandamız dönüşümləri maksimuma çatdırmaq üçün hədəflənmiş satış kampaniyaları həyata keçirir. Potensial müştərilərin <br/>cəlb olunmasından satışın bağlanmasına qədər satış prosesinin hər mərhələsini dəqiqlik <br/>və məsuliyyətlə idarə edirik.</div>
                                <div className="features_list-wrap">
                                  <div>(Nə daxildir)</div>
                                  <div className="features_list">
                                    <div className="features_item">
                                      <div className="text-color-white60">(01)</div><div>Leadlərin Cəlbi</div>
                                    </div>
                                    <div className="features_item">
                                      <div className="text-color-white60">(02)</div><div>Satış Təlimi və Dəstək</div>
                                    </div>
                                    <div className="features_item">
                                      <div className="text-color-white60">(03)</div><div>Satış Prosesinin Optimizasiyası<br/></div>
                                    </div>
                                    <div className="features_item is-last">
                                      <div className="text-color-white60">(04)</div><div>Hesabat və Analitika</div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="features_img-wrap">
                                <img src="https://cdn.prod.website-files.com/6825d64025f8005ef1ddfc4c/68836422104ac3b4423c628e_Sales-Execution.avif" loading="eager" alt="A group of people standing in front of a large building." className="fullwidth-img"/>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div data-gsap-delay="0.4" className={`features_dropdown animate-right ${openDropdown === 2 ? 'is-open' : ''}`}>
                        <div className="features_toggle" onClick={() => toggleDropdown(2)}>
                          <div className="features_toggle-title">
                            <div className="features_toggle-text">CRM + Lead Axını</div>
                            <div className="features_toggle-text is-bottom">CRM + Lead Axını</div>
                          </div>
                          <div className="features_plus w-embed">
                            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M27.998 16C27.998 16.2652 27.8927 16.5196 27.7052 16.7071C27.5176 16.8946 27.2633 17 26.998 17H16.998V27C16.998 27.2652 16.8927 27.5196 16.7052 27.7071C16.5176 27.8946 16.2633 28 15.998 28C15.7328 28 15.4785 27.8946 15.2909 27.7071C15.1034 27.5196 14.998 27.2652 14.998 27V17H4.99805C4.73283 17 4.47848 16.8946 4.29094 16.7071C4.1034 16.5196 3.99805 16.2652 3.99805 16C3.99805 15.7348 4.1034 15.4804 4.29094 15.2929C4.47848 15.1054 4.73283 15 4.99805 15H14.998V5C14.998 4.73478 15.1034 4.48043 15.2909 4.29289C15.4785 4.10536 15.7328 4 15.998 4C16.2633 4 16.5176 4.10536 16.7052 4.29289C16.8927 4.48043 16.998 4.73478 16.998 5V15H26.998C27.2633 15 27.5176 15.1054 27.7052 15.2929C27.8927 15.4804 27.998 15.7348 27.998 16Z" fill="white"/>
                            </svg>
                          </div>
                        </div>
                        <div className="features_dropdown-nav" style={{ height: openDropdown === 2 ? 'auto' : '0px' }}>
                          <div className="features_content-holder">
                            <div className="features_number">(03)</div>
                            <div className="features_content-wrap">
                              <div className="features_content">
                                <div>Biz qabaqcıl CRM sistemləri ilə leadlərin idarəsini asanlaşdırırıq, hər bir potensial müştərini sorğudan satışa qədər izləyirik. İmkanlardan yararlanın və optimallaşdırılmış CRM həllərimizlə daha çox leadi<br/>müştəriyə çevirin.</div>
                                <div className="features_list-wrap">
                                  <div>(Nə daxildir)</div>
                                  <div className="features_list">
                                    <div className="features_item">
                                      <div className="text-color-white60">(01)</div><div>CRM-in İnteqrasiyası və Quraşdırılması</div>
                                    </div>
                                    <div className="features_item">
                                      <div className="text-color-white60">(02)</div><div>Leadlərin İzlənməsi və İdarə Edilməsi</div>
                                    </div>
                                    <div className="features_item">
                                      <div className="text-color-white60">(03)</div><div>Avtomatlaşdırılmış Xatırlatmalar<br/></div>
                                    </div>
                                    <div className="features_item is-last">
                                      <div className="text-color-white60">(04)</div><div>Performans Təhlili</div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="features_img-wrap">
                                <img src="https://cdn.prod.website-files.com/6825d64025f8005ef1ddfc4c/6883632adc0db4bf68a59dcd_CRM%20Lead%20flow.avif" loading="eager" sizes="(max-width: 1500px) 100vw, 1500px" srcSet="https://cdn.prod.website-files.com/6825d64025f8005ef1ddfc4c/6883632adc0db4bf68a59dcd_CRM%20Lead%20flow-p-500.avif 500w, https://cdn.prod.website-files.com/6825d64025f8005ef1ddfc4c/6883632adc0db4bf68a59dcd_CRM%20Lead%20flow.avif 1500w" alt="A man sitting at a table with a laptop and a glass of beer." className="fullwidth-img"/>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div data-gsap-delay="0.4" className={`features_dropdown animate-right ${openDropdown === 3 ? 'is-open' : ''}`}>
                        <div className="features_toggle" onClick={() => toggleDropdown(3)}>
                          <div className="features_toggle-title">
                            <div className="features_toggle-text">Tam marketinq dəstəyi</div>
                            <div className="features_toggle-text is-bottom">Tam marketinq dəstəyi</div>
                          </div>
                          <div className="features_plus w-embed">
                            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M27.998 16C27.998 16.2652 27.8927 16.5196 27.7052 16.7071C27.5176 16.8946 27.2633 17 26.998 17H16.998V27C16.998 27.2652 16.8927 27.5196 16.7052 27.7071C16.5176 27.8946 16.2633 28 15.998 28C15.7328 28 15.4785 27.8946 15.2909 27.7071C15.1034 27.5196 14.998 27.2652 14.998 27V17H4.99805C4.73283 17 4.47848 16.8946 4.29094 16.7071C4.1034 16.5196 3.99805 16.2652 3.99805 16C3.99805 15.7348 4.1034 15.4804 4.29094 15.2929C4.47848 15.1054 4.73283 15 4.99805 15H14.998V5C14.998 4.73478 15.1034 4.48043 15.2909 4.29289C15.4785 4.10536 15.7328 4 15.998 4C16.2633 4 16.5176 4.10536 16.7052 4.29289C16.8927 4.48043 16.998 4.73478 16.998 5V15H26.998C27.2633 15 27.5176 15.1054 27.7052 15.2929C27.8927 15.4804 27.998 15.7348 27.998 16Z" fill="white"/>
                            </svg>
                          </div>
                        </div>
                        <div className="features_dropdown-nav" style={{ height: openDropdown === 3 ? 'auto' : '0px' }}>
                          <div className="features_content-holder">
                            <div className="features_number">(04)</div>
                            <div className="features_content-wrap">
                              <div className="features_content">
                                <div>Bakı şəhərində aparıcı daşınmaz əmlak platforması – layihələrin tanıtımı, satışların artırılması və alıcı cəlbi üçün tam marketinq strategiyası. Rəqəmsal kampaniyalar, sosial şəbəkələr və ənənəvi media ilə satışlarda yüksək nəticə.</div>
                                <div className="features_list-wrap">
                                  <div>(Nə daxildir)</div>
                                  <div className="features_list">
                                    <div className="features_item">
                                      <div className="text-color-white60">(01)</div><div>Vizual Kontentin Hazırlanması</div>
                                    </div>
                                    <div className="features_item">
                                      <div className="text-color-white60">(02)</div><div>Sosial Media Kampaniyaları</div>
                                    </div>
                                    <div className="features_item">
                                      <div className="text-color-white60">(03)</div><div>Ənənəvi Marketinq<br/></div>
                                    </div>
                                    <div className="features_item is-last">
                                      <div className="text-color-white60">(04)</div><div>Çap və Rəqəmsal Materiallar</div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="features_img-wrap">
                                <img src="https://cdn.prod.website-files.com/6825d64025f8005ef1ddfc4c/6878cb7f612a5ffa7693ec49_FULL-MARKETING.avif" loading="eager" sizes="(max-width: 1500px) 100vw, 1500px" srcSet="https://cdn.prod.website-files.com/6825d64025f8005ef1ddfc4c/6878cb7f612a5ffa7693ec49_FULL-MARKETING-p-500.avif 500w, https://cdn.prod.website-files.com/6825d64025f8005ef1ddfc4c/6878cb7f612a5ffa7693ec49_FULL-MARKETING-p-800.avif 800w, https://cdn.prod.website-files.com/6825d64025f8005ef1ddfc4c/6878cb7f612a5ffa7693ec49_FULL-MARKETING.avif 1500w" alt="A group of people sitting at desks working on computers." className="fullwidth-img"/>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div data-gsap-delay="0.4" className={`features_dropdown animate-right ${openDropdown === 4 ? 'is-open' : ''}`}>
                        <div className="features_toggle" onClick={() => toggleDropdown(4)}>
                          <div className="features_toggle-title">
                            <div className="features_toggle-text">BROKER ŞƏBƏKƏSİNİN AKTİVLƏŞDİRİLMƏSİ</div>
                            <div className="features_toggle-text is-bottom">BROKER ŞƏBƏKƏSİNİN AKTİVLƏŞDİRİLMƏSİ</div>
                          </div>
                          <div className="features_plus w-embed">
                            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M27.998 16C27.998 16.2652 27.8927 16.5196 27.7052 16.7071C27.5176 16.8946 27.2633 17 26.998 17H16.998V27C16.998 27.2652 16.8927 27.5196 16.7052 27.7071C16.5176 27.8946 16.2633 28 15.998 28C15.7328 28 15.4785 27.8946 15.2909 27.7071C15.1034 27.5196 14.998 27.2652 14.998 27V17H4.99805C4.73283 17 4.47848 16.8946 4.29094 16.7071C4.1034 16.5196 3.99805 16.2652 3.99805 16C3.99805 15.7348 4.1034 15.4804 4.29094 15.2929C4.47848 15.1054 4.73283 15 4.99805 15H14.998V5C14.998 4.73478 15.1034 4.48043 15.2909 4.29289C15.4785 4.10536 15.7328 4 15.998 4C16.2633 4 16.5176 4.10536 16.7052 4.29289C16.8927 4.48043 16.998 4.73478 16.998 5V15H26.998C27.2633 15 27.5176 15.1054 27.7052 15.2929C27.8927 15.4804 27.998 15.7348 27.998 16Z" fill="white"/>
                            </svg>
                          </div>
                        </div>
                        <div className="features_dropdown-nav" style={{ height: openDropdown === 4 ? 'auto' : '0px' }}>
                          <div className="features_content-holder">
                            <div className="features_number">(05)</div>
                            <div className="features_content-wrap">
                              <div className="features_content">
                                <div>Biz etibarlı brokerlər şəbəkəmizi aktivləşdirərək layihənizi effektiv şəkildə bazara çıxarır və satışları daha sürətli həyata keçiririk. Broker aktivləşdirmə proqramlarımız məqsədli dəstək və fərdiləşdirilmiş satış vasitələri təqdim edir.</div>
                                <div className="features_list-wrap">
                                  <div>(Nə daxildir)</div>
                                  <div className="features_list">
                                    <div className="features_item">
                                      <div className="text-color-white60">(01)</div><div>Brokerlərlə əlaqə qurma və onlarla əməkdaşlığa başlama</div>
                                    </div>
                                    <div className="features_item">
                                      <div className="text-color-white60">(02)</div><div>Brokerlər üçün satış materialları</div>
                                    </div>
                                    <div className="features_item">
                                      <div className="text-color-white60">(03)</div><div>Təlim və satış dəstəyi<br/></div>
                                    </div>
                                    <div className="features_item is-last">
                                      <div className="text-color-white60">(04)</div><div>Komissiya Strukturları</div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="features_img-wrap">
                                <img src="https://cdn.prod.website-files.com/6825d64025f8005ef1ddfc4c/688362eb9e4fdee54a214bfe_developers-pageBrokers-activation.avif" loading="eager" sizes="(max-width: 1500px) 100vw, 1500px" srcSet="https://cdn.prod.website-files.com/6825d64025f8005ef1ddfc4c/688362eb9e4fdee54a214bfe_developers-pageBrokers-activation-p-500.avif 500w, https://cdn.prod.website-files.com/6825d64025f8005ef1ddfc4c/688362eb9e4fdee54a214bfe_developers-pageBrokers-activation-p-800.avif 800w, https://cdn.prod.website-files.com/6825d64025f8005ef1ddfc4c/688362eb9e4fdee54a214bfe_developers-pageBrokers-activation.avif 1500w" alt="A group of people sitting around a wooden table." className="fullwidth-img"/>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div data-gsap-delay="0.4" className={`features_dropdown animate-right ${openDropdown === 5 ? 'is-open' : ''}`}>
                        <div className="features_toggle" onClick={() => toggleDropdown(5)}>
                          <div className="features_toggle-title">
                            <div className="features_toggle-text">İnvestisiya Konsultasiyası</div>
                            <div className="features_toggle-text is-bottom">İnvestisiya Konsultasiyası</div>
                          </div>
                          <div className="features_plus w-embed">
                            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M27.998 16C27.998 16.2652 27.8927 16.5196 27.7052 16.7071C27.5176 16.8946 27.2633 17 26.998 17H16.998V27C16.998 27.2652 16.8927 27.5196 16.7052 27.7071C16.5176 27.8946 16.2633 28 15.998 28C15.7328 28 15.4785 27.8946 15.2909 27.7071C15.1034 27.5196 14.998 27.2652 14.998 27V17H4.99805C4.73283 17 4.47848 16.8946 4.29094 16.7071C4.1034 16.5196 3.99805 16.2652 3.99805 16C3.99805 15.7348 4.1034 15.4804 4.29094 15.2929C4.47848 15.1054 4.73283 15 4.99805 15H14.998V5C14.998 4.73478 15.1034 4.48043 15.2909 4.29289C15.4785 4.10536 15.7328 4 15.998 4C16.2633 4 16.5176 4.10536 16.7052 4.29289C16.8927 4.48043 16.998 4.73478 16.998 5V15H26.998C27.2633 15 27.5176 15.1054 27.7052 15.2929C27.8927 15.4804 27.998 15.7348 27.998 16Z" fill="white"/>
                            </svg>
                          </div>
                        </div>
                        <div className="features_dropdown-nav" style={{ height: openDropdown === 5 ? 'auto' : '0px' }}>
                          <div className="features_content-holder is-last">
                            <div className="features_number">(06)</div>
                            <div className="features_content-wrap">
                              <div className="features_content">
                                <div>Biz developerləri potensial investorlarla bir araya gətirir və layihələrin mənfəətliliyini artırmaq üçün strateji tövsiyələr təqdim edirik — bunu hərtərəfli investisiya konsultasiyası xidmətimiz çərçivəsində edirik.</div>
                                <div className="features_list-wrap">
                                  <div>(Nə daxildir)</div>
                                  <div className="features_list">
                                    <div className="features_item">
                                      <div className="text-color-white60">(01)</div><div>İnvestorlarla Əlaqə Qurulması</div>
                                    </div>
                                    <div className="features_item">
                                      <div className="text-color-white60">(02)</div><div>İnvestisiya Gəliri (ROI) Təhlili</div>
                                    </div>
                                    <div className="features_item">
                                      <div className="text-color-white60">(03)</div><div>Maliyyələşdirmə Konsultasiyası<br/></div>
                                    </div>
                                    <div className="features_item is-last">
                                      <div className="text-color-white60">(04)</div><div>İnvestisiya Təqdimatları və Təklifləri</div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="features_img-wrap">
                                <img src="https://cdn.prod.website-files.com/6825d64025f8005ef1ddfc4c/6883629ea8e9bdc78d7894bf_investttttt.avif" loading="eager" alt="invest" height="Auto" className="fullwidth-img"/>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="section_projects-prev is-services">
              <div className="global-padding padding-section-medium">
                <div className="container-large">
                  <div className="projects-prev_component">
                    <div className="projects-prev_intro-wrap">
                      <p>(portfolio)</p>
                      <div className="max-width-56rem">
                        <h2>Seçilmiş layihələr</h2>
                      </div>
                    </div>
                    <div className="w-dyn-list">
                      <div role="list" className="projects-prev_wrap w-dyn-items">
                        
                        <div role="listitem" className="projects-prev_item img-reveal w-dyn-item">
                          <div className="projects-prev_holder">
                            <div className="projects-prev_img-wrap">
                              <img src="https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/69e0ca6fb39a1d49bd14574e_arabiann-5.webp" loading="lazy" alt="Arabian Ranches" sizes="100vw" srcSet="https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/69e0ca6fb39a1d49bd14574e_arabiann-5-p-500.webp 500w, https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/69e0ca6fb39a1d49bd14574e_arabiann-5-p-800.webp 800w, https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/69e0ca6fb39a1d49bd14574e_arabiann-5-p-1080.webp 1080w, https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/69e0ca6fb39a1d49bd14574e_arabiann-5-p-1600.webp 1600w, https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/69e0ca6fb39a1d49bd14574e_arabiann-5-p-2000.webp 2000w, https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/69e0ca6fb39a1d49bd14574e_arabiann-5.webp 2602w" className="fullwidth-img ease0-6"/>
                            </div>
                            <Link aria-label="go to project" href={`/${locale}/projects`} className="projects_overlay w-inline-block">
                              <div className="projects_btn">
                                <div className="icon-large w-embed">
                                  <svg width="21" height="21" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M17.6557 10.4994C17.6557 10.6575 17.5929 10.8092 17.4811 10.921C17.3692 11.0328 17.2176 11.0957 17.0594 11.0957H11.0964V17.0587C11.0964 17.2168 11.0336 17.3685 10.9217 17.4803C10.8099 17.5922 10.6582 17.655 10.5001 17.655C10.3419 17.655 10.1903 17.5922 10.0784 17.4803C9.96662 17.3685 9.90379 17.2168 9.90379 17.0587V11.0957H3.94078C3.78263 11.0957 3.63096 11.0328 3.51914 10.921C3.40731 10.8092 3.34448 10.6575 3.34448 10.4994C3.34448 10.3412 3.40731 10.1895 3.51914 10.0777C3.63096 9.96589 3.78263 9.90306 3.94078 9.90306H9.90379V3.94005C9.90379 3.7819 9.96662 3.63023 10.0784 3.5184C10.1903 3.40657 10.3419 3.34375 10.5001 3.34375C10.6582 3.34375 10.8099 3.40657 10.9217 3.5184C11.0336 3.63023 11.0964 3.7819 11.0964 3.94005V9.90306H17.0594C17.2176 9.90306 17.3692 9.96589 17.4811 10.0777C17.5929 10.1895 17.6557 10.3412 17.6557 10.4994Z" fill="white"/>
                                  </svg>
                                </div>
                              </div>
                              <div className="projects_caption">Arabian Ranches</div>
                            </Link>
                            <div className="img-cover bg-color-grey200"></div>
                          </div>
                          <Link aria-label="go to project" href={`/${locale}/projects`} className="projects_content-wrap show-landscape w-inline-block">
                            <div className="heading-style-h3 text-color-blue400">Arabian Ranches</div>
                            <div fs-list-field="location">Sea Breeze</div>
                            <div fs-list-field="status" className="hide">Under Development</div>
                          </Link>
                        </div>

                        <div role="listitem" className="projects-prev_item img-reveal w-dyn-item">
                          <div className="projects-prev_holder">
                            <div className="projects-prev_img-wrap">
                              <img src="https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/6878c0b5046e1d573cd3b04d_700X800_MARI%CC%87NA.avif" loading="lazy" alt="Marina Village" sizes="100vw" srcSet="https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/6878c0b5046e1d573cd3b04d_700X800_MARI%CC%87NA-p-500.avif 500w, https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/6878c0b5046e1d573cd3b04d_700X800_MARI%CC%87NA.avif 700w" className="fullwidth-img ease0-6"/>
                            </div>
                            <Link aria-label="go to project" href={`/${locale}/projects`} className="projects_overlay w-inline-block">
                              <div className="projects_btn">
                                <div className="icon-large w-embed">
                                  <svg width="21" height="21" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M17.6557 10.4994C17.6557 10.6575 17.5929 10.8092 17.4811 10.921C17.3692 11.0328 17.2176 11.0957 17.0594 11.0957H11.0964V17.0587C11.0964 17.2168 11.0336 17.3685 10.9217 17.4803C10.8099 17.5922 10.6582 17.655 10.5001 17.655C10.3419 17.655 10.1903 17.5922 10.0784 17.4803C9.96662 17.3685 9.90379 17.2168 9.90379 17.0587V11.0957H3.94078C3.78263 11.0957 3.63096 11.0328 3.51914 10.921C3.40731 10.8092 3.34448 10.6575 3.34448 10.4994C3.34448 10.3412 3.40731 10.1895 3.51914 10.0777C3.63096 9.96589 3.78263 9.90306 3.94078 9.90306H9.90379V3.94005C9.90379 3.7819 9.96662 3.63023 10.0784 3.5184C10.1903 3.40657 10.3419 3.34375 10.5001 3.34375C10.6582 3.34375 10.8099 3.40657 10.9217 3.5184C11.0336 3.63023 11.0964 3.7819 11.0964 3.94005V9.90306H17.0594C17.2176 9.90306 17.3692 9.96589 17.4811 10.0777C17.5929 10.1895 17.6557 10.3412 17.6557 10.4994Z" fill="white"/>
                                  </svg>
                                </div>
                              </div>
                              <div className="projects_caption">Marina Village</div>
                            </Link>
                            <div className="img-cover bg-color-grey200"></div>
                          </div>
                          <Link aria-label="go to project" href={`/${locale}/projects`} className="projects_content-wrap show-landscape w-inline-block">
                            <div className="heading-style-h3 text-color-blue400">Marina Village</div>
                            <div fs-list-field="location">Sea Breeze</div>
                            <div fs-list-field="status" className="hide">Under Development</div>
                          </Link>
                        </div>

                        <div role="listitem" className="projects-prev_item img-reveal w-dyn-item">
                          <div className="projects-prev_holder">
                            <div className="projects-prev_img-wrap">
                              <img src="https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/6878c132b243b50c391cf0eb_700X800.avif" loading="lazy" alt="Villa Siena" sizes="100vw" srcSet="https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/6878c132b243b50c391cf0eb_700X800-p-500.avif 500w, https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/6878c132b243b50c391cf0eb_700X800.avif 700w" className="fullwidth-img ease0-6"/>
                            </div>
                            <Link aria-label="go to project" href={`/${locale}/projects`} className="projects_overlay w-inline-block">
                              <div className="projects_btn">
                                <div className="icon-large w-embed">
                                  <svg width="21" height="21" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M17.6557 10.4994C17.6557 10.6575 17.5929 10.8092 17.4811 10.921C17.3692 11.0328 17.2176 11.0957 17.0594 11.0957H11.0964V17.0587C11.0964 17.2168 11.0336 17.3685 10.9217 17.4803C10.8099 17.5922 10.6582 17.655 10.5001 17.655C10.3419 17.655 10.1903 17.5922 10.0784 17.4803C9.96662 17.3685 9.90379 17.2168 9.90379 17.0587V11.0957H3.94078C3.78263 11.0957 3.63096 11.0328 3.51914 10.921C3.40731 10.8092 3.34448 10.6575 3.34448 10.4994C3.34448 10.3412 3.40731 10.1895 3.51914 10.0777C3.63096 9.96589 3.78263 9.90306 3.94078 9.90306H9.90379V3.94005C9.90379 3.7819 9.96662 3.63023 10.0784 3.5184C10.1903 3.40657 10.3419 3.34375 10.5001 3.34375C10.6582 3.34375 10.8099 3.40657 10.9217 3.5184C11.0336 3.63023 11.0964 3.7819 11.0964 3.94005V9.90306H17.0594C17.2176 9.90306 17.3692 9.96589 17.4811 10.0777C17.5929 10.1895 17.6557 10.3412 17.6557 10.4994Z" fill="white"/>
                                  </svg>
                                </div>
                              </div>
                              <div className="projects_caption">Villa Siena</div>
                            </Link>
                            <div className="img-cover bg-color-grey200"></div>
                          </div>
                          <Link aria-label="go to project" href={`/${locale}/projects`} className="projects_content-wrap show-landscape w-inline-block">
                            <div className="heading-style-h3 text-color-blue400">Villa Siena</div>
                            <div fs-list-field="location">Baku</div>
                            <div fs-list-field="status" className="hide">Completed</div>
                          </Link>
                        </div>

                        <div role="listitem" className="projects-prev_item img-reveal w-dyn-item is-large">
                          <div className="projects-prev_holder">
                            <div className="projects-prev_img-wrap">
                              <img src="https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/692d30a5de9b28406e24d70b_sabah4.jpg" loading="lazy" alt="Sabah Residence" className="fullwidth-img ease0-6"/>
                            </div>
                            <Link aria-label="go to project" href={`/${locale}/projects`} className="projects_overlay w-inline-block">
                              <div className="projects_btn">
                                <div className="icon-large w-embed">
                                  <svg width="21" height="21" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M17.6557 10.4994C17.6557 10.6575 17.5929 10.8092 17.4811 10.921C17.3692 11.0328 17.2176 11.0957 17.0594 11.0957H11.0964V17.0587C11.0964 17.2168 11.0336 17.3685 10.9217 17.4803C10.8099 17.5922 10.6582 17.655 10.5001 17.655C10.3419 17.655 10.1903 17.5922 10.0784 17.4803C9.96662 17.3685 9.90379 17.2168 9.90379 17.0587V11.0957H3.94078C3.78263 11.0957 3.63096 11.0328 3.51914 10.921C3.40731 10.8092 3.34448 10.6575 3.34448 10.4994C3.34448 10.3412 3.40731 10.1895 3.51914 10.0777C3.63096 9.96589 3.78263 9.90306 3.94078 9.90306H9.90379V3.94005C9.90379 3.7819 9.96662 3.63023 10.0784 3.5184C10.1903 3.40657 10.3419 3.34375 10.5001 3.34375C10.6582 3.34375 10.8099 3.40657 10.9217 3.5184C11.0336 3.63023 11.0964 3.7819 11.0964 3.94005V9.90306H17.0594C17.2176 9.90306 17.3692 9.96589 17.4811 10.0777C17.5929 10.1895 17.6557 10.3412 17.6557 10.4994Z" fill="white"/>
                                  </svg>
                                </div>
                              </div>
                              <div className="projects_caption">Sabah Residence</div>
                            </Link>
                            <div className="img-cover bg-color-grey200"></div>
                          </div>
                          <Link aria-label="go to project" href={`/${locale}/projects`} className="projects_content-wrap show-landscape w-inline-block">
                            <div className="heading-style-h3 text-color-blue400">Sabah Residence</div>
                            <div fs-list-field="location">Baku</div>
                            <div fs-list-field="status" className="hide">Completed</div>
                          </Link>
                        </div>

                      </div>
                    </div>
                    <div className="projects-prev_cta-wrap animate-up">
                      <div className="projects-prev_cta-title">
                        <p>Növbəti investisiya imkanınızı tapmaq üçün layihələrimizlə tanış olun.</p>
                      </div>
                      <Link href={`/${locale}/projects`} className="button w-inline-block" data-wf--button--variant="blue">
                        <ButtonText>Seçilmiş Layihələrlə Tanış Olun</ButtonText>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section data-w-id="53797656-c2da-3541-a7b7-695898a96114" className="section_cta bg-color-white">
              <div className="global-padding padding-section-xlarge">
                <div className="container-large">
                  <div className="cta_component">
                    <div className="cta_wrap">
                      <div className="cta_content">
                        <h2 className="cta_heading">Tərəfdaşlığa <em>hazırsınız?</em></h2>
                        <div className="button-group">
                          <Link href={`/${locale}/contact#get-in-touch`} className="button w-variant-396e566b-0a82-5a60-ac2f-21a23e91a30e w-inline-block" data-wf--button--variant="blue-large">
                            <div className="svg-code">This is some text inside of a div block.</div>
                            <ButtonText className="w-variant-396e566b-0a82-5a60-ac2f-21a23e91a30e">Əlaqə saxlayın</ButtonText>
                          </Link>
                          <Link href={`/${locale}/brokers#broker-registration`} className="button w-variant-6df2cdf2-59f5-a951-7112-29ad9c77d0eb w-inline-block" data-wf--button--variant="ghost-large">
                            <div className="svg-code">This is some text inside of a div block.</div>
                            <ButtonText className="w-variant-6df2cdf2-59f5-a951-7112-29ad9c77d0eb">Şəbəkəmizə qoşulun</ButtonText>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="cta_bg-wrap">
                <div className="cta_bg-top is-consultation">
                  <div className="cta_img-wrap is-top-left is-az">
                    <img width="Auto" loading="lazy" alt="A large white building with palm trees in front of it - arabian ranches" src="https://cdn.prod.website-files.com/6825d64025f8005ef1ddfc4c/6877795ce390ea79b5c67e2e_1014X598.avif" className="fullwidth-img"/>
                  </div>
                  <div className="cta_img-wrap is-top-right is-az">
                    <img width="Auto" sizes="100vw" alt="A building with a fountain in front of it - villa siena" src="https://cdn.prod.website-files.com/6825d64025f8005ef1ddfc4c/687789e484afd3d27df4a880_1920X1080.avif" loading="lazy" srcSet="https://cdn.prod.website-files.com/6825d64025f8005ef1ddfc4c/687789e484afd3d27df4a880_1920X1080-p-500.avif 500w, https://cdn.prod.website-files.com/6825d64025f8005ef1ddfc4c/687789e484afd3d27df4a880_1920X1080-p-800.avif 800w, https://cdn.prod.website-files.com/6825d64025f8005ef1ddfc4c/687789e484afd3d27df4a880_1920X1080-p-1080.avif 1080w, https://cdn.prod.website-files.com/6825d64025f8005ef1ddfc4c/687789e484afd3d27df4a880_1920X1080.avif 1920w" className="fullwidth-img"/>
                  </div>
                </div>
                <div className="cta_bg-middle is-consultation">
                  <div className="cta_img-wrap is-middle-right">
                    <img width="Auto" sizes="100vw" alt="A large house with a pool in front of it  - villa siena" src="https://cdn.prod.website-files.com/6825d64025f8005ef1ddfc4c/687789e35e32834841daa30b_1014X598.avif" loading="lazy" srcSet="https://cdn.prod.website-files.com/6825d64025f8005ef1ddfc4c/687789e35e32834841daa30b_1014X598-p-500.avif 500w, https://cdn.prod.website-files.com/6825d64025f8005ef1ddfc4c/687789e35e32834841daa30b_1014X598.avif 1014w" className="fullwidth-img"/>
                  </div>
                </div>
                <div className="cta_bg-bottom is-consultation">
                  <div className="cta_img-wrap is-bottom-left">
                    <img sizes="100vw" srcSet="https://cdn.prod.website-files.com/6825d64025f8005ef1ddfc4c/68778c96c2e171e2e9f756e5_16X9-p-500.avif 500w, https://cdn.prod.website-files.com/6825d64025f8005ef1ddfc4c/68778c96c2e171e2e9f756e5_16X9-p-800.avif 800w, https://cdn.prod.website-files.com/6825d64025f8005ef1ddfc4c/68778c96c2e171e2e9f756e5_16X9.avif 1920w" alt="A plane flying over a building with a curved facade - Sabah Residence" src="https://cdn.prod.website-files.com/6825d64025f8005ef1ddfc4c/68778c96c2e171e2e9f756e5_16X9.avif" loading="lazy" className="fullwidth-img"/>
                  </div>
                  <div className="cta_img-wrap is-bottom-right">
                    <img width="Auto" sizes="100vw" alt="A large building with a boat in front of it - marina village" src="https://cdn.prod.website-files.com/6825d64025f8005ef1ddfc4c/687785016cf80af995692f8b_2X1.avif" loading="lazy" srcSet="https://cdn.prod.website-files.com/6825d64025f8005ef1ddfc4c/687785016cf80af995692f8b_2X1-p-500.avif 500w, https://cdn.prod.website-files.com/6825d64025f8005ef1ddfc4c/687785016cf80af995692f8b_2X1-p-800.avif 800w, https://cdn.prod.website-files.com/6825d64025f8005ef1ddfc4c/687785016cf80af995692f8b_2X1-p-1080.avif 1080w, https://cdn.prod.website-files.com/6825d64025f8005ef1ddfc4c/687785016cf80af995692f8b_2X1-p-1600.avif 1600w, https://cdn.prod.website-files.com/6825d64025f8005ef1ddfc4c/687785016cf80af995692f8b_2X1.avif 2000w" className="fullwidth-img"/>
                  </div>
                </div>
              </div>
            </section>
          </main>

          <HomeFooter locale={locale} />
        </div>
      </div>
    </>
  )
}
