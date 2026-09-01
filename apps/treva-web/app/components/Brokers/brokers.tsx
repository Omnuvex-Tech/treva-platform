'use client'
import { ButtonText } from '@/app/components/ButtonText';


import { useEffect, useRef, useState } from 'react'
import type { ChangeEvent, FormEvent, MouseEvent } from 'react'
import Script from 'next/script'
import Link from 'next/link'
import Navbar from '@/app/components/HomeV2/V2Nav'
import { HomeFooter } from '@/app/components/HomeV2/V2Footer'
import CallbackV2 from '@/app/components/HomeV2/V2Callback'
import './brokers.css'
import '../Contact/contact.css'

declare global {
  interface Window {
    gsap?: any
    ScrollTrigger?: any
    SplitText?: any
  }
}

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

/**
 * Brokerlər səhifəsinin mətnləri.
 *
 * Səhifə tam azərbaycanca sabit yazılmışdı — ingilis və rus versiyalarında da
 * bütün başlıqlar, forma sahələri və seçim siyahıları azərbaycanca görünürdü.
 *
 * DİQQƏT: brokerType və experience seçimlərinin DƏYƏRİ azərbaycanca qalır,
 * çünki həmin dəyər API-yə göndərilir və admin paneldə göstərilir. Yalnız
 * etiket tərcümə olunur — əks halda eyni sahə bazada üç fərqli dildə saxlanardı.
 */
const brokerTypeOptions = [
  { value: 'Şirkət', az: 'Şirkət', en: 'Company', ru: 'Компания' },
  { value: 'Fərdi broker', az: 'Fərdi broker', en: 'Individual broker', ru: 'Частный брокер' },
] as const

const experienceOptions = [
  { value: 'Təcrübəm yoxdur', az: 'Təcrübəm yoxdur', en: 'No experience', ru: 'Нет опыта' },
  { value: '1 ildən az', az: '1 ildən az', en: 'Less than 1 year', ru: 'Менее 1 года' },
  { value: '1-3 il', az: '1-3 il', en: '1-3 years', ru: '1-3 года' },
  { value: '3 ildən artıq', az: '3 ildən artıq', en: 'More than 3 years', ru: 'Более 3 лет' },
] as const

