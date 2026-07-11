"use client";

import { ArrowLeft, CreditCard, LockKeyhole, ShieldCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { TopNav } from "@/components/top-nav";
import { clearCheckoutDraft, readCheckoutDraft } from "@/lib/checkout-draft";
import { detailMediaFor } from "@/lib/listing-media";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useCreateBooking, useUsers } from "@/hooks/use-listings";
import type { CheckoutDraft } from "@/types/api";

const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0
});

export default function CheckoutPage() {
  const router = useRouter();
  const usersQuery = useUsers();
  const { currentUser, currentUserId, selectUser } = useCurrentUser(usersQuery.data);
  const createBooking = useCreateBooking(currentUserId);
  const [draft] = useState<CheckoutDraft | null>(() => readCheckoutDraft());

  async function confirmBooking() {
    if (!draft) {
      toast.error("Choose dates on a listing before checkout.");
      return;
    }

    const booking = await createBooking.mutateAsync({
      listing_id: draft.listingId,
      check_in: draft.checkIn,
      check_out: draft.checkOut,
      guests: draft.guests
    });

    clearCheckoutDraft();
    toast.success("Booking confirmed.");
    router.push(`/trips?confirmed=${booking.id}`);
  }

  return (
    <main className="min-h-screen bg-white">
      <TopNav users={usersQuery.data} currentUser={currentUser} onUserChange={selectUser} />

      <div className="airbnb-page airbnb-page--detail py-8">
        <div className="mb-8 flex items-center gap-4">
          <Link href={draft ? `/listings/${draft.listingId}` : "/"} className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-surface-soft">
            <ArrowLeft size={22} />
          </Link>
          <h1 className="text-[28px] font-bold text-ink">Request to book</h1>
        </div>

        {!draft ? (
          <section className="grid min-h-[360px] place-items-center rounded-air border border-hairline p-8 text-center">
            <div>
              <h2 className="text-xl font-semibold text-ink">No reservation selected</h2>
              <p className="mt-2 text-sm text-muted">Pick dates from a listing page and your checkout summary will appear here.</p>
              <Link href="/" className="mt-5 inline-flex h-12 items-center rounded-lg bg-rausch px-6 text-sm font-medium text-white">
                Explore stays
              </Link>
            </div>
          </section>
        ) : null}

        {draft ? (
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_380px]">
            <section className="space-y-8">
              <div className="border-b border-hairline-soft pb-8">
                <h2 className="text-[21px] font-bold text-ink">Your trip</h2>
                <div className="mt-5 space-y-5">
                  <div className="flex items-start justify-between gap-6">
                    <div>
                      <p className="font-semibold text-ink">Dates</p>
                      <p className="mt-1 text-base text-body">
                        {draft.checkIn} to {draft.checkOut}
                      </p>
                    </div>
                    <Link href={`/listings/${draft.listingId}`} className="text-sm font-semibold underline">
                      Edit
                    </Link>
                  </div>
                  <div className="flex items-start justify-between gap-6">
                    <div>
                      <p className="font-semibold text-ink">Guests</p>
                      <p className="mt-1 text-base text-body">
                        {draft.guests} guest{draft.guests === 1 ? "" : "s"}
                      </p>
                    </div>
                    <Link href={`/listings/${draft.listingId}`} className="text-sm font-semibold underline">
                      Edit
                    </Link>
                  </div>
                </div>
              </div>

              <div className="border-b border-hairline-soft pb-8">
                <h2 className="text-[21px] font-bold text-ink">Pay with</h2>
                <div className="mt-5 rounded-air border border-hairline p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CreditCard size={22} />
                      <div>
                        <p className="font-semibold text-ink">Mock card ending in 4242</p>
                        <p className="text-sm text-muted">No real payment will be charged</p>
                      </div>
                    </div>
                    <LockKeyhole size={18} />
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-start gap-3 rounded-air bg-surface-soft p-5">
                  <ShieldCheck className="mt-0.5 shrink-0" size={22} />
                  <p className="text-sm leading-6 text-body">
                    This checkout is mocked for the assignment. Confirming creates a real booking in SQLite and blocks those dates for other guests.
                  </p>
                </div>

                <button
                  className="mt-6 h-12 rounded-lg bg-rausch px-8 text-base font-medium text-white hover:bg-rausch-active disabled:bg-[#ffd1da]"
                  disabled={createBooking.isPending}
                  onClick={confirmBooking}
                >
                  {createBooking.isPending ? "Confirming..." : "Confirm and book"}
                </button>
              </div>
            </section>

            <aside className="h-fit rounded-air border border-hairline bg-white p-6 shadow-airbnb">
              <div className="flex gap-4 border-b border-hairline-soft pb-5">
                <div className="relative h-28 w-32 overflow-hidden rounded-lg bg-surface-strong">
                  {draft.photoUrl ? <Image src={detailMediaFor(draft.listingId, draft.photoUrl)} alt={draft.title} fill sizes="128px" className="object-cover" /> : null}
                </div>
                <div>
                  <p className="line-clamp-2 text-sm font-semibold text-ink">{draft.title}</p>
                  <p className="mt-1 text-sm text-muted">{draft.location}</p>
                </div>
              </div>

              <div className="border-b border-hairline-soft py-5">
                <h2 className="text-[21px] font-bold text-ink">Price details</h2>
                <div className="mt-4 space-y-3 text-sm text-body">
                  <div className="flex justify-between">
                    <span className="underline">
                      {currency.format(draft.nightlyPrice)} x {draft.nights} nights
                    </span>
                    <span>{currency.format(draft.nightlyPrice * draft.nights)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="underline">Cleaning fee</span>
                    <span>{currency.format(draft.cleaningFee)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="underline">Service fee</span>
                    <span>{currency.format(draft.serviceFee)}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-5 font-semibold text-ink">
                <span>Total</span>
                <span>{currency.format(draft.total)}</span>
              </div>
            </aside>
          </div>
        ) : null}
      </div>
    </main>
  );
}
