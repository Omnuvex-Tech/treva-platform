"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { getDict } from "./dictionary";
import type { CreditUnit } from "./inventory-api";
import SelectV2, { type SelectOption } from "./SelectV2";

type Props = { locale: string; units?: CreditUnit[] };

/** Percentages, not amounts — the field is a dropdown, so it cannot take a sum. */
const DOWN_PAYMENTS = [10, 20, 30, 40, 50];
const TERMS = [12, 24, 36, 48, 60];

type Selection = {
  project: string;
  rooms: string;
  area: string;
  floor: string;
  payment: string;
  term: string;
};

const EMPTY: Selection = { project: "", rooms: "", area: "", floor: "", payment: "", term: "" };

/** The dropdowns are answered top to bottom — a step unlocks only once every
    step above it holds a value, and picking one opens the next. */
const ORDER: (keyof Selection)[] = ["project", "rooms", "area", "floor", "payment", "term"];

/** Re-answering a step invalidates every step after it — the sequence restarts
    from wherever the user reaches back to. */
const CLEARS: Record<keyof Selection, (keyof Selection)[]> = {
  project: ["rooms", "area", "floor", "payment", "term"],
  rooms: ["area", "floor", "payment", "term"],
  area: ["floor", "payment", "term"],
  floor: ["payment", "term"],
  payment: ["term"],
  term: [],
};

/** Ascending numeric options with the duplicates collapsed. */
function numericOptions(values: (number | null)[], label: (value: number) => string): SelectOption[] {
  return Array.from(new Set(values.filter((value): value is number => value !== null)))
    .sort((a, b) => a - b)
    .map((value) => ({ value: String(value), label: label(value) }));
}

/** "2800.6" -> "2 800.60 ₼" — the design's dot decimal, grouped like the resale listing. */
function formatMoney(amount: number, currency: string): string {
  const [whole = "0", fraction = "00"] = amount.toFixed(2).split(".");
  return `${whole.replace(/\B(?=(\d{3})+(?!\d))/g, " ")}.${fraction} ${currency}`;
}

/**
 * Credit calculator hero — Figma 635:21742.
 *
 * Two 396-tall cards: the calculator on the left, the result panel on the right.
 *
 * The right panel (Figma 635:21913 "Consultation") is a clipped 20-radius card
 * layered as: the 3D "TREVA" artwork under a 20%-black scrim, the "Calculation
 * Result" heading with its three payment figures pinned top-left, and the
 * Add Credit / print controls pinned to the bottom.
 *
 * The six dropdowns are cascading views of the real off-plan inventory
 * (`getCreditUnits`), not fixed lists: picking a project narrows the room
 * counts to the ones that project actually has, those narrow the areas, and
 * those narrow the floors. So every combination the user can reach resolves to
 * a unit that exists — there is no way to ask for a quote on an apartment
 * nobody is selling. Down payment and term are the only free choices.
 *
 * The sum itself is the internal (developer) instalment plan, which carries no
 * interest: the down payment comes off the price and what is left is split
 * evenly across the term. A bank-style amortised rate would need a rate field
 * the design does not have.
 */
