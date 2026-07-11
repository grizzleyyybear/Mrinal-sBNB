"use client";

import { Search, SlidersHorizontal } from "lucide-react";
import type { ListingFilters } from "@/types/api";

type SearchBarProps = {
  filters: ListingFilters;
  onChange: (filters: ListingFilters) => void;
};

export function SearchBar({ filters, onChange }: SearchBarProps) {
  function update<K extends keyof ListingFilters>(key: K, value: ListingFilters[K]) {
    onChange({ ...filters, [key]: value, page: 1 });
  }

  return (
    <section className="border-b border-hairline-soft bg-white">
      <div className="mx-auto max-w-[1128px] px-5 py-5 sm:px-8 lg:px-12">
        <div className="grid min-h-16 overflow-hidden rounded-full border border-hairline bg-white shadow-airbnb md:grid-cols-[1.25fr_1fr_1fr_0.8fr_64px]">
          <label className="flex flex-col justify-center px-6 py-3">
            <span className="text-xs font-bold text-ink">Where</span>
            <input
              className="mt-1 w-full bg-transparent text-sm text-ink outline-none placeholder:text-muted"
              placeholder="Search destinations"
              value={filters.location}
              onChange={(event) => update("location", event.target.value)}
            />
          </label>

          <label className="flex flex-col justify-center border-t border-hairline px-6 py-3 md:border-l md:border-t-0">
            <span className="text-xs font-bold text-ink">Check in</span>
            <input
              className="mt-1 w-full bg-transparent text-sm text-muted outline-none"
              type="date"
              value={filters.checkIn}
              onChange={(event) => update("checkIn", event.target.value)}
            />
          </label>

          <label className="flex flex-col justify-center border-t border-hairline px-6 py-3 md:border-l md:border-t-0">
            <span className="text-xs font-bold text-ink">Check out</span>
            <input
              className="mt-1 w-full bg-transparent text-sm text-muted outline-none"
              type="date"
              value={filters.checkOut}
              onChange={(event) => update("checkOut", event.target.value)}
            />
          </label>

          <label className="flex flex-col justify-center border-t border-hairline px-6 py-3 md:border-l md:border-t-0">
            <span className="text-xs font-bold text-ink">Who</span>
            <input
              className="mt-1 w-full bg-transparent text-sm text-muted outline-none"
              min={1}
              type="number"
              value={filters.guests}
              onChange={(event) => update("guests", Math.max(1, Number(event.target.value)))}
            />
          </label>

          <div className="flex items-center justify-center border-t border-hairline p-2 md:border-l md:border-t-0">
            <button className="flex h-12 w-12 items-center justify-center rounded-full bg-rausch text-white" aria-label="Search listings">
              <Search size={20} />
            </button>
          </div>
        </div>

        <div className="mt-4 grid gap-3 rounded-2xl border border-hairline-soft p-3 sm:grid-cols-[1fr_1fr_auto]">
          <label className="flex h-12 items-center gap-3 rounded-lg border border-hairline px-4">
            <span className="text-sm font-medium text-ink">Min</span>
            <input
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted"
              placeholder="Any price"
              value={filters.minPrice}
              onChange={(event) => update("minPrice", event.target.value)}
            />
          </label>
          <label className="flex h-12 items-center gap-3 rounded-lg border border-hairline px-4">
            <span className="text-sm font-medium text-ink">Max</span>
            <input
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted"
              placeholder="Any price"
              value={filters.maxPrice}
              onChange={(event) => update("maxPrice", event.target.value)}
            />
          </label>
          <button className="flex h-12 items-center justify-center gap-2 rounded-lg border border-ink px-5 text-sm font-medium text-ink">
            <SlidersHorizontal size={16} />
            Filters
          </button>
        </div>
      </div>
    </section>
  );
}
