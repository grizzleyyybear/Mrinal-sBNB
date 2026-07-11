"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { SaveButton } from "@/components/save-button";
import { detailMediaFor } from "@/lib/listing-media";
import { useSearchStore } from "@/lib/search-store";
import type { ListingCard as ListingCardType } from "@/types/api";

type HomeCardProps = {
  listing: ListingCardType;
  onToggleWishlist: (listingId: number) => void;
  isToggling: boolean;
};

const formatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0
});

function formatRating(rating: number | null) {
  if (!rating) {
    return "New";
  }

  return Number.isInteger(rating) ? rating.toFixed(1) : rating.toFixed(2).replace(/0$/, "");
}

export function HomeCard({ listing, onToggleWishlist, isToggling }: HomeCardProps) {
  const twoNightPrice = formatter.format(Number(listing.price_per_night) * 2);
  const photoUrl = detailMediaFor(listing.id, listing.first_photo_url);
  const searchParams = useSearchParams();
  const { checkIn, checkOut, guests } = useSearchStore();
  const query = new URLSearchParams();
  const selectedCheckIn = checkIn || searchParams.get("check_in") || "";
  const selectedCheckOut = checkOut || searchParams.get("check_out") || "";
  const selectedGuests = guests > 1 ? guests : Math.max(1, Number(searchParams.get("guests") ?? 1));
  if (selectedCheckIn) query.set("check_in", selectedCheckIn);
  if (selectedCheckOut) query.set("check_out", selectedCheckOut);
  if (selectedGuests > 1) query.set("guests", String(selectedGuests));
  const listingHref = `/listings/${listing.id}${query.size ? `?${query.toString()}` : ""}`;

  return (
    <article className="w-[210px] shrink-0 sm:w-[226px]">
      <div className="relative h-[200px] overflow-hidden rounded-air bg-surface-strong sm:h-[216px]">
        <Link href={listingHref} aria-label={listing.title}>
          {photoUrl ? (
            <Image
              src={photoUrl}
              alt={listing.title}
              fill
              sizes="(max-width: 639px) 210px, 226px"
              className="h-full w-full object-cover transition duration-300 hover:scale-[1.02]"
            />
          ) : (
            <div className="h-full w-full bg-surface-strong" />
          )}
        </Link>

        {listing.rating && listing.rating >= 4.7 ? (
          <span className="absolute left-3 top-3 rounded-full bg-white px-3 py-2 text-sm font-semibold leading-none text-ink shadow-sm">
            Guest favourite
          </span>
        ) : null}

        <SaveButton
          saved={listing.is_wishlisted}
          disabled={isToggling}
          onToggle={() => {
            onToggleWishlist(listing.id);
            toast.success(listing.is_wishlisted ? "Removed from wishlist" : "Saved to wishlist");
          }}
        />
      </div>

      <Link href={listingHref} className="mt-2 block">
        <h3 className="truncate text-base font-semibold leading-5 text-ink">{listing.title}</h3>
        <p className="mt-1 truncate text-[15px] leading-5 text-muted">
          {twoNightPrice} for 2 nights · ★ {formatRating(listing.rating)}
        </p>
      </Link>
    </article>
  );
}
