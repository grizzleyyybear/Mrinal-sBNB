"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { HomeCard } from "@/components/home-card";
import type { ListingCard } from "@/types/api";

type HomeShelfProps = {
  title: string;
  searchLocation: string;
  listings: ListingCard[];
  isLoading: boolean;
  isError: boolean;
  isToggling: boolean;
  onToggleWishlist: (listingId: number) => void;
};

export function HomeShelf({ title, searchLocation, listings, isLoading, isError, isToggling, onToggleWishlist }: HomeShelfProps) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  function scrollByCard(direction: -1 | 1) {
    scrollerRef.current?.scrollBy({ left: direction * 520, behavior: "smooth" });
  }

  return (
    <section className="w-full min-w-0 pb-[46px]">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <h2 className="min-w-0 text-[20px] font-semibold leading-6 tracking-normal text-ink sm:text-[26px] sm:font-bold sm:leading-tight">{title}</h2>
          <Link href={`/?location=${encodeURIComponent(searchLocation)}`} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-strong text-ink transition hover:bg-hairline-soft" aria-label={`Explore ${searchLocation}`}>
            <ChevronRight size={22} />
          </Link>
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <button
            className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-soft text-hairline"
            onClick={() => scrollByCard(-1)}
            aria-label={`Scroll ${title} left`}
          >
            <ChevronLeft size={22} />
          </button>
          <button
            className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-strong text-ink"
            onClick={() => scrollByCard(1)}
            aria-label={`Scroll ${title} right`}
          >
            <ChevronRight size={22} />
          </button>
        </div>
      </div>

      {isError ? <p className="rounded-air border border-hairline p-5 text-sm text-muted">Unable to load homes right now.</p> : null}

      {!isError ? (
        <div ref={scrollerRef} className="airbnb-hide-scrollbar flex w-full min-w-0 gap-4 overflow-x-auto pb-1">
          {isLoading
            ? Array.from({ length: 7 }).map((_, index) => (
                <div key={index} className="w-[210px] shrink-0 sm:w-[226px]">
                  <div className="h-[200px] animate-pulse rounded-air bg-surface-strong sm:h-[216px]" />
                  <div className="mt-3 h-4 w-3/4 animate-pulse rounded-full bg-surface-strong" />
                  <div className="mt-2 h-4 w-2/3 animate-pulse rounded-full bg-surface-strong" />
                </div>
              ))
            : listings.map((listing) => (
                <HomeCard
                  key={`${title}-${listing.id}`}
                  listing={listing}
                  isToggling={isToggling}
                  onToggleWishlist={onToggleWishlist}
                />
              ))}

          {!isLoading && listings.length === 0 ? (
            <div className="rounded-air border border-hairline p-5 text-sm text-muted">No homes match these filters yet.</div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
