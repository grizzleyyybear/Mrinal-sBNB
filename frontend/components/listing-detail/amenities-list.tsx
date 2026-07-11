"use client";

import {
  Car,
  Coffee,
  KeyRound,
  Laptop,
  Mountain,
  PawPrint,
  Snowflake,
  Umbrella,
  Utensils,
  WashingMachine,
  Waves,
  Wifi
} from "lucide-react";
import type { Amenity } from "@/types/api";

const icons = {
  car: Car,
  coffee: Coffee,
  "key-round": KeyRound,
  laptop: Laptop,
  mountain: Mountain,
  "paw-print": PawPrint,
  snowflake: Snowflake,
  umbrella: Umbrella,
  utensils: Utensils,
  "washing-machine": WashingMachine,
  waves: Waves,
  wifi: Wifi
};

type AmenitiesListProps = {
  amenities: Amenity[];
};

export function AmenitiesList({ amenities }: AmenitiesListProps) {
  return (
    <section className="border-y border-hairline-soft py-8">
      <h2 className="text-[21px] font-bold leading-7 text-ink">What this place offers</h2>
      <div className="mt-5 grid gap-x-8 gap-y-4 sm:grid-cols-2">
        {amenities.map((amenity) => {
          const Icon = icons[amenity.icon as keyof typeof icons] ?? Wifi;

          return (
            <div key={amenity.id} className="flex items-center gap-4 py-2 text-base text-ink">
              <Icon size={24} strokeWidth={1.8} />
              <span>{amenity.name}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
