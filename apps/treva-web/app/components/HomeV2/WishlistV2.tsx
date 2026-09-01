"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import PlanImage from "./PlanImage";
import { getDict } from "./dictionary";
import {
  getSaved,
  removeSaved,
  onSavedChange,
  type SavedProperty,
} from "@/lib/saved-properties";
import {
  getCompared,
  addCompared,
  removeCompared,
  onCompareChange,
} from "@/lib/compare-properties";

type Props = { locale: string };

/** The design's own plan render, used where a unit has no artwork of its own. */
const PLAN_FALLBACK = "/images/figma/unit-plan.png";

/**
 * Seçilmişlər — müqayisə səhifəsinin (Figma 638:27901) eyni kartı.
 *
 * `ComparisonV2` ilə eyni DOM və eyni `hv2-cmp__*` sinifləri işlənir: kart plan
 * şəklini beş sətirlik cədvəldən ayırır, mobildə isə eyni DOM alt-alta düzülür.
 * Fərq yalnız mənbədə və düymələrin mənasında: siyahı `saved-properties`-dən
 * gəlir, ürək həmişə aktivdir və basanda seçilmişlərdən çıxarır, müqayisə
 * düyməsi isə elementi müqayisəyə əlavə edir/çıxarır.
 */
export default function WishlistV2({ locale }: Props) {
  const dict = getDict(locale);
  const [items, setItems] = useState<SavedProperty[]>([]);
  const [comparedIds, setComparedIds] = useState<string[]>([]);

  useEffect(() => {
    const refresh = () => {
      setItems(getSaved());
      setComparedIds(getCompared().map((item) => item.id));
    };
    refresh();
    const offSaved = onSavedChange(refresh);
    const offCompare = onCompareChange(refresh);
    return () => {
      offSaved();
      offCompare();
    };
  }, []);

  const toggleCompare = (item: SavedProperty) => {
    if (comparedIds.includes(item.id)) {
      removeCompared(item.id);
      setComparedIds((prev) => prev.filter((id) => id !== item.id));
    } else {
      addCompared({
        id: item.id,
        slug: item.slug,
        type: item.type,
        image: item.image,
        price: item.price,
        currency: item.currency,
        rooms: item.rooms,
        area: item.area,
        floor: item.floor,
        building: item.building,
        project: item.project || item.location,
        title: item.title,
      });
      setComparedIds((prev) => [...prev, item.id]);
    }
  };

  const offPlanItems = items.filter((item) => item.type === "off-plan");
  const resaleItems = items.filter((item) => item.type === "resale");

  const renderGroup = (label: string, groupItems: SavedProperty[]) => {
    if (groupItems.length === 0) return null;

    return (
      <div className="hv2-cmp__group">
        <h2 className="hv2-cmp__group-title">{label}</h2>

        <div className="hv2-cmp">
          {groupItems.map((item) => {
            const project = item.project || item.location;
            const rows = [
              { label: dict.comparison.complex, value: project },
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

            const compared = comparedIds.includes(item.id);

            return (
              <article key={item.id} className="hv2-cmp__card">
                <Link href={detailHref} className="hv2-cmp__plan">
                  <PlanImage src={item.image} alt={project} fallback={PLAN_FALLBACK} />
                </Link>

                <div className="hv2-cmp__body">
                  <div className="hv2-cmp__actions">
                    <button
                      type="button"
                      className={`hv2-cmp__action-btn${compared ? " active" : ""}`}
                      aria-label={compared ? dict.wishlist.compared : dict.wishlist.compare}
                      onClick={() => toggleCompare(item)}
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
                      className="hv2-cmp__action-btn active"
                      aria-label={dict.wishlist.remove}
                      onClick={() => removeSaved(item.id)}
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
    <section className="hv2-shell hv2-section hv2-s-wishlist">
      <h1 className="hv2-h2">{dict.wishlist.title}</h1>

      {items.length === 0 ? (
        <p className="hv2-cmp__empty">{dict.wishlist.empty}</p>
      ) : (
        <>
          {renderGroup(dict.search.offPlan, offPlanItems)}
          {renderGroup(dict.search.resale, resaleItems)}
        </>
      )}
    </section>
  );
}