const brokersDictionary = {
  az: {
    joinAsBroker: '(broker kimi qoşul)',
    heroTitle: 'Azərbaycanın Aparıcı Daşınmaz Əmlak Şəbəkəsinə Qoşulun, Brokerlər, Şirkətlər və Beynəlxalq Agentlər dəvət olunur.',
    heroBody: 'SİZ BROKER, DAŞINMAZ ƏMLAK AGENTLİYİ, YA DA BEYNƏLXALQ ŞİRKƏTSİZ? TREVA OLARAQ, BİZ BÜTÜN SAHƏ VƏ ÖLKƏLƏRDƏN OLAN TƏRƏFDAŞLARI MƏMNUNİYYƏTLƏ QƏBUL EDİRİK. SİZƏ DAHA ÇOX KOMİSSİYA QAZANMAQ VƏ AZƏRBAYCANIN DAŞINMAZ ƏMLAK BAZARINDA, HƏMÇİNİN ONDAN KƏNARDA ŞƏBƏKƏNİZİ GENİŞLƏNDİRMƏK ÜÇÜN LAZIM OLAN BÜTÜN ALƏTLƏRİ, ELANLARI VƏ DƏSTƏYİ BİZİM PLATFORMA TƏQDİM EDİR.',
    joinNetwork: 'Şəbəkəmizə qoşulun',
    videoTitle: 'Trident Investment şirkətinin təsisçisi Narullah Sultanov.',
    whyPartner: 'Niyə TREVA Real Estate ilə tərəfdaşlıq etməlisiniz',
    whyPartnerBody: 'AZƏRBAYCANDA YERLƏŞƏN APARICI DAŞINMAZ ƏMLAK ŞİRKƏTİMİZDƏ TƏRƏFDAŞLARIMIZA SATIŞ POTENSİALINI YÜKSƏLTMƏK ÜÇÜN İMKANLAR YARADIRIQ. SİZ YERLİ BROKER, İNKİŞAF EDƏN DAŞINMAZ ƏMLAK ŞİRKƏTİ VƏ YA BEYNƏLXALQ AGENT OLMAĞINIZDAN ASILI OLMAYARAQ, UĞUR QAZANMAĞINIZ ÜÇÜN LAZIM OLAN ALƏTLƏRİ VƏ FÜRSƏTLƏRİ TƏQDİM EDİRİK.',
    partnershipAlt: 'TREVA tərəfdaşlıq proqramı',
    benefitsLabel: '(TREVA Tərəfdaşı Kimi Nələr Qazanırsınız)',
    b1Title: 'Eksklüziv Elanlar',
    b1Text: 'Ən yaxşı layihələr ictimaiyyətə təqdim olunmadan əvvəl prioritet giriş əldə edin.',
    b1Alt: 'Qonaq otağında divanda oturan iki nəfər.',
    b2Title: 'Marketinq Materialları',
    b2Text: 'Alıcıları cəlb etmək üçün peşəkar vizuallar, videolar və rəqəmsal kontent.',
    b2Alt: 'Ofisdə kompüter arxasında işləyən komanda.',
    b3Title: 'Satış Dəstəyi',
    b3Text: 'Müzakirələr, qiymət strategiyaları və müştəri idarəçiliyi üzrə peşəkar dəstək.',
    b3Alt: 'Masa arxasında oturan bir kişi və bir qadın.',
    b4Title: 'Şəbəkənin Genişləndirilməsi',
    b4Text: 'Problemsiz razılaşma — Trevanın aparıcı broker icması ilə əməkdaşlıq edin və dərhal satışa başlayın.',
    b4Alt: 'Planşetlə masa arxasında oturan qrup.',
    b5Title: 'Sadə Müqavilə Prosesi',
    b5Text: 'Müqavilə prosesinin asanlaşdırılması daha sürətli, rahat və səmərəli razılaşmaların əldə olunmasına imkan yaradır.',
    b5Alt: 'Kostyumlu iki nəfər əl sıxır.',
    benefitsNote: 'TREVA TƏRƏFDAŞI OLARAQ, SATIŞLARINIZI ARTIRMAQ VƏ ŞƏBƏKƏNİZİ GENİŞLƏNDİRMƏK ÜÇÜN XÜSUSİ HAZIRLANMIŞ GÜCLÜ RESURSLARDAN İSTİFADƏ ETMƏ İMKANI QAZANIRSINIZ.',
    becomePartner: 'TREVA ilə tərəfdaş olun',
    stayInTouch: 'TREVA ilə Əlaqədə Qalın',
    registerTitle: 'Tərəfdaş broker olmaq üçün indi qeydiyyatdan keçin',
    registerNote: 'TREVA ilə tərəfdaşlıq edərək, satışlarınızı artırmaq və şəbəkənizi genişləndirmək üçün nəzərdə tutulmuş güclü resurslara çıxış əldə edirsiniz.',
    successTitle: 'Qeydiyyat uğurla tamamlandı!',
    successText: 'Komandamız tezliklə sizinlə əlaqə saxlayacaq.',
    newRegistration: 'Yeni qeydiyyat',
    fullName: 'Tam ad *',
    email: 'Email ünvanı *',
    phone: 'Telefon nömrəsi *',
    city: 'Şəhər',
    brokerTypePlaceholder: 'BROKER NÖVÜ *',
    experiencePlaceholder: 'İŞ TƏCRÜBƏSİ',
    website: 'Vebsayt və ya sosial media linki',
    comments: 'Şərhlər / Suallar',
    submit: 'İndi qeydiyyatdan keç',
    errorText: 'Göndərilmədi. Yenidən cəhd edin.',
    required: 'Bu sahə mütləq doldurulmalıdır',
    invalidEmail: 'Etibarlı e-poçt ünvanı daxil edin',
    invalidPhone: 'Etibarlı telefon nömrəsi daxil edin',
    invalidUrl: 'Etibarlı URL daxil edin',
    ctaContact: 'Əlaqə saxlayın',
  },
  en: {
    joinAsBroker: '(join as a broker)',
    heroTitle: 'Join the leading real estate network in Azerbaijan — brokers, agencies and international agents welcome.',
    heroBody: 'ARE YOU A BROKER, A REAL ESTATE AGENCY OR AN INTERNATIONAL COMPANY? AT TREVA WE WELCOME PARTNERS FROM EVERY MARKET AND COUNTRY. OUR PLATFORM GIVES YOU ALL THE TOOLS, LISTINGS AND SUPPORT YOU NEED TO EARN MORE COMMISSION AND GROW YOUR NETWORK IN AZERBAIJAN AND BEYOND.',
    joinNetwork: 'Join our network',
    videoTitle: 'Narullah Sultanov, founder of Trident Investment.',
    whyPartner: 'Why partner with TREVA Real Estate',
    whyPartnerBody: 'AS THE LEADING REAL ESTATE COMPANY IN AZERBAIJAN, WE CREATE THE CONDITIONS FOR OUR PARTNERS TO RAISE THEIR SALES POTENTIAL. WHETHER YOU ARE A LOCAL BROKER, A GROWING AGENCY OR AN INTERNATIONAL AGENT, WE PROVIDE THE TOOLS AND OPPORTUNITIES YOU NEED TO SUCCEED.',
    partnershipAlt: 'TREVA partnership programme',
    benefitsLabel: '(What You Gain as a TREVA Partner)',
    b1Title: 'Exclusive Listings',
    b1Text: 'Get priority access to the best projects before they reach the public.',
    b1Alt: 'Two men sitting on couches in a living room.',
    b2Title: 'Marketing Materials',
    b2Text: 'Professional visuals, videos and digital content to attract buyers.',
    b2Alt: 'A group of people working on computers in an office.',
    b3Title: 'Sales Support',
    b3Text: 'Expert support on negotiations, pricing strategy and client management.',
    b3Alt: 'A man and a woman sitting at a table.',
    b4Title: 'Network Growth',
    b4Text: 'A frictionless deal — work with the leading broker community at Treva and start selling right away.',
    b4Alt: 'A group of people sitting around a table with a tablet.',
    b5Title: 'Simple Contract Process',
    b5Text: 'A streamlined contract process makes deals faster, easier and more efficient.',
    b5Alt: 'A man shaking hands with another man in a suit.',
    benefitsNote: 'AS A TREVA PARTNER YOU GAIN ACCESS TO POWERFUL RESOURCES BUILT TO GROW YOUR SALES AND EXPAND YOUR NETWORK.',
    becomePartner: 'Partner with TREVA',
    stayInTouch: 'Stay in Touch with TREVA',
    registerTitle: 'Register now to become a partner broker',
    registerNote: 'By partnering with TREVA you gain access to powerful resources designed to grow your sales and expand your network.',
    successTitle: 'Registration completed!',
    successText: 'Our team will contact you shortly.',
    newRegistration: 'New registration',
    fullName: 'Full name *',
    email: 'Email address *',
    phone: 'Phone number *',
    city: 'City',
    brokerTypePlaceholder: 'BROKER TYPE *',
    experiencePlaceholder: 'WORK EXPERIENCE',
    website: 'Website or social media link',
    comments: 'Comments / Questions',
    submit: 'Register now',
    errorText: 'Submission failed. Please try again.',
    required: 'This field is required',
    invalidEmail: 'Enter a valid email address',
    invalidPhone: 'Enter a valid phone number',
    invalidUrl: 'Enter a valid URL',
    ctaContact: 'Get in touch',
  },
  ru: {
    joinAsBroker: '(присоединиться как брокер)',
    heroTitle: 'Присоединяйтесь к ведущей сети недвижимости Азербайджана — приглашаем брокеров, агентства и международных агентов.',
    heroBody: 'ВЫ БРОКЕР, АГЕНТСТВО НЕДВИЖИМОСТИ ИЛИ МЕЖДУНАРОДНАЯ КОМПАНИЯ? В TREVA МЫ РАДЫ ПАРТНЁРАМ ИЗ ЛЮБЫХ СФЕР И СТРАН. НАША ПЛАТФОРМА ДАЁТ ВСЕ ИНСТРУМЕНТЫ, ОБЪЕКТЫ И ПОДДЕРЖКУ, ЧТОБЫ ЗАРАБАТЫВАТЬ БОЛЬШЕ КОМИССИИ И РАСШИРЯТЬ СВОЮ СЕТЬ В АЗЕРБАЙДЖАНЕ И ЗА ЕГО ПРЕДЕЛАМИ.',
    joinNetwork: 'Присоединиться к сети',
    videoTitle: 'Наруллах Султанов, основатель Trident Investment.',
    whyPartner: 'Почему стоит сотрудничать с TREVA Real Estate',
    whyPartnerBody: 'КАК ВЕДУЩАЯ КОМПАНИЯ НА РЫНКЕ НЕДВИЖИМОСТИ АЗЕРБАЙДЖАНА МЫ СОЗДАЁМ УСЛОВИЯ ДЛЯ РОСТА ПРОДАЖ НАШИХ ПАРТНЁРОВ. БУДЬ ВЫ МЕСТНЫМ БРОКЕРОМ, РАСТУЩИМ АГЕНТСТВОМ ИЛИ МЕЖДУНАРОДНЫМ АГЕНТОМ — МЫ ДАЁМ ИНСТРУМЕНТЫ И ВОЗМОЖНОСТИ ДЛЯ УСПЕХА.',
    partnershipAlt: 'Партнёрская программа TREVA',
    benefitsLabel: '(Что вы получаете как партнёр TREVA)',
    b1Title: 'Эксклюзивные объекты',
    b1Text: 'Получайте приоритетный доступ к лучшим проектам до их публичного запуска.',
    b1Alt: 'Двое мужчин на диванах в гостиной.',
    b2Title: 'Маркетинговые материалы',
    b2Text: 'Профессиональные визуалы, видео и цифровой контент для привлечения покупателей.',
    b2Alt: 'Команда за компьютерами в офисе.',
    b3Title: 'Поддержка продаж',
    b3Text: 'Экспертная поддержка в переговорах, ценовой стратегии и работе с клиентами.',
    b3Alt: 'Мужчина и женщина за столом.',
    b4Title: 'Расширение сети',
    b4Text: 'Сделка без лишних сложностей — работайте с ведущим брокерским сообществом Treva и начинайте продавать сразу.',
    b4Alt: 'Группа людей за столом с планшетом.',
    b5Title: 'Простой процесс договора',
    b5Text: 'Упрощённый процесс договора делает сделки быстрее, удобнее и эффективнее.',
    b5Alt: 'Двое мужчин в костюмах пожимают руки.',
    benefitsNote: 'КАК ПАРТНЁР TREVA ВЫ ПОЛУЧАЕТЕ ДОСТУП К МОЩНЫМ РЕСУРСАМ, СОЗДАННЫМ ДЛЯ РОСТА ПРОДАЖ И РАСШИРЕНИЯ ВАШЕЙ СЕТИ.',
    becomePartner: 'Стать партнёром TREVA',
    stayInTouch: 'Оставайтесь на связи с TREVA',
    registerTitle: 'Зарегистрируйтесь, чтобы стать партнёром-брокером',
    registerNote: 'Сотрудничая с TREVA, вы получаете доступ к мощным ресурсам для роста продаж и расширения сети.',
    successTitle: 'Регистрация завершена!',
    successText: 'Наша команда свяжется с вами в ближайшее время.',
    newRegistration: 'Новая регистрация',
    fullName: 'Полное имя *',
    email: 'Электронная почта *',
    phone: 'Номер телефона *',
    city: 'Город',
    brokerTypePlaceholder: 'ТИП БРОКЕРА *',
    experiencePlaceholder: 'ОПЫТ РАБОТЫ',
    website: 'Сайт или ссылка на соцсети',
    comments: 'Комментарии / Вопросы',
    submit: 'Зарегистрироваться',
    errorText: 'Не отправлено. Попробуйте ещё раз.',
    required: 'Это поле обязательно для заполнения',
    invalidEmail: 'Введите корректный адрес электронной почты',
    invalidPhone: 'Введите корректный номер телефона',
    invalidUrl: 'Введите корректный URL',
    ctaContact: 'Связаться с нами',
  },
} as const

