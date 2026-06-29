"use client";

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import './call-back.css';
import PageContainer from '@/app/components/Container/PageContainer';
import { ButtonText } from '@/app/components/ButtonText';

type Locale = 'az' | 'en' | 'ru';

const callbackDictionary: Record<Locale, {
  titleTop: string;
  titleBottom: string;
  titleExtra?: string;
  subtitle: string;
  roles: { client: string; developer: string; broker: string };
  namePlaceholder: string;
  phonePlaceholder: string;
  submitLabel: string;
  disclaimerParts: { before: string; bold: string; after: string };
}> = {
  az: {
    titleTop: "İLK ADDIMI",
    titleBottom: "ATMAĞA HAZIRSINIZ?",
    subtitle: "Mütəxəssislərimiz məmnuniyyətlə sizinlə əlaqə saxlayaraq lazımi dəstəyi göstərəcək.",
    roles: { client: "Müştəri", developer: "Developer", broker: "Broker" },
    namePlaceholder: "Adınız",
    phonePlaceholder: "Telefon nömrəniz",
    submitLabel: "Əlaqə saxla",
    disclaimerParts: { before: "Düyməyə basmaqla, ", bold: "şəxsi məlumatların", after: " işlənməsinə razılığınızı təsdiq edirsiniz." },
  },
  en: {
    titleTop: "READY TO TAKE",
    titleBottom: "THE FIRST STEP?",
    subtitle: "Request a callback. One of our managers will be happy to assist you.",
    roles: { client: "Client", developer: "Developer", broker: "Broker" },
    namePlaceholder: "Your Name",
    phonePlaceholder: "Phone Number",
    submitLabel: "Contact me",
    disclaimerParts: { before: "By clicking the button, you confirm your consent to the processing of ", bold: "personal data", after: "." },
  },
  ru: {
    titleTop: "ГОТОВЫ СТАТЬ",
    titleBottom: "ПЕРВЫЙ ШАГ?",
    subtitle: "Запросите обратный вызов. Один из наших менеджеров с радостью свяжется с вами и окажет необходимую поддержку.",
    roles: { client: "Клиент", developer: "Застройщик", broker: "Брокер" },
    namePlaceholder: "Ваше имя",
    phonePlaceholder: "Номер телефона",
    submitLabel: "Связаться со мной",
    disclaimerParts: { before: "Нажимая кнопку, вы подтверждаете согласие на обработку ", bold: "персональных данных", after: "." },
  },
};

type RoleType = 'Client' | 'Developer' | 'Broker';

type RoleButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  isActive: boolean;
};

function RoleButton({ label, isActive, ...props }: RoleButtonProps) {
  return (
    <button
      type="button"
      className={`roleButton ${isActive ? 'activeRole' : ''}`}
      suppressHydrationWarning
      {...props}
    >
      {label}
    </button>
  );
}

type CallbackSubmitButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
};

function CallbackSubmitButton({ label, ...props }: CallbackSubmitButtonProps) {
  return (
    <button type="submit" className="submitButton" suppressHydrationWarning {...props}>
      <ButtonText>{label}</ButtonText>
    </button>
  );
}

export default function CallbackForm() {
  const pathname = usePathname();
  const detectedLocale = pathname?.split("/")[1];
  const locale: Locale = (detectedLocale && detectedLocale in callbackDictionary) ? detectedLocale as Locale : "az";
  const content = callbackDictionary[locale];

  const roleKeyMap: Record<Locale, RoleType[]> = {
    az: ['Client', 'Developer', 'Broker'],
    en: ['Client', 'Developer', 'Broker'],
    ru: ['Client', 'Developer', 'Broker'],
  };
  const roleLabels: Record<RoleType, Record<Locale, string>> = {
    Client: { az: content.roles.client, en: content.roles.client, ru: content.roles.client },
    Developer: { az: content.roles.developer, en: content.roles.developer, ru: content.roles.developer },
    Broker: { az: content.roles.broker, en: content.roles.broker, ru: content.roles.broker },
  };

  const [activeRole, setActiveRole] = useState<RoleType>('Client');
  const [name, setName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:10021';
      const res = await fetch(`${apiBase}/callback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, role: activeRole }),
      });
      if (!res.ok) throw new Error('Xəta baş verdi');
      setSubmitted(true);
      setName('');
      setPhone('');
      setActiveRole('Client');
    } catch {
      setError('Göndərilmədi. Yenidən cəhd edin.');
    } finally {
      setSubmitting(false);
    }
  };

  const hasExtraLine = !!content.titleExtra;

  return (
    <PageContainer as="main" className="callbackContainer">
      <form onSubmit={handleSubmit} className="formWrapper">
        
        <div className="headerContainer">
          {hasExtraLine && <div className="bgLineTopExtra"></div>}
          <div className="bgLineTop"></div>
          <div className="bgLineBottom"></div>
          <h1 className="title no-animate">
            <span className="titleTop">{content.titleTop}</span>
            {hasExtraLine && <span className="titleMiddle">{content.titleExtra}</span>}
            <span className="titleBottom">{content.titleBottom}</span>
          </h1>
        </div>

        <p className="subtitle no-animate">
          {content.subtitle}
        </p>

        <div className="roleSelector">
          {roleKeyMap[locale].map((role) => (
            <RoleButton
              key={role}
              label={roleLabels[role][locale]}
              isActive={activeRole === role}
              onClick={() => setActiveRole(role)}
            />
          ))}
        </div>

        <div className="inputGroup">
          <input
            type="text"
            placeholder={content.namePlaceholder}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="inputField"
            required
            suppressHydrationWarning
          />
          <input
            type="tel"
            placeholder={content.phonePlaceholder}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="inputField"
            required
            suppressHydrationWarning
          />
        </div>

        <CallbackSubmitButton label={submitting ? '...' : (submitted ? (locale === 'az' ? 'Göndərildi!' : locale === 'en' ? 'Sent!' : 'Отправлено!') : content.submitLabel)} disabled={submitting} />

        {error && <p style={{ color: '#ff4444', fontSize: 13, marginTop: 8, textAlign: 'center' }}>{error}</p>}
        {submitted && <p style={{ color: '#22c55e', fontSize: 13, marginTop: 8, textAlign: 'center' }}>{locale === 'az' ? 'Sorğunuz qəbul edildi. Tezliklə əlaqə saxlayacağıq.' : locale === 'en' ? 'Your request has been received. We will contact you shortly.' : 'Ваш запрос принят. Мы свяжемся с вами в ближайшее время.'}</p>}

        <p className="disclaimer">
          {content.disclaimerParts.before}
          <strong>{content.disclaimerParts.bold}</strong>
          {content.disclaimerParts.after}
        </p>

      </form>
    </PageContainer>
  );
}
