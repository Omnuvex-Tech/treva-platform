"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import PageContainer from '@/app/components/Container/PageContainer';
import './about-us.css';

const aboutDictionary = {
  az: {
    titleLight: "Haqqımızda",
    titleBold: "",
    paragraphs: [
      "Biz alıcı, developer və brokerləri vahid satış ekosistemində birləşdirən daşınmaz əmlak platformasıyıq. Portfelimizdəki hər bir aktivi gələcək dəyəri və dayanıqlı qazanc potensialına görə seçirik.",
      "Satışdan investisiya məsləhət xidmətlərinə qədər, hədəflərinizə uyğun həllər təqdim edirik.",
      "Missiyamız sadədir: Bakının dinamik daşınmaz əmlak bazarında etibarlı qərarlar qəbul etməyinizə və davamlı böyümə əldə etməyinizə kömək etmək.",
    ],
    services: [
      {
        title: "Satış və marketinq",
        desc: "Eksklüziv daşınmaz əmlak imkanlarını effektiv təqdim edərək, əmlakı düzgün alıcılarla birləşdiririk.",
      },
      {
        title: "CRM və lead idarəetməsi",
        desc: "Müştəri münasibətlərini və potensial müştəri axınlarını sistematik idarə edərək, əla nəticələr əldə edirik.",
      },
      {
        title: "Broker şəbəkəsinin aktivləşdirilməsi",
        desc: "Broker əməkdaşlıqlarını gücləndirir, bazar əhatəmizi genişləndirir və satış effektivliyini maksimuma çatdırırıq.",
      },
      {
        title: "Investisiya məsləhəti",
        desc: "Peşəkar məsləhət və strateji bazar təhlili təqdim edərək, düzgün investisiya qərarlarını təmin edirik.",
      },
    ],
  },
  en: {
    titleLight: "About",
    titleBold: "Us",
    paragraphs: [
      "At TREVA Real Estate, we bring together deep market expertise, innovative strategies, and a client-first approach to unlock real value in every deal.",
      "From property sales to investment advisory, we provide end-to-end solutions tailored to your goals.",
      "Our mission is simple: to help you make confident decisions and achieve sustainable growth in Baku's dynamic real estate market.",
    ],
    services: [
      {
        title: "Sales & Marketing",
        desc: "Effectively showcasing exclusive real estate opportunities to connect properties with the right buyers.",
      },
      {
        title: "CRM & Lead Management",
        desc: "Systematically managing client relationships and lead pipelines to drive superior performance and results.",
      },
      {
        title: "Broker Network Activation",
        desc: "Empowering broker collaborations, expanding market reach, and maximizing overall sales efficiency.",
      },
      {
        title: "Investment Advisory",
        desc: "Providing expert counsel and strategic market analysis to guarantee well-informed investment decisions.",
      },
    ],
  },
  ru: {
    titleLight: "О",
    titleBold: "Нас",
    paragraphs: [
      "В TREVA Real Estate мы объединяем глубокие знания рынка, инновационные стратегии и индивидуальный подход для раскрытия реальной стоимости каждой сделки.",
      "От продажи недвижимости до инвестиционного консалтинга — мы предоставляем комплексные решения, адаптированные под ваши цели.",
      "Наша миссия проста: помочь вам принимать уверенные решения и достигать устойчивого роста на динамичном рынке недвижимости Баку.",
    ],
    services: [
      {
        title: "Продажи и маркетинг",
        desc: "Эффективная презентация эксклюзивных возможностей недвижимости для соединения объектов с подходящими покупателями.",
      },
      {
        title: "CRM и управление лидами",
        desc: "Систематическое управление клиентскими отношениями и воронкой лидов для достижения превосходных результатов.",
      },
      {
        title: "Активация сети брокеров",
        desc: "Укрепление сотрудничества с брокерами, расширение охвата рынка и максимизация эффективности продаж.",
      },
      {
        title: "Инвестиционный консалтинг",
        desc: "Экспертные консультации и стратегический анализ рынка для принятия взвешенных инвестиционных решений.",
      },
    ],
  },
} as const;