type BrokerLocale = keyof typeof brokersDictionary

export function BrokersPage({ locale }: BrokersPageProps) {
  const lang = (locale in brokersDictionary ? locale : 'az') as BrokerLocale
  const t = brokersDictionary[lang]
  const gsapReady = useRef(false)

  const [fields, setFields] = useState<BrokerFields>(INITIAL_FIELDS)
  const [errors, setErrors] = useState<BrokerErrors>({})
  const [status, setStatus] = useState<SubmitStatus>('idle')
  const [brokerTypeOpen, setBrokerTypeOpen] = useState(false)
  const [experienceOpen, setExperienceOpen] = useState(false)
  const brokerTypeRef = useRef<HTMLDivElement>(null)
  const experienceRef = useRef<HTMLDivElement>(null)

  const getBrokerRegistrationOffset = () => {
    if (typeof window === 'undefined') return 88

    const navHeightValue = window
      .getComputedStyle(document.documentElement)
      .getPropertyValue('--treva-nav-height')

    const navHeight = Number.parseFloat(navHeightValue) || 64
    return navHeight + 24
  }

  const scrollToBrokerRegistration = (event?: MouseEvent<HTMLAnchorElement>) => {
    event?.preventDefault()

    if (typeof window === 'undefined') return

    const target = document.getElementById('broker-registration')
    if (!target) return

    window.history.replaceState(null, '', '#broker-registration')

    const offset = getBrokerRegistrationOffset()

    window.scrollTo({
      top: Math.max(target.getBoundingClientRect().top + window.scrollY - offset, 0),
      behavior: 'smooth',
    })
  }

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.location.hash !== '#broker-registration') return

    const timer = window.setTimeout(() => scrollToBrokerRegistration(), 150)
    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    const handleClickOutside = (e: globalThis.MouseEvent) => {
      if (brokerTypeRef.current && !brokerTypeRef.current.contains(e.target as Node)) setBrokerTypeOpen(false)
      if (experienceRef.current && !experienceRef.current.contains(e.target as Node)) setExperienceOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

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

    document.querySelectorAll('.section_gallery').forEach((section) => {
      const galleryBlocks = section.querySelectorAll('.gallery_block')
      if (!galleryBlocks.length) return

      ScrollTrigger.create({
        trigger: section,
        start: 'top bottom',
        once: true,
        onEnter: () => {
          gsap.set(galleryBlocks, { yPercent: -20 })
          gsap.to(galleryBlocks, {
            yPercent: -120,
            duration: 80,
            ease: 'none',
            repeat: -1,
          })
        },
      })
    })
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
    if (!fields.name.trim()) errs.name = t.required
    if (!fields.email.trim() || !fields.email.includes('@') || !fields.email.includes('.')) errs.email = t.invalidEmail
    if (!fields.phone.trim() || fields.phone.replace(/[^\d]/g, '').length < 8) errs.phone = t.invalidPhone
    if (!fields.city.trim()) errs.city = t.required
    if (!fields.brokerType) errs.brokerType = t.required
    if (!fields.experience) errs.experience = t.required
    if (fields.website && !validateURL(fields.website)) errs.website = t.invalidUrl

    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }

    setStatus('loading')
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:10021'
      const res = await fetch(`${apiBase}/broker-registration`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fields.name,
          email: fields.email,
          phone: fields.phone,
          city: fields.city,
          brokerType: fields.brokerType,
          experience: fields.experience,
          website: fields.website || null,
          message: fields.message || null,
        })
      })
      
      if (!res.ok) throw new Error('Xəta baş verdi')
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
      <div className="page-wrapper" data-locale={locale}>
          <Navbar locale={locale} variant="solid" />
          
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
                            {t.heroTitle}
                          </h1>
                        </div>
                        <p className="first-child">{t.joinAsBroker}</p>
                      </div>
                      <div className="header-services_bottom">
                        <div className="header-services_content-wrap">
                          <p>{t.heroBody}</p>
                          <a data-wf--button--variant="blue" href="#broker-registration" onClick={scrollToBrokerRegistration} className="button w-inline-block">
                            <ButtonText>{t.joinNetwork}</ButtonText>
                          </a>
                        </div>
                        <div className="header-services_video-wrap img-reveal">
                          <div className="header-services_img-wrap w-embed w-iframe">
                            <div style={{ position: 'relative', paddingTop: '56.25%', height: 0, overflow: 'hidden' }}>
                              <iframe
                                src="https://www.youtube.com/embed/Oiy6qfNeYc8"
                                title={t.videoTitle}
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
                        <h2><span className="heading-gap-h1">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>{t.whyPartner}</h2>
                      </div>
                      <div className="partners_bio-wrap">
                        <p>{t.whyPartnerBody}</p>
                      </div>
                    </div>
                    <div className="partners_cover-wrap img-reveal">
                      <img src="../images/brokers/partnership.jpg" loading="lazy" alt={t.partnershipAlt} className="fullwidth-img is-20-top"/>
                      <div className="img-cover bg-color-grey200"></div>
                    </div>
                    <div className="partners_benefits-wrap">
                      <p>{t.benefitsLabel}</p>
                      <div className="partners_benefits-list">
                        <div className="partners_benefits-item animate-right">
                          <div className="partners_benefits-content">
                            <div className="partners_img-wrap">
                              <img src="../images/brokers/brokers1.jpeg" loading="lazy" alt={t.b1Alt} className="fullwidth-img"/>
                            </div>
                            <div className="partners_title">{t.b1Title}</div>
                          </div>
                          <div className="partners_benefits-caption">
                            <div>{t.b1Text}</div>
                          </div>
                        </div>
                        <div className="partners_benefits-item animate-right">
                          <div className="partners_benefits-content">
                            <div className="partners_img-wrap">
                              <img src="../images/brokers/brokers2.jpeg" loading="lazy" sizes="100vw"  alt={t.b2Alt} className="fullwidth-img"/>
                            </div>
                            <div className="partners_title">{t.b2Title}</div>
                          </div>
                          <div className="partners_benefits-caption">
                            <div>{t.b2Text}</div>
                          </div>
                        </div>
                        <div className="partners_benefits-item animate-right">
                          <div className="partners_benefits-content">
                            <div className="partners_img-wrap">
                              <img src="../images/brokers/brokers3.avif" loading="lazy" sizes="100vw"  alt={t.b3Alt} className="fullwidth-img"/>
                            </div>
                            <div className="partners_title">{t.b3Title}</div>
                          </div>
                          <div className="partners_benefits-caption">
                            <div>{t.b3Text}</div>
                          </div>
                        </div>
                        <div className="partners_benefits-item animate-right">
                          <div className="partners_benefits-content">
                            <div className="partners_img-wrap">
                              <img src="https://cdn.prod.website-files.com/6825d64025f8005ef1ddfc4c/688365b9c2326ad6795278be_network exp.avif" loading="lazy" alt={t.b4Alt} className="fullwidth-img"/>
                            </div>
                            <div className="partners_title">{t.b4Title}</div>
                          </div>
                          <div className="partners_benefits-caption">
                            <div>{t.b4Text}</div>
                          </div>
                        </div>
                        <div id="w-node-_8e2a6c29-d8ff-9bf8-309b-349a6be246c1-af46c2b8" className="partners_benefits-item animate-right">
                          <div className="partners_benefits-content">
                            <div className="partners_img-wrap">
                              <img src="https://cdn.prod.website-files.com/6825d64025f8005ef1ddfc4c/6883660557d5794e07264454_simple contra.avif" loading="lazy" sizes="100vw" height="Auto" alt={t.b5Alt} srcSet="https://cdn.prod.website-files.com/6825d64025f8005ef1ddfc4c/6883660557d5794e07264454_simple%20contra-p-500.avif 500w, https://cdn.prod.website-files.com/6825d64025f8005ef1ddfc4c/6883660557d5794e07264454_simple%20contra.avif 1013w" className="fullwidth-img"/>
                            </div>
                            <div className="partners_title">{t.b5Title}</div>
                          </div>
                          <div className="partners_benefits-caption">
                            <div>{t.b5Text}</div>
                          </div>
                        </div>
                      </div>
                      <div className="partners_benefits-cta animate-up">
                        <div className="note_wrap is-wide">
                          <p>{t.benefitsNote}</p>
                        </div>
                        <a data-wf--button--variant="blue" href="#broker-registration" onClick={scrollToBrokerRegistration} className="button w-inline-block">
                          <ButtonText>{t.becomePartner}</ButtonText>
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
                      <p className="text-color-white60">{t.stayInTouch}</p>
                      <h2 className="text-color-white">{t.registerTitle}</h2>
                      <div className="note_wrap is-white is-wide">
                        <div className="text-color-white60">{t.registerNote}</div>
                      </div>
                    </div>
                    <div className="broker_wrap">
                      <div className="connect_form-wrap animate-up w-form">
                        {status === 'success' ? (
                          <div className="broker-success-wrap">
                            <div className="contact-success-icon">
                              <svg viewBox="0 0 52 52" className="contact-checkmark">
                                <circle className="contact-checkmark-circle" cx="26" cy="26" r="25" fill="none" />
                                <path className="contact-checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
                              </svg>
                            </div>
                            <h3 className="broker-success-title">{t.successTitle}</h3>
                            <p className="broker-success-text">{t.successText}</p>
                            <button type="button" className="broker-success-btn" onClick={() => { setStatus('idle'); setFields(INITIAL_FIELDS) }}>
                              {t.newRegistration}
                            </button>
                          </div>
                        ) : (
                        <form id="wf-form-Broker-Form" name="wf-form-Broker-Form" data-name="Broker Form" method="get" className="broker_form" onSubmit={handleSubmit}>
                          <div className="field_wrap">
                            <input className={`connect_input-field w-input ${errors.name ? 'error' : ''}`} maxLength={256} name="name" data-name="name" placeholder={t.fullName} type="text" id="name" value={fields.name} onChange={handleChange} />
                            {errors.name && <div className="connect_error" style={{ display: 'block' }}>{errors.name}</div>}
                          </div>
                          <div className="field_wrap">
                            <input className={`connect_input-field w-input ${errors.email ? 'error' : ''}`} maxLength={256} name="email" data-name="email" placeholder={t.email} type="email" id="email" value={fields.email} onChange={handleChange} />
                            {errors.email && <div className="connect_error" style={{ display: 'block' }}>{errors.email}</div>}
                          </div>
                          <div className="field_wrap">
                            <input className={`connect_input-field w-input ${errors.phone ? 'error' : ''}`} maxLength={256} name="phone" data-name="phone" placeholder={t.phone} type="tel" id="phone" value={fields.phone} onChange={handleChange} />
                            {errors.phone && <div className="connect_error" style={{ display: 'block' }}>{errors.phone}</div>}
                          </div>
                          <div className="field_wrap">
                            <input className={`connect_input-field w-input ${errors.city ? 'error' : ''}`} maxLength={256} name="city" data-name="city" placeholder={t.city} type="text" id="city" value={fields.city} onChange={handleChange} />
                            {errors.city && <div className="connect_error" style={{ display: 'block' }}>{errors.city}</div>}
                          </div>
                          
                          <div className="field_wrap">
                            <div ref={brokerTypeRef} style={{ position: 'relative' }}>
                              <div
                                className={`connect_input-field is-select ${errors.brokerType ? 'error' : ''}`}
                                onClick={() => setBrokerTypeOpen(p => !p)}
                                style={{ cursor: 'pointer' }}
                              >
                                <span style={{ color: fields.brokerType ? '#fff' : 'rgba(255,255,255,0.4)', fontSize: 14, fontFamily: 'inherit' }}>{brokerTypeOptions.find(o => o.value === fields.brokerType)?.[lang] || t.brokerTypePlaceholder}</span>
                                <div className="icon-small w-embed" style={{ pointerEvents: 'none' }}>
                                  <svg width="12" height="7" viewBox="0 0 12 7" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M11.354 1.35403L6.35403 6.35403C6.30759 6.40052 6.25245 6.4374 6.19175 6.46256C6.13105 6.48772 6.06599 6.50067 6.00028 6.50067C5.93457 6.50067 5.86951 6.48772 5.80881 6.46256C5.74811 6.4374 5.69297 6.40052 5.64653 6.35403L0.646528 1.35403C0.552708 1.26021 0.5 1.13296 0.5 1.00028C0.5 0.867596 0.552708 0.740348 0.646528 0.646528C0.740348 0.552707 0.867596 0.5 1.00028C1.13296 0.5 1.26021 0.552707 1.35403 0.646528L6.00028 5.2934L10.6465 0.646528C10.693 0.600073 10.7481 0.563222 10.8088 0.538081C10.8695 0.51294 10.9346 0.5 11.0003 0.5C11.066 0.5 11.131 0.51294 11.1917 0.538081C11.2524 0.563222 11.3076 0.600073 11.354 0.646528C11.4005 0.692983 11.4373 0.748133 11.4625 0.80883C11.4876 0.869526 11.5006 0.934581 11.5006 1.00028C11.5006 1.06598 11.4876 1.13103 11.4625 1.19173C11.4373 1.25242 11.4005 1.30757 11.354 1.35403Z" fill="white" fillOpacity="0.4"/>
                                  </svg>
                                </div>
                              </div>
                              {brokerTypeOpen && (
                                <div className="broker-dropdown-list">
                                  {brokerTypeOptions.map(opt => (
                                    <button
                                      key={opt.value}
                                      type="button"
                                      className={`broker-dropdown-item ${fields.brokerType === opt.value ? 'broker-dropdown-item--active' : ''}`}
                                      onClick={() => { setFields(f => ({ ...f, brokerType: opt.value })); setBrokerTypeOpen(false) }}
                                    >
                                      {opt[lang]}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                            {errors.brokerType && <div className="connect_error" style={{ display: 'block' }}>{errors.brokerType}</div>}
                          </div>

                          <div className="field_wrap">
                            <div ref={experienceRef} style={{ position: 'relative' }}>
                              <div
                                className={`connect_input-field is-select ${errors.experience ? 'error' : ''}`}
                                onClick={() => setExperienceOpen(p => !p)}
                                style={{ cursor: 'pointer' }}
                              >
                                <span style={{ color: fields.experience ? '#fff' : 'rgba(255,255,255,0.4)', fontSize: 14, fontFamily: 'inherit' }}>{experienceOptions.find(o => o.value === fields.experience)?.[lang] || t.experiencePlaceholder}</span>
                                <div className="icon-small w-embed" style={{ pointerEvents: 'none' }}>
                                  <svg width="12" height="7" viewBox="0 0 12 7" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M11.354 1.35403L6.35403 6.35403C6.30759 6.40052 6.25245 6.4374 6.19175 6.46256C6.13105 6.48772 6.06599 6.50067 6.00028 6.50067C5.93457 6.50067 5.86951 6.48772 5.80881 6.46256C5.74811 6.4374 5.69297 6.40052 5.64653 6.35403L0.646528 1.35403C0.552708 1.26021 0.5 1.13296 0.5 1.00028C0.5 0.867596 0.552708 0.740348 0.646528 0.646528C0.740348 0.552707 0.867596 0.5 1.00028C1.13296 0.5 1.26021 0.552707 1.35403 0.646528L6.00028 5.2934L10.6465 0.646528C10.693 0.600073 10.7481 0.563222 10.8088 0.538081C10.8695 0.51294 10.9346 0.5 11.0003 0.5C11.066 0.5 11.131 0.51294 11.1917 0.538081C11.2524 0.563222 11.3076 0.600073 11.354 0.646528C11.4005 0.692983 11.4373 0.748133 11.4625 0.80883C11.4876 0.869526 11.5006 0.934581 11.5006 1.00028C11.5006 1.06598 11.4876 1.13103 11.4625 1.19173C11.4373 1.25242 11.4005 1.30757 11.354 1.35403Z" fill="white" fillOpacity="0.4"/>
                                  </svg>
                                </div>
                              </div>
                              {experienceOpen && (
                                <div className="broker-dropdown-list">
                                  {experienceOptions.map(opt => (
                                    <button
                                      key={opt.value}
                                      type="button"
                                      className={`broker-dropdown-item ${fields.experience === opt.value ? 'broker-dropdown-item--active' : ''}`}
                                      onClick={() => { setFields(f => ({ ...f, experience: opt.value })); setExperienceOpen(false) }}
                                    >
                                      {opt[lang]}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                            {errors.experience && <div className="connect_error" style={{ display: 'block' }}>{errors.experience}</div>}
                          </div>

                          <div id="w-node-_168df956-a53e-7751-a302-0e484eb6821f-af46c2b8" className="field_wrap">
                            <input className={`connect_input-field w-input ${errors.website ? 'error' : ''}`} maxLength={256} name="website" data-name="website" placeholder={t.website} type="text" id="website" value={fields.website} onChange={handleChange} />
                            {errors.website && <div className="connect_error" style={{ display: 'block' }}>{errors.website}</div>}
                          </div>
                          <div id="w-node-_3a41a586-fc03-8b5c-7947-16d71e0d6a51-af46c2b8" className="field_wrap">
                            <input className="connect_input-field w-input" maxLength={256} name="message" data-name="message" placeholder={t.comments} type="text" id="message" value={fields.message} onChange={handleChange} />
                          </div>

                          <button type="submit" className="broker-submit-btn" disabled={status === 'loading'}>
                            {status === 'loading' && <span className="contact-spinner" style={{ position: 'absolute', top: '50%', left: '50%', marginLeft: -10, marginTop: -10, borderTopColor: '#3f4249', borderColor: 'rgba(63,66,73,0.22)' }} />}
                            <span className={status === 'loading' ? 'broker-btn-text-hidden' : ''}>{t.submit}</span>
                          </button>
                        </form>
                        )}

                        {status === 'error' && (
                          <div className="cs_error w-form-fail" style={{ display: 'block' }}>
                            <div>{t.errorText}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <CallbackV2 locale={locale} role="Broker" />

          </main>

          <HomeFooter locale={locale} />
      </div>
    </>
  )
}
