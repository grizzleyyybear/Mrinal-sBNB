"use client";

import { ConciergeBell, Map, Sparkles } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { ExploreGrid } from "@/components/explore-grid";
import { Pagination } from "@/components/pagination";
import { RegionalMap } from "@/components/regional-map";
import { SearchResultsToolbar } from "@/components/search-results-toolbar";
import { TopNav } from "@/components/top-nav";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useAmenities, useListings, useUsers, useWishlistToggle } from "@/hooks/use-listings";
import type { ListingFilters } from "@/types/api";

const emptyFilters: ListingFilters = {
  location: "",
  checkIn: "",
  checkOut: "",
  guests: 1,
  minPrice: "",
  maxPrice: "",
  minBedrooms: "",
  minBeds: "",
  minBaths: "",
  propertyType: "",
  amenities: [],
  page: 1,
  limit: 12
};

function filtersFromParams(params: URLSearchParams): ListingFilters {
  return {
    ...emptyFilters,
    location: params.get("location") ?? "",
    checkIn: params.get("check_in") ?? "",
    checkOut: params.get("check_out") ?? "",
    guests: Math.max(1, Number(params.get("guests") ?? 1)),
    minPrice: params.get("min_price") ?? "",
    maxPrice: params.get("max_price") ?? "",
    minBedrooms: params.get("min_bedrooms") ?? "",
    minBeds: params.get("min_beds") ?? "",
    minBaths: params.get("min_baths") ?? "",
    propertyType: params.get("property_type") ?? ""
  };
}

type ExploreMode = "homes" | "experiences" | "services";

function ExploreContent({ initialFilters, mode }: { initialFilters: ListingFilters; mode: ExploreMode }) {
  const [filters, setFilters] = useState<ListingFilters>(initialFilters);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const usersQuery = useUsers();
  const amenitiesQuery = useAmenities();
  const { currentUser, currentUserId, selectUser } = useCurrentUser(usersQuery.data);
  const modePropertyTypes = mode === "experiences" ? "Heritage,House,Cabin" : mode === "services" ? "Apartment,Flat,Loft,Serviced apartment" : "";
  const searchFilters = modePropertyTypes && !filters.propertyType ? { ...filters, propertyType: modePropertyTypes } : filters;
  const listingsQuery = useListings(searchFilters, currentUserId);
  const mapFilters = { ...searchFilters, location: "", page: 1, limit: 50 };
  const mapListingsQuery = useListings(mapFilters, currentUserId);
  const wishlistToggle = useWishlistToggle(currentUserId);

  function clearFilters() {
    setFilters(emptyFilters);
    window.history.replaceState(null, "", "/");
  }

  const title = mode === "experiences" ? "Experience-ready stays" : mode === "services" ? "Service-ready stays" : "Explore stays";
  const subtitle = mode === "experiences" ? "Discover heritage, hillside, and outdoor-ready homes." : mode === "services" ? "Browse serviced and practical city stays with useful amenities." : "Prices include all fees before taxes.";
  const icon = mode === "experiences" ? <Sparkles size={18} /> : mode === "services" ? <ConciergeBell size={18} /> : null;

  function chooseRegion(region: string) {
    setFilters((current) => ({ ...current, location: region, page: 1 }));
  }

  return (
    <main className="min-h-screen bg-white">
      <TopNav users={usersQuery.data} currentUser={currentUser} onUserChange={selectUser} />
      <section className="airbnb-page airbnb-page--wide py-6 sm:py-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm text-muted">{listingsQuery.data?.total ?? 0} stays</p>
            <h1 className="mt-1 flex items-center gap-2 text-[26px] font-semibold leading-tight text-ink">{icon}{title}</h1>
          </div>
          <div className="flex w-full items-center justify-between gap-3 sm:w-auto"><p className="hidden text-sm text-muted sm:block">{subtitle}</p><button type="button" className={`flex h-10 shrink-0 items-center gap-2 rounded-lg border px-4 text-sm font-semibold transition ${isMapOpen ? "border-ink bg-ink text-white" : "border-hairline text-ink hover:border-ink"}`} onClick={() => setIsMapOpen((openState) => !openState)}><Map size={16} />{isMapOpen ? "Hide map" : "Show map"}</button></div>
        </div>

        <SearchResultsToolbar amenities={amenitiesQuery.data} filters={filters} onChange={setFilters} onClear={clearFilters} />

        <div className={`pt-7 ${isMapOpen ? "grid gap-7 lg:grid-cols-[minmax(0,1fr)_420px]" : ""}`}>
          <ExploreGrid listings={listingsQuery.data?.items ?? []} isLoading={listingsQuery.isLoading} isError={listingsQuery.isError} togglingListingId={wishlistToggle.isPending ? wishlistToggle.variables : undefined} onToggleWishlist={(listingId) => wishlistToggle.mutate(listingId)} />
          {isMapOpen && mapListingsQuery.data?.items.length ? <div className="lg:sticky lg:top-24 lg:self-start"><RegionalMap listings={mapListingsQuery.data.items} selectedRegion={filters.location} onRegionSelect={chooseRegion} /></div> : null}
        </div>

        {listingsQuery.data ? <Pagination page={listingsQuery.data.page} pages={listingsQuery.data.pages} total={listingsQuery.data.total} filters={filters} onChange={setFilters} /> : null}
      </section>
    </main>
  );
}

function Explore() {
  const searchParams = useSearchParams();
  const initialFilters = filtersFromParams(searchParams);
  const requestedMode = searchParams.get("mode");
  const mode: ExploreMode = requestedMode === "experiences" || requestedMode === "services" ? requestedMode : "homes";
  return <ExploreContent key={searchParams.toString()} initialFilters={initialFilters} mode={mode} />;
}

export default function HomePage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-white" />}>
      <Explore />
    </Suspense>
  );
}
