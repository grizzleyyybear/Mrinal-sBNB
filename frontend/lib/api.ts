import type {
  Amenity,
  Booking,
  BookingCreate,
  HostListingWithBookings,
  ListingDetail,
  ListingFilters,
  ListingPage,
  ListingWritePayload,
  Review,
  ReviewCreate,
  User,
  WishlistResponse
} from "@/types/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

type ApiOptions = {
  currentUserId?: number;
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
};

async function apiFetch<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    method: options.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      ...(options.currentUserId ? { "X-User-Id": String(options.currentUserId) } : {})
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
    cache: "no-store"
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({ detail: "Request failed." }));
    throw new Error(payload.detail ?? "Request failed.");
  }

  return response.json() as Promise<T>;
}

function appendIfValue(params: URLSearchParams, key: string, value: string | number | undefined) {
  if (value === undefined || value === "") {
    return;
  }

  params.set(key, String(value));
}

export function buildListingSearchPath(filters: ListingFilters): string {
  const params = new URLSearchParams();
  appendIfValue(params, "location", filters.location.trim());
  appendIfValue(params, "check_in", filters.checkIn);
  appendIfValue(params, "check_out", filters.checkOut);
  appendIfValue(params, "guests", filters.guests);
  appendIfValue(params, "min_price", filters.minPrice);
  appendIfValue(params, "max_price", filters.maxPrice);
  appendIfValue(params, "min_bedrooms", filters.minBedrooms);
  appendIfValue(params, "min_beds", filters.minBeds);
  appendIfValue(params, "min_baths", filters.minBaths);
  appendIfValue(params, "property_type", filters.propertyType);
  appendIfValue(params, "page", filters.page);
  appendIfValue(params, "limit", filters.limit);

  filters.amenities.forEach((amenityId) => params.append("amenities", amenityId));

  return `/listings?${params.toString()}`;
}

export function getUsers() {
  return apiFetch<User[]>("/users");
}

export function switchUser(userId: number) {
  return apiFetch<User>("/users/switch", {
    method: "POST",
    body: { user_id: userId }
  });
}

export function getAmenities() {
  return apiFetch<Amenity[]>("/amenities");
}

export function getListings(filters: ListingFilters, currentUserId: number) {
  return apiFetch<ListingPage>(buildListingSearchPath(filters), { currentUserId });
}

export function getListingDetail(listingId: number, currentUserId: number) {
  return apiFetch<ListingDetail>(`/listings/${listingId}`, { currentUserId });
}

export function toggleWishlist(listingId: number, currentUserId: number) {
  return apiFetch<WishlistResponse>("/wishlist", {
    currentUserId,
    method: "POST",
    body: { listing_id: listingId }
  });
}

export function getWishlist(currentUserId: number) {
  return apiFetch<WishlistResponse>("/wishlist", { currentUserId });
}

export function createBooking(payload: BookingCreate, currentUserId: number) {
  return apiFetch<Booking>("/bookings", {
    currentUserId,
    method: "POST",
    body: payload
  });
}

export function getMyBookings(currentUserId: number) {
  return apiFetch<Booking[]>("/bookings/me", { currentUserId });
}

export function cancelBooking(bookingId: number, currentUserId: number) {
  return apiFetch<Booking>(`/bookings/${bookingId}`, {
    currentUserId,
    method: "DELETE"
  });
}

export function getHostDashboard(currentUserId: number) {
  return apiFetch<HostListingWithBookings[]>("/hosts/me/listings", { currentUserId });
}

export function createListing(payload: ListingWritePayload, currentUserId: number) {
  return apiFetch<ListingDetail>("/listings", {
    currentUserId,
    method: "POST",
    body: payload
  });
}

export function updateListing(listingId: number, payload: ListingWritePayload, currentUserId: number) {
  return apiFetch<ListingDetail>(`/listings/${listingId}`, {
    currentUserId,
    method: "PUT",
    body: payload
  });
}

export function deleteListing(listingId: number, currentUserId: number) {
  return apiFetch<{ message: string }>(`/listings/${listingId}`, {
    currentUserId,
    method: "DELETE"
  });
}

export function createReview(payload: ReviewCreate, currentUserId: number) {
  return apiFetch<Review>("/reviews", {
    currentUserId,
    method: "POST",
    body: payload
  });
}
