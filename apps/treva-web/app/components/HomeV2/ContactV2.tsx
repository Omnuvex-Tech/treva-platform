"use client";

import { useState } from "react";
import Image from "next/image";
import { getDict } from "./dictionary";

type Props = { locale: string };

const EMAIL = "info@treva.realestate";
const PHONE = "050-277-2662";
const PHONE_HREF = "+994502772662";

const HEAD_ADDRESS = "Ziya Yusifzade 10, Sabah Residence";
const ASAN_ADDRESS = "Baku \"ASAN service\" center 1";

/** The design's two offices, each with the photo Figma places on its card. */
const OFFICES = [
  { key: "head", photo: "/images/figma/office-1.jpg", address: HEAD_ADDRESS },
  { key: "sales", photo: "/images/figma/office-2.jpg", address: "Mikayıl Müşfiq, Nardaran, Baku 1097" },
];

const SOCIALS = [
  { label: "Linkedin", href: "https://www.linkedin.com/company/trevarealestate", src: "/images/icons/linkedin.svg", w: 16, h: 16 },
  { label: "Instagram", href: "https://www.instagram.com/treva.realestate?igsh=cDY3OTh0b3JyOGZy", src: "/images/icons/instagram.svg", w: 16, h: 16 },
  { label: "Facebook", href: "https://www.facebook.com/people/Trevarealestate/61576234409540/", src: "/images/icons/facebook.svg", w: 8.83, h: 13.5 },
  { label: "Youtube", href: "https://youtube.com/@trevarealestate?si=zN8KQjIc7UJA7mlY", src: "/images/icons/youtube.svg", w: 16, h: 16 },
  { label: "Tiktok", href: "https://www.tiktok.com/@treva.realestate?_t=ZS-8y85uLU6heS&_r=1", src: "/images/icons/tiktok.svg", w: 16, h: 16 },
];

const MESSAGE_LIMIT = 500;

/**
 * Contact — Figma 622:2996.
 *
 * A centred headline over two 662-wide cards, then the two office cards. The
 * office card is the project card's language again: a photo under a
 * rgba(253,253,253,0.8) footer, so it reuses `.hv2-ucard--person` rather than
 * growing a third copy of that pattern.
 *
 * The form posts nowhere yet — there is no endpoint for it — so the fields are
 * controlled and submit is suppressed. The character counter is live because
 * the design draws one and it costs nothing to make it real.
 */
