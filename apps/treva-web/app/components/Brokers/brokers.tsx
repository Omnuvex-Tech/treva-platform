import { ButtonText } from '@/app/components/ButtonText';
'use client'

import { useEffect, useRef, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import Script from 'next/script'
import Link from 'next/link'
import Navbar from '@/app/components/Navbar/navbar'
import { HomeFooter } from '@/app/components/Home/HomeFooter'
import './brokers.css'

declare global {
  interface Window {
    gsap?: any
    ScrollTrigger?: any
    ScrollSmoother?: any
    SplitText?: any
  }
}

const CheckCircleSVG = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="#ffffff" viewBox="0 0 256 256">
    <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm45.66,85.66-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35a8,8,0,0,1,11.32,11.32Z"/>
  </svg>
)

type BrokerFields = {
  name: string
  email: string
  phone: string
  city: string
  brokerType: string
  experience: string
  website: string
  message: string
}

type BrokerErrors = Partial<Record<keyof BrokerFields, string>>
type SubmitStatus = 'idle' | 'loading' | 'success' | 'error'

const INITIAL_FIELDS: BrokerFields = {
  name: '',
  email: '',
  phone: '',
  city: '',
  brokerType: '',
  experience: '',
  website: '',
  message: '',
}

type BrokersPageProps = {
  locale: string
}

