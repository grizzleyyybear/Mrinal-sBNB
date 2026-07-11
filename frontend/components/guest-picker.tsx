"use client";

import { Minus, Plus } from "lucide-react";

export type GuestBreakdown = {
  adults: number;
  children: number;
  infants: number;
};

type GuestPickerProps = {
  value: GuestBreakdown;
  onChange: (value: GuestBreakdown) => void;
  maxGuests?: number;
};

const rows: Array<{ key: keyof GuestBreakdown; title: string; description: string; countsTowardStay: boolean }> = [
  { key: "adults", title: "Adults", description: "Ages 13 or above", countsTowardStay: true },
  { key: "children", title: "Children", description: "Ages 2-12", countsTowardStay: true },
  { key: "infants", title: "Infants", description: "Under 2", countsTowardStay: false }
];

export function totalGuests(value: GuestBreakdown) {
  return value.adults + value.children;
}

export function guestSummary(value: GuestBreakdown) {
  const guests = totalGuests(value);
  const parts = [`${guests} guest${guests === 1 ? "" : "s"}`];
  if (value.infants) parts.push(`${value.infants} infant${value.infants === 1 ? "" : "s"}`);
  return parts.join(", ");
}

export function GuestPicker({ value, onChange, maxGuests = 20 }: GuestPickerProps) {
  function update(key: keyof GuestBreakdown, direction: -1 | 1) {
    const minimum = key === "adults" ? 1 : 0;
    const nextValue = Math.max(minimum, value[key] + direction);
    const next = { ...value, [key]: nextValue };
    if (direction > 0 && rows.find((row) => row.key === key)?.countsTowardStay && totalGuests(next) > maxGuests) return;
    onChange(next);
  }

  return (
    <div className="w-full rounded-2xl border border-hairline bg-white p-5 shadow-airbnb">
      {rows.map((row, index) => {
        const minimum = row.key === "adults" ? 1 : 0;
        const canAdd = !row.countsTowardStay || totalGuests(value) < maxGuests;
        return (
          <div key={row.key} className={`flex items-center justify-between gap-4 py-3 ${index ? "border-t border-hairline-soft" : "pt-0"}`}>
            <div>
              <p className="text-sm font-semibold text-ink">{row.title}</p>
              <p className="mt-0.5 text-sm text-muted">{row.description}</p>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <button type="button" className="grid h-8 w-8 place-items-center rounded-full border border-hairline text-ink transition hover:border-ink disabled:cursor-not-allowed disabled:text-hairline disabled:hover:border-hairline" disabled={value[row.key] <= minimum} onClick={() => update(row.key, -1)} aria-label={`Decrease ${row.title.toLowerCase()}`}><Minus size={15} /></button>
              <span className="w-4 text-center text-sm text-ink">{value[row.key]}</span>
              <button type="button" className="grid h-8 w-8 place-items-center rounded-full border border-hairline text-ink transition hover:border-ink disabled:cursor-not-allowed disabled:text-hairline disabled:hover:border-hairline" disabled={!canAdd} onClick={() => update(row.key, 1)} aria-label={`Increase ${row.title.toLowerCase()}`}><Plus size={15} /></button>
            </div>
          </div>
        );
      })}
      <p className="mt-2 text-xs text-muted">{maxGuests < 20 ? `This stay allows up to ${maxGuests} guests.` : "You can add up to 20 guests. Infants do not count toward the guest total."}</p>
    </div>
  );
}
