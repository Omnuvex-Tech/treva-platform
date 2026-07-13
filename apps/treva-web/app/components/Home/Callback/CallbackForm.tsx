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
  const [phonePlaceholder, setPhonePlaceholder] = useState('050 123 45 67');
  const [phoneMaxLength, setPhoneMaxLength] = useState(10);
  const [phoneFormat, setPhoneFormat] = useState('XXX XXX XX XX');
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const flagRef = useRef<HTMLDivElement>(null);

  const countries = [
    { code: '+994', flag: '/images/flags/az.png', name: 'Azerbaijan', placeholder: '050 123 45 67', maxLength: 10, format: 'XXX XXX XX XX' },
    { code: '+90', flag: '/images/flags/tr.png', name: 'Turkey', placeholder: '532 123 45 67', maxLength: 10, format: 'XXX XXX XX XX' },
    { code: '+7', flag: '/images/flags/ru.png', name: 'Russia', placeholder: '905 123 45 67', maxLength: 10, format: 'XXX XXX XX XX' },
    { code: '+1', flag: '/images/flags/us.png', name: 'United States', placeholder: '202 555 1234', maxLength: 10, format: 'XXX XXX XXXX' },
    { code: '+44', flag: '/images/flags/gb.png', name: 'United Kingdom', placeholder: '7911 123456', maxLength: 10, format: 'XXXX XXXXXX' },
    { code: '+49', flag: '/images/flags/de.png', name: 'Germany', placeholder: '151 12345678', maxLength: 11, format: 'XXX XXXXXXXX' },
    { code: '+33', flag: '/images/flags/fr.png', name: 'France', placeholder: '6 12 34 56 78', maxLength: 9, format: 'X XX XX XX XX' },
    { code: '+39', flag: '/images/flags/it.png', name: 'Italy', placeholder: '320 123 4567', maxLength: 10, format: 'XXX XXX XXXX' },
    { code: '+34', flag: '/images/flags/es.png', name: 'Spain', placeholder: '612 345 678', maxLength: 9, format: 'XXX XXX XXX' },
    { code: '+31', flag: '/images/flags/nl.png', name: 'Netherlands', placeholder: '6 12345678', maxLength: 9, format: 'X XXXXXXXX' },
    { code: '+32', flag: '/images/flags/be.png', name: 'Belgium', placeholder: '470 123 456', maxLength: 9, format: 'XXX XXX XXX' },
    { code: '+48', flag: '/images/flags/pl.png', name: 'Poland', placeholder: '501 234 567', maxLength: 9, format: 'XXX XXX XXX' },
    { code: '+380', flag: '/images/flags/ua.png', name: 'Ukraine', placeholder: '50 123 45 67', maxLength: 9, format: 'XX XXX XX XX' },
    { code: '+40', flag: '/images/flags/ro.png', name: 'Romania', placeholder: '721 234 567', maxLength: 9, format: 'XXX XXX XXX' },
    { code: '+995', flag: '/images/flags/ge.png', name: 'Georgia', placeholder: '555 123 456', maxLength: 9, format: 'XXX XXX XXX' },
    { code: '+998', flag: '/images/flags/uz.png', name: 'Uzbekistan', placeholder: '90 123 45 67', maxLength: 9, format: 'XX XXX XX XX' },
    { code: '+98', flag: '/images/flags/ir.png', name: 'Iran', placeholder: '912 345 6789', maxLength: 10, format: 'XXX XXX XXXX' },
    { code: '+964', flag: '/images/flags/iq.png', name: 'Iraq', placeholder: '770 123 4567', maxLength: 10, format: 'XXX XXX XXXX' },
    { code: '+966', flag: '/images/flags/sa.png', name: 'Saudi Arabia', placeholder: '50 123 4567', maxLength: 9, format: 'XX XXX XXXX' },
    { code: '+971', flag: '/images/flags/ae.png', name: 'UAE', placeholder: '50 123 4567', maxLength: 9, format: 'XX XXX XXXX' },
    { code: '+974', flag: '/images/flags/qa.png', name: 'Qatar', placeholder: '5512 3456', maxLength: 8, format: 'XXXX XXXX' },
    { code: '+965', flag: '/images/flags/kw.png', name: 'Kuwait', placeholder: '5012 3456', maxLength: 8, format: 'XXXX XXXX' },
    { code: '+972', flag: '/images/flags/il.png', name: 'Israel', placeholder: '50 123 4567', maxLength: 9, format: 'XX XXX XXXX' },
    { code: '+20', flag: '/images/flags/eg.png', name: 'Egypt', placeholder: '10 0123 4567', maxLength: 10, format: 'XX XXXX XXXX' },
    { code: '+91', flag: '/images/flags/in.png', name: 'India', placeholder: '98765 43210', maxLength: 10, format: 'XXXXX XXXXX' },
    { code: '+86', flag: '/images/flags/cn.png', name: 'China', placeholder: '138 1234 5678', maxLength: 11, format: 'XXX XXXX XXXX' },
    { code: '+81', flag: '/images/flags/jp.png', name: 'Japan', placeholder: '90 1234 5678', maxLength: 10, format: 'XX XXXX XXXX' },
    { code: '+82', flag: '/images/flags/kr.png', name: 'South Korea', placeholder: '10 1234 5678', maxLength: 10, format: 'XX XXXX XXXX' },
    { code: '+92', flag: '/images/flags/pk.png', name: 'Pakistan', placeholder: '300 123 4567', maxLength: 10, format: 'XXX XXX XXXX' },
    { code: '+55', flag: '/images/flags/br.png', name: 'Brazil', placeholder: '11 91234 5678', maxLength: 11, format: 'XX XXXXX XXXX' },
    { code: '+52', flag: '/images/flags/mx.png', name: 'Mexico', placeholder: '55 1234 5678', maxLength: 10, format: 'XX XXXX XXXX' },
    { code: '+54', flag: '/images/flags/ar.png', name: 'Argentina', placeholder: '11 1234 5678', maxLength: 10, format: 'XX XXXX XXXX' },
    { code: '+61', flag: '/images/flags/au.png', name: 'Australia', placeholder: '412 345 678', maxLength: 9, format: 'XXX XXX XXX' },
    { code: '+27', flag: '/images/flags/za.png', name: 'South Africa', placeholder: '82 123 4567', maxLength: 9, format: 'XX XXX XXXX' },
    { code: '+30', flag: '/images/flags/gr.png', name: 'Greece', placeholder: '691 234 5678', maxLength: 10, format: 'XXX XXX XXXX' },
    { code: '+351', flag: '/images/flags/pt.png', name: 'Portugal', placeholder: '912 345 678', maxLength: 9, format: 'XXX XXX XXX' },
    { code: '+36', flag: '/images/flags/hu.png', name: 'Hungary', placeholder: '20 123 4567', maxLength: 9, format: 'XX XXX XXXX' },
    { code: '+420', flag: '/images/flags/cz.png', name: 'Czech Republic', placeholder: '601 234 567', maxLength: 9, format: 'XXX XXX XXX' },
    { code: '+43', flag: '/images/flags/at.png', name: 'Austria', placeholder: '660 1234567', maxLength: 10, format: 'XXX XXXXXXX' },
    { code: '+41', flag: '/images/flags/ch.png', name: 'Switzerland', placeholder: '76 123 45 67', maxLength: 9, format: 'XX XXX XX XX' },
    { code: '+46', flag: '/images/flags/se.png', name: 'Sweden', placeholder: '70 123 45 67', maxLength: 9, format: 'XX XXX XX XX' },
    { code: '+47', flag: '/images/flags/no.png', name: 'Norway', placeholder: '401 23 456', maxLength: 8, format: 'XXX XX XXX' },
    { code: '+45', flag: '/images/flags/dk.png', name: 'Denmark', placeholder: '20 12 34 56', maxLength: 8, format: 'XX XX XX XX' },
    { code: '+358', flag: '/images/flags/fi.png', name: 'Finland', placeholder: '40 123 4567', maxLength: 9, format: 'XX XXX XXXX' },
    { code: '+353', flag: '/images/flags/ie.png', name: 'Ireland', placeholder: '86 123 4567', maxLength: 9, format: 'XX XXX XXXX' },
    { code: '+359', flag: '/images/flags/bg.png', name: 'Bulgaria', placeholder: '87 123 4567', maxLength: 9, format: 'XX XXX XXXX' },
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
      const rawPhone = phone.replace(/\s/g, '');
      const fullPhone = `${countryCode}${rawPhone}`;
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
      setPhonePlaceholder('050 123 45 67');
      setPhoneMaxLength(10);
      setPhoneFormat('XXX XXX XX XX');
      setActiveRole(visibleRoles[0] ?? 'Client');
    } catch {
      setError('Göndərilmədi. Yenidən cəhd edin.');
    } finally {
      setSubmitting(false);
    }
  };

  const hasExtraLine = !!content.titleExtra;

  function formatPhoneNumber(raw: string, fmt: string): string {
    let idx = 0;
    let out = '';
    for (const ch of fmt) {
      if (idx >= raw.length) break;
      if (ch === 'X') { out += raw[idx]; idx++; }
      else { out += ch; }
    }
    return out;
  }

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
            <button type="button" className="callback-success-btn" onClick={() => setSubmitted(false)}>
              <ButtonText>{content.resetBtn}</ButtonText>
            </button>
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
                          setPhonePlaceholder(c.placeholder);
                          setPhoneMaxLength(c.maxLength);
                          setPhoneFormat(c.format);
                          setPhone('');
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
                placeholder={phonePlaceholder}
                maxLength={phoneMaxLength}
                value={phone}
                onChange={(e) => {
                  const raw = e.target.value.replace(/[^0-9]/g, '');
                  setPhone(formatPhoneNumber(raw, phoneFormat));
                }}
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
