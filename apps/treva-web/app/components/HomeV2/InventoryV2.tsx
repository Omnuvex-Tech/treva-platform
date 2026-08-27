"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getDict } from "./dictionary";
import { inventoryCards, type InventoryCard } from "./data";
import { getSaved, addSaved, removeSaved } from "@/lib/saved-properties";
import { getCompared, addCompared, removeCompared } from "@/lib/compare-properties";

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

  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [comparedIds, setComparedIds] = useState<string[]>([]);

  useEffect(() => {
    setSavedIds(getSaved().map((p) => p.id));
    setComparedIds(getCompared().map((p) => p.id));
  }, []);

  const slugOf = (item: InventoryCard) => item.href?.split("/").filter(Boolean).pop() || item.id;

  const toggleSave = (item: InventoryCard) => {
    if (savedIds.includes(item.id)) {
      removeSaved(item.id);
      setSavedIds((prev) => prev.filter((id) => id !== item.id));
    } else {
      addSaved({
        id: item.id,
        slug: slugOf(item),
        type: deal,
        image: item.image,
        price: Number(item.price.replace(/[^\d]/g, "")) || 0,
        currency: "USD",
        rooms: item.rooms,
        area: item.area,
        floor: item.floor || "",
        location: item.project,
        project: item.project,
        title: item.project,
      });
      setSavedIds((prev) => [...prev, item.id]);
    }
  };

  const toggleCompare = (item: InventoryCard) => {
    if (comparedIds.includes(item.id)) {
      removeCompared(item.id);
      setComparedIds((prev) => prev.filter((id) => id !== item.id));
    } else {
      addCompared({
        id: item.id,
        slug: slugOf(item),
        type: deal,
        image: item.image,
        price: Number(item.price.replace(/[^\d]/g, "")) || 0,
        currency: "USD",
        rooms: item.rooms,
        area: item.area,
        floor: item.floor || "",
        building: item.building,
        project: item.project,
        title: item.project,
      });
      setComparedIds((prev) => [...prev, item.id]);
    }
  };

  const trackRef = useRef<HTMLDivElement>(null);
  // Both false is also the desktop state and the "fits on screen" state, which
  // is what hides the pair: with nothing to scroll neither end is reachable.
  const [reach, setReach] = useState({ prev: false, next: false });

  const sync = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const max = track.scrollWidth - track.clientWidth;
    // 1px of slack: a fractional scrollLeft at either end is normal once the
    // track is snapped, and without it the far button never quite disables.
    setReach({ prev: track.scrollLeft > 1, next: track.scrollLeft < max - 1 });
  }, []);

  // Re-measures on mount, on every tab switch (the two decks are different
  // lengths) and on resize, where the grid stops being a scroller entirely.
  useEffect(() => {
    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, [sync, visibleItems]);

  // A tab switch swaps the whole deck, so leaving the track parked mid-track
  // would drop the reader into the middle of a list they have not seen.
  useEffect(() => {
    trackRef.current?.scrollTo({ left: 0 });
  }, [deal]);

  const step = (dir: -1 | 1) => {
    const track = trackRef.current;
    if (!track) return;
    // Measured, not hard-coded: the card is 348 and the gap 16 today, but both
    // are CSS, and a page-width fallback keeps the button useful if the first
    // child ever stops being a card.
    const card = track.firstElementChild as HTMLElement | null;
    const gap = Number.parseFloat(getComputedStyle(track).columnGap) || 0;
    const by = card ? card.getBoundingClientRect().width + gap : track.clientWidth;
    // Same "reduce motion" contract the project cards honour for their hover
    // clips — the jump still happens, it just does not animate.
    const smooth = !window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    track.scrollBy({ left: dir * by, behavior: smooth ? "smooth" : "auto" });
  };

  return (
    <section
      className={
        visibleItems.length > 3
          ? "hv2-shell hv2-section hv2-s-inventory"
          : "hv2-shell hv2-section hv2-s-inventory hv2-s-inventory--single"
      }
    >
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

        {/* Mobile only — below 768 the grid turns into a one-row swipe track
            (see home-v2.css) and these drive it for anyone not swiping. Their
            own row under the tabs: the pair is 88 wide and the tabs 245, which
            does not leave the two a shared row at 375. Dropped entirely rather
            than disabled when the deck already fits, so a short tab shows no
            dead pair. */}
        {reach.prev || reach.next ? (
          <div className="hv2-cnav">
            <button
              type="button"
              className="hv2-cnav__btn"
              aria-label={dict.inventory.prev}
              disabled={!reach.prev}
              onClick={() => step(-1)}
            >
              <ChevronLeft size={20} strokeWidth={1.5} aria-hidden="true" />
            </button>
            <button
              type="button"
              className="hv2-cnav__btn"
              aria-label={dict.inventory.next}
              disabled={!reach.next}
              onClick={() => step(1)}
            >
              <ChevronRight size={20} strokeWidth={1.5} aria-hidden="true" />
            </button>
          </div>
        ) : null}
      </div>

      <div className="hv2-grid-3" ref={trackRef} onScroll={sync}>
        {visibleItems.map((item) => (
          <div key={item.id} className="hv2-ucard-wrap">
            <Link
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
                    style={{ objectFit: "cover" }}
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

            <div className="hv2-ucard__actions">
              <button
                type="button"
                className={`hv2-ucard__action-btn${comparedIds.includes(item.id) ? " active" : ""}`}
                aria-label={comparedIds.includes(item.id) ? dict.inventory.compared : dict.inventory.compare}
                onClick={() => toggleCompare(item)}
              >
                <Image src="/images/icons/compare.svg" alt="" aria-hidden="true" width={20} height={20} unoptimized />
              </button>
              <button
                type="button"
                className={`hv2-ucard__action-btn${savedIds.includes(item.id) ? " active" : ""}`}
                aria-label={savedIds.includes(item.id) ? dict.inventory.saved : dict.inventory.save}
                onClick={() => toggleSave(item)}
              >
                <Image src="/images/icons/heart.svg" alt="" aria-hidden="true" width={20} height={20} unoptimized />
              </button>
            </div>
          </div>
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
