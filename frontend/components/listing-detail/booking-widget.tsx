"use client";

import { differenceInCalendarDays, format } from "date-fns";
import { ChevronDown, Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { DateRange } from "react-day-picker";
import { toast } from "sonner";
import { DateRangeCalendar } from "@/components/date-range-calendar";
import { guestSummary, GuestPicker, totalGuests } from "@/components/guest-picker";
import type { CheckoutDraft, ListingDetail } from "@/types/api";

type BookingWidgetProps = {
  listing: ListingDetail;
  initialCheckIn?: string;
  initialCheckOut?: string;
  initialGuests?: number;
};

const currency = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

function toDate(value: string) {
  return new Date(`${value}T00:00:00`);
}

function toIsoDate(value: Date) {
  return format(value, "yyyy-MM-dd");
}

function shortDate(value: Date | undefined) {
  return value ? format(value, "dd/MM/yyyy") : "Add date";
}

export function BookingWidget({ listing, initialCheckIn = "", initialCheckOut = "", initialGuests = 1 }: BookingWidgetProps) {
  const router = useRouter();
  const initialRange = initialCheckIn || initialCheckOut ? { from: initialCheckIn ? toDate(initialCheckIn) : undefined, to: initialCheckOut ? toDate(initialCheckOut) : undefined } : undefined;
  const [range, setRange] = useState<DateRange | undefined>(initialRange);
  const [guestBreakdown, setGuestBreakdown] = useState({ adults: Math.min(Math.max(1, initialGuests), listing.max_guests), children: 0, infants: 0 });
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isGuestsOpen, setIsGuestsOpen] = useState(false);
  const nightlyPrice = Number(listing.price_per_night);
  const guests = totalGuests(guestBreakdown);
  const nights = range?.from && range?.to ? differenceInCalendarDays(range.to, range.from) : 0;
  const cleaningFee = nights > 0 ? 3500 : 0;
  const serviceFee = nights > 0 ? Math.round(nightlyPrice * nights * 0.12) : 0;
  const subtotal = nightlyPrice * nights;
  const total = subtotal + cleaningFee + serviceFee;
  const blockedRanges = listing.booked_date_ranges.map((bookedRange) => ({ from: toDate(bookedRange.check_in), to: toDate(bookedRange.check_out) }));

  function reserve() {
    if (!range?.from || !range.to || nights <= 0) {
      setIsCalendarOpen(true);
      toast.error("Select check-in and check-out dates.");
      return;
    }

    const checkoutDraft: CheckoutDraft = {
      listingId: listing.id,
      title: listing.title,
      location: `${listing.location_city}, ${listing.location_country}`,
      photoUrl: listing.photos[0]?.url ?? null,
      checkIn: toIsoDate(range.from),
      checkOut: toIsoDate(range.to),
      guests,
      nights,
      nightlyPrice,
      cleaningFee,
      serviceFee,
      total
    };

    window.localStorage.setItem("airbnb_checkout_draft", JSON.stringify(checkoutDraft));
    router.push("/checkout");
  }

  return (
    <aside id="reserve" className="relative sticky top-24 rounded-xl border border-hairline bg-white p-6 shadow-airbnb">
      <div className="flex items-start justify-between gap-4">
        <p className="text-base text-ink"><span className="text-[22px] font-semibold">{currency.format(nightlyPrice)}</span> night</p>
        <div className="flex items-center gap-1 text-sm text-ink"><Star size={14} className="fill-ink" /><span>{listing.rating ?? "New"}</span></div>
      </div>

      <div className="mt-6 overflow-hidden rounded-lg border border-ink">
        <div className="grid grid-cols-2 border-b border-ink">
          <button type="button" className="border-r border-ink p-3 text-left transition hover:bg-surface-soft" onClick={() => { setIsCalendarOpen(true); setIsGuestsOpen(false); }}>
            <p className="text-[10px] font-semibold uppercase text-ink">Check-in</p>
            <p className="mt-1 truncate text-sm text-body">{shortDate(range?.from)}</p>
          </button>
          <button type="button" className="p-3 text-left transition hover:bg-surface-soft" onClick={() => { setIsCalendarOpen(true); setIsGuestsOpen(false); }}>
            <p className="text-[10px] font-semibold uppercase text-ink">Checkout</p>
            <p className="mt-1 truncate text-sm text-body">{shortDate(range?.to)}</p>
          </button>
        </div>
        <button type="button" className="flex w-full items-center justify-between p-3 text-left transition hover:bg-surface-soft" onClick={() => { setIsGuestsOpen((openState) => !openState); setIsCalendarOpen(false); }}>
          <div><p className="text-[10px] font-semibold uppercase text-ink">Guests</p><p className="mt-1 text-sm text-body">{guestSummary(guestBreakdown)}</p></div>
          <ChevronDown size={18} className={`transition-transform ${isGuestsOpen ? "rotate-180" : ""}`} />
        </button>
      </div>

      {isCalendarOpen ? (
        <div className="mt-4 rounded-xl border border-hairline-soft bg-white p-3">
          <DateRangeCalendar value={range} onChange={setRange} onComplete={() => setIsCalendarOpen(false)} showSelection={false} blockedRanges={blockedRanges} />
        </div>
      ) : null}

      {isGuestsOpen ? (
        <div className="mt-4"><GuestPicker value={guestBreakdown} onChange={setGuestBreakdown} maxGuests={listing.max_guests} /></div>
      ) : null}

      <button type="button" className="mt-4 h-12 w-full rounded-lg bg-rausch text-base font-semibold text-white transition hover:bg-rausch-active active:scale-[.99]" onClick={reserve}>Reserve</button>
      <p className="mt-3 text-center text-sm text-muted">You won&apos;t be charged yet</p>

      {nights > 0 ? (
        <div className="mt-6 space-y-3 border-t border-hairline-soft pt-6 text-sm text-body">
          <div className="flex justify-between"><span className="underline">{currency.format(nightlyPrice)} x {nights} nights</span><span>{currency.format(subtotal)}</span></div>
          <div className="flex justify-between"><span className="underline">Cleaning fee</span><span>{currency.format(cleaningFee)}</span></div>
          <div className="flex justify-between"><span className="underline">Service fee</span><span>{currency.format(serviceFee)}</span></div>
          <div className="flex justify-between border-t border-hairline-soft pt-4 font-semibold text-ink"><span>Total before taxes</span><span>{currency.format(total)}</span></div>
        </div>
      ) : null}
    </aside>
  );
}
