export type User = {
  id: number;
  name: string;
  email: string;
  avatar_url: string;
  is_host: boolean;
  is_superhost: boolean;
};

export type Amenity = {
  id: number;
  name: string;
  icon: string;
};

export type ListingPhoto = {
  id: number;
  url: string;
  sort_order: number;
};

export type BookedDateRange = {
  check_in: string;
  check_out: string;
};

export type Review = {
  id: number;
  listing_id: number;
  author_id: number;
  booking_id: number | null;
  rating: number;
  comment: string;
  created_at: string;
  author: User;
};

export type ListingCard = {
  id: number;
  title: string;
  property_type: string;
  location_city: string;
  location_country: string;
  lat: number;
  lng: number;
  price_per_night: string;
  max_guests: number;
  bedrooms: number;
  beds: number;
  baths: number;
  created_at: string;
  first_photo_url: string | null;
  photo_urls: string[];
  rating: number | null;
  review_count: number;
  is_wishlisted: boolean;
};

export type ListingDetail = {
  id: number;
  host_id: number;
  title: string;
  description: string;
  property_type: string;
  location_city: string;
  location_country: string;
  lat: number;
  lng: number;
  price_per_night: string;
  max_guests: number;
  bedrooms: number;
  beds: number;
  baths: number;
  created_at: string;
  host: User;
  photos: ListingPhoto[];
  amenities: Amenity[];
  reviews: Review[];
  booked_date_ranges: BookedDateRange[];
  rating: number | null;
  review_count: number;
  is_wishlisted: boolean;
};

export type ListingPage = {
  items: ListingCard[];
  page: number;
  limit: number;
  total: number;
  pages: number;
};

export type ListingFilters = {
  location: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  minPrice: string;
  maxPrice: string;
  minBedrooms: string;
  minBeds: string;
  minBaths: string;
  propertyType: string;
  amenities: string[];
  page: number;
  limit: number;
};

export type WishlistResponse = {
  items: ListingCard[];
};

export type CheckoutDraft = {
  listingId: number;
  title: string;
  location: string;
  photoUrl: string | null;
  checkIn: string;
  checkOut: string;
  guests: number;
  nights: number;
  nightlyPrice: number;
  cleaningFee: number;
  serviceFee: number;
  total: number;
};

export type BookingCreate = {
  listing_id: number;
  check_in: string;
  check_out: string;
  guests: number;
};

export type Booking = {
  id: number;
  listing_id: number;
  guest_id: number;
  check_in: string;
  check_out: string;
  guests: number;
  total_price: string;
  status: "confirmed" | "cancelled";
  created_at: string;
  listing: ListingCard;
};

export type ReviewCreate = {
  listing_id: number;
  rating: number;
  comment: string;
  booking_id?: number;
};

export type HostBooking = Omit<Booking, "listing"> & {
  guest: User;
};

export type HostListingWithBookings = {
  listing: ListingCard;
  bookings: HostBooking[];
};

export type ListingWritePayload = {
  title: string;
  description: string;
  property_type: string;
  location_city: string;
  location_country: string;
  lat: number;
  lng: number;
  price_per_night: string;
  max_guests: number;
  bedrooms: number;
  beds: number;
  baths: number;
  photo_urls: string[];
  amenity_ids: number[];
};
