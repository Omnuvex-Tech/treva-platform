"use client";

import { useState } from "react";
import Image from "next/image";
import { getDict } from "./dictionary";

type Props = { locale: string };

/**
 * Callback banner — Figma 865:27787, 1344x444, the last block before the footer.
 *
 * Three layers inside one clipped 20-radius card: the oversized "V" watermark,
 * the family photo pinned to the right edge, and the form floating over both on
 * the left. The watermark and the photo are both anchored off the card's centre
 * the way the design places them, so they keep their relationship as the card
 * narrows instead of drifting apart.
 */
export default function CallbackV2({ locale }: Props) {
  const dict = getDict(locale);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  return (
    <section className="hv2-shell hv2-section hv2-s-callback">
      <div className="hv2-cb">
        <div className="hv2-cb__watermark" aria-hidden="true">
          <Image src="/images/figma/callback-watermark.svg" alt="" width={831} height={444} unoptimized />
        </div>

        <div className="hv2-cb__photo" aria-hidden="true">
          <Image
            src="/images/figma/callback-photo.png"
            alt=""
            fill
            sizes="(max-width: 1024px) 100vw, 588px"
          />
        </div>

        {/* No endpoint is wired yet — the fields are controlled so the values are
            already in hand when one is, and the submit is a no-op until then. */}
        <form className="hv2-cb__form" onSubmit={(event) => event.preventDefault()}>
          <div className="hv2-cb__text">
            <h2 className="hv2-cb__title">{dict.callback.title}</h2>
            <p className="hv2-cb__lead">
              {dict.callback.lead[0]}
              <br />
              {dict.callback.lead[1]}
            </p>
          </div>

          <label className="hv2-input-field">
            <span>{dict.callback.nameLabel}</span>
            <input
              type="text"
              name="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder={dict.callback.namePlaceholder}
            />
          </label>

          <label className="hv2-input-field">
            <span>{dict.callback.phoneLabel}</span>
            <input
              type="tel"
              name="phone"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder={dict.callback.phonePlaceholder}
            />
          </label>

          <button type="submit" className="hv2-pill hv2-pill--dark hv2-pill--cta">
            {dict.callback.cta}
            <Image
              src="/images/icons/phone-light.svg"
              alt=""
              aria-hidden="true"
              width={24}
              height={24}
              unoptimized
            />
          </button>
        </form>
      </div>
    </section>
  );
}
