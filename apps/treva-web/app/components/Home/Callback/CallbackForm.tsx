"use client";

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import './call-back.css';
import '../../Contact/contact.css';
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
  successTitle: string;
  successText: string;
  resetBtn: string;
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
    successTitle: "Sorğunuz göndərildi!",
    successText: "Tezliklə sizinlə əlaqə saxlayacağıq.",
    resetBtn: "Yeni sorğu",
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
    successTitle: "Request Sent!",
    successText: "We'll get in touch with you soon.",
    resetBtn: "New request",
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
    successTitle: "Запрос отправлен!",
    successText: "Мы свяжемся с вами в ближайшее время.",
    resetBtn: "Новый запрос",
  },
};

type RoleType = 'Client' | 'Developer' | 'Broker';

type CallbackFormProps = {
  allowedRoles?: RoleType[];
  sectionId?: string;
};

const defaultRoles: RoleType[] = ['Client', 'Developer', 'Broker'];

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

export default function CallbackForm({ allowedRoles, sectionId }: CallbackFormProps) {
  const pathname = usePathname();
  const detectedLocale = pathname?.split("/")[1];
  const locale: Locale = (detectedLocale && detectedLocale in callbackDictionary) ? detectedLocale as Locale : "az";
  const content = callbackDictionary[locale];

  const visibleRoles: RoleType[] = allowedRoles && allowedRoles.length > 0
    ? allowedRoles
    : defaultRoles;

  const roleLabels: Record<RoleType, string> = {
    Client: content.roles.client,
    Developer: content.roles.developer,
    Broker: content.roles.broker,
  };

  const [activeRole, setActiveRole] = useState<RoleType>(visibleRoles[0] ?? 'Client');
  const [name, setName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  React.useEffect(() => {
    if (!visibleRoles.includes(activeRole)) {
      setActiveRole(visibleRoles[0] ?? 'Client');
    }
  }, [activeRole, visibleRoles]);

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
      setActiveRole(visibleRoles[0] ?? 'Client');
    } catch {
      setError('Göndərilmədi. Yenidən cəhd edin.');
    } finally {
      setSubmitting(false);
    }
  };

  const hasExtraLine = !!content.titleExtra;

  return (
    <PageContainer as="main" className="callbackContainer" {...(sectionId ? { id: sectionId } : {})}>
      {submitted ? (
        <div className="formWrapper">
          <div className="callback-success-overlay">
            <div className="contact-success-icon">
              <svg viewBox="0 0 52 52" className="contact-checkmark">
                <circle className="contact-checkmark-circle" cx="26" cy="26" r="25" fill="none" />
                <path className="contact-checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
              </svg>
            </div>
            <h3 className="callback-success-title">{content.successTitle}</h3>
            <p className="callback-success-text">{content.successText}</p>
            <button type="button" className="callback-success-btn" onClick={() => setSubmitted(false)}>{content.resetBtn}</button>
          </div>
        </div>
      ) : (
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

          {visibleRoles.length > 1 && (
          <div className="roleSelector">
            {visibleRoles.map((role) => (
              <RoleButton
                key={role}
                label={roleLabels[role]}
                isActive={activeRole === role}
                onClick={() => setActiveRole(role)}
              />
            ))}
          </div>
          )}

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

          <CallbackSubmitButton label={submitting ? '...' : content.submitLabel} disabled={submitting} />

          {error && <p style={{ color: '#ff4444', fontSize: 13, marginTop: 8, textAlign: 'center' }}>{error}</p>}

          <p className="disclaimer">
            {content.disclaimerParts.before}
            <strong>{content.disclaimerParts.bold}</strong>
            {content.disclaimerParts.after}
          </p>

        </form>
      )}
    </PageContainer>
  );
}
