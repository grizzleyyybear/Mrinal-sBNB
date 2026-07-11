"use client";

import { ListingCard } from "@/components/listing-card";
import type { ListingCard as ListingCardType } from "@/types/api";

type ExploreGridProps = {
  listings: ListingCardType[];
  isLoading: boolean;
  isError: boolean;
  onToggleWishlist: (listingId: number) => void;
  togglingListingId?: number;
};

export function ExploreGrid({ listings, isLoading, isError, onToggleWishlist, togglingListingId }: ExploreGridProps) {
  if (isLoading) {
    return (
      <div className="grid w-full min-w-0 grid-cols-[repeat(2,minmax(0,1fr))] gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4 xl:grid-cols-5">
        {Array.from({ length: 10 }).map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="aspect-square rounded-air bg-surface-strong" />
            <div className="mt-3 h-4 w-3/4 rounded bg-surface-strong" />
            <div className="mt-2 h-3 w-1/2 rounded bg-surface-strong" />
            <div className="mt-2 h-3 w-1/3 rounded bg-surface-strong" />
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="grid min-h-[360px] place-items-center rounded-air border border-hairline p-8 text-center">
        <p className="max-w-md text-sm text-muted">The backend API is not responding yet. Start FastAPI on port 8000 and refresh.</p>
      </div>
    );
  }

  if (!listings.length) {
    return (
      <div className="grid min-h-[360px] place-items-center rounded-air border border-hairline p-8 text-center">
        <div>
          <h2 className="text-xl font-semibold text-ink">No exact matches</h2>
          <p className="mt-2 max-w-md text-sm text-muted">Try changing your destination, dates, guest count, or filters.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid w-full min-w-0 grid-cols-[repeat(2,minmax(0,1fr))] gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4 xl:grid-cols-5">
      {listings.map((listing) => (
        <ListingCard key={listing.id} listing={listing} onToggleWishlist={onToggleWishlist} isToggling={togglingListingId === listing.id} />
      ))}
    </div>
  );
}
