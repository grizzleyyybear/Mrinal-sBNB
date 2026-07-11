"use client";

import { Grid3X3, X } from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";
import { detailGalleryFor } from "@/lib/listing-media";
import type { ListingDetail } from "@/types/api";

type PhotoGalleryProps = {
  listing: ListingDetail;
};

export function PhotoGallery({ listing }: PhotoGalleryProps) {
  const [isOpen, setIsOpen] = useState(false);
  const photos = useMemo(() => {
    return detailGalleryFor(listing.id, listing.photos.map((photo) => photo.url));
  }, [listing.id, listing.photos]);

  return (
    <section className="relative mt-6 w-[calc(100vw-40px)] max-w-full overflow-hidden rounded-xl bg-surface-strong md:w-full">
      <div className="grid h-[310px] grid-cols-1 gap-2 md:h-[440px] md:grid-cols-4 md:grid-rows-2">
        {photos.map((url, index) => (
          <button
            type="button"
            key={`${url}-${index}`}
            className={`relative overflow-hidden bg-surface-strong ${index === 0 ? "md:col-span-2 md:row-span-2" : "hidden md:block"}`}
            onClick={() => setIsOpen(true)}
            aria-label={`View photo ${index + 1}`}
          >
            <Image src={url} alt={`${listing.title} photo ${index + 1}`} fill priority={index === 0} sizes={index === 0 ? "(min-width: 768px) 50vw, 100vw" : "25vw"} className="object-cover transition duration-500 hover:scale-[1.02]" />
          </button>
        ))}
      </div>

      <button type="button" className="absolute bottom-4 right-4 flex h-10 items-center gap-2 rounded-lg border border-ink bg-white px-4 text-sm font-semibold text-ink shadow-sm transition hover:bg-surface-soft" onClick={() => setIsOpen(true)}>
        <Grid3X3 size={16} /> Show all photos
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-[70] overflow-y-auto bg-white" role="dialog" aria-modal="true" aria-label="All listing photos">
          <div className="mx-auto max-w-[1128px] px-5 pb-10 sm:px-8 lg:px-0">
            <div className="sticky top-0 z-10 flex h-20 items-center justify-between bg-white">
              <button type="button" className="flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-surface-soft" onClick={() => setIsOpen(false)} aria-label="Close photos"><X size={22} /></button>
              <p className="text-sm font-semibold text-ink">{listing.title}</p>
              <div className="w-10" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {photos.map((url, index) => (
                <div key={`${url}-full-${index}`} className="relative aspect-[4/3] overflow-hidden rounded-xl bg-surface-strong">
                  <Image src={url} alt={`${listing.title} gallery photo ${index + 1}`} fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