const serviceIcons = [
  <svg key="0" className="services-list__icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path opacity="0.8" d="M13.9412 15.3596V5.1725M13.9412 15.3596L21.064 19.3645C21.2608 19.4751 21.4836 19.5329 21.7103 19.5321C21.9369 19.5314 22.1593 19.4721 22.3553 19.3602C22.5514 19.2483 22.7141 19.0877 22.8272 18.8944C22.9403 18.7012 22.9999 18.4822 23 18.2592V2.27298C22.9999 2.04999 22.9403 1.83092 22.8272 1.6377C22.7141 1.44448 22.5514 1.28388 22.3553 1.17197C21.1593 1.06006 21.9369 1.00076 21.7103 1.00001C21.4836 0.999254 21.2608 1.05707 21.064 1.16768L13.9412 5.1725M13.9412 15.3596H10.0588M13.9412 5.1725H6.17647C4.80359 5.1725 3.48693 5.70914 2.51615 6.66437C1.54538 7.6196 1 8.91517 1 10.2661C1 11.617 1.54538 12.9125 2.51615 13.8678C3.48693 14.823 4.80359 15.3596 6.17647 15.3596M10.0588 15.3596V21.0899C10.0588 21.5965 9.85431 22.0823 9.49027 22.4405C9.12623 22.7988 8.63248 23 8.11765 23C7.60282 23 7.10907 22.7988 6.74503 22.4405C6.38099 22.0823 6.17647 21.5965 6.17647 21.0899V15.3596M10.0588 15.3596H6.17647" stroke="#4E525D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  <svg key="1" className="services-list__icon" width="30" height="25" viewBox="0 0 30 25" fill="none" xmlns="http://www.w3.org/2000/svg"><path opacity="0.8" d="M19.458 0.303121C20.5507-0.0626662 21.7256-0.0984768 22.8379 0.201559C23.95 0.501622 24.9507 1.12399 25.7188 1.98867C26.4863 2.85301 26.9895 3.92377 27.1699 5.06972C27.3502 6.21587 27.2001 7.39201 26.7373 8.45449C26.3409 9.36425 25.7276 10.1581 24.9561 10.768C25.7517 11.1727 26.4484 11.7146 27.0312 12.3705C28.3705 13.8777 29.0497 15.9149 29.0498 18.0883C29.0496 18.6678 28.5795 19.1378 28 19.1381C27.4202 19.1381 26.9504 18.668 26.9502 18.0883C26.9501 16.3419 26.4047 14.8282 25.4609 13.766C24.5303 12.7187 23.1513 12.0387 21.3164 12.0385H21.3135C21.0626 12.038 20.8146 12.0213 20.5703 11.9906C20.3368 13.1842 19.7543 14.2919 18.8818 15.1644C18.6069 15.4394 18.3071 15.6841 17.9902 15.8998C21.0248 17.1536 23.1883 19.9808 23.1885 23.3529C23.1885 23.9326 22.7183 24.4024 22.1387 24.4027C21.5588 24.4027 21.0889 23.9328 21.0889 23.3529C21.0886 20.0876 18.2037 17.3043 14.4717 17.3041C10.7394 17.3041 7.85477 20.0875 7.85449 23.3529C7.85449 23.9327 7.38441 24.4025 6.80469 24.4027C6.22479 24.4027 5.75488 23.9328 5.75488 23.3529C5.75508 19.9559 7.94961 17.111 11.0195 15.8715C10.7178 15.6626 10.4321 15.4275 10.1689 15.1644C9.37678 14.3723 8.82195 13.3869 8.55176 12.3187C8.52959 12.3201 8.5069 12.3226 8.48438 12.3227C4.80916 12.3229 2.09961 15.1669 2.09961 18.7074C2.09937 19.2871 1.62955 19.7572 1.0498 19.7572C0.470255 19.757 0.000241229 19.287 0 18.7074C0 15.3906 1.82657 12.5062 4.62793 11.1127C4.00786 10.7162 3.46234 10.2052 3.02246 9.60195C2.2966 8.60632 1.8922 7.40861 1.86133 6.17324C1.83055 4.93795 2.17474 3.7212 2.84961 2.68984C3.52474 1.65829 4.49908 0.860964 5.64062 0.410543C6.78241-0.0398197 8.0345-0.121121 9.22363 0.180074C10.4126 0.481331 11.4785 1.14896 12.2764 2.0873C12.9212 2.84568 13.3651 3.75215 13.5762 4.72109C13.8895 4.67232 14.207 4.64687 14.5254 4.64687C14.8606 4.6469 15.1942 4.67583 15.5234 4.729C15.3151 3.47743 15.6624 2.20315 16.4866 1.22363C17.3107 0.24411 18.5412-0.292932 19.458 0.303121ZM9.22363 4.64687C8.39858 4.64687 7.58897 4.8927 6.88813 5.35657C6.18729 5.82043 5.62365 6.48402 5.25871 7.26816C4.89378 8.05231 4.74188 8.92673 4.81997 9.78794C4.89805 10.6492 5.20288 11.4627 5.69783 12.1361C6.19278 12.8096 6.85898 13.3168 7.61942 13.5987C8.37987 13.8806 9.20153 13.9259 9.98786 13.7293C10.7742 13.5328 11.4917 13.1024 12.0536 12.4917C12.6155 11.881 12.9978 11.115 13.1536 10.2936C12.2573 9.82443 11.5758 9.06806 11.2358 8.16809C10.8958 7.26811 10.9205 6.28907 11.3045 5.40659C11.6885 4.52412 12.4003 3.80547 13.2913 3.39802C13.2259 3.35966 13.1634 3.31647 13.1043 3.26888C12.2884 2.61876 11.2554 2.35722 10.2534 2.55373C9.25136 2.75024 8.38927 3.38284 7.90764 4.26813C8.31635 4.50387 8.76231 4.64688 9.22363 4.64687Z" fill="#4E525D"/></svg>,
  <svg key="2" className="services-list__icon" width="29" height="29" viewBox="0 0 29 29" fill="none" xmlns="http://www.w3.org/2000/svg"><path opacity="0.8" d="M14.4023 0C14.4812 1.31165e-05 14.5596 0.00223026 14.6377 0.00683594C18.2664 0.119633 21.5529 1.59063 24.001 3.92773C24.1255 3.98448 24.2376 4.07366 24.3223 4.19336C24.3505 4.23332 24.3736 4.27551 24.3936 4.31836C26.8585 6.86179 28.376 10.3242 28.376 14.1406C28.3757 21.8021 22.2621 28.0354 14.6377 28.2725C14.5596 28.2771 14.4812 28.2812 14.4023 28.2812C14.3793 28.2812 14.356 28.2797 14.333 28.2793C14.2846 28.2798 14.2361 28.2812 14.1875 28.2812C6.35504 28.2811 0.000332405 21.9523 0 14.1406C0 6.3287 6.35483 0.000145889 14.1875 0C14.2367 2.89284e-07 14.2859 0.000477791 14.335 0.000976562C14.3573 0.000601899 14.3799 0 14.4023 0ZM13.7568 20.6445C12.3008 20.7282 10.9076 21.013 9.61035 21.4697C9.84098 22.0918 10.0968 22.6723 10.375 23.2021C11.4046 25.1628 12.6261 26.2757 13.7568 26.5869V20.6445ZM15.3564 26.4844C16.3973 26.0683 17.4923 24.9853 18.4287 23.2021C18.7293 22.6297 19.0045 21.9988 19.249 21.3193C18.0224 20.931 16.7159 20.694 15.3564 20.6328V26.4844ZM8.13184 22.083C7.41379 22.4286 6.73348 22.8282 6.09863 23.2773C5.98257 23.3594 5.85175 23.4053 5.71973 23.4189C7.04866 24.6235 8.63742 25.5483 10.3926 26.1006C9.85849 25.4742 9.37673 24.7427 8.95801 23.9453C8.65584 23.3698 8.38011 22.7459 8.13184 22.083ZM20.7461 21.8857C20.4796 22.623 20.1778 23.3128 19.8457 23.9453C19.4711 24.6587 19.0428 25.3167 18.5752 25.8965C20.2353 25.2812 21.7276 24.3258 22.9717 23.1172C22.2777 22.6473 21.5335 22.2336 20.7461 21.8857ZM1.63477 15.0947C1.85059 17.9501 3.02799 20.5389 4.84375 22.542C4.86688 22.3209 4.979 22.1103 5.1748 21.9717C5.93951 21.4307 6.76203 20.9558 7.63086 20.5518C7.16193 18.8922 6.86573 17.0452 6.79199 15.0947H1.63477ZM22.0117 15.0947C21.9409 16.9673 21.6635 18.744 21.2266 20.3516C22.2333 20.7828 23.1812 21.3091 24.0557 21.9199C25.5708 20.0148 26.5451 17.6636 26.7393 15.0947H22.0117ZM8.39258 15.0947C8.4629 16.9435 8.76696 18.6964 9.27832 20.291C8.26769 19.8594 7.31927 19.3327 6.44434 18.7214C4.92895 20.6274 3.95461 22.9796 3.76038 15.0947H8.39258ZM14.4023 2.10059C14.3537 2.10059 14.3053 2.10243 14.2568 2.10605C12.7523 2.25689 11.4183 3.03431 10.5557 4.22266C9.69308 5.41101 9.38517 6.90565 9.61035 8.3457C10.8589 8.0736 12.0508 7.56287 13.0954 6.85596C13.5931 6.51913 14.0401 6.12573 14.4251 5.68457C14.4174 5.09694 14.4135 4.50847 14.4135 3.91919C14.4098 3.31332 14.406 2.7066 14.4023 2.10059Z" fill="#4E525D"/></svg>,
  <svg key="3" className="services-list__icon" width="28" height="25" viewBox="0 0 28 25" fill="none" xmlns="http://www.w3.org/2000/svg"><path opacity="0.8" d="M16.0029 0C16.9284 0 17.8117 0.376617 18.459 1.03809C19.1054 1.69893 19.4647 2.59086 19.4648 3.51562V4.82422H23.625C25.5789 4.82447 27.1825 6.39389 27.1826 8.35449V20.7588C27.1823 22.7192 25.5788 24.2888 23.625 24.2891H3.55859C1.60479 24.2888 0.000346824 22.7192 0 20.7588V8.35449C0.000147825 6.3939 1.60467 4.82447 3.55859 4.82422H7.71777V3.51562C7.71788 2.59084 8.07723 1.69893 8.72363 1.03809C9.37088 0.376459 10.2542 0.000125847 11.1797 0H16.0029ZM19.4648 22.1895H23.625C24.4409 22.1892 25.0827 21.5376 25.083 20.7588V8.35449C25.0829 7.57549 24.4411 6.92407 23.625 6.92383H19.4648V22.1895ZM9.81738 22.1895H17.3652V6.92383H9.81738V22.1895ZM3.55859 6.92383C2.74255 6.92408 2.09976 7.5755 2.09961 8.35449V20.7588C2.09996 21.5376 2.74268 22.1892 3.55859 22.1895H7.71777V6.92383H3.55859ZM11.1797 2.09961C10.8263 2.09973 10.4817 2.24311 10.2246 2.50586C9.96669 2.76953 9.81748 3.13303 9.81738 3.51562V4.82422H17.3652V3.51562C17.3651 3.13302 17.2159 2.76953 16.958 2.50586C16.7008 2.24323 16.3563 2.09961 16.0029 2.09961H11.1797Z" fill="#4E525D"/></svg>,
];

