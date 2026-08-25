"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { getDict } from "./dictionary";
import { inventoryCards, type InventoryCard } from "./data";

type Props = { locale: string; items?: InventoryCard[]; resaleItems?: InventoryCard[] };
type Deal = "off-plan" | "resale";

const DEV_ICON = "/images/features-pro/icons/dreamfest-arena.svg";
const CTA_ICON = "/images/icons/arrow-up-right.svg";
const CARD_SIZES = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 432px";

/**
 * Unit cards — Figma 597:18777, 432x470.
 *
 * The artwork is a floor plan on a tinted panel rather than a photo, so it is
 * contained at its designed 261x280 instead of being cropped to fill; the 130px
 * translucent footer below it carries price, developer and specs.
 *
 * Off-plan and resale are separate treva-api models (unit-layouts vs
 * apartments — see inventory-api.ts), fetched once on the server as two
 * separate arrays. The tabs below only ever switched a `deal` state that fed
 * link hrefs, never which cards were shown, so every tab quietly displayed
 * the same off-plan units — including when there is real resale inventory to
 * show. `items`/`resaleItems` are picked between here instead.
 */
export default function InventoryV2({ locale, items = inventoryCards, resaleItems = inventoryCards }: Props) {
  const dict = getDict(locale);
  const [deal, setDeal] = useState<Deal>("off-plan");
  const visibleItems = deal === "resale" ? resaleItems : items;

  return (
    <section className="hv2-shell hv2-section hv2-s-inventory">
      <div className="hv2-section-head">
        <h2 className="hv2-h2">{dict.inventory.title}</h2>

        <div className="hv2-switch">
          <button type="button" aria-pressed={deal === "off-plan"} onClick={() => setDeal("off-plan")}>
            {dict.search.offPlan}
          </button>
          <button type="button" aria-pressed={deal === "resale"} onClick={() => setDeal("resale")}>
            {dict.search.resale}
          </button>
        </div>
      </div>

      <div className="hv2-grid-3">
        {visibleItems.map((item) => (
          <Link
            key={item.id}
            href={item.href ? `/${locale}${item.href}` : `/${locale}/${deal}`}
            className="hv2-ucard hv2-ucard--unit"
          >
            <div className="hv2-ucard__media">
              <div className="hv2-ucard__plan">
                <Image
                  src={item.image}
                  alt={item.project}
                  fill
                  sizes={CARD_SIZES}
                  style={{ objectFit: "contain" }}
                />
              </div>
            </div>

            <div className="hv2-ucard__foot">
              <div className="hv2-ucard__info">
                <p className="hv2-ucard__title">{item.price}</p>

                <p className="hv2-ucard__meta hv2-ucard__dev">
                  <Image
                    className="hv2-ucard__dev-icon"
                    src={DEV_ICON}
                    alt=""
                    aria-hidden="true"
                    width={24}
                    height={24}
                    unoptimized
                  />
                  {item.developer}
                </p>

                <p className="hv2-ucard__meta hv2-ucard__specs">
                  <span>{item.project}</span>
                  <span>
                    {item.rooms} {dict.inventory.rooms}
                  </span>
                  <span>{item.area}</span>
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="hv2-center">
        <Link href={`/${locale}/${deal}`} className="hv2-pill hv2-pill--dark hv2-pill--cta">
          {dict.inventory.seeAll}
          <Image src={CTA_ICON} alt="" aria-hidden="true" width={24} height={24} unoptimized />
        </Link>
      </div>
    </section>
  );
}
