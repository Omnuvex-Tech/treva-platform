import Image from "next/image";
import PlanImage from "./PlanImage";
import { getDict } from "./dictionary";
import { inventoryCards, type InventoryCard } from "./data";

type Props = { locale: string; items?: InventoryCard[] };

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
 * `building` and `floor` come from the unit API and are blank on the seed cards,
 * so the rows render an em dash rather than collapsing — a comparison table with
 * a different number of rows per column would be worse than an empty cell.
 */
export default function ComparisonV2({ locale, items = inventoryCards.slice(0, 2) }: Props) {
  const dict = getDict(locale);

  if (items.length === 0) {
    return (
      <section className="hv2-shell hv2-section hv2-s-compare">
        <h1 className="hv2-h2">{dict.comparison.title}</h1>
        <p className="hv2-cmp__empty">{dict.comparison.empty}</p>
      </section>
    );
  }

  return (
    <section className="hv2-shell hv2-section hv2-s-compare">
      <h1 className="hv2-h2">{dict.comparison.title}</h1>

      <div className="hv2-cmp">
        {items.map((item) => {
          const rows = [
            { label: dict.comparison.complex, value: item.project },
            {
              label: dict.comparison.roomsArea,
              value: [item.rooms, item.area].filter(Boolean).join(" / "),
            },
            { label: dict.comparison.building, value: item.building },
            { label: dict.comparison.floor, value: item.floor },
            { label: dict.comparison.price, value: item.price },
          ];

          return (
            <article key={item.id} className="hv2-cmp__card">
              <div className="hv2-cmp__plan">
                <PlanImage src={item.image} alt={item.project} fallback={PLAN_FALLBACK} />
              </div>

              <div className="hv2-cmp__body">
                <div className="hv2-cmp__actions">
                  <button type="button" className="hv2-nav__btn hv2-nav__btn--icon" aria-label={dict.comparison.compare}>
                    <Image
                      src="/images/icons/compare.svg"
                      alt=""
                      aria-hidden="true"
                      width={23}
                      height={23}
                      style={{ width: "23.0496px", height: "23.0496px" }}
                      unoptimized
                    />
                  </button>
                  <button type="button" className="hv2-nav__btn hv2-nav__btn--icon" aria-label={dict.comparison.save}>
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
    </section>
  );
}
