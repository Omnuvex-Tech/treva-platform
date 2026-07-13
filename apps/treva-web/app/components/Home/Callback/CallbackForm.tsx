"use client";

import React, { useState, useRef, useEffect } from 'react';
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
  loading?: boolean;
};

function CallbackSubmitButton({ label, loading, ...props }: CallbackSubmitButtonProps) {
  return (
    <button type="submit" className={`submitButton ${loading ? 'is-loading' : ''}`} suppressHydrationWarning {...props}>
      {loading && <span className="callback-spinner" />}
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
  const [countryCode, setCountryCode] = useState('+994');
  const [countryFlag, setCountryFlag] = useState('/images/flags/az.png');
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const flagRef = useRef<HTMLDivElement>(null);

  const countries = [
    { code: '+994', flag: '/images/flags/az.png', name: 'Azerbaijan' },
    { code: '+90', flag: '/images/flags/tr.png', name: 'Turkey' },
    { code: '+7', flag: '/images/flags/ru.png', name: 'Russia' },
    { code: '+1', flag: '/images/flags/us.png', name: 'United States' },
    { code: '+44', flag: '/images/flags/gb.png', name: 'United Kingdom' },
    { code: '+49', flag: '/images/flags/de.png', name: 'Germany' },
    { code: '+33', flag: '/images/flags/fr.png', name: 'France' },
    { code: '+39', flag: '/images/flags/it.png', name: 'Italy' },
    { code: '+34', flag: '/images/flags/es.png', name: 'Spain' },
    { code: '+31', flag: '/images/flags/nl.png', name: 'Netherlands' },
    { code: '+32', flag: '/images/flags/be.png', name: 'Belgium' },
    { code: '+48', flag: '/images/flags/pl.png', name: 'Poland' },
    { code: '+380', flag: '/images/flags/ua.png', name: 'Ukraine' },
    { code: '+40', flag: '/images/flags/ro.png', name: 'Romania' },
    { code: '+995', flag: '/images/flags/ge.png', name: 'Georgia' },
    { code: '+998', flag: '/images/flags/uz.png', name: 'Uzbekistan' },
    { code: '+98', flag: '/images/flags/ir.png', name: 'Iran' },
    { code: '+964', flag: '/images/flags/iq.png', name: 'Iraq' },
    { code: '+966', flag: '/images/flags/sa.png', name: 'Saudi Arabia' },
    { code: '+971', flag: '/images/flags/ae.png', name: 'UAE' },
    { code: '+974', flag: '/images/flags/qa.png', name: 'Qatar' },
    { code: '+965', flag: '/images/flags/kw.png', name: 'Kuwait' },
    { code: '+972', flag: '/images/flags/il.png', name: 'Israel' },
    { code: '+20', flag: '/images/flags/eg.png', name: 'Egypt' },
    { code: '+91', flag: '/images/flags/in.png', name: 'India' },
    { code: '+86', flag: '/images/flags/cn.png', name: 'China' },
    { code: '+81', flag: '/images/flags/jp.png', name: 'Japan' },
    { code: '+82', flag: '/images/flags/kr.png', name: 'South Korea' },
    { code: '+92', flag: '/images/flags/pk.png', name: 'Pakistan' },
    { code: '+55', flag: '/images/flags/br.png', name: 'Brazil' },
    { code: '+52', flag: '/images/flags/mx.png', name: 'Mexico' },
    { code: '+54', flag: '/images/flags/ar.png', name: 'Argentina' },
    { code: '+61', flag: '/images/flags/au.png', name: 'Australia' },
    { code: '+27', flag: '/images/flags/za.png', name: 'South Africa' },
    { code: '+30', flag: '/images/flags/gr.png', name: 'Greece' },
    { code: '+351', flag: '/images/flags/pt.png', name: 'Portugal' },
    { code: '+36', flag: '/images/flags/hu.png', name: 'Hungary' },
    { code: '+420', flag: '/images/flags/cz.png', name: 'Czech Republic' },
    { code: '+43', flag: '/images/flags/at.png', name: 'Austria' },
    { code: '+41', flag: '/images/flags/ch.png', name: 'Switzerland' },
    { code: '+46', flag: '/images/flags/se.png', name: 'Sweden' },
    { code: '+47', flag: '/images/flags/no.png', name: 'Norway' },
    { code: '+45', flag: '/images/flags/dk.png', name: 'Denmark' },
    { code: '+358', flag: '/images/flags/fi.png', name: 'Finland' },
    { code: '+353', flag: '/images/flags/ie.png', name: 'Ireland' },
    { code: '+359', flag: '/images/flags/bg.png', name: 'Bulgaria' },
  ];

  useEffect(() => {
    if (!visibleRoles.includes(activeRole)) {
      setActiveRole(visibleRoles[0] ?? 'Client');
    }
  }, [activeRole, visibleRoles]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (flagRef.current && !flagRef.current.contains(e.target as Node)) {
        setShowCountryDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:10021';
      const fullPhone = `${countryCode}${phone.trim()}`;
      const res = await fetch(`${apiBase}/callback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone: fullPhone, role: activeRole }),
      });
      if (!res.ok) throw new Error('Xəta baş verdi');
      setSubmitted(true);
      setName('');
      setPhone('');
      setCountryCode('+994');
      setCountryFlag('/images/flags/az.png');
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
            <div className="phoneGroup">
              <div className="flagSelector" ref={flagRef} onClick={() => setShowCountryDropdown(!showCountryDropdown)}>
                <img src={countryFlag} alt="" className="flagImg" />
                <span className="countryCodeDisplay">{countryCode}</span>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <path d="M6 9l6 6 6-6"/>
                </svg>
                {showCountryDropdown && (
                  <div className="countryDropdown">
                    {countries.map((c) => (
                      <div
                        key={`${c.code}-${c.name}`}
                        className="countryOption"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCountryCode(c.code);
                          setCountryFlag(c.flag);
                          setShowCountryDropdown(false);
                        }}
                      >
                        <img src={c.flag} alt="" className="countryFlagImg" />
                        <span className="countryName">{c.name}</span>
                        <span className="countryCode">{c.code}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <input
                type="tel"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder={content.phonePlaceholder}
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
                className="inputField phoneInput"
                required
                suppressHydrationWarning
              />
            </div>
          </div>

          <CallbackSubmitButton label={content.submitLabel} loading={submitting} disabled={submitting} />

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