export default function CalculatorV2({ locale, units = [] }: Props) {
  const dict = getDict(locale);
  const [values, setValues] = useState<Selection>(EMPTY);
  const [calculated, setCalculated] = useState(false);
  const [openKey, setOpenKey] = useState<keyof Selection | null>(null);

  // Each step narrows the pool the next step chooses from.
  const byProject = useMemo(
    () => (values.project ? units.filter((unit) => unit.projectSlug === values.project) : units),
    [units, values.project],
  );
  const byRooms = useMemo(
    () => (values.rooms ? byProject.filter((unit) => String(unit.rooms) === values.rooms) : byProject),
    [byProject, values.rooms],
  );
  const byArea = useMemo(
    () => (values.area ? byRooms.filter((unit) => String(unit.area) === values.area) : byRooms),
    [byRooms, values.area],
  );
  const byFloor = useMemo(
    () => (values.floor ? byArea.filter((unit) => String(unit.floor) === values.floor) : byArea),
    [byArea, values.floor],
  );

  const projectOptions = useMemo(() => {
    const seen = new Map<string, string>();
    units.forEach((unit) => {
      if (unit.projectSlug && !seen.has(unit.projectSlug)) seen.set(unit.projectSlug, unit.projectTitle);
    });
    return Array.from(seen, ([value, label]) => ({ value, label })).sort((a, b) =>
      a.label.localeCompare(b.label, locale),
    );
  }, [units, locale]);

  /**
   * Commit a step: store the value, wipe the steps it invalidates, and open the
   * next step's dropdown so the user is carried straight down the sequence.
   */
  const choose = (key: keyof Selection) => (value: string) => {
    setValues((current) => ({
      ...current,
      [key]: value,
      ...Object.fromEntries(CLEARS[key].map((field) => [field, ""])),
    }));
    const next = ORDER[ORDER.indexOf(key) + 1];
    setOpenKey(next ?? null);
  };

  /** A step is reachable only once every step above it holds a value. */
  const isReachable = (key: keyof Selection) =>
    ORDER.slice(0, ORDER.indexOf(key)).every((earlier) => values[earlier]);

  const fields: {
    key: keyof Selection;
    label: string;
    placeholder: string;
    options: SelectOption[];
  }[] = [
    {
      key: "project",
      label: dict.search.project,
      placeholder: dict.search.projectPlaceholder,
      options: projectOptions,
    },
    {
      key: "rooms",
      label: dict.search.rooms,
      placeholder: dict.credit.selectRooms,
      options: values.project ? numericOptions(byProject.map((unit) => unit.rooms), String) : [],
    },
    {
      key: "area",
      label: dict.credit.areaLabel,
      placeholder: dict.credit.selectArea,
      options: values.rooms ? numericOptions(byRooms.map((unit) => unit.area), (value) => `${value} m²`) : [],
    },
    {
      key: "floor",
      label: dict.credit.floorLabel,
      placeholder: dict.credit.selectFloor,
      options: values.area ? numericOptions(byArea.map((unit) => unit.floor), String) : [],
    },
    {
      key: "payment",
      label: dict.credit.downPayment,
      placeholder: dict.credit.selectPayment,
      options: DOWN_PAYMENTS.map((percent) => ({ value: String(percent), label: `${percent}%` })),
    },
    {
      key: "term",
      label: dict.credit.term,
      placeholder: dict.credit.selectTerm,
      options: TERMS.map((months) => ({ value: String(months), label: dict.credit.months(months) })),
    },
  ];

  const result = useMemo(() => {
    // All four unit fields have to be answered before a price exists; two units
    // can still share the last one (same project, rooms, area and floor), and
    // then either quote is equally true, so the first stands in.
    const resolved = values.project && values.rooms && values.area && values.floor;
    const unit = resolved ? (byFloor[0] ?? null) : null;
    if (!unit || !values.payment || !values.term) return null;

    // Quoted in manat — `priceAzn` is always set (pegged from USD when the feed
    // has no AZN figure of its own; see inventory-api).
    const price = unit.priceAzn;
    if (price === null) return null;

    const downPayment = (price * Number(values.payment)) / 100;
    const monthly = (price - downPayment) / Number(values.term);

    return {
      monthly: formatMoney(monthly, "₼"),
      downPayment: formatMoney(downPayment, "₼"),
      total: formatMoney(price, "₼"),
    };
  }, [byFloor, values]);

  const shown = calculated ? result : null;

  return (
    <section className="hv2-shell hv2-s-credit">
      <div className="hv2-credit">
        <div className="hv2-credit__calc">
          <h1 className="hv2-credit__title">
            {dict.search.title[0]}
            <br />
            {dict.search.title[1]}
          </h1>

          <div className="hv2-credit__fields">
            {fields.map((field) => (
              <div key={field.key} className="hv2-credit__field">
                <span>{field.label}</span>
                <SelectV2
                  value={values[field.key]}
                  onChange={choose(field.key)}
                  options={field.options}
                  placeholder={field.placeholder}
                  label={field.label}
                  disabled={!isReachable(field.key)}
                  open={openKey === field.key}
                  onOpenChange={(next) =>
                    setOpenKey((current) =>
                      next ? field.key : current === field.key ? null : current,
                    )
                  }
                />
              </div>
            ))}
          </div>
        </div>

        <div className="hv2-credit__panel">
          <div className="hv2-credit__art" aria-hidden="true">
            <Image
              src="/images/figma/credit-result-art.jpg"
              alt=""
              fill
              sizes="(max-width: 1024px) 100vw, 639px"
            />
          </div>

          <div className="hv2-credit__result">
            <h2 className="hv2-credit__result-title">{dict.credit.resultTitle}</h2>

            {shown ? (
              <div className="hv2-credit__stats">
                {/* The frame labels its third column "Monthly Payment" a second
                    time, which duplicates the first; the total is what belongs
                    beside a monthly figure and a deposit. */}
                <div className="hv2-credit__stat">
                  <span>{dict.credit.monthlyPayment}</span>
                  <strong>{shown.monthly}</strong>
                </div>
                <div className="hv2-credit__stat">
                  <span>{dict.credit.downPayment}</span>
                  <strong>{shown.downPayment}</strong>
                </div>
                <div className="hv2-credit__stat">
                  <span>{dict.credit.totalPrice}</span>
                  <strong>{shown.total}</strong>
                </div>
              </div>
            ) : (
              <p className="hv2-credit__hint">
                {units.length === 0 ? dict.credit.noMatch : dict.credit.emptyHint}
              </p>
            )}
          </div>

          <div className="hv2-credit__actions">
            <button
              type="button"
              className="hv2-pill hv2-pill--cta hv2-credit__add"
              onClick={() => setCalculated(true)}
              disabled={result === null}
            >
              {dict.credit.addCredit}
              <Image
                src="/images/icons/arrow-right-dark.svg"
                alt=""
                aria-hidden="true"
                width={28}
                height={28}
                unoptimized
              />
            </button>

            <button
              type="button"
              className="hv2-pill hv2-credit__print"
              aria-label={dict.credit.print}
              onClick={() => window.print()}
            >
              <Image
                src="/images/icons/printer-dark.svg"
                alt=""
                aria-hidden="true"
                width={28}
                height={28}
                unoptimized
              />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
