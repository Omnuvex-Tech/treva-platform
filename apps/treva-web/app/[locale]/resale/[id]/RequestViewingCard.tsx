'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useCreateRequest } from '@/hooks/use-resale-apartments';
import '../../../components/Contact/contact.css';
import './property-info-cards.css';

interface RequestViewingCardProps {
  className?: string;
}

export default function RequestViewingCard({ className = '' }: RequestViewingCardProps) {
  const pathname = usePathname();
  const detectedLocale = pathname?.split('/')[1];
  const locale = (detectedLocale && ['az', 'en', 'ru'].includes(detectedLocale)) ? detectedLocale : 'az';

  const texts = {
    az: {
      title: 'Mənzilə Baxış Sorğusu',
      desc: 'Əmlak məsləhətçimiz yaxın zamanda sizinlə əlaqə saxlayaraq görüşü koordinasiya edəcək və ətraflı təqdimat edəcək.',
      name: 'Adınız',
      send: 'Sorğu göndər',
      error: 'Xəta baş verdi. Zəhmət olmasa yenidən cəhd edin.',
      successTitle: 'Sorğunuz göndərildi!',
      successText: 'Tezliklə sizinlə əlaqə saxlayacağıq.',
      successBtn: 'Yeni sorğu',
    },
    en: {
      title: 'Request a Viewing',
      desc: 'A real estate consultant will confirm your appointment shortly to coordinate the meeting and provide a comprehensive guided tour.',
      name: 'Your Name',
      send: 'Send request',
      error: 'Something went wrong. Please try again.',
      successTitle: 'Request Sent!',
      successText: "We'll get in touch with you soon.",
      successBtn: 'New request',
    },
    ru: {
      title: 'Запрос на просмотр',
      desc: 'Консультант по недвижимости скоро свяжется с вами, чтобы согласовать встречу и провести подробный показ.',
      name: 'Ваше имя',
      send: 'Отправить запрос',
      error: 'Что-то пошло не так. Пожалуйста, попробуйте снова.',
      successTitle: 'Запрос отправлен!',
      successText: 'Мы свяжемся с вами в ближайшее время.',
      successBtn: 'Новый запрос',
    },
  } as const;

  const t = texts[locale as keyof typeof texts] || texts.az;
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+994');
  const [countryFlag, setCountryFlag] = useState('/images/flags/az.png');
  const [phonePlaceholder, setPhonePlaceholder] = useState('50 123 45 67');
  const [phoneMaxLength, setPhoneMaxLength] = useState(9);
  const [phoneFormat, setPhoneFormat] = useState('XX XXX XX XX');
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const flagRef = useRef<HTMLDivElement>(null);
  const createRequest = useCreateRequest();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (flagRef.current && !flagRef.current.contains(e.target as Node)) {
        setShowCountryDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const countries = [
    { code: '+994', flag: '/images/flags/az.png', name: 'Azerbaijan', placeholder: '50 123 45 67', maxLength: 9, format: 'XX XXX XX XX', stripLeadingZero: true },
    { code: '+90', flag: '/images/flags/tr.png', name: 'Turkey', placeholder: '532 123 45 67', maxLength: 10, format: 'XXX XXX XX XX', stripLeadingZero: true },
    { code: '+7', flag: '/images/flags/ru.png', name: 'Russia', placeholder: '905 123 45 67', maxLength: 10, format: 'XXX XXX XX XX', stripLeadingZero: false },
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
    { code: '+7', flag: '/images/flags/kz.png', name: 'Kazakhstan', placeholder: '705 123 45 67', maxLength: 10, format: 'XXX XXX XX XX' },
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
    { code: '+1', flag: '/images/flags/ca.png', name: 'Canada', placeholder: '202 555 1234', maxLength: 10, format: 'XXX XXX XXXX' },
    { code: '+61', flag: '/images/flags/au.png', name: 'Australia', placeholder: '412 345 678', maxLength: 9, format: 'XXX XXX XXX' },
    { code: '+27', flag: '/images/flags/za.png', name: 'South Africa', placeholder: '82 123 4567', maxLength: 9, format: 'XX XXX XXXX' },
    { code: '+234', flag: '/images/flags/ng.png', name: 'Nigeria', placeholder: '803 123 4567', maxLength: 10, format: 'XXX XXX XXXX' },
    { code: '+212', flag: '/images/flags/ma.png', name: 'Morocco', placeholder: '612 345 678', maxLength: 9, format: 'XXX XXX XXX' },
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

  const normalizePhoneDigits = (raw: string, stripLeadingZero = false) => {
    let digits = raw.replace(/[^0-9]/g, '');
    if (stripLeadingZero && digits.startsWith('0')) {
      digits = digits.slice(1);
    }
    return digits;
  };

  const formatPhoneNumber = (raw: string, fmt: string) => {
    let idx = 0;
    let out = '';
    for (const ch of fmt) {
      if (idx >= raw.length) break;
      if (ch === 'X') {
        out += raw[idx];
        idx += 1;
      } else {
        out += ch;
      }
    }
    return out;
  };

  const getFormatCharacterLimit = (fmt: string) => fmt.length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitSuccess(false);
    const fullName = name.trim();
    const selectedCountry = countries.find((country) => country.code === countryCode && country.flag === countryFlag);
    const phoneNumber = `${countryCode}${normalizePhoneDigits(phone, selectedCountry?.stripLeadingZero ?? false)}`;
    if (!fullName || !phone.trim()) return;
    createRequest.mutate(
      { fullName, phoneNumber },
      {
        onSuccess: () => {
          setSubmitSuccess(true);
          setName('');
          setPhone('');
          setCountryCode('+994');
          setCountryFlag('/images/flags/az.png');
          setPhonePlaceholder('50 123 45 67');
          setPhoneMaxLength(9);
          setPhoneFormat('XX XXX XX XX');
        },
      }
    );
  };

  return (
    <section className={`ap-info-card ap-viewing-card ${className}`.trim()}>
      <h2 className="ap-info-title">{t.title}</h2>
      <p className="ap-viewing-desc">{t.desc}</p>

      {submitSuccess ? (
        <div className="property-success-inline">
          <div className="contact-success-icon">
            <svg viewBox="0 0 52 52" className="contact-checkmark">
              <circle className="contact-checkmark-circle" cx="26" cy="26" r="25" fill="none" />
              <path className="contact-checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
            </svg>
          </div>
          <h3 className="property-success-title">{t.successTitle}</h3>
          <p className="property-success-text">{t.successText}</p>
          <button type="button" className="property-success-btn" onClick={() => setSubmitSuccess(false)}>{t.successBtn}</button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="ap-viewing-form">
          <input
            type="text"
            placeholder={t.name}
            className="ap-form-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <div className="ap-phone-group">
            <div className="ap-flag-selector" ref={flagRef} onClick={() => setShowCountryDropdown(!showCountryDropdown)}>
              <img src={countryFlag} alt="" className="ap-flag-img" />
              <span className="ap-country-code-display">{countryCode}</span>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <path d="M6 9l6 6 6-6" />
              </svg>
              {showCountryDropdown && (
                <div className="ap-country-dropdown">
                  {countries.map((c) => (
                    <div
                      key={`${c.code}-${c.name}`}
                      className="ap-country-option"
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
                      <img src={c.flag} alt="" className="ap-country-flag-img" />
                      <span className="ap-country-name">{c.name}</span>
                      <span className="ap-country-code">{c.code}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <input
              type="tel"
              inputMode="numeric"
              placeholder={phonePlaceholder}
              maxLength={getFormatCharacterLimit(phoneFormat)}
              className="ap-form-input ap-phone-input"
              value={phone}
              onChange={(e) => {
                const selectedCountry = countries.find((country) => country.code === countryCode && country.flag === countryFlag);
                const raw = normalizePhoneDigits(
                  e.target.value,
                  selectedCountry?.stripLeadingZero ?? false,
                ).slice(0, phoneMaxLength);
                setPhone(formatPhoneNumber(raw, phoneFormat));
              }}
              required
            />
          </div>

          {createRequest.isError && (
            <div className="ap-form-error">{t.error}</div>
          )}

          <button
            type="submit"
            className="ap-submit-btn"
            disabled={createRequest.isPending}
            style={{ position: 'relative' }}
          >
            {createRequest.isPending && <span className="contact-spinner" style={{ position: 'absolute', top: '50%', left: '50%', marginLeft: -9, marginTop: -9, borderTopColor: '#dcdcdf', borderColor: 'rgba(220,220,223,0.3)', width: 18, height: 18 }} />}
            <span style={createRequest.isPending ? { visibility: 'hidden' } : undefined}>{t.send}</span>
          </button>
        </form>
      )}
    </section>
  );
}
