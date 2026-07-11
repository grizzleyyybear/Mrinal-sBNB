"use client";

import { SlidersHorizontal, X } from "lucide-react";
import { useState } from "react";
import { CategoryRow } from "@/components/category-row";
import type { Amenity, ListingFilters } from "@/types/api";

type SearchResultsToolbarProps = {
  amenities: Amenity[] | undefined;
  filters: ListingFilters;
  onChange: (filters: ListingFilters) => void;
  onClear: () => void;
};

export function SearchResultsToolbar({ amenities, filters, onChange, onClear }: SearchResultsToolbarProps) {
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const hasExtraFilters = Boolean(filters.propertyType || filters.amenities.length || filters.minPrice || filters.maxPrice || filters.minBedrooms || filters.minBeds || filters.minBaths || filters.guests > 1);

  function updateFilters(patch: Partial<ListingFilters>) {
    onChange({ ...filters, ...patch, page: 1 });
  }

  function togglePropertyType(type: string) {
    const selected = filters.propertyType.split(",").filter(Boolean);
    const propertyType = selected.includes(type) ? selected.filter((value) => value !== type).join(",") : [...selected, type].join(",");
    updateFilters({ propertyType });
  }

  function toggleAmenity(amenityId: string) {
    updateFilters({ amenities: filters.amenities.includes(amenityId) ? filters.amenities.filter((value) => value !== amenityId) : [...filters.amenities, amenityId] });
  }

  function applyPrice(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsFiltersOpen(false);
  }

  return (
    <>
      <div className="border-b border-hairline-soft bg-white">
        <div className="mx-auto flex max-w-[1678px] items-center gap-3 px-5 py-3 xl:px-0">
          <div className="min-w-0 flex-1">
            <CategoryRow amenities={amenities} filters={filters} onChange={onChange} />
          </div>
          <button
            type="button"
            className="relative flex h-11 shrink-0 items-center gap-2 rounded-xl border border-ink px-4 text-sm font-semibold text-ink transition hover:bg-surface-soft"
            onClick={() => setIsFiltersOpen(true)}
          >
            <SlidersHorizontal size={16} />
            Filters
            {hasExtraFilters ? <span className="h-2 w-2 rounded-full bg-rausch" /> : null}
          </button>
          {(hasExtraFilters || filters.location || filters.checkIn || filters.checkOut || filters.guests > 1) ? (
            <button type="button" className="hidden h-11 items-center gap-1 rounded-xl px-3 text-sm font-semibold underline hover:bg-surface-soft sm:flex" onClick={onClear}>
              <X size={16} /> Clear all
            </button>
          ) : null}
        </div>
      </div>

      {isFiltersOpen ? (
        <div className="fixed inset-0 z-[60] bg-black/45 px-4 py-8" role="dialog" aria-modal="true" aria-label="Filters">
          <form className="airbnb-surface-enter mx-auto mt-[6vh] flex max-h-[88vh] w-full max-w-[680px] flex-col overflow-hidden rounded-air bg-white shadow-airbnb" onSubmit={applyPrice}>
            <div className="flex items-center justify-between border-b border-hairline-soft p-5">
              <h2 className="text-[20px] font-semibold text-ink">Filters</h2>
              <button type="button" className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-surface-soft" onClick={() => setIsFiltersOpen(false)} aria-label="Close filters">
                <X size={19} />
              </button>
            </div>
            <div className="airbnb-scrollbar flex-1 space-y-6 overflow-y-auto p-5">
              <fieldset>
                <legend className="text-base font-semibold text-ink">Price range</legend>
                <p className="mt-1 text-sm text-muted">Nightly price before fees and taxes.</p>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <label className="rounded-lg border border-hairline px-3 py-2 focus-within:border-ink">
                    <span className="block text-[11px] font-semibold uppercase text-muted">Minimum</span>
                    <input
                      className="mt-1 w-full bg-transparent text-sm outline-none"
                      inputMode="numeric"
                      min="0"
                      placeholder="No minimum"
                      value={filters.minPrice}
                      onChange={(event) => updateFilters({ minPrice: event.target.value })}
                    />
                  </label>
                  <label className="rounded-lg border border-hairline px-3 py-2 focus-within:border-ink">
                    <span className="block text-[11px] font-semibold uppercase text-muted">Maximum</span>
                    <input
                      className="mt-1 w-full bg-transparent text-sm outline-none"
                      inputMode="numeric"
                      min="0"
                      placeholder="No maximum"
                      value={filters.maxPrice}
                      onChange={(event) => updateFilters({ maxPrice: event.target.value })}
                    />
                  </label>
                </div>
              </fieldset>
              <fieldset>
                <legend className="text-base font-semibold text-ink">Type of place</legend>
                <div className="mt-3 flex flex-wrap gap-2">
                  {["Villa", "Apartment", "Cabin", "Bungalow", "Chalet", "Heritage", "Beach", "House", "Loft", "Flat", "Serviced apartment"].map((type) => <button key={type} type="button" className={`rounded-full border px-3 py-2 text-sm font-medium transition ${filters.propertyType.split(",").includes(type) ? "border-ink bg-ink text-white" : "border-hairline text-ink hover:border-ink"}`} onClick={() => togglePropertyType(type)}>{type}</button>)}
                </div>
              </fieldset>
              <fieldset>
                <legend className="text-base font-semibold text-ink">Rooms and beds</legend>
                <div className="mt-3 grid gap-4 sm:grid-cols-3">
                  {[{ label: "Bedrooms", key: "minBedrooms" as const }, { label: "Beds", key: "minBeds" as const }, { label: "Bathrooms", key: "minBaths" as const }].map((group) => <div key={group.key}><p className="text-sm text-muted">{group.label}</p><div className="mt-2 flex flex-wrap gap-2">{["", "1", "2", "3", "4"].map((value) => <button key={value || "any"} type="button" className={`min-w-10 rounded-full border px-3 py-2 text-sm font-medium transition ${filters[group.key] === value ? "border-ink bg-ink text-white" : "border-hairline text-ink hover:border-ink"}`} onClick={() => updateFilters({ [group.key]: value })}>{value ? `${value}+` : "Any"}</button>)}</div></div>)}
                </div>
              </fieldset>
              <fieldset>
                <legend className="text-base font-semibold text-ink">Guest capacity</legend>
                <div className="mt-3 flex flex-wrap gap-2">{[1, 4, 8, 12, 16, 20].map((count) => <button key={count} type="button" className={`rounded-full border px-3 py-2 text-sm font-medium transition ${filters.guests === count ? "border-ink bg-ink text-white" : "border-hairline text-ink hover:border-ink"}`} onClick={() => updateFilters({ guests: count })}>{count === 1 ? "Any" : `${count}+ guests`}</button>)}</div>
              </fieldset>
              <fieldset>
                <legend className="text-base font-semibold text-ink">Amenities</legend>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">{(amenities ?? []).map((amenity) => { const selected = filters.amenities.includes(String(amenity.id)); return <button key={amenity.id} type="button" className={`flex items-center justify-between rounded-lg border px-3 py-3 text-left text-sm font-medium transition ${selected ? "border-ink bg-surface-soft text-ink" : "border-hairline text-body hover:border-ink"}`} onClick={() => toggleAmenity(String(amenity.id))}><span>{amenity.name}</span><span className={`grid h-5 w-5 place-items-center rounded border text-xs ${selected ? "border-ink bg-ink text-white" : "border-hairline text-transparent"}`}>✓</span></button>})}</div>
              </fieldset>
            </div>
            <div className="flex items-center justify-between border-t border-hairline-soft p-5">
              <button type="button" className="text-sm font-semibold underline" onClick={() => { onClear(); setIsFiltersOpen(false); }}>Clear all</button>
              <button className="h-12 rounded-lg bg-rausch px-6 text-sm font-semibold text-white transition hover:bg-rausch-active">Show stays</button>
            </div>
          </form>
        </div>
      ) : null}
    </>
  );
}
