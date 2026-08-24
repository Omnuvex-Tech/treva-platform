"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { getDict } from "./dictionary";
import { projectCards, roomOptions } from "./data";
import SelectV2 from "./SelectV2";

type Props = { locale: string };
type Deal = "off-plan" | "resale";

export default function SearchPanelV2({ locale }: Props) {
  const dict = getDict(locale);
  const router = useRouter();

  const [deal, setDeal] = useState<Deal>("off-plan");
  const [project, setProject] = useState("");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [rooms, setRooms] = useState<string[]>([]);
  const [areaMin, setAreaMin] = useState("");
  const [areaMax, setAreaMax] = useState("");

  const toggleRoom = (room: string) =>
    setRooms((prev) => (prev.includes(room) ? prev.filter((r) => r !== room) : [...prev, room]));

  const submit = () => {
    const query = new URLSearchParams();
    if (project) query.set("project", project);
    if (priceMin) query.set("priceMin", priceMin);
    if (priceMax) query.set("priceMax", priceMax);
    if (rooms.length) query.set("rooms", rooms.join(","));
    if (areaMin) query.set("areaMin", areaMin);
    if (areaMax) query.set("areaMax", areaMax);

    const suffix = query.toString();
    router.push(`/${locale}/${deal}${suffix ? `?${suffix}` : ""}`);
  };

  return (
    <section className="hv2-shell">
      <div className="hv2-search">
        <div className="hv2-search__body">
          <div className="hv2-search__head">
            <h2 className="hv2-search__title">
              {dict.search.title[0]}
              <br />
              {dict.search.title[1]}
            </h2>

            <div className="hv2-switch" data-active={deal}>
              <button
                type="button"
                aria-pressed={deal === "off-plan"}
                onClick={() => setDeal("off-plan")}
              >
                {dict.search.offPlan}
              </button>
              <button
                type="button"
                aria-pressed={deal === "resale"}
                onClick={() => setDeal("resale")}
              >
                {dict.search.resale}
              </button>
            </div>
          </div>

          <div className="hv2-search__grid">
            {/* Project */}
            <div className="hv2-field">
              <span className="hv2-field__label">{dict.search.project}</span>
              <SelectV2
                value={project}
                onChange={setProject}
                placeholder={dict.search.projectPlaceholder}
                label={dict.search.project}
                options={projectCards.map((item) => ({ value: item.slug, label: item.title }))}
              />
            </div>

            {/* Price */}
            <div className="hv2-field">
              <span className="hv2-field__label">{dict.search.price}</span>
              <div className="hv2-range">
                <input
                  className="hv2-input"
                  inputMode="numeric"
                  placeholder="100.000 AZN"
                  value={priceMin}
                  onChange={(event) => setPriceMin(event.target.value)}
                  aria-label={`${dict.search.price} min`}
                />
                <span className="hv2-range__dash" aria-hidden="true" />
                <input
                  className="hv2-input"
                  inputMode="numeric"
                  placeholder="300.000 AZN"
                  value={priceMax}
                  onChange={(event) => setPriceMax(event.target.value)}
                  aria-label={`${dict.search.price} max`}
                />
              </div>
            </div>

            {/* Rooms */}
            <div className="hv2-field">
              <span className="hv2-field__label">{dict.search.rooms}</span>
              <div className="hv2-rooms">
                {roomOptions.map((room) => (
                  <button
                    key={room}
                    type="button"
                    aria-pressed={rooms.includes(room)}
                    onClick={() => toggleRoom(room)}
                  >
                    {room}
                  </button>
                ))}
              </div>
            </div>

            {/* Area */}
            <div className="hv2-field">
              <span className="hv2-field__label">{dict.search.area}</span>
              <div className="hv2-range">
                <input
                  className="hv2-input"
                  inputMode="numeric"
                  placeholder="60 m²"
                  value={areaMin}
                  onChange={(event) => setAreaMin(event.target.value)}
                  aria-label={`${dict.search.area} min`}
                />
                <span className="hv2-range__dash" aria-hidden="true" />
                <input
                  className="hv2-input"
                  inputMode="numeric"
                  placeholder="148 m²"
                  value={areaMax}
                  onChange={(event) => setAreaMax(event.target.value)}
                  aria-label={`${dict.search.area} max`}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="hv2-search__foot">
          <span className="hv2-search__count">{dict.search.found(0)}</span>
          <button type="button" className="hv2-pill hv2-search__cta" onClick={submit}>
            {dict.search.cta}
            <Search size={14} strokeWidth={1.8} />
          </button>
        </div>
      </div>
    </section>
  );
}