export default function ContactV2({ locale }: Props) {
  const dict = getDict(locale);
  const [form, setForm] = useState({ name: "", lastName: "", email: "", subject: "", message: "" });

  const set = (key: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((current) => ({ ...current, [key]: event.target.value }));

  const entries = [
    { key: "email", icon: "/images/icons/contact-mail.svg", label: dict.contact.emailLabel, value: EMAIL, href: `mailto:${EMAIL}` },
    { key: "phone", icon: "/images/icons/contact-phone.svg", label: dict.contact.phoneLabel, value: PHONE, href: `tel:${PHONE_HREF}` },
    { key: "address-1", icon: "/images/icons/contact-pin.svg", label: dict.contact.addressLabel, value: HEAD_ADDRESS },
    { key: "address-2", icon: "/images/icons/contact-pin.svg", label: dict.contact.addressLabel, value: ASAN_ADDRESS },
  ];

  return (
    <section className="hv2-shell hv2-section hv2-s-contact">
      <div className="hv2-ct__head">
        <h1 className="hv2-ct__title">
          {dict.contact.title[0]}
          <br />
          {dict.contact.title[1]}
        </h1>
        <p className="hv2-ct__lead">{dict.contact.lead}</p>
      </div>

      <div className="hv2-ct__grid">
        <div className="hv2-ct__card">
          <div className="hv2-ct__cardhead">
            <h2 className="hv2-ct__cardtitle">{dict.contact.infoTitle}</h2>
            <p className="hv2-ct__cardlead">{dict.contact.infoLead}</p>
          </div>

          <div className="hv2-ct__entries">
            {entries.map((entry) => (
              <div key={entry.key} className="hv2-ct__entry">
                <span className="hv2-ct__entryhead">
                  <span className="hv2-ct__entryicon">
                    <Image src={entry.icon} alt="" aria-hidden="true" width={16} height={16} unoptimized />
                  </span>
                  <span className="hv2-ct__entrylabel">{entry.label}</span>
                </span>

                {entry.href ? (
                  <a className="hv2-ct__entryvalue" href={entry.href}>
                    {entry.value}
                  </a>
                ) : (
                  <p className="hv2-ct__entryvalue">{entry.value}</p>
                )}
              </div>
            ))}
          </div>

          <div className="hv2-ct__social">
            <h3 className="hv2-ct__entrylabel">{dict.contact.socialLabel}</h3>
            <div className="hv2-footer__socials">
              {SOCIALS.map(({ label, href, src, w, h }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="hv2-footer__social"
                >
                  <Image
                    src={src}
                    alt=""
                    aria-hidden="true"
                    width={Math.round(w)}
                    height={Math.round(h)}
                    style={{ width: `${w}px`, height: `${h}px` }}
                    unoptimized
                  />
                </a>
              ))}
            </div>
          </div>
        </div>

        <form className="hv2-ct__card hv2-ct__form" onSubmit={(event) => event.preventDefault()}>
          <label className="hv2-input-field">
            <span>{dict.contact.nameLabel}</span>
            <input type="text" value={form.name} onChange={set("name")} placeholder={dict.contact.namePlaceholder} />
          </label>

          <label className="hv2-input-field">
            <span>{dict.contact.lastNameLabel}</span>
            <input type="text" value={form.lastName} onChange={set("lastName")} placeholder={dict.contact.lastNamePlaceholder} />
          </label>

          <label className="hv2-input-field">
            <span>{dict.contact.emailFieldLabel}</span>
            <input type="email" value={form.email} onChange={set("email")} placeholder={dict.contact.emailPlaceholder} />
          </label>

          <label className="hv2-input-field">
            <span>{dict.contact.subjectLabel}</span>
            <input type="text" value={form.subject} onChange={set("subject")} placeholder={dict.contact.subjectPlaceholder} />
          </label>

          <label className="hv2-input-field hv2-input-field--area">
            <span>{dict.contact.messageLabel}</span>
            <span className="hv2-ct__area">
              <textarea
                value={form.message}
                onChange={set("message")}
                maxLength={MESSAGE_LIMIT}
                placeholder={dict.contact.messagePlaceholder}
              />
              <span className="hv2-ct__count">
                {form.message.length}/{MESSAGE_LIMIT}
              </span>
            </span>
          </label>

          <button type="submit" className="hv2-pill hv2-pill--dark hv2-pill--cta hv2-ct__send">
            {dict.contact.send}
            <Image src="/images/icons/contact-mail-light.svg" alt="" aria-hidden="true" width={24} height={24} unoptimized />
          </button>
        </form>
      </div>

      <div className="hv2-ct__offices">
        {OFFICES.map((office) => (
          <article key={office.key} className="hv2-ucard hv2-ucard--person hv2-ct__office">
            <div className="hv2-ucard__media">
              <Image
                src={office.photo}
                alt=""
                aria-hidden="true"
                fill
                sizes="(max-width: 1024px) 100vw, 662px"
              />
            </div>

            <div className="hv2-ucard__foot">
              <div className="hv2-ucard__info">
                <p className="hv2-ucard__title">
                  {office.key === "head" ? dict.contact.headOffice : dict.contact.salesOffice}
                </p>
                <p className="hv2-ucard__meta">{office.address}</p>
              </div>

              <a
                className="hv2-ct__map"
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(office.address)}`}
                target="_blank"
                rel="noreferrer"
              >
                {dict.contact.viewMap}
                <Image src="/images/icons/arrow-up-right-ink.svg" alt="" aria-hidden="true" width={24} height={24} unoptimized />
              </a>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
