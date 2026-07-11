"use client";

import { FormEvent, useEffect, useMemo, useState, type Dispatch, type SetStateAction } from "react";
import { Globe2, Heart, Menu, Minus, Plus, Search, UserRound, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";
import { toast } from "sonner";
import { DateRangeCalendar } from "@/components/date-range-calendar";
import type { ListingFilters, User } from "@/types/api";

type HomeHeaderProps = {
  users: User[] | undefined;
  currentUser: User | undefined;
  onUserChange: (userId: number) => void;
  filters: ListingFilters;
  onChange: Dispatch<SetStateAction<ListingFilters>>;
  onSearch: () => void;
};

type OpenPanel = "dates" | "guests" | null;

const categoryTabs = [
  { iconSrc: "/assets/airbnb-home/category-all.png", label: "All" },
  { iconSrc: "/assets/airbnb-home/category-homes.png", label: "Homes" },
  { iconSrc: "/assets/airbnb-home/category-experiences.png", label: "Experiences" },
  { iconSrc: "/assets/airbnb-home/category-services.png", label: "Services" }
];

function parseDate(value: string) {
  return value ? new Date(`${value}T00:00:00`) : undefined;
}

function asIsoDate(value: Date) {
  return format(value, "yyyy-MM-dd");
}

function formatDateRange(checkIn: string, checkOut: string) {
  if (!checkIn && !checkOut) return "Add dates";
  if (checkIn && checkOut) return `${format(parseDate(checkIn)!, "dd MMM")} - ${format(parseDate(checkOut)!, "dd MMM")}`;
  return checkIn ? `From ${format(parseDate(checkIn)!, "dd MMM")}` : `Until ${format(parseDate(checkOut)!, "dd MMM")}`;
}

export function HomeHeader({ users, currentUser, onUserChange, filters, onChange, onSearch }: HomeHeaderProps) {
  const [openPanel, setOpenPanel] = useState<OpenPanel>(null);
  const [isCompact, setIsCompact] = useState(false);
  const [activeTab, setActiveTab] = useState("All");
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const selectedRange = useMemo<DateRange | undefined>(() => {
    const from = parseDate(filters.checkIn);
    const to = parseDate(filters.checkOut);
    return from || to ? { from, to } : undefined;
  }, [filters.checkIn, filters.checkOut]);

  useEffect(() => {
    const updateCompactState = () => setIsCompact(window.scrollY > 92);
    updateCompactState();
    window.addEventListener("scroll", updateCompactState, { passive: true });
    return () => window.removeEventListener("scroll", updateCompactState);
  }, []);

  function updateFilters(patch: Partial<ListingFilters>) {
    onChange((current) => ({ ...current, ...patch, page: 1 }));
  }

  function chooseDates(nextRange: DateRange | undefined) {
    updateFilters({ checkIn: nextRange?.from ? asIsoDate(nextRange.from) : "", checkOut: nextRange?.to ? asIsoDate(nextRange.to) : "" });
  }

  function submitSearch(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    setOpenPanel(null);
    setIsMobileSearchOpen(false);
    onSearch();
  }

  function selectProduct(label: string) {
    setActiveTab(label);
    if (label !== "All") toast.message(`${label} are coming soon in this assignment.`);
  }

  function openDesktopSearch() {
    setIsCompact(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <header className="sticky top-0 z-40 border-b border-hairline-soft bg-white">
      <div className="hidden sm:block">
        <div className="relative mx-auto flex h-[112px] max-w-[1900px] items-center justify-between px-8 xl:px-[60px]">
          <Link href="/" className="flex shrink-0 items-center gap-2 text-rausch" aria-label="Airbnb home">
            <svg viewBox="0 0 32 32" aria-hidden="true" className="h-10 w-10 fill-current"><path d="M16 2.8c-1.7 0-3.2 1.1-4.3 3.1L3.9 20.1c-1.6 3-.4 6.7 2.6 8.2 2.5 1.3 5.5.6 7.2-1.7L16 23.5l2.3 3.1c1.7 2.3 4.7 3 7.2 1.7 3-1.5 4.2-5.2 2.6-8.2L20.3 5.9c-1.1-2-2.6-3.1-4.3-3.1Zm0 4.1c.3 0 .7.4 1.1 1.1l7.8 14.2c.6 1.1.2 2.5-.9 3.1-1 .5-2.1.2-2.8-.7l-2.8-3.8 1.5-2.1c1.4-1.9 1.3-4.6-.2-6.4-.9-1-2.2-1.6-3.7-1.6s-2.8.6-3.7 1.6c-1.5 1.8-1.6 4.5-.2 6.4l1.5 2.1-2.8 3.8c-.7.9-1.8 1.2-2.8.7-1.1-.6-1.5-2-.9-3.1L14.9 8c.4-.7.8-1.1 1.1-1.1Zm0 7.6c.5 0 .9.2 1.2.6.5.6.5 1.6 0 2.3L16 19l-1.2-1.6c-.5-.7-.5-1.7 0-2.3.3-.4.7-.6 1.2-.6Z" /></svg>
            <span className="text-[28px] font-semibold leading-none">airbnb</span>
          </Link>

          <nav className={`absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-9 transition duration-200 ${isCompact ? "pointer-events-none opacity-0" : "opacity-100"}`}>
            {categoryTabs.map((tab) => <button type="button" key={tab.label} onClick={() => selectProduct(tab.label)} className={`relative flex items-center gap-2.5 pb-4 text-[18px] font-semibold transition-colors ${activeTab === tab.label ? "text-ink" : "text-muted hover:text-ink"}`}><Image src={tab.iconSrc} alt="" width={48} height={48} className="h-12 w-12 object-contain" /><span>{tab.label}</span>{activeTab === tab.label ? <span className="absolute inset-x-0 bottom-0 h-0.5 bg-ink" /> : null}</button>)}
          </nav>

          <button type="button" className={`absolute left-1/2 top-1/2 hidden h-14 w-[468px] -translate-x-1/2 -translate-y-1/2 items-center rounded-full border border-hairline bg-white pl-5 pr-2 text-[15px] font-semibold text-ink shadow-airbnb transition duration-200 lg:flex ${isCompact ? "scale-100 opacity-100" : "pointer-events-none scale-95 opacity-0"}`} onClick={openDesktopSearch} aria-label="Expand search"><Image src="/assets/airbnb-home/category-homes.png" alt="" width={34} height={34} className="mr-2 h-[34px] w-[34px] object-contain" /><span className="w-[108px] text-left">Anywhere</span><span className="h-6 w-px bg-hairline" /><span className="w-[112px] text-center">Anytime</span><span className="h-6 w-px bg-hairline" /><span className="w-[120px] text-center">Add guests</span><span className="ml-auto flex h-10 w-10 items-center justify-center rounded-full bg-rausch text-white"><Search size={18} strokeWidth={3} /></span></button>

          <div className="relative flex items-center gap-3">
            <Link href="/host/dashboard" className="rounded-full px-3 py-3 text-base font-semibold text-ink hover:bg-surface-soft">Become a host</Link>
            <button type="button" className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-strong text-ink hover:bg-hairline-soft" aria-label="Language and currency" onClick={() => { setIsLanguageOpen((open) => !open); setIsAccountOpen(false); }}><Globe2 size={20} /></button>
            <button type="button" className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-strong text-ink hover:bg-hairline-soft" aria-label="Open account menu" onClick={() => { setIsAccountOpen((open) => !open); setIsLanguageOpen(false); }}><Menu size={24} /></button>
            {isLanguageOpen ? <div className="absolute right-14 top-[62px] z-50 w-64 rounded-xl border border-hairline bg-white p-4 shadow-airbnb"><p className="text-sm font-semibold text-ink">Language and region</p><button type="button" className="mt-3 flex w-full justify-between rounded-lg bg-surface-soft px-3 py-3 text-sm font-medium" onClick={() => setIsLanguageOpen(false)}><span>English (IN)</span><span>₹ INR</span></button></div> : null}
            {isAccountOpen ? <div className="absolute right-0 top-[62px] z-50 w-72 overflow-hidden rounded-xl border border-hairline bg-white py-2 shadow-airbnb"><div className="flex items-center gap-3 px-4 py-3"><div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-surface-strong">{currentUser?.avatar_url ? <Image src={currentUser.avatar_url} alt="" width={40} height={40} className="h-full w-full object-cover" /> : <UserRound size={18} />}</div><div><p className="text-sm font-semibold text-ink">{currentUser?.name ?? "Guest"}</p><p className="text-xs text-muted">{currentUser?.is_host ? "Host profile" : "Guest profile"}</p></div></div><div className="border-t border-hairline-soft" /><Link href="/wishlists" className="flex items-center gap-3 px-4 py-3 text-sm font-semibold hover:bg-surface-soft" onClick={() => setIsAccountOpen(false)}><Heart size={17} /> Wishlists</Link><Link href="/trips" className="flex items-center gap-3 px-4 py-3 text-sm font-semibold hover:bg-surface-soft" onClick={() => setIsAccountOpen(false)}><UserRound size={17} /> Trips</Link><div className="my-2 border-t border-hairline-soft" /><label className="block px-4 pb-2 text-xs font-semibold text-muted">Switch profile</label><select aria-label="Switch profile" className="mx-3 mb-2 h-10 w-[calc(100%-24px)] rounded-lg border border-hairline bg-white px-3 text-sm outline-none" value={currentUser?.id ?? ""} onChange={(event) => { onUserChange(Number(event.target.value)); setIsAccountOpen(false); }}>{(users ?? []).map((user) => <option key={user.id} value={user.id}>{user.name}{user.is_host ? " (Host)" : ""}</option>)}</select></div> : null}
          </div>
        </div>

        <form className={`relative mx-auto mb-10 mt-2 hidden max-w-[1062px] overflow-visible rounded-full border border-hairline bg-white shadow-[0_10px_34px_rgba(0,0,0,0.14)] transition duration-200 sm:grid sm:h-[82px] sm:grid-cols-[348px_364px_266px_84px] ${isCompact ? "pointer-events-none h-0 scale-95 opacity-0" : "scale-100 opacity-100"}`} onSubmit={submitSearch}>
          <label className="flex min-h-[82px] flex-col justify-center rounded-full bg-[#ebebeb] px-10"><span className="text-[15px] font-semibold text-ink">Where</span><input className="mt-0.5 bg-transparent text-[22px] leading-7 text-body outline-none placeholder:text-muted" placeholder="Search destinations" value={filters.location} onChange={(event) => updateFilters({ location: event.target.value })} /></label>
          <div className="relative flex min-h-[82px] items-center border-l border-hairline px-8"><button type="button" className="flex w-full flex-col items-start text-left" onClick={() => setOpenPanel(openPanel === "dates" ? null : "dates")}><span className="text-[15px] font-semibold text-ink">When</span><span className="mt-0.5 text-[22px] leading-7 text-muted">{formatDateRange(filters.checkIn, filters.checkOut)}</span></button>{openPanel === "dates" ? <div className="absolute left-4 top-[92px] z-50 w-[370px] rounded-xl border border-hairline bg-white p-3 shadow-airbnb"><DateRangeCalendar value={selectedRange} onChange={chooseDates} onComplete={() => setOpenPanel(null)} /><button type="button" className="mt-1 text-sm font-semibold underline" onClick={() => chooseDates(undefined)}>Clear dates</button></div> : null}</div>
          <div className="relative flex min-h-[82px] items-center border-l border-hairline px-8"><button type="button" className="flex w-full flex-col items-start text-left" onClick={() => setOpenPanel(openPanel === "guests" ? null : "guests")}><span className="text-[15px] font-semibold text-ink">Who</span><span className="mt-0.5 text-[22px] leading-7 text-muted">{filters.guests > 1 ? `${filters.guests} guests` : "Add guests"}</span></button>{openPanel === "guests" ? <div className="absolute left-4 top-[92px] z-50 flex w-[290px] items-center justify-between rounded-xl border border-hairline bg-white p-4 shadow-airbnb"><div><p className="text-sm font-semibold">Guests</p><p className="text-sm text-muted">Adults and children</p></div><div className="flex items-center gap-3"><button type="button" className="flex h-8 w-8 items-center justify-center rounded-full border border-hairline disabled:text-hairline" disabled={filters.guests <= 1} onClick={() => updateFilters({ guests: Math.max(1, filters.guests - 1) })}><Minus size={15} /></button><span>{filters.guests}</span><button type="button" className="flex h-8 w-8 items-center justify-center rounded-full border border-hairline" onClick={() => updateFilters({ guests: filters.guests + 1 })}><Plus size={15} /></button></div></div> : null}</div>
          <div className="flex items-center justify-center"><button className="flex h-[60px] w-[60px] items-center justify-center rounded-full bg-rausch text-white transition hover:bg-rausch-active" aria-label="Search"><Search size={25} strokeWidth={3} /></button></div>
        </form>
      </div>

      <div className="sm:hidden">
        <div className="px-6 pt-4"><button type="button" className="flex h-16 w-full items-center justify-center gap-3 rounded-full border border-hairline bg-white text-base font-semibold text-ink shadow-airbnb" onClick={() => setIsMobileSearchOpen(true)}><Search size={18} /> Start your search</button></div>
        <nav className="airbnb-hide-scrollbar flex gap-2 overflow-x-auto px-6 py-5">{categoryTabs.map((tab) => <button type="button" key={tab.label} onClick={() => selectProduct(tab.label)} className={`flex h-10 shrink-0 items-center gap-1.5 rounded-full border px-3 text-sm font-medium shadow-sm ${activeTab === tab.label ? "border-ink text-ink" : "border-hairline text-body"}`}><Image src={tab.iconSrc} alt="" width={28} height={28} className="h-7 w-7 object-contain" />{tab.label}</button>)}</nav>
      </div>

      {isMobileSearchOpen ? <div className="fixed inset-0 z-[70] overflow-y-auto bg-white p-5 sm:hidden"><div className="mx-auto max-w-md"><div className="flex h-12 items-center justify-between"><button type="button" className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-surface-soft" onClick={() => setIsMobileSearchOpen(false)} aria-label="Close search"><X size={22} /></button><p className="text-sm font-semibold">Search stays</p><div className="w-10" /></div><form className="mt-4 space-y-3" onSubmit={submitSearch}><label className="block rounded-xl border border-hairline px-4 py-3 focus-within:border-ink"><span className="block text-xs font-semibold">Where</span><input className="mt-1 w-full bg-transparent text-lg outline-none placeholder:text-muted" placeholder="Search destinations" value={filters.location} onChange={(event) => updateFilters({ location: event.target.value })} /></label><button type="button" className="flex w-full items-center justify-between rounded-xl border border-hairline px-4 py-4 text-left" onClick={() => setOpenPanel(openPanel === "dates" ? null : "dates")}><div><p className="text-xs font-semibold">When</p><p className="mt-1 text-base text-body">{formatDateRange(filters.checkIn, filters.checkOut)}</p></div><span className="text-sm font-semibold underline">Edit</span></button>{openPanel === "dates" ? <DateRangeCalendar value={selectedRange} onChange={chooseDates} onComplete={() => setOpenPanel(null)} /> : null}<button type="button" className="flex w-full items-center justify-between rounded-xl border border-hairline px-4 py-4 text-left" onClick={() => setOpenPanel(openPanel === "guests" ? null : "guests")}><div><p className="text-xs font-semibold">Who</p><p className="mt-1 text-base text-body">{filters.guests} guest{filters.guests === 1 ? "" : "s"}</p></div><span className="text-sm font-semibold underline">Edit</span></button>{openPanel === "guests" ? <div className="flex items-center justify-between rounded-xl border border-hairline-soft p-4"><div><p className="font-semibold">Guests</p><p className="text-sm text-muted">Adults and children</p></div><div className="flex items-center gap-3"><button type="button" className="flex h-9 w-9 items-center justify-center rounded-full border border-hairline disabled:text-hairline" disabled={filters.guests <= 1} onClick={() => updateFilters({ guests: Math.max(1, filters.guests - 1) })}><Minus size={16} /></button><span className="w-4 text-center">{filters.guests}</span><button type="button" className="flex h-9 w-9 items-center justify-center rounded-full border border-hairline" onClick={() => updateFilters({ guests: filters.guests + 1 })}><Plus size={16} /></button></div></div> : null}<button className="mt-4 flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-rausch text-base font-semibold text-white"><Search size={18} /> Search</button></form></div></div> : null}
    </header>
  );
}