export function BrokersPage({ locale }: BrokersPageProps) {
  const smoothWrapRef = useRef<HTMLDivElement | null>(null)
  const gsapReady = useRef(false)

  const [fields, setFields] = useState<BrokerFields>(INITIAL_FIELDS)
  const [errors, setErrors] = useState<BrokerErrors>({})
  const [status, setStatus] = useState<SubmitStatus>('idle')

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
  }

  useEffect(() => {
    if (window.gsap && window.ScrollTrigger) {
      initGSAP()
    }
    const onLoad = () => initGSAP()
    window.addEventListener('gsap-ready', onLoad)
    return () => window.removeEventListener('gsap-ready', onLoad)
  }, [])

  const validateURL = (url: string) => {
    if (!url) return true;
    const pattern = /^(https?:\/\/)?(www\.)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/.*)?$/;
    return pattern.test(url.trim());
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFields(f => ({ ...f, [name]: value }))
    if (errors[name as keyof BrokerFields]) {
      setErrors(er => ({ ...er, [name]: '' }))
    }
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    const errs: BrokerErrors = {}
    if (!fields.name.trim()) errs.name = 'Bu sahə mütləq doldurulmalıdır'
    if (!fields.email.trim() || !fields.email.includes('@') || !fields.email.includes('.')) errs.email = 'Etibarlı e-poçt ünvanı daxil edin'
    if (!fields.phone.trim() || fields.phone.replace(/[^\d]/g, '').length < 8) errs.phone = 'Etibarlı telefon nömrəsi daxil edin'
    if (!fields.city.trim()) errs.city = 'Bu sahə mütləq doldurulmalıdır'
    if (!fields.brokerType) errs.brokerType = 'Bu sahə mütləq doldurulmalıdır'
    if (!fields.experience) errs.experience = 'Bu sahə mütləq doldurulmalıdır'
    if (fields.website && !validateURL(fields.website)) errs.website = 'Etibarlı URL daxil edin'

    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }

    setStatus('loading')
    try {
      const data = {
        name: fields.name,
        email: fields.email,
        phone: fields.phone,
        city: fields.city
      }
      
      const res = await fetch('https://nodebitrixproject15.vercel.app/api/webflow-registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      
      const result = await res.json()
      // Webflow bitrix integration often just assumes success if not error thrown
      setStatus('success')
      setFields(INITIAL_FIELDS)
    } catch (err) {
      console.error(err)
      setStatus('error')
      setTimeout(() => setStatus('idle'), 3000)
    }
  }

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
                    <div className="header-services_wrap">
                      <div className="header-services_title">
                        <div className="max-width-60rem">
                          <h1 className="heading-style-h1-small">
                            <span className="heading-gap-h1"> &nbsp;&nbsp;&nbsp;&nbsp;</span>
                            Azərbaycanın Aparıcı Daşınmaz Əmlak Şəbəkəsinə Qoşulun, Brokerlər, Şirkətlər və Beynəlxalq Agentlər dəvət olunur.
                          </h1>
                        </div>
                        <p className="first-child">(broker kimi qoşul)</p>
                      </div>
                      <div className="header-services_bottom">
                        <div className="header-services_content-wrap">
                          <p>SİZ BROKER, DAŞINMAZ ƏMLAK AGENTLİYİ, YA DA BEYNƏLXALQ ŞİRKƏTSİZ? TREVA OLARAQ, BİZ BÜTÜN SAHƏ VƏ ÖLKƏLƏRDƏN OLAN TƏRƏFDAŞLARI MƏMNUNİYYƏTLƏ QƏBUL EDİRİK. SİZƏ DAHA ÇOX KOMİSSİYA QAZANMAQ VƏ AZƏRBAYCANIN DAŞINMAZ ƏMLAK BAZARINDA, HƏMÇİNİN ONDAN KƏNARDA ŞƏBƏKƏNİZİ GENİŞLƏNDİRMƏK ÜÇÜN LAZIM OLAN BÜTÜN ALƏTLƏRİ, ELANLARI VƏ DƏSTƏYİ BİZİM PLATFORMA TƏQDİM EDİR.</p>
                          <a data-wf--button--variant="blue" href="#broker-registration" className="button w-inline-block">
                            <ButtonText>Şəbəkəmizə qoşulun</ButtonText>
                          </a>
                        </div>
                        <div className="header-services_video-wrap img-reveal">
                          <div className="header-services_img-wrap w-embed w-iframe">
                            <div style={{ position: 'relative', paddingTop: '56.25%', height: 0, overflow: 'hidden' }}>
                              <iframe
                                src="https://www.youtube.com/embed/Oiy6qfNeYc8"
                                title="Trident Investment şirkətinin təsisçisi Narullah Sultanov."
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
                              </iframe>
                            </div>
                          </div>
                          <div className="header-services_video-overlay"></div>
                          <div className="img-cover"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="section_partners bg-color-grey200">
              <div className="global-padding padding-section-medium">
                <div className="container-large">
                  <div className="partners_component">
                    <div className="partners_intro-wrap">
                      <div className="max-width-48rem is-large-tablet">
                        <h2><span className="heading-gap-h1">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>Niyə TREVA Real Estate ilə tərəfdaşlıq etməlisiniz</h2>
                      </div>
                      <div className="partners_bio-wrap">
                        <p>AZƏRBAYCANDA YERLƏŞƏN APARICI DAŞINMAZ ƏMLAK ŞİRKƏTİMİZDƏ TƏRƏFDAŞLARIMIZA SATIŞ POTENSİALINI YÜKSƏLTMƏK ÜÇÜN İMKANLAR YARADIRIQ. SİZ YERLİ BROKER, İNKİŞAF EDƏN DAŞINMAZ ƏMLAK ŞİRKƏTİ VƏ YA BEYNƏLXALQ AGENT OLMAĞINIZDAN ASILI OLMAYARAQ, UĞUR QAZANMAĞINIZ ÜÇÜN LAZIM OLAN ALƏTLƏRİ VƏ FÜRSƏTLƏRİ TƏQDİM EDİRİK.</p>
                      </div>
                    </div>
                    <div className="partners_cover-wrap img-reveal">
                      <img src="https://cdn.prod.website-files.com/6825d64025f8005ef1ddfc4c/6891e2f9ecd2afd4b7a6c9ab_team.avif" loading="lazy" alt="Error, please try again after some time." className="fullwidth-img is-20-top"/>
                      <div className="img-cover bg-color-grey200"></div>
                    </div>
                    <div className="partners_benefits-wrap">
                      <p>(TREVA Tərəfdaşı Kimi Nələr Qazanırsınız)</p>
                      <div className="partners_benefits-list">
                        <div className="partners_benefits-item animate-right">
                          <div className="partners_benefits-content">
                            <div className="partners_img-wrap">
                              <img src="https://cdn.prod.website-files.com/6825d64025f8005ef1ddfc4c/6883657a2197715430c59ad8_exclusive-listing-2222.avif" loading="lazy" alt="Two men sitting on couches in a living room." className="fullwidth-img"/>
                            </div>
                            <div className="partners_title">Eksklüziv Elanlar</div>
                          </div>
                          <div className="partners_benefits-caption">
                            <div>Ən yaxşı layihələr ictimaiyyətə təqdim olunmadan əvvəl prioritet giriş əldə edin.</div>
                          </div>
                        </div>
                        <div className="partners_benefits-item animate-right">
                          <div className="partners_benefits-content">
                            <div className="partners_img-wrap">
                              <img src="https://cdn.prod.website-files.com/6825d64025f8005ef1ddfc4c/6878d434984d431f34ac0936_Marketing-Assets.avif" loading="lazy" sizes="100vw" srcSet="https://cdn.prod.website-files.com/6825d64025f8005ef1ddfc4c/6878d434984d431f34ac0936_Marketing-Assets-p-500.avif 500w, https://cdn.prod.website-files.com/6825d64025f8005ef1ddfc4c/6878d434984d431f34ac0936_Marketing-Assets-p-800.avif 800w, https://cdn.prod.website-files.com/6825d64025f8005ef1ddfc4c/6878d434984d431f34ac0936_Marketing-Assets.avif 1920w" alt="A group of people working on computers in an office." className="fullwidth-img"/>
                            </div>
                            <div className="partners_title">Marketinq Materialları</div>
                          </div>
                          <div className="partners_benefits-caption">
                            <div>Alıcıları cəlb etmək üçün peşəkar vizuallar, videolar və rəqəmsal kontent.</div>
                          </div>
                        </div>
                        <div className="partners_benefits-item animate-right">
                          <div className="partners_benefits-content">
                            <div className="partners_img-wrap">
                              <img src="https://cdn.prod.website-files.com/6825d64025f8005ef1ddfc4c/688361a94247e43c5532067b_sales-support.avif" loading="lazy" sizes="100vw" srcSet="https://cdn.prod.website-files.com/6825d64025f8005ef1ddfc4c/688361a94247e43c5532067b_sales-support-p-500.avif 500w, https://cdn.prod.website-files.com/6825d64025f8005ef1ddfc4c/688361a94247e43c5532067b_sales-support.avif 960w" alt="A man and a woman sitting at a table." className="fullwidth-img"/>
                            </div>
                            <div className="partners_title">Satış Dəstəyi</div>
                          </div>
                          <div className="partners_benefits-caption">
                            <div>Müzakirələr, qiymət strategiyaları və müştəri idarəçiliyi üzrə peşəkar dəstək.</div>
                          </div>
                        </div>
                        <div className="partners_benefits-item animate-right">
                          <div className="partners_benefits-content">
                            <div className="partners_img-wrap">
                              <img src="https://cdn.prod.website-files.com/6825d64025f8005ef1ddfc4c/688365b9c2326ad6795278be_network exp.avif" loading="lazy" alt="A group of people sitting around a table with a tablet." className="fullwidth-img"/>
                            </div>
                            <div className="partners_title">Şəbəkənin Genişləndirilməsi</div>
                          </div>
                          <div className="partners_benefits-caption">
                            <div>Problemsiz razılaşma — Trevanın aparıcı broker icması ilə əməkdaşlıq edin və dərhal satışa başlayın.</div>
                          </div>
                        </div>
                        <div id="w-node-_8e2a6c29-d8ff-9bf8-309b-349a6be246c1-af46c2b8" className="partners_benefits-item animate-right">
                          <div className="partners_benefits-content">
                            <div className="partners_img-wrap">
                              <img src="https://cdn.prod.website-files.com/6825d64025f8005ef1ddfc4c/6883660557d5794e07264454_simple contra.avif" loading="lazy" sizes="100vw" height="Auto" alt="A man shaking hands with another man in a suit." srcSet="https://cdn.prod.website-files.com/6825d64025f8005ef1ddfc4c/6883660557d5794e07264454_simple%20contra-p-500.avif 500w, https://cdn.prod.website-files.com/6825d64025f8005ef1ddfc4c/6883660557d5794e07264454_simple%20contra.avif 1013w" className="fullwidth-img"/>
                            </div>
                            <div className="partners_title">Sadə Müqavilə Prosesi</div>
                          </div>
                          <div className="partners_benefits-caption">
                            <div>Müqavilə prosesinin asanlaşdırılması daha sürətli, rahat və səmərəli razılaşmaların əldə olunmasına imkan yaradır.</div>
                          </div>
                        </div>
                      </div>
                      <div className="partners_benefits-cta animate-up">
                        <div className="note_wrap is-wide">
                          <p>TREVA TƏRƏFDAŞI OLARAQ, SATIŞLARINIZI ARTIRMAQ VƏ ŞƏBƏKƏNİZİ GENİŞLƏNDİRMƏK ÜÇÜN XÜSUSİ HAZIRLANMIŞ GÜCLÜ RESURSLARDAN İSTİFADƏ ETMƏ İMKANI QAZANIRSINIZ.</p>
                        </div>
                        <a data-wf--button--variant="blue" href="#broker-registration" className="button w-inline-block">
                          <ButtonText>TREVA ilə tərəfdaş olun </ButtonText>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="section_broker bg-color-blue100 parallax-reveal">
              <div id="broker-registration" className="global-padding padding-section-large">
                <div className="container-large">
                  <div className="broker_component">
                    <div className="broker_title-wrap is-az">
                      <p className="text-color-white60">TREVA ilə Əlaqədə Qalın</p>
                      <h2 className="text-color-white">Tərəfdaş broker olmaq üçün indi qeydiyyatdan keçin</h2>
                    </div>
                    <div className="broker_wrap">
                      <div className="note_wrap is-white is-wide">
                        <div className="text-color-white60">TREVA ilə tərəfdaşlıq edərək, satışlarınızı artırmaq və şəbəkənizi genişləndirmək üçün nəzərdə tutulmuş güclü resurslara çıxış əldə edirsiniz.</div>
                      </div>
                      <div className="connect_form-wrap animate-up w-form">
                        <form id="wf-form-Broker-Form" name="wf-form-Broker-Form" data-name="Broker Form" method="get" className="broker_form" onSubmit={handleSubmit}>
                          <div className="field_wrap">
                            <input className={`connect_input-field w-input ${errors.name ? 'error' : ''}`} maxLength={256} name="name" data-name="name" placeholder="Tam ad *" type="text" id="name" value={fields.name} onChange={handleChange} />
                            {errors.name && <div className="connect_error" style={{ display: 'block' }}>{errors.name}</div>}
                          </div>
                          <div className="field_wrap">
                            <input className={`connect_input-field w-input ${errors.email ? 'error' : ''}`} maxLength={256} name="email" data-name="email" placeholder="Email ünvanı *" type="email" id="email" value={fields.email} onChange={handleChange} />
                            {errors.email && <div className="connect_error" style={{ display: 'block' }}>{errors.email}</div>}
                          </div>
                          <div className="field_wrap">
                            <input className={`connect_input-field w-input ${errors.phone ? 'error' : ''}`} maxLength={256} name="phone" data-name="phone" placeholder="Telefon nömrəsi *" type="tel" id="phone" value={fields.phone} onChange={handleChange} />
                            {errors.phone && <div className="connect_error" style={{ display: 'block' }}>{errors.phone}</div>}
                          </div>
                          <div className="field_wrap">
                            <input className={`connect_input-field w-input ${errors.city ? 'error' : ''}`} maxLength={256} name="city" data-name="city" placeholder="Şəhər" type="text" id="city" value={fields.city} onChange={handleChange} />
                            {errors.city && <div className="connect_error" style={{ display: 'block' }}>{errors.city}</div>}
                          </div>
                          
                          <div className="field_wrap">
                            <div className="fs_selectcustom-1_component">
                              <div data-delay="0" data-hover="false" className="fs_selectcustom-1_dropdown w-dropdown">
                                <div className={`connect_input-field is-select w-dropdown-toggle ${errors.brokerType ? 'error' : ''}`}>
                                  <div className="fs_selectcustom-1_text">{fields.brokerType || 'BROKER NÖVÜ *'}</div>
                                  <div className="icon-small w-embed">
                                    <svg width="12" height="7" viewBox="0 0 12 7" fill="none" xmlns="http://www.w3.org/2000/svg">
                                      <path d="M11.354 1.35403L6.35403 6.35403C6.30759 6.40052 6.25245 6.4374 6.19175 6.46256C6.13105 6.48772 6.06599 6.50067 6.00028 6.50067C5.93457 6.50067 5.86951 6.48772 5.80881 6.46256C5.74811 6.4374 5.69297 6.40052 5.64653 6.35403L0.646528 1.35403C0.552708 1.26021 0.5 1.13296 0.5 1.00028C0.5 0.867596 0.552708 0.740348 0.646528 0.646528C0.740348 0.552707 0.867596 0.5 1.00028 0.5C1.13296 0.5 1.26021 0.552707 1.35403 0.646528L6.00028 5.2934L10.6465 0.646528C10.693 0.600073 10.7481 0.563222 10.8088 0.538081C10.8695 0.51294 10.9346 0.5 11.0003 0.5C11.066 0.5 11.131 0.51294 11.1917 0.538081C11.2524 0.563222 11.3076 0.600073 11.354 0.646528C11.4005 0.692983 11.4373 0.748133 11.4625 0.80883C11.4876 0.869526 11.5006 0.934581 11.5006 1.00028C11.5006 1.06598 11.4876 1.13103 11.4625 1.19173C11.4373 1.25242 11.4005 1.30757 11.354 1.35403Z" fill="white" fillOpacity="0.4"/>
                                    </svg>
                                  </div>
                                  <select id="BROKER-N-V" name="brokerType" data-name="BROKER NÖVÜ" className="fs_selectcustom-1_field w-select" value={fields.brokerType} onChange={handleChange} style={{ position: 'absolute', top: 0, left: 0, opacity: 0, width: '100%', height: '100%', cursor: 'pointer', appearance: 'none', WebkitAppearance: 'none' }}>
                                    <option value="">BROKER NÖVÜ *</option>
                                    <option value="Şirkət">Şirkət</option>
                                    <option value="Fərdi broker">Fərdi broker</option>
                                  </select>
                                </div>
                              </div>
                            </div>
                            {errors.brokerType && <div className="connect_error" style={{ display: 'block' }}>{errors.brokerType}</div>}
                          </div>

                          <div className="field_wrap">
                            <div className="fs_selectcustom-1_component">
                              <div data-delay="0" data-hover="false" className="fs_selectcustom-1_dropdown w-dropdown">
                                <div className={`connect_input-field is-select w-dropdown-toggle ${errors.experience ? 'error' : ''}`}>
                                  <div className="fs_selectcustom-1_text">{fields.experience || 'İŞ TƏCRÜBƏSİ'}</div>
                                  <div className="icon-small w-embed">
                                    <svg width="12" height="7" viewBox="0 0 12 7" fill="none" xmlns="http://www.w3.org/2000/svg">
                                      <path d="M11.354 1.35403L6.35403 6.35403C6.30759 6.40052 6.25245 6.4374 6.19175 6.46256C6.13105 6.48772 6.06599 6.50067 6.00028 6.50067C5.93457 6.50067 5.86951 6.48772 5.80881 6.46256C5.74811 6.4374 5.69297 6.40052 5.64653 6.35403L0.646528 1.35403C0.552708 1.26021 0.5 1.13296 0.5 1.00028C0.5 0.867596 0.552708 0.740348 0.646528 0.646528C0.740348 0.552707 0.867596 0.5 1.00028 0.5C1.13296 0.5 1.26021 0.552707 1.35403 0.646528L6.00028 5.2934L10.6465 0.646528C10.693 0.600073 10.7481 0.563222 10.8088 0.538081C10.8695 0.51294 10.9346 0.5 11.0003 0.5C11.066 0.5 11.131 0.51294 11.1917 0.538081C11.2524 0.563222 11.3076 0.600073 11.354 0.646528C11.4005 0.692983 11.4373 0.748133 11.4625 0.80883C11.4876 0.869526 11.5006 0.934581 11.5006 1.00028C11.5006 1.06598 11.4876 1.13103 11.4625 1.19173C11.4373 1.25242 11.4005 1.30757 11.354 1.35403Z" fill="white" fillOpacity="0.4"/>
                                    </svg>
                                  </div>
                                  <select id="Years-of-Experience" name="experience" data-name="Years of Experience" className="fs_selectcustom-1_field w-select" value={fields.experience} onChange={handleChange} style={{ position: 'absolute', top: 0, left: 0, opacity: 0, width: '100%', height: '100%', cursor: 'pointer', appearance: 'none', WebkitAppearance: 'none' }}>
                                    <option value="">İŞ TƏCRÜBƏSİ</option>
                                    <option value="Təcrübəm yoxdur">Təcrübəm yoxdur</option>
                                    <option value="1 ildən az">1 ildən az</option>
                                    <option value="1-3 il">1-3 il</option>
                                    <option value="3 ildən artıq">3 ildən artıq</option>
                                  </select>
                                </div>
                              </div>
                            </div>
                            {errors.experience && <div className="connect_error" style={{ display: 'block' }}>{errors.experience}</div>}
                          </div>

                          <div id="w-node-_168df956-a53e-7751-a302-0e484eb6821f-af46c2b8" className="field_wrap">
                            <input className={`connect_input-field w-input ${errors.website ? 'error' : ''}`} maxLength={256} name="website" data-name="website" placeholder="Vebsayt və ya sosial media linki" type="text" id="website" value={fields.website} onChange={handleChange} />
                            {errors.website && <div className="connect_error" style={{ display: 'block' }}>{errors.website}</div>}
                          </div>
                          <div id="w-node-_3a41a586-fc03-8b5c-7947-16d71e0d6a51-af46c2b8" className="field_wrap">
                            <input className="connect_input-field w-input" maxLength={256} name="message" data-name="message" placeholder="Şərhlər / Suallar" type="text" id="message" value={fields.message} onChange={handleChange} />
                          </div>

                          <button type="submit" className="button white" disabled={status === 'loading'} style={{ border: 'none', cursor: status === 'loading' ? 'wait' : 'pointer', fontFamily: 'inherit' }}>
                            {status === 'loading' ? 'Göndərilir...' : 'İndi qeydiyyatdan keç'}
                          </button>
                        </form>
                        
                        {status === 'success' && (
                          <div className="cs_form-success w-form-done" style={{ display: 'block' }}>
                            <div className="cs_form-success-content">
                              <div className="icon-huge w-embed">
                                <CheckCircleSVG />
                              </div>
                              <div>Qeydiyyat üçün təşəkkür edirik! <br/>Komandamız tezliklə sizinlə əlaqə saxlayacaq.</div>
                            </div>
                          </div>
                        )}
                        {status === 'error' && (
                          <div className="cs_error w-form-fail" style={{ display: 'block' }}>
                            <div>Oops! Something went wrong.</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section data-w-id="44345067-e7e2-e418-326c-dc1560d944bb" className="section_gallery">
              <div className="global-padding">
                <div className="container-large">
                  <div className="gallery_component">
                    <div className="gallery_wrap">
                      <div className="gallery_content-wrap">
                        <div className="gallery_title-wrap is-az">
                          <div className="text-color-blue60">(TREVA ilə tərəfdaş olun)</div>
                          <h2>Daha çox komissiya qazanın, daha çox müqavilə bağlayın.</h2>
                        </div>
                        <div className="gallery_bottom-wrap">
                          <div className="max-width-40rem">
                            <p className="text-color-blue60">HARADA YERLƏŞMƏYİNİZDƏN ASILI OLMAYARAQ — TREVA BROKERLƏRİ, ŞİRKƏTLƏRİ, BEYNƏLXALQ AGENTLƏRİ SATIŞ ŞƏBƏKƏMİZƏ QOŞULMAĞA DƏVƏT EDİR. TREVA İLƏ MÜQAVİLƏLƏRİ DAHA SÜRƏTLİ BAĞLAMAĞA, YÜKSƏK KOMİSSİYALAR QAZANMAĞA BAŞLAYIN.</p>
                          </div>
                          <a data-wf--button--variant="blue" href="#broker-registration" className="button w-inline-block">
                            <div className="svg-code">This is some text inside of a div block.</div>
                            <ButtonText>Bizimlə tərəfdaş olun</ButtonText>
                          </a>
                        </div>
                      </div>
                      <div className="gallery_holder">
                        <div className="gallery_track">
                          <div style={{ WebkitTransform: 'translate3d(0, -20%, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)', MozTransform: 'translate3d(0, -20%, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)', msTransform: 'translate3d(0, -20%, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)', transform: 'translate3d(0, -20%, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)' }} className="gallery_block">
                            <div className="gallery_lightbox">
                              <div className="gallery_img-wrap">
                                <img src="https://cdn.prod.website-files.com/6825d64025f8005ef1ddfc4c/6885e0ca09370b706fb69a48_treva-ofissss.avif" loading="lazy" alt="Two men in suits standing outside of a building." className="fullwidth-img ease0-6" />
                              </div>
                            </div>
                            <div className="gallery_lightbox">
                              <div className="gallery_img-wrap">
                                <img src="https://cdn.prod.website-files.com/6825d64025f8005ef1ddfc4c/68836511b9a5b2f70263e946_IMG_2517.avif" loading="lazy" alt="A man and a woman standing in front of a group of people." className="fullwidth-img ease0-6" />
                              </div>
                            </div>
                            <div className="gallery_lightbox">
                              <div className="gallery_img-wrap">
                                <img src="https://cdn.prod.website-files.com/6825d64025f8005ef1ddfc4c/68836511710deed268d458cd_IMG_2518.avif" loading="lazy" alt="A man sitting at a table writing on a piece of paper." className="fullwidth-img ease0-6" />
                              </div>
                            </div>
                          </div>
                          <div style={{ WebkitTransform: 'translate3d(0, -20%, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)', MozTransform: 'translate3d(0, -20%, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)', msTransform: 'translate3d(0, -20%, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)', transform: 'translate3d(0, -20%, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)' }} className="gallery_block">
                            <div className="gallery_lightbox">
                              <div className="gallery_img-wrap">
                                <img src="https://cdn.prod.website-files.com/6825d64025f8005ef1ddfc4c/6885e0ca09370b706fb69a48_treva-ofissss.avif" loading="lazy" alt="Two men in suits standing outside of a building." className="fullwidth-img ease0-6" />
                              </div>
                            </div>
                            <div className="gallery_lightbox">
                              <div className="gallery_img-wrap">
                                <img src="https://cdn.prod.website-files.com/6825d64025f8005ef1ddfc4c/68836511b9a5b2f70263e946_IMG_2517.avif" loading="lazy" alt="A man and a woman standing in front of a group of people." className="fullwidth-img ease0-6" />
                              </div>
                            </div>
                            <div className="gallery_lightbox">
                              <div className="gallery_img-wrap">
                                <img src="https://cdn.prod.website-files.com/6825d64025f8005ef1ddfc4c/68836511710deed268d458cd_IMG_2518.avif" loading="lazy" alt="A man sitting at a table writing on a piece of paper." className="fullwidth-img ease0-6" />
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
          </main>
          
          <HomeFooter locale={locale} />
        </div>
      </div>
    </>
  )
}
