"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import PlanImage from "./PlanImage";
import { getDict } from "./dictionary";
import {
  getCompared,
  removeCompared,
  onCompareChange,
  type CompareProperty,
} from "@/lib/compare-properties";
import { addSaved, removeSaved, isSaved, onSavedChange } from "@/lib/saved-properties";

type Props = { locale: string };

/** The design's own plan render, used where a unit has no artwork of its own. */
const PLAN_FALLBACK = "/images/figma/unit-plan.png";

/**
 * Comparison — Figma 638:27901, a heading over two 660x283 cards.
 *
 * Each card splits a floor plan from a table of five fields. On desktop the two
 * sit side by side with a hairline between them; on mobile the card stacks and
 * that hairline becomes the divider under the plan. Both states are one DOM:
 * only the flex direction and which edge carries the rule change.
 *
 * Off-plan and resale each get their own group (off-plan first, per the
 * product spec) rather than one mixed grid — the two aren't really
 * comparable against each other, and splitting them is what "seçilmiş
 * off-planlar" / "seçilmiş resale" turned into once there were two kinds of
 * item that could land on this page.
 */
export default function ComparisonV2({ locale }: Props) {
  const dict = getDict(locale);
  const [items, setItems] = useState<CompareProperty[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);

  useEffect(() => {
    const refresh = () => {
      setItems(getCompared());
      setSavedIds(getCompared().map((i) => i.id).filter((id) => isSaved(id)));
    };
    refresh();
    const offCompare = onCompareChange(refresh);
    const offSaved = onSavedChange(refresh);
    return () => {
      offCompare();
      offSaved();
    };
  }, []);

  const toggleSave = (item: CompareProperty) => {
    if (isSaved(item.id)) {
      removeSaved(item.id);
      setSavedIds((prev) => prev.filter((id) => id !== item.id));
    } else {
      addSaved({
        id: item.id,
        slug: item.slug,
        type: item.type,
        image: item.image,
        price: item.price,
        currency: item.currency,
        rooms: item.rooms,
        area: item.area,
        floor: item.floor,
        location: item.project,
        project: item.project,
        title: item.title,
      });
      setSavedIds((prev) => [...prev, item.id]);
    }
  };

  const offPlanItems = items.filter((item) => item.type === "off-plan");
  const resaleItems = items.filter((item) => item.type === "resale");

  const renderGroup = (label: string, groupItems: CompareProperty[]) => {
    if (groupItems.length === 0) return null;

    return (
    <div className="hv2-cmp__group">
      <h2 className="hv2-cmp__group-title">{label}</h2>

        <div className="hv2-cmp">
          {groupItems.map((item) => {
            const rows = [
              { label: dict.comparison.complex, value: item.project },
              {
                label: dict.comparison.roomsArea,
                value: [item.rooms, item.area].filter(Boolean).join(" / "),
              },
              { label: dict.comparison.building, value: item.building },
              { label: dict.comparison.floor, value: item.floor },
              { label: dict.comparison.price, value: `${item.price} ${item.currency}` },
            ];

            const detailHref =
              item.type === "off-plan"
                ? `/${locale}/off-plan/${item.slug}`
                : `/${locale}/resale/${item.slug}`;

            return (
              <article key={item.id} className="hv2-cmp__card">
                <Link href={detailHref} className="hv2-cmp__plan">
                  <PlanImage src={item.image} alt={item.project} fallback={PLAN_FALLBACK} />
                </Link>

                <div className="hv2-cmp__body">
                  <div className="hv2-cmp__actions">
                    <button
                      type="button"
                      className="hv2-cmp__action-btn active"
                      aria-label={dict.comparison.compare}
                      onClick={() => removeCompared(item.id)}
                    >
                      <Image
                        src="/images/icons/compare.svg"
                        alt=""
                        aria-hidden="true"
                        width={24}
                        height={24}
                        unoptimized
                      />
                    </button>
                    <button
                      type="button"
                      className={`hv2-cmp__action-btn${savedIds.includes(item.id) ? " active" : ""}`}
                      aria-label={dict.comparison.save}
                      onClick={() => toggleSave(item)}
                    >
                      <Image
                        src="/images/icons/heart.svg"
                        alt=""
                        aria-hidden="true"
                        width={24}
                        height={24}
                        unoptimized
                      />
                    </button>
                  </div>

                  <dl className="hv2-cmp__rows">
                    {rows.map((row) => (
                      <div key={row.label} className="hv2-cmp__row">
                        <dt>{row.label}</dt>
                        <dd>{row.value || "—"}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </article>
            );
          })}
        </div>
    </div>
    );
  };

  return (
    <section className="hv2-shell hv2-section hv2-s-compare">
      <h1 className="hv2-h2">{dict.comparison.title}</h1>

      {items.length === 0 ? (
        <p className="hv2-cmp__empty">{dict.comparison.empty}</p>
      ) : (
        <>
          {renderGroup(dict.search.offPlan, offPlanItems)}
          {renderGroup(dict.search.resale, resaleItems)}
        </>
      )}
    </section>
  );
}
