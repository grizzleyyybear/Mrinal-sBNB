"use client";

import { Heart, Loader2, MapPin, Share, Star } from "lucide-react";
import Image from "next/image";
import { useParams, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { AmenitiesList } from "@/components/listing-detail/amenities-list";
import { BookingWidget } from "@/components/listing-detail/booking-widget";
import { HostCard } from "@/components/listing-detail/host-card";
import { PhotoGallery } from "@/components/listing-detail/photo-gallery";
import { ReviewsSection } from "@/components/listing-detail/reviews-section";
import { StaticMap } from "@/components/listing-detail/static-map";
import { TopNav } from "@/components/top-nav";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useListingDetail, useUsers, useWishlistToggle } from "@/hooks/use-listings";

export default function ListingDetailPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const listingId = Number(params.id);
  const usersQuery = useUsers();
  const { currentUser, currentUserId, selectUser } = useCurrentUser(usersQuery.data);
  const listingQuery = useListingDetail(listingId, currentUserId);
  const listing = listingQuery.data;
  const wishlistToggle = useWishlistToggle(currentUserId);
  const initialCheckIn = searchParams.get("check_in") ?? "";
  const initialCheckOut = searchParams.get("check_out") ?? "";
  const initialGuests = Math.max(1, Number(searchParams.get("guests") ?? 1));

  async function shareListing() {
    const shareData = {
      title: listing?.title ?? "Stay on Airbnb",
      text: listing ? `${listing.title} in ${listing.location_city}` : "",
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        toast.success("Listing link copied");
      }
    } catch (error) {
      if ((error as DOMException).name !== "AbortError") {
        toast.error("Could not share this listing.");
      }
    }
  }

  return (
    <main className="min-h-screen bg-white">
      <TopNav users={usersQuery.data} currentUser={currentUser} onUserChange={selectUser} />

      {listingQuery.isLoading ? (
        <div className="grid min-h-[70vh] place-items-center">
          <Loader2 className="animate-spin text-rausch" size={32} />
        </div>
      ) : null}

      {listingQuery.isError ? (
        <div className="mx-auto grid min-h-[70vh] max-w-[1128px] place-items-center px-5 text-center">
          <div>
            <h1 className="text-[28px] font-bold text-ink">This stay is unavailable</h1>
            <p className="mt-2 text-sm text-muted">The listing could not be loaded. Check that the backend is running.</p>
          </div>
        </div>
      ) : null}

      {listing ? (
        <div className="airbnb-page airbnb-page--detail py-6">
          <section>
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <h1 className="text-[26px] font-semibold leading-tight text-ink">{listing.title}</h1>
                <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-ink">
                  <Star size={14} className="fill-ink" />
                  <span className="font-semibold">{listing.rating ?? "New"}</span>
                  <span>·</span>
                  <span className="underline">{listing.review_count} reviews</span>
                  <span>·</span>
                  <span className="flex items-center gap-1 underline">
                    <MapPin size={14} />
                    {listing.location_city}, {listing.location_country}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button type="button" className="flex h-10 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-ink transition hover:bg-surface-soft" onClick={shareListing}><Share size={16} /> <span className="underline">Share</span></button>
                <button
                  type="button"
                  className="flex h-10 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-ink transition hover:bg-surface-soft"
                  disabled={wishlistToggle.isPending}
                  onClick={() => wishlistToggle.mutate(listing.id)}
                >
                  <Heart size={17} className={listing.is_wishlisted ? "fill-rausch text-rausch" : ""} /> <span className="underline">Save</span>
                </button>
              </div>
            </div>

            <PhotoGallery listing={listing} />
          </section>

          <div className="mt-8 grid gap-12 lg:grid-cols-[minmax(0,1fr)_372px]">
            <div>
              <section className="border-b border-hairline-soft pb-8">
                <div className="flex items-start justify-between gap-6">
                  <div>
                    <h2 className="text-[22px] font-semibold leading-7 text-ink">
                      {listing.property_type} hosted by {listing.host.name}
                    </h2>
                    <p className="mt-1 text-base text-body">
                      {listing.max_guests} guests · {listing.bedrooms} bedrooms · {listing.beds} beds · {listing.baths} baths
                    </p>
                  </div>
                  <Image src={listing.host.avatar_url} alt="" width={56} height={56} className="h-14 w-14 shrink-0 rounded-full object-cover" />
                </div>
              </section>

              <section className="border-b border-hairline-soft py-8">
                <p className="max-w-[680px] text-base leading-7 text-body">{listing.description}</p>
              </section>

              <AmenitiesList amenities={listing.amenities} />
              <HostCard host={listing.host} />
              <StaticMap listing={listing} />
              <ReviewsSection listing={listing} />
            </div>

            <div className="hidden lg:block">
              <BookingWidget key={`${listing.id}-${initialCheckIn}-${initialCheckOut}-${initialGuests}`} listing={listing} initialCheckIn={initialCheckIn} initialCheckOut={initialCheckOut} initialGuests={initialGuests} />
            </div>
          </div>

          <div className="fixed inset-x-0 bottom-0 z-30 border-t border-hairline bg-white p-4 lg:hidden">
            <div className="mx-auto flex max-w-[1128px] items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-ink">₹{Number(listing.price_per_night).toLocaleString("en-IN")} night</p>
                <p className="text-xs text-muted">{listing.rating ?? "New"} · {listing.review_count} reviews</p>
              </div>
              <a href="#reserve" className="rounded-lg bg-rausch px-6 py-3 text-sm font-medium text-white">
                Reserve
              </a>
            </div>
          </div>

          <div id="reserve" className="mt-8 pb-24 lg:hidden">
            <BookingWidget key={`${listing.id}-${initialCheckIn}-${initialCheckOut}-${initialGuests}`} listing={listing} initialCheckIn={initialCheckIn} initialCheckOut={initialCheckOut} initialGuests={initialGuests} />
          </div>
        </div>
      ) : null}
    </main>
  );
}
