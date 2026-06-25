"use client";

import React from "react";
import Link from "next/link";
import Navbar from "@/app/components/Home/TrevaHero/navbar";
import { HomeFooter } from "@/app/components/Home/HomeFooter";
import CallbackForm from "@/app/components/Home/Callback/CallbackForm";
import "./privacy-policy.css";

import { ButtonText } from '@/app/components/ButtonText';
/* eslint-disable @next/next/no-img-element */

interface PrivacyPolicyProps {
  locale: string;
}

const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ locale }) => {
  return (
    <div className="page-wrapper">
      <Navbar locale={locale} variant="solid" />
      
      <main className="main-wrapper">
        <section className="section_policy">
          <div className="global-padding padding-section-medium">
            <div className="container-large">
              <div className="projects_component">
                <div className="projects_intro-wrap">
                  <h1>
                    Məxfilik Siyasəti
                  </h1>
                </div>
                
                <div className="policy_wrap">
                  <div className="policy_img-wrap img-reveal">
                    <img 
                      src="https://cdn.prod.website-files.com/6825d64025f8005ef1ddfc4c/699330ca428de3a18c598073_envato-labs-image-edit.avif" 
                      loading="lazy" 
                      width="Auto" 
                      sizes="(max-width: 2000px) 100vw, 2000px" 
                      alt="A laptop computer sitting on top of a wooden desk." 
                      srcSet="https://cdn.prod.website-files.com/6825d64025f8005ef1ddfc4c/699330ca428de3a18c598073_envato-labs-image-edit-p-500.avif 500w, https://cdn.prod.website-files.com/6825d64025f8005ef1ddfc4c/699330ca428de3a18c598073_envato-labs-image-edit-p-800.avif 800w, https://cdn.prod.website-files.com/6825d64025f8005ef1ddfc4c/699330ca428de3a18c598073_envato-labs-image-edit.avif 2000w" 
                      className="fullwidth-img"
                    />
                    <div className="img-cover"></div>
                  </div>
                  
                  <div className="policy_body_wrap">
                    <div>
                      TREVA Real Estate şirkəti müştərilərin şəxsi məlumatlarını (ad və telefon nömrəsi daxil olmaqla) məhsullar, xidmətlər, kampaniyalar və tədbirlər haqqında marketinq və informasiya mesajları göndərmək məqsədilə, o cümlədən WhatsApp vasitəsilə emal edə bilər.<br/>
                      <br/>
                      Müştəriyə göndərilən ilk mesaj, məlumatlandırılmış razılığın əldə olunması üçün sorğunu ehtiva edir. Müştəri hər zaman razılıq verə və ya imtina edə bilər.<br/>
                      <br/>
                      Şirkət məlumatları yalnız razılıq çərçivəsində və şəxsi məlumatların qorunması haqqında qanunvericiliyə uyğun istifadə etməyi öhdəsinə götürür.<br/>
                      <br/>
                      Müştəri istənilən vaxt messencer vasitəsilə “Abunəliyi ləğv et” sözünü yazaraq və ya info@treva.realestate ünvanına “Abunəlikdən imtina” mövzusu ilə e-mail göndərərək mesajlardan imtina edə bilər. İmtinadan sonra şirkət qısa müddət ərzində göndərişləri dayandıracaq.<br/>
                      <br/>
                      TREVA Real Estate şirkəti məlumatları üçüncü şəxslərə ötürmür və əməkdaşların girişini məhdudlaşdırmaq, həmçinin mesajların şifrələnməsi də daxil olmaqla texniki və təşkilati təhlükəsizlik tədbirlərini tətbiq edir.
                    </div>
                    
                    <Link href={`/${locale}/contacts`} className="button w-inline-block">
                      <ButtonText>SATIŞLA ƏLAQƏ SAXLAYIN</ButtonText>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <CallbackForm />
      <HomeFooter locale={locale} />
    </div>
  );
};

export default PrivacyPolicy;
