"use client";

import { Check, ChevronDown, Globe2, Heart, Menu, Search, UserRound, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";
import { DateRangeCalendar } from "@/components/date-range-calendar";
import { DestinationPicker } from "@/components/destination-picker";
import { guestSummary, GuestPicker } from "@/components/guest-picker";
import { useSearchStore } from "@/lib/search-store";
import type { User } from "@/types/api";

type TopNavProps = {
  users: User[] | undefined;
  currentUser: User | undefined;
  onUserChange: (userId: number) => void;
};

type SearchPanel = "destination" | "dates" | "guests" | null;
type MobileSearchStep = "where" | "dates" | "guests";

export function TopNav({ users, currentUser, onUserChange }: TopNavProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isLocaleOpen, setIsLocaleOpen] = useState(false);
  const [isDatesOpen, setIsDatesOpen] = useState(false);
  const [isGuestsOpen, setIsGuestsOpen] = useState(false);
  const [isCompact, setIsCompact] = useState(false);
  const [activeSearchPanel, setActiveSearchPanel] = useState<SearchPanel>(null);
  const [isProfilePickerOpen, setIsProfilePickerOpen] = useState(false);
  const [mobileStep, setMobileStep] = useState<MobileSearchStep>("where");
  const { adults, checkIn, checkOut, children, close, guests, infants, isOpen, location, open, setCheckIn, setCheckOut, setGuestBreakdown, setLocation } = useSearchStore();

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (location.trim()) params.set("location", location.trim());
    if (checkIn) params.set("check_in", checkIn);
    if (checkOut) params.set("check_out", checkOut);
    if (guests > 1) params.set("guests", String(guests));
    close();
    router.push(`/${params.size ? `?${params.toString()}` : ""}`);
  }

  function runSearch() {
    const params = new URLSearchParams();
    if (location.trim()) params.set("location", location.trim());
    if (checkIn) params.set("check_in", checkIn);
    if (checkOut) params.set("check_out", checkOut);
    if (guests > 1) params.set("guests", String(guests));
    setActiveSearchPanel(null);
    router.push(`/${params.size ? `?${params.toString()}` : ""}`);
  }

  const selectedRange: DateRange | undefined = checkIn || checkOut ? {
    from: checkIn ? new Date(`${checkIn}T00:00:00`) : undefined,
    to: checkOut ? new Date(`${checkOut}T00:00:00`) : undefined
  } : undefined;
  const activeMode = searchParams.get("mode") === "experiences" ? "experiences" : searchParams.get("mode") === "services" ? "services" : "homes";

  function selectDates(nextRange: DateRange | undefined) {
    setCheckIn(nextRange?.from ? format(nextRange.from, "yyyy-MM-dd") : "");
    setCheckOut(nextRange?.to ? format(nextRange.to, "yyyy-MM-dd") : "");
  }

  function dateText(value: string, empty: string) {
    return value ? format(new Date(`${value}T00:00:00`), "dd MMM") : empty;
  }

  useEffect(() => {
    const updateHeader = () => setIsCompact(window.scrollY > 96);
    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });
    return () => window.removeEventListener("scroll", updateHeader);
  }, []);

  return (
    <header className={`sticky top-0 z-40 border-b border-hairline-soft bg-white transition-[box-shadow,background-color] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${isCompact ? "shadow-[0_4px_16px_rgba(0,0,0,0.08)]" : "shadow-none"}`}>
      <div className={`relative mx-auto flex max-w-[1440px] items-center justify-between gap-5 px-6 transition-[height] duration-300 lg:px-10 ${isCompact ? "h-20" : "h-[88px]"}`}>
        <Link href="/" className="flex shrink-0 items-center gap-2 text-rausch" aria-label="Airbnb home">
          <svg viewBox="0 0 32 32" aria-hidden="true" className="h-8 w-8 fill-current">
            <path d="M16 2.8c-1.7 0-3.2 1.1-4.3 3.1L3.9 20.1c-1.6 3-.4 6.7 2.6 8.2 2.5 1.3 5.5.6 7.2-1.7L16 23.5l2.3 3.1c1.7 2.3 4.7 3 7.2 1.7 3-1.5 4.2-5.2 2.6-8.2L20.3 5.9c-1.1-2-2.6-3.1-4.3-3.1Zm0 4.1c.3 0 .7.4 1.1 1.1l7.8 14.2c.6 1.1.2 2.5-.9 3.1-1 .5-2.1.2-2.8-.7l-2.8-3.8 1.5-2.1c1.4-1.9 1.3-4.6-.2-6.4-.9-1-2.2-1.6-3.7-1.6s-2.8.6-3.7 1.6c-1.5 1.8-1.6 4.5-.2 6.4l1.5 2.1-2.8 3.8c-.7.9-1.8 1.2-2.8.7-1.1-.6-1.5-2-.9-3.1L14.9 8c.4-.7.8-1.1 1.1-1.1Zm0 7.6c.5 0 .9.2 1.2.6.5.6.5 1.6 0 2.3L16 19l-1.2-1.6c-.5-.7-.5-1.7 0-2.3.3-.4.7-.6 1.2-.6Z" />
          </svg>
          <span className="hidden text-[22px] font-semibold leading-none sm:inline">airbnb</span>
        </Link>

        <nav className={`absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-8 text-base font-semibold transition duration-200 lg:flex ${isCompact ? "pointer-events-none opacity-0" : "opacity-100"}`}>
          <Link href="/" className={`relative pb-2 transition hover:text-ink ${activeMode === "homes" ? "text-ink" : "text-muted"}`}>Homes{activeMode === "homes" ? <span className="absolute inset-x-1 -bottom-0.5 h-0.5 bg-ink" /> : null}</Link>
          <Link href="/?mode=experiences" className={`relative pb-2 transition hover:text-ink ${activeMode === "experiences" ? "text-ink" : "text-muted"}`}>Experiences{activeMode === "experiences" ? <span className="absolute inset-x-1 -bottom-0.5 h-0.5 bg-ink" /> : null}</Link>
          <Link href="/?mode=services" className={`relative pb-2 transition hover:text-ink ${activeMode === "services" ? "text-ink" : "text-muted"}`}>Services{activeMode === "services" ? <span className="absolute inset-x-1 -bottom-0.5 h-0.5 bg-ink" /> : null}</Link>
        </nav>

        <button
          type="button"
          className={`absolute left-1/2 top-1/2 hidden h-12 min-w-[352px] -translate-x-1/2 -translate-y-1/2 items-center rounded-full border border-hairline bg-white pl-5 pr-2 text-sm font-semibold text-ink shadow-airbnb transition duration-300 hover:shadow-md lg:flex ${isCompact ? "scale-100 opacity-100" : "pointer-events-none scale-95 opacity-0"}`}
          onClick={open}
          aria-label="Open search"
        >
          <span className="w-28 text-left">Anywhere</span>
          <span className="h-6 w-px bg-hairline" />
          <span className="w-28 text-center">Any week</span>
          <span className="h-6 w-px bg-hairline" />
          <span className="w-28 text-center text-muted">Add guests</span>
          <span className="ml-auto flex h-8 w-8 items-center justify-center rounded-full bg-rausch text-white">
            <Search size={16} strokeWidth={3} />
          </span>
        </button>

        <div className="flex shrink-0 items-center gap-2">
          <Link href="/host/dashboard" className="hidden rounded-full px-3 py-3 text-sm font-semibold text-ink transition hover:bg-surface-soft sm:block">
            Become a host
          </Link>
          <button
            type="button"
            className="hidden h-10 w-10 items-center justify-center rounded-full text-ink transition hover:bg-surface-soft sm:flex"
            aria-label="Select language and currency"
            aria-expanded={isLocaleOpen}
            onClick={() => {
              setIsLocaleOpen((openState) => !openState);
              setIsAccountOpen(false);
            }}
          >
            <Globe2 size={18} />
          </button>
          <button type="button" className="flex h-11 min-w-[190px] items-center justify-center gap-2 rounded-full border border-hairline bg-white px-4 text-sm font-semibold text-ink shadow-pill transition active:scale-[.99] sm:hidden" aria-label="Open search" onClick={() => { setMobileStep("where"); open(); }}>
            <Search size={17} /> Start your search
          </button>
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center gap-2 rounded-full border border-hairline bg-white px-0 shadow-sm transition hover:shadow-airbnb sm:h-11 sm:w-auto sm:px-2.5"
            aria-label="Open account menu"
            aria-expanded={isAccountOpen}
            onClick={() => {
              setIsAccountOpen((openState) => !openState);
              setIsLocaleOpen(false);
            }}
          >
            <Menu size={19} />
            <div className="hidden h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-surface-strong sm:flex">
              {currentUser?.avatar_url ? <Image src={currentUser.avatar_url} alt="" width={28} height={28} className="h-full w-full object-cover" /> : <UserRound size={16} />}
            </div>
          </button>
          <button type="button" className="hidden h-10 w-10 items-center justify-center rounded-full bg-rausch text-white sm:flex lg:hidden" aria-label="Open search" onClick={open}>
            <Search size={18} />
          </button>
        </div>

        {isLocaleOpen ? (
          <div className="airbnb-surface-enter absolute right-16 top-[68px] z-50 w-64 rounded-air border border-hairline bg-white p-4 shadow-airbnb">
            <p className="text-sm font-semibold text-ink">Language and region</p>
            <button type="button" className="mt-3 flex w-full items-center justify-between rounded-lg bg-surface-soft px-3 py-3 text-left text-sm font-medium text-ink" onClick={() => setIsLocaleOpen(false)}>
              <span>English (IN)</span><span>₹ INR</span>
            </button>
          </div>
        ) : null}

        {isAccountOpen ? (
          <div className="airbnb-surface-enter absolute right-6 top-[68px] z-50 w-72 overflow-hidden rounded-air border border-hairline bg-white py-2 shadow-airbnb lg:right-10">
            <div className="flex items-center gap-3 px-4 py-3">
              <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-surface-strong">
                {currentUser?.avatar_url ? <Image src={currentUser.avatar_url} alt="" width={40} height={40} className="h-full w-full object-cover" /> : <UserRound size={18} />}
              </div>
              <div><p className="text-sm font-semibold text-ink">{currentUser?.name ?? "Guest"}</p><p className="text-xs text-muted">{currentUser?.is_host ? "Host profile" : "Guest profile"}</p></div>
            </div>
            <div className="border-t border-hairline-soft" />
            <Link href="/wishlists" className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-ink transition hover:bg-surface-soft" onClick={() => setIsAccountOpen(false)}><Heart size={17} /> Wishlists</Link>
            <Link href="/trips" className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-ink transition hover:bg-surface-soft" onClick={() => setIsAccountOpen(false)}><UserRound size={17} /> Trips</Link>
            {currentUser?.is_host ? <Link href="/host/dashboard" className="block px-4 py-3 text-sm font-semibold text-ink hover:bg-surface-soft" onClick={() => setIsAccountOpen(false)}>Host dashboard</Link> : null}
            <div className="my-2 border-t border-hairline-soft" />
            <div className="border-t border-hairline-soft px-3 pt-2">
              <button type="button" className="flex h-11 w-full items-center justify-between rounded-lg px-2 text-left text-sm font-semibold text-ink transition hover:bg-surface-soft" onClick={() => setIsProfilePickerOpen((openState) => !openState)}>
                <span>Switch profile</span><ChevronDown size={16} className={`transition-transform ${isProfilePickerOpen ? "rotate-180" : ""}`} />
              </button>
              {isProfilePickerOpen ? <div className="mb-2 max-h-48 overflow-y-auto rounded-lg border border-hairline-soft p-1">{(users ?? []).map((user) => <button key={user.id} type="button" className="flex w-full items-center justify-between rounded-md px-3 py-2.5 text-left text-sm text-ink transition hover:bg-surface-soft" onClick={() => { onUserChange(user.id); setIsProfilePickerOpen(false); setIsAccountOpen(false); }}><span>{user.name}{user.is_host ? " (Host)" : ""}</span>{user.id === currentUser?.id ? <Check size={16} className="text-rausch" /> : null}</button>)}</div> : null}
            </div>
          </div>
        ) : null}
      </div>

      <div className="border-t border-hairline-soft bg-white px-5 py-3 lg:hidden">
        <nav className="airbnb-hide-scrollbar flex gap-2 overflow-x-auto pb-1" aria-label="Browse products">
          {[{ mode: "homes", label: "Homes", image: "/assets/airbnb-home/category-homes.png" }, { mode: "experiences", label: "Experiences", image: "/assets/airbnb-home/category-experiences.png" }, { mode: "services", label: "Services", image: "/assets/airbnb-home/category-services.png" }].map((item) => <button key={item.mode} type="button" className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-2 text-sm font-semibold shadow-sm transition ${activeMode === item.mode ? "border-ink bg-white text-ink" : "border-hairline bg-white text-muted"}`} onClick={() => router.push(item.mode === "homes" ? "/" : `/?mode=${item.mode}`)}><Image src={item.image} alt="" width={24} height={24} className="h-6 w-6 object-contain" />{item.label}</button>)}
        </nav>
      </div>

      <div className={`relative hidden overflow-visible transition-[height,opacity] duration-300 lg:block ${isCompact ? "pointer-events-none h-0 opacity-0" : "h-[82px] opacity-100"}`}>
        <div className="flex justify-center px-6 pb-5">
          <div className="relative flex h-16 w-full max-w-[760px] items-center rounded-full border border-hairline bg-white pl-7 pr-2 text-left shadow-pill">
            <button type="button" className={`flex-1 border-r border-hairline pr-6 text-left transition ${activeSearchPanel === "destination" ? "text-ink" : "text-muted"}`} onClick={() => setActiveSearchPanel(activeSearchPanel === "destination" ? null : "destination")}><span className="block text-xs font-semibold text-ink">Where</span><span className="mt-1 block text-base truncate">{location || "Search destinations"}</span></button>
            <button type="button" className={`flex-1 border-r border-hairline px-6 text-left transition ${activeSearchPanel === "dates" ? "text-ink" : "text-muted"}`} onClick={() => setActiveSearchPanel(activeSearchPanel === "dates" ? null : "dates")}><span className="block text-xs font-semibold text-ink">When</span><span className="mt-1 block text-base truncate">{checkIn ? `${dateText(checkIn, "")} - ${dateText(checkOut, "Add dates")}` : "Add dates"}</span></button>
            <button type="button" className={`flex-1 px-6 text-left transition ${activeSearchPanel === "guests" ? "text-ink" : "text-muted"}`} onClick={() => setActiveSearchPanel(activeSearchPanel === "guests" ? null : "guests")}><span className="block text-xs font-semibold text-ink">Who</span><span className="mt-1 block text-base truncate">{guests > 1 || infants ? guestSummary({ adults, children, infants }) : "Add guests"}</span></button>
            <button type="button" className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-rausch text-white transition hover:bg-rausch-active active:scale-95" onClick={runSearch} aria-label="Search stays"><Search size={20} strokeWidth={3} /></button>

            {activeSearchPanel ? <div className={`absolute top-[72px] z-50 ${activeSearchPanel === "destination" ? "left-0 w-[360px]" : activeSearchPanel === "dates" ? "left-1/2 w-[430px] -translate-x-1/2" : "right-0 w-[380px]"}`}>
              {activeSearchPanel === "destination" ? <DestinationPicker value={location} onChange={setLocation} onSelect={(destination) => { setLocation(destination); setActiveSearchPanel("dates"); }} /> : null}
              {activeSearchPanel === "dates" ? <DateRangeCalendar value={selectedRange} onChange={selectDates} onComplete={() => setActiveSearchPanel(null)} /> : null}
              {activeSearchPanel === "guests" ? <GuestPicker value={{ adults, children, infants }} onChange={setGuestBreakdown} /> : null}
            </div> : null}
          </div>
        </div>
      </div>

      {isOpen ? (
        <>
        <div className="fixed inset-0 z-[70] overflow-y-auto bg-[#f7f7f7] px-3 py-4 sm:hidden">
          <div className="mx-auto max-w-md">
            <div className="flex items-center justify-between px-2">
              <div className="flex gap-5" aria-label="Search type">
                {[{ mode: "homes", label: "Homes", image: "/assets/airbnb-home/category-homes.png" }, { mode: "experiences", label: "Experiences", image: "/assets/airbnb-home/category-experiences.png" }, { mode: "services", label: "Services", image: "/assets/airbnb-home/category-services.png" }].map((item) => <button key={item.mode} type="button" className={`flex flex-col items-center gap-1 border-b-2 pb-2 text-xs font-semibold transition ${activeMode === item.mode ? "border-ink text-ink" : "border-transparent text-muted"}`} onClick={() => router.push(item.mode === "homes" ? "/" : `/?mode=${item.mode}`)}><Image src={item.image} alt="" width={30} height={30} className="h-8 w-8 object-contain" />{item.label}</button>)}
              </div>
              <button type="button" className="grid h-11 w-11 place-items-center rounded-full bg-white text-ink shadow-airbnb" onClick={close} aria-label="Close search"><X size={20} /></button>
            </div>
            <div className="mt-5 rounded-[28px] bg-white p-5 shadow-airbnb">
              <h2 className="text-[26px] font-semibold leading-tight text-ink">{mobileStep === "where" ? "Where?" : mobileStep === "dates" ? "When?" : "Who?"}</h2>
              {mobileStep === "where" ? <div className="mt-4"><DestinationPicker value={location} onChange={setLocation} onSelect={(destination) => { setLocation(destination); setMobileStep("dates"); }} /></div> : null}
              {mobileStep === "dates" ? <div className="mt-4"><DateRangeCalendar value={selectedRange} onChange={selectDates} onComplete={() => setMobileStep("guests")} /></div> : null}
              {mobileStep === "guests" ? <div className="mt-4"><GuestPicker value={{ adults, children, infants }} onChange={setGuestBreakdown} /></div> : null}
            </div>
            <div className="mt-4 space-y-3">
              <button type="button" className="flex w-full items-center justify-between rounded-2xl bg-white px-5 py-5 text-left shadow-sm" onClick={() => setMobileStep("dates")}><span className="text-base text-body">When</span><span className="text-base font-semibold text-ink">{checkIn ? `${dateText(checkIn, "")} - ${dateText(checkOut, "Add dates")}` : "Add dates"}</span></button>
              <button type="button" className="flex w-full items-center justify-between rounded-2xl bg-white px-5 py-5 text-left shadow-sm" onClick={() => setMobileStep("guests")}><span className="text-base text-body">Who</span><span className="text-base font-semibold text-ink">{guests > 1 || infants ? guestSummary({ adults, children, infants }) : "Add guests"}</span></button>
            </div>
            {mobileStep === "guests" ? <button type="button" className="mt-5 flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-rausch text-base font-semibold text-white shadow-airbnb transition active:scale-[.99]" onClick={() => { close(); runSearch(); }}><Search size={18} /> Search</button> : null}
          </div>
        </div>
        <div className="fixed inset-0 z-50 hidden bg-black/45 px-4 py-8 sm:block sm:py-16">
          <form className="mx-auto w-full max-w-[850px] rounded-[28px] bg-white p-5 shadow-airbnb sm:p-6" onSubmit={submitSearch}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-ink">Search stays</h2>
              <button type="button" className="flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-surface-soft" onClick={close} aria-label="Close search"><X size={19} /></button>
            </div>
            <div className="mt-5 grid overflow-hidden rounded-2xl border border-hairline md:grid-cols-[1.25fr_1fr_1fr_.7fr]">
              <label className="grid gap-1 p-4"><span className="text-xs font-semibold text-ink">Where</span><input className="bg-transparent text-sm outline-none placeholder:text-muted" placeholder="Search destinations" value={location} onChange={(event) => setLocation(event.target.value)} /></label>
              <button type="button" className="grid gap-1 border-t border-hairline p-4 text-left transition hover:bg-surface-soft md:border-l md:border-t-0" onClick={() => { setIsDatesOpen(true); setIsGuestsOpen(false); }}><span className="text-xs font-semibold text-ink">Check in</span><span className="text-sm text-body">{dateText(checkIn, "Add date")}</span></button>
              <button type="button" className="grid gap-1 border-t border-hairline p-4 text-left transition hover:bg-surface-soft md:border-l md:border-t-0" onClick={() => { setIsDatesOpen(true); setIsGuestsOpen(false); }}><span className="text-xs font-semibold text-ink">Check out</span><span className="text-sm text-body">{dateText(checkOut, "Add date")}</span></button>
              <button type="button" className="grid gap-1 border-t border-hairline p-4 text-left transition hover:bg-surface-soft md:border-l md:border-t-0" onClick={() => { setIsGuestsOpen((openState) => !openState); setIsDatesOpen(false); }}><span className="text-xs font-semibold text-ink">Guests</span><span className="text-sm text-body">{guestSummary({ adults, children, infants })}</span></button>
            </div>
            {isDatesOpen ? <div className="mt-4 max-w-[430px]"><DateRangeCalendar value={selectedRange} onChange={selectDates} onComplete={() => setIsDatesOpen(false)} /></div> : null}
            {isGuestsOpen ? <div className="mt-4 max-w-[380px]"><GuestPicker value={{ adults, children, infants }} onChange={setGuestBreakdown} /></div> : null}
            <button className="mt-5 flex h-12 items-center justify-center gap-2 rounded-lg bg-rausch px-6 text-sm font-semibold text-white transition hover:bg-rausch-active"><Search size={17} /> Search</button>
          </form>
        </div>
        </>
      ) : null}
    </header>
  );
}
