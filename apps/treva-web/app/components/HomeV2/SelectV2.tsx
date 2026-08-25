"use client";

import { useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import { ChevronDown, Check } from "lucide-react";

export type SelectOption = {
  value: string;
  label: string;
  /** 44x44 preview. Options carrying one switch the popup to the grid layout. */
  thumb?: string;
};

type Props = {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder: string;
  label?: string;
};

/**
 * Listbox that replaces a native <select>.
 *
 * A native option list is painted by the OS — the blue highlight and system
 * font cannot be restyled — so the V2 panel needs its own popup to stay on
 * design. Keyboard behaviour follows the ARIA listbox pattern: Up/Down move the
 * active option, Enter/Space commit, Escape closes, Home/End jump.
 */
export default function SelectV2({ value, onChange, options, placeholder, label }: Props) {
  const listboxId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const selected = options.find((option) => option.value === value);
  // Figma 825:26696 lays picture options out as a 3-column grid of 173x60
  // tiles rather than a plain list; plain options keep the single column.
  const isGrid = options.some((option) => option.thumb);

  // Close on outside click / Escape while open.
  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  // Keep the active option scrolled into view as the user arrows through.
  useEffect(() => {
    if (!open || activeIndex < 0) return;
    const node = listRef.current?.children[activeIndex] as HTMLElement | undefined;
    node?.scrollIntoView({ block: "nearest" });
  }, [open, activeIndex]);

  const openAt = (index: number) => {
    setOpen(true);
    setActiveIndex(index);
  };

  const commit = (index: number) => {
    const option = options[index];
    if (!option) return;
    onChange(option.value);
    setOpen(false);
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    const currentIndex = options.findIndex((option) => option.value === value);

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        if (!open) openAt(currentIndex >= 0 ? currentIndex : 0);
        else setActiveIndex((i) => Math.min(i + 1, options.length - 1));
        break;
      case "ArrowUp":
        event.preventDefault();
        if (!open) openAt(currentIndex >= 0 ? currentIndex : 0);
        else setActiveIndex((i) => Math.max(i - 1, 0));
        break;
      case "Home":
        if (open) {
          event.preventDefault();
          setActiveIndex(0);
        }
        break;
      case "End":
        if (open) {
          event.preventDefault();
          setActiveIndex(options.length - 1);
        }
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        if (!open) openAt(currentIndex >= 0 ? currentIndex : 0);
        else commit(activeIndex);
        break;
      case "Escape":
        if (open) {
          event.preventDefault();
          setOpen(false);
        }
        break;
      case "Tab":
        setOpen(false);
        break;
    }
  };

  return (
    <div className="hv2-sel" ref={rootRef}>
      <button
        type="button"
        className="hv2-sel__trigger"
        data-filled={selected ? "true" : "false"}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listboxId : undefined}
        aria-label={label}
        onClick={() => (open ? setOpen(false) : openAt(options.findIndex((o) => o.value === value)))}
        onKeyDown={onKeyDown}
      >
        <span className="hv2-sel__value">{selected ? selected.label : placeholder}</span>
        <ChevronDown size={15} strokeWidth={1.6} className="hv2-sel__chevron" />
      </button>

      {open ? (
        <ul
          className={isGrid ? "hv2-sel__list hv2-sel__list--grid" : "hv2-sel__list"}
          id={listboxId}
          role="listbox"
          ref={listRef}
          tabIndex={-1}
        >
          {options.map((option, index) => {
            const isSelected = option.value === value;
            return (
              <li
                key={option.value}
                role="option"
                aria-selected={isSelected}
                data-active={index === activeIndex ? "true" : "false"}
                className="hv2-sel__option"
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => commit(index)}
              >
                {option.thumb ? (
                  <Image
                    className="hv2-sel__thumb"
                    src={option.thumb}
                    alt=""
                    aria-hidden="true"
                    width={44}
                    height={44}
                  />
                ) : null}
                <span>{option.label}</span>
                {isSelected && !option.thumb ? <Check size={14} strokeWidth={2} /> : null}
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
