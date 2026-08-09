'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Navbar from '@/app/components/Home/TrevaHero/navbar'
import { HomeFooter } from '@/app/components/Home/HomeFooter'
import { ButtonText } from '@/app/components/ButtonText'
import './not-found.css'

const dictionary = {
  az: {
    title: 'Bu səhifə mövcud deyil',
    description:
      'Axtardığınız səhifə silinib, adı dəyişdirilib və ya heç vaxt mövcud olmayıb. Aşağıdakı bağlantılardan istifadə edərək davam edə bilərsiniz.',
    primaryCta: 'Ana səhifəyə qayıt',
    secondaryCta: 'Layihələrimizə baxın',
  },
  en: {
    title: "This page doesn't exist",
    description:
      "The page you're looking for has been removed, renamed, or never existed. Use the links below to find your way back.",
    primaryCta: 'Back to homepage',
    secondaryCta: 'Browse our projects',
  },
  ru: {
    title: 'Такой страницы не существует',
    description:
      'Страница, которую вы ищете, была удалена, переименована или никогда не существовала. Воспользуйтесь ссылками ниже, чтобы продолжить.',
    primaryCta: 'На главную',
    secondaryCta: 'Смотреть проекты',
  },
} as const

type SupportedLocale = keyof typeof dictionary

export function NotFoundPage() {
  const pathname = usePathname()
  const detectedLocale = pathname?.split('/')[1]
  const locale: SupportedLocale =
    detectedLocale && detectedLocale in dictionary ? (detectedLocale as SupportedLocale) : 'az'
  const t = dictionary[locale]

  return (
    <div className="page-wrapper" data-locale={locale}>
      <Navbar locale={locale} variant="solid" />
      <main className="main-wrapper">
        <section className="notfound_section">
          <div className="notfound_glow" aria-hidden="true" />
          <div className="notfound_content">
            <p className="notfound_code notfound_fade">404</p>
            <h1 className="notfound_title notfound_fade notfound_fade--delay-1">{t.title}</h1>
            <p className="notfound_description notfound_fade notfound_fade--delay-2">{t.description}</p>
            <div className="notfound_actions notfound_fade notfound_fade--delay-3">
              <Link href={`/${locale}`} data-wf--button--variant="blue" className="button">
                <ButtonText>{t.primaryCta}</ButtonText>
              </Link>
              <Link
                href={`/${locale}/projects`}
                className="button w-variant-bc0192ac-8f77-bda0-587a-2ac5ad6e5e49 w-inline-block"
                data-wf--button--variant="ghost"
              >
                <ButtonText>{t.secondaryCta}</ButtonText>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <HomeFooter locale={locale} />
    </div>
  )
}

export default NotFoundPage
