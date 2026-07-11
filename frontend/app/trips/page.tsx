"use client";

import { CalendarDays, Loader2, MapPin, PartyPopper, UsersRound } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";
import { TopNav } from "@/components/top-nav";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useCancelBooking, useCreateReview, useMyBookings, useUsers } from "@/hooks/use-listings";
import { detailMediaFor } from "@/lib/listing-media";
import type { Booking } from "@/types/api";

const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0
});

function isCompletedStay(booking: Booking) {
  return new Date(`${booking.check_out}T00:00:00`) <= new Date();
}

function TripReviewForm({
  booking,
  onSubmit,
  isSubmitting
}: {
  booking: Booking;
  onSubmit: (payload: { listing_id: number; booking_id: number; rating: number; comment: string }) => void;
  isSubmitting: boolean;
}) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  function submitReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit({
      listing_id: booking.listing_id,
      booking_id: booking.id,
      rating,
      comment
    });
    setComment("");
    setRating(5);
  }

  if (!isCompletedStay(booking)) {
    return null;
  }

  return (
    <form className="mt-5 rounded-lg border border-hairline-soft p-4" onSubmit={submitReview}>
      <p className="text-sm font-semibold text-ink">Leave a review</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-[120px_1fr_auto]">
        <select className="h-11 rounded-lg border border-hairline px-3 text-sm" value={rating} onChange={(event) => setRating(Number(event.target.value))}>
          {[5, 4, 3, 2, 1].map((value) => (
            <option key={value} value={value}>
              {value} stars
            </option>
          ))}
        </select>
        <input
          className="h-11 rounded-lg border border-hairline px-3 text-sm outline-none focus:border-ink"
          placeholder="Share a quick note about your stay"
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          required
        />
        <button className="h-11 rounded-lg bg-ink px-4 text-sm font-medium text-white disabled:bg-muted" disabled={isSubmitting || comment.length < 2}>
          Post
        </button>
      </div>
    </form>
  );
}

function TripsContent() {
  const searchParams = useSearchParams();
  const confirmedId = searchParams.get("confirmed");
  const usersQuery = useUsers();
  const { currentUser, currentUserId, selectUser } = useCurrentUser(usersQuery.data);
  const bookingsQuery = useMyBookings(currentUserId);
  const createReview = useCreateReview(currentUserId);
  const cancelBooking = useCancelBooking(currentUserId);
  const bookings = bookingsQuery.data ?? [];

  return (
    <main className="min-h-screen bg-white">
      <TopNav users={usersQuery.data} currentUser={currentUser} onUserChange={selectUser} />

      <section className="airbnb-page airbnb-page--detail py-8">
        {confirmedId ? (
          <div className="mb-8 flex items-start gap-4 rounded-air border border-hairline bg-surface-soft p-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rausch text-white">
              <PartyPopper size={20} />
            </div>
            <div>
              <p className="font-semibold text-ink">Booking confirmed</p>
              <p className="mt-1 text-sm text-muted">Your trip #{confirmedId} is saved and those dates are now blocked for this stay.</p>
            </div>
          </div>
        ) : null}

        <div className="mb-8">
          <h1 className="text-[28px] font-bold text-ink">Trips</h1>
          <p className="mt-1 text-sm text-muted">
            {currentUser ? `Bookings for ${currentUser.name}` : "Your upcoming and past stays"}
          </p>
        </div>

        {bookingsQuery.isLoading ? (
          <div className="grid min-h-[360px] place-items-center">
            <Loader2 className="animate-spin text-rausch" size={32} />
          </div>
        ) : null}

        {bookingsQuery.isError ? (
          <div className="grid min-h-[360px] place-items-center rounded-air border border-hairline p-8 text-center">
            <p className="max-w-md text-sm text-muted">Trips could not be loaded. Check that the backend is running.</p>
          </div>
        ) : null}

        {!bookingsQuery.isLoading && !bookingsQuery.isError && bookings.length === 0 ? (
          <div className="grid min-h-[360px] place-items-center rounded-air border border-hairline p-8 text-center">
            <div>
              <h2 className="text-xl font-semibold text-ink">No trips booked yet</h2>
              <p className="mt-2 text-sm text-muted">When you book a stay, it will show up here.</p>
              <Link href="/" className="mt-5 inline-flex h-12 items-center rounded-lg bg-rausch px-6 text-sm font-medium text-white">
                Start exploring
              </Link>
            </div>
          </div>
        ) : null}

        <div className="grid gap-6 md:grid-cols-2">
          {bookings.map((booking) => (
            <article key={booking.id} className="overflow-hidden rounded-air border border-hairline bg-white shadow-sm">
              <div className="relative h-56 bg-surface-strong">
                {booking.listing.first_photo_url ? (
                  <Image
                    src={detailMediaFor(booking.listing.id, booking.listing.first_photo_url)}
                    alt={booking.listing.title}
                    fill
                    sizes="(min-width: 768px) 50vw, 100vw"
                    className="object-cover"
                  />
                ) : null}
              </div>

              <div className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="line-clamp-1 text-lg font-semibold text-ink">{booking.listing.title}</h2>
                    <p className="mt-1 flex items-center gap-1 text-sm text-muted">
                      <MapPin size={14} />
                      {booking.listing.location_city}, {booking.listing.location_country}
                    </p>
                  </div>
                  <span className="rounded-full bg-surface-soft px-3 py-1 text-xs font-semibold capitalize text-ink">{booking.status}</span>
                </div>

                <div className="mt-5 grid gap-3 text-sm text-body sm:grid-cols-2">
                  <div className="flex items-center gap-2">
                    <CalendarDays size={16} />
                    <span>
                      {booking.check_in} to {booking.check_out}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <UsersRound size={16} />
                    <span>
                      {booking.guests} guest{booking.guests === 1 ? "" : "s"}
                    </span>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-hairline-soft pt-4">
                  <p className="text-sm text-muted">Total paid</p>
                  <p className="font-semibold text-ink">{currency.format(Number(booking.total_price))}</p>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Link href={`/listings/${booking.listing_id}`} className="inline-flex h-10 items-center rounded-lg border border-ink px-4 text-sm font-medium text-ink">
                    View listing
                  </Link>
                  {booking.status === "confirmed" ? (
                    <button
                      className="inline-flex h-10 items-center rounded-lg border border-hairline px-4 text-sm font-medium text-ink"
                      disabled={cancelBooking.isPending}
                      onClick={() => cancelBooking.mutate(booking.id)}
                    >
                      Cancel booking
                    </button>
                  ) : null}
                </div>

                <TripReviewForm
                  booking={booking}
                  isSubmitting={createReview.isPending}
                  onSubmit={(payload) => createReview.mutate(payload)}
                />
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

export default function TripsPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-white">
          <div className="grid min-h-screen place-items-center">
            <Loader2 className="animate-spin text-rausch" size={32} />
          </div>
        </main>
      }
    >
      <TripsContent />
    </Suspense>
  );
}
