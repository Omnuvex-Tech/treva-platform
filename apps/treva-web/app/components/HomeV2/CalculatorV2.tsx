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
 * That right panel is deliberately blank. In Figma its fill is a checkerboard
 * placeholder — the designer's "artwork goes here" marker, not artwork — so
 * shipping it would put a literal checkerboard on the page. The frame, its
 * radius and both of its controls are reproduced exactly; only the contents of
 * the panel are left for the design to decide.
 */
export default function CalculatorV2({ locale }: Props) {
  const dict = getDict(locale);
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
          <div className="hv2-credit__actions">
            <button type="button" className="hv2-pill hv2-pill--dark hv2-pill--cta hv2-credit__add">
              {dict.credit.addCredit}
              <Image
                src="/images/icons/arrow-right-light.svg"
                alt=""
                aria-hidden="true"
                width={24}
                height={24}
                unoptimized
              />
            </button>

            <button
              type="button"
              className="hv2-pill hv2-pill--dark hv2-credit__print"
              aria-label={dict.credit.print}
            >
              <Image
                src="/images/icons/printer-light.svg"
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
