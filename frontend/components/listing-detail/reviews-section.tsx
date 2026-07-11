"use client";

import { Star } from "lucide-react";
import Image from "next/image";
import type { ListingDetail } from "@/types/api";

type ReviewsSectionProps = {
  listing: ListingDetail;
};

const dateFormatter = new Intl.DateTimeFormat("en", {
  month: "short",
  year: "numeric"
});

export function ReviewsSection({ listing }: ReviewsSectionProps) {
  return (
    <section className="py-8">
      <div className="flex items-center gap-2">
        <Star size={20} className="fill-ink" />
        <h2 className="text-[21px] font-bold text-ink">
          {listing.rating ?? "New"} · {listing.review_count} reviews
        </h2>
      </div>

      <div className="mt-6 grid gap-x-12 gap-y-8 md:grid-cols-2">
        {listing.reviews.slice(0, 6).map((review) => (
          <article key={review.id}>
            <div className="flex items-center gap-3">
              <div className="relative h-11 w-11 overflow-hidden rounded-full bg-surface-strong">
                <Image src={review.author.avatar_url} alt={review.author.name} fill sizes="44px" className="object-cover" />
              </div>
              <div>
                <p className="text-sm font-semibold text-ink">{review.author.name}</p>
                <p className="text-sm text-muted">{dateFormatter.format(new Date(review.created_at))}</p>
              </div>
            </div>
            <p className="mt-3 line-clamp-3 text-sm leading-6 text-body">{review.comment}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
