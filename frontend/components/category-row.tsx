"use client";

import { Building2, Castle, Home, Mountain, Palmtree, Sailboat, TreePine, Waves } from "lucide-react";
import clsx from "clsx";
import type { Amenity, ListingFilters } from "@/types/api";

const categories = [
  { label: "All", value: "", icon: Home },
  { label: "Villa", value: "Villa", icon: Palmtree },
  { label: "Apartment", value: "Apartment", icon: Building2 },
  { label: "Cabin", value: "Cabin", icon: TreePine },
  { label: "Bungalow", value: "Bungalow", icon: Waves },
  { label: "Chalet", value: "Chalet", icon: Mountain },
  { label: "Heritage", value: "Heritage", icon: Castle },
  { label: "Beach", value: "Beach", icon: Sailboat }
];

type CategoryRowProps = {
  amenities: Amenity[] | undefined;
  filters: ListingFilters;
  onChange: (filters: ListingFilters) => void;
};

export function CategoryRow({ amenities, filters, onChange }: CategoryRowProps) {
  function setPropertyType(propertyType: string) {
    onChange({ ...filters, propertyType, page: 1 });
  }

  function toggleAmenity(amenityId: number) {
    const value = String(amenityId);
    const nextAmenities = filters.amenities.includes(value)
      ? filters.amenities.filter((item) => item !== value)
      : [...filters.amenities, value];

    onChange({ ...filters, amenities: nextAmenities, page: 1 });
  }

  return (
    <div className="flex gap-6 overflow-x-auto py-1 airbnb-hide-scrollbar">
        {categories.map((category) => {
          const Icon = category.icon;
          const isActive = filters.propertyType === category.value;

          return (
            <button
              key={category.label}
              className={clsx(
                "flex min-w-fit flex-col items-center gap-2 border-b-2 pb-2 text-xs font-semibold transition",
                isActive ? "border-ink text-ink" : "border-transparent text-muted hover:border-hairline hover:text-ink"
              )}
              onClick={() => setPropertyType(category.value)}
            >
              <Icon size={24} strokeWidth={1.8} />
              {category.label}
            </button>
          );
        })}

        <div className="h-12 w-px shrink-0 bg-hairline" />

        {(amenities ?? []).slice(0, 8).map((amenity) => {
          const isActive = filters.amenities.includes(String(amenity.id));

          return (
            <button
              key={amenity.id}
              className={clsx(
                "min-w-fit rounded-full border px-4 py-2 text-sm font-medium transition",
                isActive ? "border-ink bg-ink text-white" : "border-hairline text-ink hover:border-ink"
              )}
              onClick={() => toggleAmenity(amenity.id)}
            >
              {amenity.name}
            </button>
          );
        })}
    </div>
  );
}
