"use client";

import { MapPin } from "lucide-react";
import Link from "next/link";
import type { ListingCard } from "@/types/api";

type RegionalMapProps = {
  listings: ListingCard[];
  selectedRegion: string;
  onRegionSelect: (region: string) => void;
};

const currency = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

function point(value: number, min: number, max: number) {
  if (min === max) return 50;
  return 12 + ((value - min) / (max - min)) * 76;
}

type MarkerPosition = { id: number; left: number; top: number };

function layoutMarkers(listings: ListingCard[], minLat: number, maxLat: number, minLng: number, maxLng: number) {
  const placed: MarkerPosition[] = [];

  listings.forEach((listing) => {
    const originLeft = point(listing.lng, minLng, maxLng);
    const originTop = 100 - point(listing.lat, minLat, maxLat);
    let left = originLeft;
    let top = originTop;

    for (let attempt = 0; attempt < 24; attempt += 1) {
      const collides = placed.some((marker) => Math.abs(marker.left - left) < 17 && Math.abs(marker.top - top) < 10);
      if (!collides) break;
      const angle = (attempt * 137.5 * Math.PI) / 180;
      const radius = 7 + Math.floor(attempt / 4) * 4;
      left = Math.min(88, Math.max(12, originLeft + Math.cos(angle) * radius));
      top = Math.min(88, Math.max(12, originTop + Math.sin(angle) * radius));
    }

    placed.push({ id: listing.id, left, top });
  });

  return new Map(placed.map((marker) => [marker.id, marker]));
}

export function RegionalMap({ listings, selectedRegion, onRegionSelect }: RegionalMapProps) {
  const regions = Array.from(new Set(listings.map((listing) => listing.location_city)));
  const latitudes = listings.map((listing) => listing.lat);
  const longitudes = listings.map((listing) => listing.lng);
  const minLat = Math.min(...latitudes);
  const maxLat = Math.max(...latitudes);
  const minLng = Math.min(...longitudes);
  const maxLng = Math.max(...longitudes);
  const markerPositions = layoutMarkers(listings, minLat, maxLat, minLng, maxLng);

  return (
    <section className="overflow-hidden rounded-air border border-hairline bg-white shadow-sm">
      <div className="border-b border-hairline-soft p-5">
        <p className="text-base font-semibold text-ink">Explore by region</p>
        <p className="mt-1 text-sm text-muted">Choose a city or a home pin to refine your search.</p>
        <div className="mt-4 flex gap-2 overflow-x-auto pb-1 airbnb-hide-scrollbar">
          <button type="button" className={`shrink-0 rounded-full border px-3 py-2 text-xs font-semibold transition ${!selectedRegion ? "border-ink bg-ink text-white" : "border-hairline text-ink hover:border-ink"}`} onClick={() => onRegionSelect("")}>All regions</button>
          {regions.map((region) => <button key={region} type="button" className={`shrink-0 rounded-full border px-3 py-2 text-xs font-semibold transition ${selectedRegion === region ? "border-ink bg-ink text-white" : "border-hairline text-ink hover:border-ink"}`} onClick={() => onRegionSelect(region)}>{region}</button>)}
        </div>
      </div>
      <div className="relative min-h-[420px] overflow-hidden bg-[#e8efe7]" aria-label="Map of available stays">
        <div className="absolute inset-x-[-12%] top-[22%] h-16 -rotate-6 bg-white/65" />
        <div className="absolute inset-x-[-12%] top-[66%] h-10 rotate-3 bg-white/55" />
        <div className="absolute left-[22%] top-[-10%] h-[120%] w-10 rotate-[18deg] bg-white/50" />
        <div className="absolute left-[70%] top-[-10%] h-[120%] w-8 -rotate-[14deg] bg-white/65" />
        {listings.map((listing) => {
          const marker = markerPositions.get(listing.id)!;
          const isSelected = Boolean(selectedRegion && listing.location_city === selectedRegion);
          return (
            <Link key={listing.id} href={`/listings/${listing.id}`} className="group absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${marker.left}%`, top: `${marker.top}%` }} aria-label={`View ${listing.title}`}>
              <span className={`relative z-10 flex items-center gap-1 rounded-full border px-3 py-2 text-xs font-semibold shadow-airbnb transition group-hover:scale-105 ${isSelected ? "border-ink bg-ink text-white" : "border-ink bg-white text-ink group-hover:bg-ink group-hover:text-white"}`}>{currency.format(Number(listing.price_per_night))}<MapPin size={13} /></span>
            </Link>
          );
        })}
        <div className="absolute bottom-4 left-4 rounded-full bg-white/90 px-3 py-2 text-xs font-semibold text-muted shadow-sm">{listings.length} homes on the map</div>
      </div>
    </section>
  );
}