type AboutUsProps = {
  locale?: string;
};

export default function AboutUs({ locale = 'az' }: AboutUsProps) {
  const pathname = usePathname();
  const detectedLocale = pathname?.split("/")[1];
  const activeLocale = (detectedLocale && detectedLocale in aboutDictionary) ? detectedLocale as keyof typeof aboutDictionary : locale as keyof typeof aboutDictionary;
  const content = aboutDictionary[activeLocale];
  return (
    <main className="about-container">
      <PageContainer>
        {/* Hero Section */}
        <section className="about-hero">
          <div className="about-hero__content">
            <h1 className="about-hero__title">
              <span className="about-hero__title-about">{content.titleLight}</span>
              {content.titleBold && (
                <>
                  {' '}
                  <span className="about-hero__title-us">{content.titleBold}</span>
                </>
              )}
            </h1>
            <div className="about-hero__description">
              {content.paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </div>
          <div className="about-hero__image-wrapper">
            <img className="about-hero__image" src="/images/about-us/aboutus.jpeg" alt="TREVA Real Estate" />
          </div>
        </section>

        {/* Services List Section */}
        <section className="services-list">
          {content.services.map((service, i) => (
            <div key={i} className="services-list__item">
              <div className="services-list__left-side">
                <div className="services-list__icon-container">
                  {serviceIcons[i]}
                </div>
                <h2 className="services-list__title">{service.title}</h2>
              </div>
              <div className="services-list__right-side">
                <p className="services-list__desc-text">{service.desc}</p>
              </div>
            </div>
          ))}
        </section>
      </PageContainer>
    </main>
  );
}