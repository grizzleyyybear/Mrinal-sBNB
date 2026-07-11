"use client";

import { MapPin, Search } from "lucide-react";

type DestinationPickerProps = {
  value: string;
  onChange: (value: string) => void;
  onSelect: (value: string) => void;
};

const destinations = [
  { title: "Noida", subtitle: "Uttar Pradesh, India" },
  { title: "Dehradun", subtitle: "Uttarakhand, India" },
  { title: "Gurgaon District", subtitle: "Haryana, India" },
  { title: "India", subtitle: "Search homes across the country" }
];

export function DestinationPicker({ value, onChange, onSelect }: DestinationPickerProps) {
  const query = value.trim().toLowerCase();
  const matches = destinations.filter((destination) => !query || `${destination.title} ${destination.subtitle}`.toLowerCase().includes(query));

  return (
    <div className="w-full rounded-2xl border border-hairline bg-white p-4 shadow-airbnb">
      <label className="flex h-12 items-center gap-3 rounded-xl border border-hairline px-3 focus-within:border-ink">
        <Search size={18} className="text-ink" />
        <input autoFocus className="min-w-0 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-muted" placeholder="Search destinations" value={value} onChange={(event) => onChange(event.target.value)} />
      </label>
      <p className="mt-4 px-1 text-xs font-semibold uppercase text-muted">Suggested destinations</p>
      <div className="mt-2">
        {matches.map((destination) => (
          <button key={destination.title} type="button" className="flex w-full items-center gap-3 rounded-xl px-2 py-3 text-left transition hover:bg-surface-soft" onClick={() => onSelect(destination.title)}>
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-surface-soft text-ink"><MapPin size={19} /></span>
            <span><span className="block text-sm font-semibold text-ink">{destination.title}</span><span className="mt-0.5 block text-sm text-muted">{destination.subtitle}</span></span>
          </button>
        ))}
        {!matches.length ? <p className="px-2 py-4 text-sm text-muted">Keep typing to search this destination.</p> : null}
      </div>
    </div>
  );
}
