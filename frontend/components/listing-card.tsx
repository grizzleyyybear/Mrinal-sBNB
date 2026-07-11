"use client";

import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { SaveButton } from "@/components/save-button";
import { detailMediaFor } from "@/lib/listing-media";
import { useSearchStore } from "@/lib/search-store";
import type { ListingCard as ListingCardType } from "@/types/api";

type ListingCardProps = {
  listing: ListingCardType;
  onToggleWishlist: (listingId: number) => void;
  isToggling: boolean;
};

const formatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0
});

export function ListingCard({ listing, onToggleWishlist, isToggling }: ListingCardProps) {
  const price = formatter.format(Number(listing.price_per_night));
  const [photoIndex, setPhotoIndex] = useState(0);
  const searchParams = useSearchParams();
  const { checkIn, checkOut, guests } = useSearchStore();
  const photos = Array.from({ length: 5 }, (_, index) => detailMediaFor(listing.id, listing.first_photo_url, index));
  const query = new URLSearchParams();
  const selectedCheckIn = checkIn || searchParams.get("check_in") || "";
  const selectedCheckOut = checkOut || searchParams.get("check_out") || "";
  const selectedGuests = guests > 1 ? guests : Math.max(1, Number(searchParams.get("guests") ?? 1));
  if (selectedCheckIn) query.set("check_in", selectedCheckIn);
  if (selectedCheckOut) query.set("check_out", selectedCheckOut);
  if (selectedGuests > 1) query.set("guests", String(selectedGuests));
  const listingHref = `/listings/${listing.id}${query.size ? `?${query.toString()}` : ""}`;

  function movePhoto(event: React.MouseEvent<HTMLButtonElement>, direction: -1 | 1) {
    event.preventDefault();
    event.stopPropagation();
    setPhotoIndex((current) => (current + direction + photos.length) % photos.length);
  }

  return (
    <article className="group min-w-0">
      <div className="relative aspect-square overflow-hidden rounded-air bg-surface-strong">
        {photos[photoIndex] ? (
          <Image
            src={photos[photoIndex]}
            alt={listing.title}
            fill
            sizes="(min-width: 1536px) 20vw, (min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="h-full w-full bg-surface-strong" />
        )}
        <Link href={listingHref} className="absolute inset-0 z-0" aria-label={`View ${listing.title}`} />

        {listing.rating && listing.rating >= 4.7 ? (
          <span className="absolute left-3 top-3 z-10 rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-ink shadow-airbnb">
            Guest favorite
          </span>
        ) : null}

        <SaveButton saved={listing.is_wishlisted} disabled={isToggling} onToggle={() => onToggleWishlist(listing.id)} />

        <button type="button" className="absolute left-3 top-1/2 z-10 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full bg-white/95 text-ink shadow-sm transition hover:scale-105 active:scale-95" onClick={(event) => movePhoto(event, -1)} aria-label={`Show previous photo for ${listing.title}`}><ChevronLeft size={18} /></button>
        <button type="button" className="absolute right-3 top-1/2 z-10 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full bg-white/95 text-ink shadow-sm transition hover:scale-105 active:scale-95" onClick={(event) => movePhoto(event, 1)} aria-label={`Show next photo for ${listing.title}`}><ChevronRight size={18} /></button>
        <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1" aria-hidden="true">
          {photos.map((_, index) => <span key={index} className={`h-1.5 w-1.5 rounded-full transition ${index === photoIndex ? "bg-white" : "bg-white/55"}`} />)}
        </div>
      </div>

      <Link href={listingHref} className="mt-3 block">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-[15px] font-semibold leading-5 text-ink">{listing.title}</h2>
            <p className="mt-0.5 text-sm leading-5 text-muted">
              {listing.location_city}, {listing.location_country}
            </p>
            <p className="text-sm leading-5 text-muted">
              {listing.beds} beds · {listing.baths} baths · Up to {listing.max_guests} guests
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-1 text-sm text-ink">
            <Star size={13} className="fill-ink" />
            <span>{listing.rating ?? "New"}</span>
          </div>
        </div>

        <p className="mt-1 text-sm text-ink">
          <span className="font-semibold">{price}</span> night
        </p>
      </Link>
    </article>
  );
}
