import Link from 'next/link'
import Navbar from '@/app/components/Home/TrevaHero/navbar'
import { HomeFooter } from '@/app/components/Home/HomeFooter'
import './thank-you.css'

const COPY: Record<string, { title: string; subtitle: string; button: string }> = {
  az: {
    title: 'Müraciətiniz qəbul edildi',
    subtitle:
      'TREVA Real Estate komandası müraciətinizi nəzərdən keçirəcək və yaxın zamanda sizinlə əlaqə saxlayaraq uyğun daşınmaz əmlak seçimləri və investisiya imkanları haqqında ətraflı məlumat təqdim edəcək.',
    button: 'Ana səhifəyə qayıt',
  },
  en: {
    title: 'Your submission has been received',
    subtitle:
      'The TREVA Real Estate team will review your submission and get in touch with you shortly with suitable property options and investment opportunities.',
    button: 'Back to homepage',
  },
  ru: {
    title: 'Ваша заявка принята',
    subtitle:
      'Команда TREVA Real Estate рассмотрит вашу заявку и в ближайшее время свяжется с вами, чтобы предложить подходящие варианты недвижимости и инвестиционные возможности.',
    button: 'Вернуться на главную',
  },
}

type ThankYouPageProps = {
  locale: string
}

export function ThankYouPage({ locale }: ThankYouPageProps) {
  const copy = COPY[locale] ?? COPY.az!
  return (
    <div className="page-wrapper thankyou-page-wrapper" data-locale={locale}>
      <Navbar locale={locale} variant="solid" />

      <main className="main-wrapper">
        <section
          className="thankyou-section"
          style={{ backgroundImage: "url('/images/thank-you.png')" }}
        >
          <div className="thankyou-content">
           
            <h1 className="thankyou-title">{copy.title}</h1>
            <p className="thankyou-subtitle">{copy.subtitle}</p>
            <Link href={`/${locale}`} className="thankyou-button">
              {copy.button}
            </Link>
          </div>
        </section>
      </main>

      <HomeFooter locale={locale} />
    </div>
  )
}