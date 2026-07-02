 'use client'

import { ButtonText } from '@/app/components/ButtonText';

import { useEffect, useRef, useState } from 'react'
import type { MouseEvent } from 'react'
import Script from 'next/script'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import Navbar from '@/app/components/Home/TrevaHero/navbar'
import { HomeFooter } from '@/app/components/Home/HomeFooter'
import CallbackForm from '@/app/components/Home/Callback/CallbackForm'
import PartnershipCTA from '@/app/components/PartnershipCTA'
import './developers.css'

declare global {
  interface Window {
    gsap?: any
    ScrollTrigger?: any
    SplitText?: any
  }
}

type DevelopersPageProps = {
  locale: string
}

type LocalizedValue = string | { az?: string; en?: string; ru?: string }

type ProjectCategory = {
  title: LocalizedValue
  slug: string
  image?: string | null
  brand?: LocalizedValue | null
  order?: number
}

type FeaturedProjectCard = {
  title: LocalizedValue
  slug: string
  image: string
  location: LocalizedValue
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:10021'
const FEATURED_PROJECT_PLACEHOLDER = '/assets/webflow-placeholder.svg'

const featuredProjectFallbackImages: Record<string, string> = {
  'arabian-ranches': '/images/features-pro/arabian-cover.jpg',
  'marina-village': '/images/features-pro/marina-cover.jpg',
  'panorama-by-elie-saab': '/images/features-pro/panorama-cover.png',
  'reportage-heights': '/images/features-pro/reportage-cover.jpg',
  'sabah-residence': '/images/features-pro/sabah-cover.png',
}

const featuredProjectsFallback: FeaturedProjectCard[] = [
  {
    title: 'Arabian Ranches',
    slug: 'arabian-ranches',
    image: 'https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/69e0ca6fb39a1d49bd14574e_arabiann-5.webp',
    location: 'Sea Breeze',
  },
  {
    title: 'Marina Village',
    slug: 'marina-village',
    image: 'https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/6878c0b5046e1d573cd3b04d_700X800_MARI%CC%87NA.avif',
    location: 'Sea Breeze',
  },
  {
    title: 'Villa Siena',
    slug: 'villa-siena',
    image: 'https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/6878c132b243b50c391cf0eb_700X800.avif',
    location: 'Baku',
  },
  {
    title: 'Sabah Residence',
    slug: 'sabah-residence',
    image: 'https://cdn.prod.website-files.com/685e5b3de579c8df7030142b/692d30a5de9b28406e24d70b_sabah4.jpg',
    location: 'Baku',
  },
]

function getLocalizedValue(value: LocalizedValue | undefined | null, locale: string, fallback = ''): string {
  if (!value) return fallback
  if (typeof value === 'string') return value || fallback
  return value[locale as keyof typeof value] || value.az || value.en || value.ru || fallback
}

function toAssetUrl(value?: string | null): string {
  if (!value) return ''
  return value.startsWith('http') ? value : `${API_BASE_URL}${value}`
}

export function DevelopersPage({ locale }: DevelopersPageProps) {
  const gsapReady = useRef(false)
  const dropdownNavRefs = useRef<Array<HTMLDivElement | null>>([])

  const scrollToServices = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault()

    const target = document.getElementById('services')
    if (!target) return

    window.history.replaceState(null, '', '#services')
    target.scrollIntoView({ block: 'start' })
  }

  const scrollToFeaturedProjects = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault()

    const target = document.getElementById('featured-projects')
    if (!target) return

    window.history.replaceState(null, '', '#featured-projects')
    target.scrollIntoView({ block: 'start' })
  }

  const [openDropdown, setOpenDropdown] = useState<number | null>(0)
  const [featuredProjects, setFeaturedProjects] = useState<FeaturedProjectCard[]>([])

  useEffect(() => {
    const fetchFeaturedProjects = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/layihelerimiz/categories/visible`)
        if (!response.ok) throw new Error('Failed to fetch featured projects')

        const rawData = await response.json()
        const list = Array.isArray(rawData) ? rawData : rawData.value || []

        const nextProjects = list
          .sort((a: ProjectCategory, b: ProjectCategory) => (a.order ?? 0) - (b.order ?? 0))
          .slice(0, 4)
          .map((item: ProjectCategory) => ({
            title: item.title,
            slug: item.slug,
            image:
              toAssetUrl(item.image) ||
              featuredProjectFallbackImages[item.slug] ||
              featuredProjectsFallback.find((card) => card.slug === item.slug)?.image ||
              FEATURED_PROJECT_PLACEHOLDER,
            location: item.brand || '',
          }))
          .filter((item: FeaturedProjectCard) => item.slug)

        if (list.length > 0) {
          setFeaturedProjects(nextProjects)
        } else {
          setFeaturedProjects(featuredProjectsFallback)
        }
      } catch {
        setFeaturedProjects(featuredProjectsFallback)
      }
    }

    fetchFeaturedProjects()
  }, [])

  const toggleDropdown = (index: number) => {
    setOpenDropdown(openDropdown === index ? null : index)
  }

  useEffect(() => {
    dropdownNavRefs.current.forEach((el, idx) => {
      if (!el) return

      const isOpen = openDropdown === idx

      if (isOpen) {
        el.style.height = '0px'
        requestAnimationFrame(() => {
          const target = el.scrollHeight
          el.style.height = `${target}px`
        })
      } else {
        const current = el.scrollHeight
        el.style.height = `${current}px`
        requestAnimationFrame(() => {
          el.style.height = '0px'
        })
      }
    })
  }, [openDropdown])

  const initGSAP = () => {
    if (gsapReady.current) return
    if (typeof window === 'undefined') return
    if (!window.gsap || !window.ScrollTrigger) return
    gsapReady.current = true

    const { gsap, ScrollTrigger, SplitText } = window

    if (ScrollTrigger) gsap.registerPlugin(ScrollTrigger)
    if (SplitText)     gsap.registerPlugin(SplitText)

    gsap.to('body', { autoAlpha: 1, duration: 0.3 })

    const isMobile  = window.matchMedia('(max-width: 768px)').matches

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
        yPercent: -110,
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
      <div className="page-wrapper">
          <Navbar locale={locale} variant="solid" />
          
          <main className="main-wrapper">
            <section className="section_header-services">
              <div className="global-padding padding-section-medium">
                <div className="container-large">
                  <div className="header-services_component">
                    <div className="header-services_wrap is-services">
                      <div className="header-services_title">
                        <p>(xidmətlərimiz)</p>
                        <div className="developers-header-title">
                          <h1 className="developers-header-h1 no-animate">
                            Əmlak Satışlarını Gücləndiririk — Strategiyadan işin icrasına qədər
                          </h1>
                        </div>
                      </div>
                      <div className="header-services_bottom is-services">
                        <div className="header-services_video-wrap img-reveal">
                          <div className="header-services_img-wrap">
                            <div className="header_bg-video w-embed">
                              <video id="myVideo" width="100%" height="100%" style={{ objectFit: 'cover', width: '100%', height: '100%', display: 'block' }} src="https://cdn.prod.website-files.com/6825d64025f8005ef1ddfc4c%2F68ca8e5a67ef60d728ebc041_video-transcode.mp4" autoPlay muted playsInline loop preload="auto"></video>
                            </div>
                          </div>
                          <div className="header-services_video-overlay"></div>
                          <div className="img-cover"></div>
                        </div>
                        <div className="header-services_content-wrap is-services">
                          <p>TREVA DEVELOPERLƏRƏ ƏMLAK LAYİHƏLƏRİNİ BAZARA ÇIXARMAQDA STRATEJİ SATIŞ VƏ MARKETİNQ DƏSTƏYİ GÖSTƏRİR. BAZARA ÇIXIŞ PLANLAMASINDAN MÜRACİƏTLƏRİN İDARƏETMƏSİNƏ QƏDƏR SATIŞLARI ARTIRMAQ VƏ LAYİHƏNİN UĞURUNU YÜKSƏLTMƏK ÜÇÜN HƏRTƏRƏFLİ HƏLLƏR TƏQDİM EDİRİK.</p>
                          <div className="button-group animate-up">
                            <Link href="#services" onClick={scrollToServices} className="button w-inline-block" data-wf--button--variant="blue">
                              <ButtonText>Xidmətlərlə tanış olun</ButtonText>
                            </Link>
                            <Link href="#featured-projects" onClick={scrollToFeaturedProjects} className="button w-variant-bc0192ac-8f77-bda0-587a-2ac5ad6e5e49 w-inline-block" data-wf--button--variant="ghost">
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
                            <Plus size={36} strokeWidth={1.5} aria-hidden="true" />
                          </div>
                        </div>
                        <div className="features_dropdown-nav" ref={(el) => { dropdownNavRefs.current[0] = el }}>
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
                            <Plus size={36} strokeWidth={1.5} aria-hidden="true" />
                          </div>
                        </div>
                        <div className="features_dropdown-nav" ref={(el) => { dropdownNavRefs.current[1] = el }}>
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
                            <Plus size={36} strokeWidth={1.5} aria-hidden="true" />
                          </div>
                        </div>
                        <div className="features_dropdown-nav" ref={(el) => { dropdownNavRefs.current[2] = el }}>
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
                            <Plus size={36} strokeWidth={1.5} aria-hidden="true" />
                          </div>
                        </div>
                        <div className="features_dropdown-nav" ref={(el) => { dropdownNavRefs.current[3] = el }}>
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
                                <img src="https://cdn.prod.website-files.com/6825d64025f8005ef1ddfc4c/6878cb7f612a5ffa7693ec49_FULL-marketIng.avif" loading="eager" sizes="(max-width: 1500px) 100vw, 1500px" srcSet="https://cdn.prod.website-files.com/6825d64025f8005ef1ddfc4c/6878cb7f612a5ffa7693ec49_FULL-marketIng-p-500.avif 500w, https://cdn.prod.website-files.com/6825d64025f8005ef1ddfc4c/6878cb7f612a5ffa7693ec49_FULL-marketIng-p-800.avif 800w, https://cdn.prod.website-files.com/6825d64025f8005ef1ddfc4c/6878cb7f612a5ffa7693ec49_FULL-marketIng.avif 1500w" alt="A group of people sitting at desks working on computers." className="fullwidth-img"/>
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
                            <Plus size={36} strokeWidth={1.5} aria-hidden="true" />
                          </div>
                        </div>
                        <div className="features_dropdown-nav" ref={(el) => { dropdownNavRefs.current[4] = el }}>
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
                                <img src="https://cdn.prod.website-files.com/6825d64025f8005ef1ddfc4c/688362eb9e4fdee54a214bfe_developers-pageBrokers-actIvatIon.avif" loading="eager" sizes="(max-width: 1500px) 100vw, 1500px" srcSet="https://cdn.prod.website-files.com/6825d64025f8005ef1ddfc4c/688362eb9e4fdee54a214bfe_developers-pageBrokers-actIvatIon-p-500.avif 500w, https://cdn.prod.website-files.com/6825d64025f8005ef1ddfc4c/688362eb9e4fdee54a214bfe_developers-pageBrokers-actIvatIon-p-800.avif 800w, https://cdn.prod.website-files.com/6825d64025f8005ef1ddfc4c/688362eb9e4fdee54a214bfe_developers-pageBrokers-actIvatIon.avif 1500w" alt="A group of people sitting around a wooden table." className="fullwidth-img"/>
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
                            <Plus size={36} strokeWidth={1.5} aria-hidden="true" />
                          </div>
                        </div>
                        <div className="features_dropdown-nav" ref={(el) => { dropdownNavRefs.current[5] = el }}>
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

            <section id="featured-projects" className="section_projects-prev is-services">
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
                        {featuredProjects.map((project, index) => {
                          const title = getLocalizedValue(project.title, locale)
                          const location = getLocalizedValue(project.location, locale)
                          const href = `/${locale}/projects/${project.slug}`

                          return (
                            <div
                              key={project.slug}
                              role="listitem"
                              className={`projects-prev_item img-reveal w-dyn-item${index === featuredProjects.length - 1 ? ' is-large' : ''}`}
                            >
                              <div className="projects-prev_holder">
                                <div className="projects-prev_img-wrap">
                                  <img src={project.image} loading="lazy" alt={title} className="fullwidth-img ease0-6" />
                                </div>
                                <Link aria-label={`go to ${title} project`} href={href} className="projects_overlay w-inline-block">
                                  <div className="projects_btn">
                                    <div className="icon-large w-embed">
                                      <svg width="21" height="21" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M17.6557 10.4994C17.6557 10.6575 17.5929 10.8092 17.4811 10.921C17.3692 11.0328 17.2176 11.0957 17.0594 11.0957H11.0964V17.0587C11.0964 17.2168 11.0336 17.3685 10.9217 17.4803C10.8099 17.5922 10.6582 17.655 10.5001 17.655C10.3419 17.655 10.1903 17.5922 10.0784 17.4803C9.96662 17.3685 9.90379 17.2168 9.90379 17.0587V11.0957H3.94078C3.78263 11.0957 3.63096 11.0328 3.51914 10.921C3.40731 10.8092 3.34448 10.6575 3.34448 10.4994C3.34448 10.3412 3.40731 10.1895 3.51914 10.0777C3.63096 9.96589 3.78263 9.90306 3.94078 9.90306H9.90379V3.94005C9.90379 3.7819 9.96662 3.63023 10.0784 3.5184C10.1903 3.40657 10.3419 3.34375 10.5001 3.34375C10.6582 3.34375 10.8099 3.40657 10.9217 3.5184C11.0336 3.63023 11.0964 3.7819 11.0964 3.94005V9.90306H17.0594C17.2176 9.90306 17.3692 9.96589 17.4811 10.0777C17.5929 10.1895 17.6557 10.3412 17.6557 10.4994Z" fill="white"/>
                                      </svg>
                                    </div>
                                  </div>
                                  <div className="projects_caption">{title}</div>
                                </Link>
                                <div className="img-cover bg-color-grey200"></div>
                              </div>
                              <Link aria-label={`go to ${title} project`} href={href} className="projects_content-wrap show-landscape w-inline-block">
                                <div className="heading-style-h3 text-color-blue400">{title}</div>
                                <div fs-list-field="location">{location}</div>
                                <div fs-list-field="status" className="hide"></div>
                              </Link>
                            </div>
                          )
                        })}
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

            <PartnershipCTA
              sectionDataWId="53797656-c2da-3541-a7b7-695898a96114"
              primaryAction={{ href: `/${locale}/contact#get-in-touch`, label: 'Əlaqə saxlayın' }}
              secondaryAction={{ href: `/${locale}/brokers#broker-registration`, label: 'Şəbəkəmizə qoşulun' }}
            />
          </main>

          <CallbackForm allowedRoles={['Developer']} />
          <HomeFooter locale={locale} />
      </div>
    </>
  )
}
