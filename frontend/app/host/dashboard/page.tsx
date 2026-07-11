"use client";

import { CalendarDays, Edit3, Loader2, MapPin, Plus, Trash2, UsersRound } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ListingForm } from "@/components/host/listing-form";
import { TopNav } from "@/components/top-nav";
import { useCurrentUser } from "@/hooks/use-current-user";
import { detailMediaFor } from "@/lib/listing-media";
import {
  useAmenities,
  useCreateListing,
  useDeleteListing,
  useHostDashboard,
  useListingDetail,
  useUpdateListing,
  useUsers
} from "@/hooks/use-listings";
import type { ListingWritePayload } from "@/types/api";

const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0
});

export default function HostDashboardPage() {
  const [editingListingId, setEditingListingId] = useState<number | null>(null);
  const [deleteListingId, setDeleteListingId] = useState<number | null>(null);
  const usersQuery = useUsers();
  const amenitiesQuery = useAmenities();
  const { currentUser, currentUserId, selectUser } = useCurrentUser(usersQuery.data);
  const dashboardQuery = useHostDashboard(currentUserId);
  const editingListingQuery = useListingDetail(editingListingId ?? 0, currentUserId);
  const createListing = useCreateListing(currentUserId);
  const updateListing = useUpdateListing(currentUserId);
  const deleteListing = useDeleteListing(currentUserId);

  const dashboardItems = dashboardQuery.data ?? [];
  const totalBookings = dashboardItems.reduce((sum, item) => sum + item.bookings.length, 0);
  const totalRevenue = dashboardItems.reduce(
    (sum, item) => sum + item.bookings.reduce((bookingSum, booking) => bookingSum + Number(booking.total_price), 0),
    0
  );

  function submitListing(payload: ListingWritePayload) {
    if (editingListingId) {
      updateListing.mutate(
        { listingId: editingListingId, payload },
        {
          onSuccess: () => setEditingListingId(null)
        }
      );
      return;
    }

    createListing.mutate(payload);
  }

  function confirmDelete() {
    if (deleteListingId === null) {
      return;
    }

    deleteListing.mutate(deleteListingId, {
      onSuccess: () => {
        if (editingListingId === deleteListingId) {
          setEditingListingId(null);
        }
        setDeleteListingId(null);
      }
    });
  }

  const listingPendingDelete = dashboardItems.find((item) => item.listing.id === deleteListingId)?.listing;

  return (
    <main className="min-h-screen bg-white">
      <TopNav users={usersQuery.data} currentUser={currentUser} onUserChange={selectUser} />

      <section className="airbnb-page airbnb-page--host py-8">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-[28px] font-bold text-ink">Host dashboard</h1>
            <p className="mt-1 text-sm text-muted">
              {currentUser ? `Managing listings as ${currentUser.name}` : "Manage your homes and bookings"}
            </p>
          </div>
          <Link href="/" className="inline-flex h-11 items-center rounded-lg border border-ink px-5 text-sm font-medium text-ink">
            View explore
          </Link>
        </div>

        {currentUser && !currentUser.is_host ? (
          <div className="grid min-h-[360px] place-items-center rounded-air border border-hairline p-8 text-center">
            <div>
              <h2 className="text-xl font-semibold text-ink">Switch to a host account</h2>
              <p className="mt-2 max-w-md text-sm text-muted">Use the user switcher in the top nav and choose Aanya, Kabir, or Meera to manage listings.</p>
            </div>
          </div>
        ) : null}

        {currentUser?.is_host ? (
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_420px]">
            <div className="space-y-8">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-air border border-hairline p-5">
                  <p className="text-sm text-muted">Active listings</p>
                  <p className="mt-2 text-3xl font-bold text-ink">{dashboardItems.length}</p>
                </div>
                <div className="rounded-air border border-hairline p-5">
                  <p className="text-sm text-muted">Bookings received</p>
                  <p className="mt-2 text-3xl font-bold text-ink">{totalBookings}</p>
                </div>
                <div className="rounded-air border border-hairline p-5">
                  <p className="text-sm text-muted">Mock revenue</p>
                  <p className="mt-2 text-3xl font-bold text-ink">{currency.format(totalRevenue)}</p>
                </div>
              </div>

              <section>
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-[21px] font-bold text-ink">Your listings</h2>
                  <button className="flex items-center gap-2 text-sm font-semibold text-ink underline" onClick={() => setEditingListingId(null)}>
                    <Plus size={16} />
                    New listing
                  </button>
                </div>

                {dashboardQuery.isLoading ? (
                  <div className="grid min-h-[280px] place-items-center">
                    <Loader2 className="animate-spin text-rausch" size={32} />
                  </div>
                ) : null}

                {dashboardQuery.isError ? (
                  <div className="rounded-air border border-hairline p-8 text-sm text-muted">
                    Host dashboard could not be loaded. Make sure the backend is running.
                  </div>
                ) : null}

                <div className="space-y-4">
                  {dashboardItems.map((item) => (
                    <article key={item.listing.id} className="rounded-air border border-hairline bg-white p-4 shadow-sm">
                      <div className="flex flex-col gap-4 sm:flex-row">
                        <div className="relative h-44 overflow-hidden rounded-lg bg-surface-strong sm:h-32 sm:w-44 sm:shrink-0">
                          {item.listing.first_photo_url ? (
                            <Image src={detailMediaFor(item.listing.id, item.listing.first_photo_url)} alt={item.listing.title} fill sizes="176px" className="object-cover" />
                          ) : null}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                              <h3 className="line-clamp-1 text-lg font-semibold text-ink">{item.listing.title}</h3>
                              <p className="mt-1 flex items-center gap-1 text-sm text-muted">
                                <MapPin size={14} />
                                {item.listing.location_city}, {item.listing.location_country}
                              </p>
                              <p className="mt-1 text-sm text-muted">
                                {item.listing.max_guests} guests · {item.listing.beds} beds · {item.listing.baths} baths
                              </p>
                            </div>

                            <p className="shrink-0 text-sm text-ink">
                              <span className="font-semibold">{currency.format(Number(item.listing.price_per_night))}</span> night
                            </p>
                          </div>

                          <div className="mt-4 flex flex-wrap gap-2">
                            <button
                              className="inline-flex h-10 items-center gap-2 rounded-lg border border-ink px-4 text-sm font-medium text-ink"
                              onClick={() => setEditingListingId(item.listing.id)}
                            >
                              <Edit3 size={15} />
                              Edit
                            </button>
                            <button
                              className="inline-flex h-10 items-center gap-2 rounded-lg border border-hairline px-4 text-sm font-medium text-ink"
                              onClick={() => setDeleteListingId(item.listing.id)}
                              disabled={deleteListing.isPending}
                            >
                              <Trash2 size={15} />
                              Delete
                            </button>
                            <Link href={`/listings/${item.listing.id}`} className="inline-flex h-10 items-center rounded-lg border border-hairline px-4 text-sm font-medium text-ink">
                              Preview
                            </Link>
                          </div>
                        </div>
                      </div>

                      {item.bookings.length ? (
                        <div className="mt-4 border-t border-hairline-soft pt-4">
                          <p className="mb-3 text-sm font-semibold text-ink">Bookings received</p>
                          <div className="grid gap-3">
                            {item.bookings.map((booking) => (
                              <div key={booking.id} className="grid gap-2 rounded-lg bg-surface-soft p-3 text-sm text-body md:grid-cols-[1fr_auto_auto] md:items-center">
                                <span className="font-medium text-ink">{booking.guest.name}</span>
                                <span className="flex items-center gap-2">
                                  <CalendarDays size={14} />
                                  {booking.check_in} to {booking.check_out}
                                </span>
                                <span className="flex items-center gap-2">
                                  <UsersRound size={14} />
                                  {booking.guests} guests · {currency.format(Number(booking.total_price))}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : null}
                    </article>
                  ))}
                </div>
              </section>
            </div>

            <aside className="lg:sticky lg:top-28 lg:h-fit">
              {editingListingId && editingListingQuery.isLoading ? (
                <div className="grid min-h-[360px] place-items-center rounded-air border border-hairline">
                  <Loader2 className="animate-spin text-rausch" size={32} />
                </div>
              ) : (
                <ListingForm
                  key={editingListingId ?? "create"}
                  amenities={amenitiesQuery.data}
                  initialListing={editingListingQuery.data ?? null}
                  isSubmitting={createListing.isPending || updateListing.isPending}
                  onSubmit={submitListing}
                  onCancelEdit={() => setEditingListingId(null)}
                />
              )}
            </aside>
          </div>
        ) : null}
      </section>

      {listingPendingDelete ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-air bg-white p-6 shadow-airbnb">
            <h2 className="text-[21px] font-bold text-ink">Delete this listing?</h2>
            <p className="mt-2 text-sm leading-6 text-body">
              {listingPendingDelete.title} will be removed with its photos, bookings, reviews, and wishlist saves.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button className="h-11 rounded-lg border border-hairline px-5 text-sm font-medium text-ink" onClick={() => setDeleteListingId(null)}>
                Cancel
              </button>
              <button className="h-11 rounded-lg bg-ink px-5 text-sm font-medium text-white" disabled={deleteListing.isPending} onClick={confirmDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
