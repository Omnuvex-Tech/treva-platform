"use client";

import React from "react";
import Link from "next/link";
import Navbar from "@/app/components/HomeV2/V2Nav";
import { HomeFooter } from "@/app/components/HomeV2/V2Footer";
import CallbackV2 from "@/app/components/HomeV2/V2Callback";
import "./privacy-policy.css";

import { ButtonText } from '@/app/components/ButtonText';
/* eslint-disable @next/next/no-img-element */

interface PrivacyPolicyProps {
  locale: string;
}

/**
 * Məxfilik siyasətinin mətni.
 *
 * DİQQƏT: bu hüquqi mətndir. Azərbaycanca variant orijinaldır; ingilis və rus
 * variantları tərcümədir və yayımdan əvvəl şirkət tərəfindən təsdiqlənməlidir.
 */
const privacyDictionary = {
  az: {
    pageTitle: 'Məxfilik Siyasəti',
    contactSales: 'SATIŞLA ƏLAQƏ SAXLAYIN',
    paragraphs: [
      'TREVA Real Estate şirkəti müştərilərin şəxsi məlumatlarını (ad və telefon nömrəsi daxil olmaqla) məhsullar, xidmətlər, kampaniyalar və tədbirlər haqqında marketinq və informasiya mesajları göndərmək məqsədilə, o cümlədən WhatsApp vasitəsilə emal edə bilər.',
      'Müştəriyə göndərilən ilk mesaj, məlumatlandırılmış razılığın əldə olunması üçün sorğunu ehtiva edir. Müştəri hər zaman razılıq verə və ya imtina edə bilər.',
      'Şirkət məlumatları yalnız razılıq çərçivəsində və şəxsi məlumatların qorunması haqqında qanunvericiliyə uyğun istifadə etməyi öhdəsinə götürür.',
      'Müştəri istənilən vaxt messencer vasitəsilə “Abunəliyi ləğv et” sözünü yazaraq və ya info@treva.realestate ünvanına “Abunəlikdən imtina” mövzusu ilə e-mail göndərərək mesajlardan imtina edə bilər. İmtinadan sonra şirkət qısa müddət ərzində göndərişləri dayandıracaq.',
      'TREVA Real Estate şirkəti məlumatları üçüncü şəxslərə ötürmür və əməkdaşların girişini məhdudlaşdırmaq, həmçinin mesajların şifrələnməsi də daxil olmaqla texniki və təşkilati təhlükəsizlik tədbirlərini tətbiq edir.',
    ],
  },
  en: {
    pageTitle: 'Privacy Policy',
    contactSales: 'CONTACT SALES',
    paragraphs: [
      'TREVA Real Estate may process customers’ personal data (including name and phone number) in order to send marketing and informational messages about products, services, campaigns and events, including via WhatsApp.',
      'The first message sent to a customer contains a request for informed consent. The customer may grant or decline consent at any time.',
      'The company undertakes to use the data only within the scope of that consent and in accordance with personal data protection legislation.',
      'A customer may opt out of messages at any time by replying “Unsubscribe” in the messenger, or by emailing info@treva.realestate with the subject “Unsubscribe”. After opting out, the company will stop sending messages within a short period.',
      'TREVA Real Estate does not transfer data to third parties and applies technical and organisational security measures, including restricting employee access and encrypting messages.',
    ],
  },
  ru: {
    pageTitle: 'Политика конфиденциальности',
    contactSales: 'СВЯЗАТЬСЯ С ОТДЕЛОМ ПРОДАЖ',
    paragraphs: [
      'Компания TREVA Real Estate может обрабатывать персональные данные клиентов (включая имя и номер телефона) для отправки маркетинговых и информационных сообщений о продуктах, услугах, кампаниях и мероприятиях, в том числе через WhatsApp.',
      'Первое сообщение, отправленное клиенту, содержит запрос на получение информированного согласия. Клиент может дать согласие или отказаться в любое время.',
      'Компания обязуется использовать данные только в рамках согласия и в соответствии с законодательством о защите персональных данных.',
      'Клиент может в любой момент отказаться от сообщений, написав в мессенджере «Отписаться», или отправив письмо на info@treva.realestate с темой «Отказ от подписки». После отказа компания прекратит рассылку в короткий срок.',
      'Компания TREVA Real Estate не передаёт данные третьим лицам и применяет технические и организационные меры безопасности, включая ограничение доступа сотрудников и шифрование сообщений.',
    ],
  },
} as const

/** Səhifə başlığındakı şəklin alt mətni. */
const imageAltByLocale = {
  az: 'Taxta iş masasının üzərində noutbuk',
  en: 'A laptop computer sitting on top of a wooden desk.',
  ru: 'Ноутбук на деревянном рабочем столе',
} as const;

const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ locale }) => {
  const imageAlt = imageAltByLocale[locale as keyof typeof imageAltByLocale] ?? imageAltByLocale.az;
  const pp = privacyDictionary[locale as keyof typeof privacyDictionary] ?? privacyDictionary.az;
  return (
    <div className="page-wrapper" data-locale={locale}>
      <Navbar locale={locale} variant="solid" />
      
      <main className="main-wrapper">
        <section className="section_policy">
          <div className="global-padding padding-section-medium">
            <div className="container-large">
              <div className="projects_component">
                <div className="projects_intro-wrap">
                  <h1>
                    {pp.pageTitle}
                  </h1>
                </div>
                
                <div className="policy_wrap">
                  <div className="policy_img-wrap img-reveal">
                    <img 
                      src="https://cdn.prod.website-files.com/6825d64025f8005ef1ddfc4c/699330ca428de3a18c598073_envato-labs-image-edit.avif" 
                      loading="lazy" 
                      width="Auto" 
                      sizes="(max-width: 2000px) 100vw, 2000px" 
                      alt={imageAlt} 
                      srcSet="https://cdn.prod.website-files.com/6825d64025f8005ef1ddfc4c/699330ca428de3a18c598073_envato-labs-image-edit-p-500.avif 500w, https://cdn.prod.website-files.com/6825d64025f8005ef1ddfc4c/699330ca428de3a18c598073_envato-labs-image-edit-p-800.avif 800w, https://cdn.prod.website-files.com/6825d64025f8005ef1ddfc4c/699330ca428de3a18c598073_envato-labs-image-edit.avif 2000w" 
                      className="fullwidth-img"
                    />
                    <div className="img-cover"></div>
                  </div>
                  
                  <div className="policy_body_wrap">
                    <div>
                      {pp.paragraphs.map((text, i) => (
                        <React.Fragment key={i}>
                          {text}
                          {i < pp.paragraphs.length - 1 && (<><br/><br/></>)}
                        </React.Fragment>
                      ))}
                    </div>
                    
                    <Link href={`/${locale}/contact`} className="button w-inline-block">
                      <ButtonText>{pp.contactSales}</ButtonText>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <CallbackV2 locale={locale} />
      <HomeFooter locale={locale} />
    </div>
  );
};

export default PrivacyPolicy;
