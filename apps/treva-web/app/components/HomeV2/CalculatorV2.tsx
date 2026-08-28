"use client";

import { useState } from "react";
import Image from "next/image";
import { getDict } from "./dictionary";
import { projectCards } from "./data";
import SelectV2, { type SelectOption } from "./SelectV2";

type Props = { locale: string };

const ROOMS = ["1", "2", "3", "4", "5+"];
const AREAS = ["40-60", "60-80", "80-100", "100-140", "140+"];
const FLOORS = ["1-5", "6-10", "11-15", "16-20", "20+"];
const PAYMENTS = ["10%", "20%", "30%", "40%", "50%"];
const TERMS = ["12", "24", "36", "48", "60"];

const toOptions = (values: string[]): SelectOption[] =>
  values.map((value) => ({ value, label: value }));

/**
 * Credit calculator hero — Figma 635:21742.
 *
 * Two 396-tall cards: the calculator on the left, the result panel on the right.
 *
 * The right panel (Figma 635:21913 "Consultation") is a clipped 20-radius card
 * layered as: the 3D "TREVA" artwork under a 20%-black scrim, the "Calculation
 * Result" heading with its three payment figures pinned top-left, and the
 * Add Credit / print controls pinned to the bottom. There is no calculator
 * endpoint yet, so `result` stays null and every figure reads as 0.00 $ until
 * one is wired.
 */
type CreditResult = { monthly: number; down: number };

const money = (value: number) => `${value.toFixed(2)} $`;

export default function CalculatorV2({ locale }: Props) {
  const dict = getDict(locale);
  const [result] = useState<CreditResult | null>(null);
  const [values, setValues] = useState({
    project: "",
    rooms: "",
    area: "",
    floor: "",
    payment: "",
    term: "",
  });

  const set = (key: keyof typeof values) => (value: string) =>
    setValues((current) => ({ ...current, [key]: value }));

  const fields: {
    key: keyof typeof values;
    label: string;
    placeholder: string;
    options: SelectOption[];
  }[] = [
    {
      key: "project",
      label: dict.search.project,
      placeholder: dict.search.projectPlaceholder,
      options: projectCards.map((item) => ({
        value: item.slug,
        label: item.title,
        thumb: `/images/thumbs/${item.slug}.jpg`,
      })),
    },
    { key: "rooms", label: dict.search.rooms, placeholder: dict.credit.selectRooms, options: toOptions(ROOMS) },
    { key: "area", label: dict.credit.areaLabel, placeholder: dict.credit.selectArea, options: toOptions(AREAS) },
    { key: "floor", label: dict.credit.floorLabel, placeholder: dict.credit.selectFloor, options: toOptions(FLOORS) },
    { key: "payment", label: dict.credit.downPayment, placeholder: dict.credit.selectPayment, options: toOptions(PAYMENTS) },
    { key: "term", label: dict.credit.term, placeholder: dict.credit.selectTerm, options: toOptions(TERMS) },
  ];

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
                  onChange={set(field.key)}
                  options={field.options}
                  placeholder={field.placeholder}
                  label={field.label}
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
            <div className="hv2-credit__stats">
              <div className="hv2-credit__stat">
                <span>{dict.credit.monthlyPayment}</span>
                <strong>{money(result?.monthly ?? 0)}</strong>
              </div>
              <div className="hv2-credit__stat">
                <span>{dict.credit.downPayment}</span>
                <strong>{money(result?.down ?? 0)}</strong>
              </div>
              <div className="hv2-credit__stat">
                <span>{dict.credit.monthlyPayment}</span>
                <strong>{money(result?.monthly ?? 0)}</strong>
              </div>
            </div>
          </div>

          <div className="hv2-credit__actions">
            <button type="button" className="hv2-pill hv2-pill--cta hv2-credit__add">
              {dict.credit.addCredit}
              <Image
                src="/images/icons/arrow-right-dark.svg"
                alt=""
                aria-hidden="true"
                width={24}
                height={24}
                unoptimized
              />
            </button>

            <button
              type="button"
              className="hv2-pill hv2-credit__print"
              aria-label={dict.credit.print}
            >
              <Image
                src="/images/icons/printer-dark.svg"
                alt=""
                aria-hidden="true"
                width={24}
                height={24}
                unoptimized
              />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
