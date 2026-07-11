"use client";

import { MapPin } from "lucide-react";
import type { ListingDetail } from "@/types/api";

type StaticMapProps = {
  listing: ListingDetail;
};

export function StaticMap({ listing }: StaticMapProps) {
  return (
    <section className="border-b border-hairline-soft py-8">
      <h2 className="text-[21px] font-bold leading-7 text-ink">Where you&apos;ll be</h2>
      <p className="mt-1 text-base text-body">
        {listing.location_city}, {listing.location_country}
      </p>

      <div className="relative mt-5 h-[320px] overflow-hidden rounded-air border border-hairline bg-[#e8efe7]">
        <div className="absolute left-[-10%] top-[40%] h-10 w-[120%] rotate-[-8deg] bg-white/70" />
        <div className="absolute left-[18%] top-[-10%] h-[120%] w-10 rotate-[18deg] bg-white/60" />
        <div className="absolute left-[62%] top-[-10%] h-[130%] w-8 rotate-[-18deg] bg-white/70" />
        <div className="absolute left-[-10%] top-[68%] h-7 w-[120%] rotate-[5deg] bg-white/60" />
        <div className="absolute bottom-8 left-8 rounded-full bg-white/80 px-4 py-2 text-xs font-semibold text-muted shadow-sm">
          {listing.lat.toFixed(4)}, {listing.lng.toFixed(4)}
        </div>
        <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-rausch text-white shadow-airbnb">
            <MapPin size={28} className="fill-rausch" />
          </div>
          <div className="mt-2 rounded-full bg-white px-4 py-1 text-sm font-semibold text-ink shadow-airbnb">Approximate location</div>
        </div>
      </div>
    </section>
  );
}
