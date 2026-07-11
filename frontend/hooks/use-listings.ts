"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createBooking,
  createListing,
  createReview,
  cancelBooking,
  deleteListing,
  getAmenities,
  getHostDashboard,
  getListingDetail,
  getListings,
  getMyBookings,
  getWishlist,
  getUsers,
  toggleWishlist,
  updateListing
} from "@/lib/api";
import type { BookingCreate, ListingFilters, ListingWritePayload, ReviewCreate } from "@/types/api";

export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: getUsers
  });
}

export function useAmenities() {
  return useQuery({
    queryKey: ["amenities"],
    queryFn: getAmenities
  });
}

export function useListings(filters: ListingFilters, currentUserId: number) {
  return useQuery({
    queryKey: ["listings", filters, currentUserId],
    queryFn: () => getListings(filters, currentUserId)
  });
}

export function useListingDetail(listingId: number, currentUserId: number) {
  return useQuery({
    queryKey: ["listing", listingId, currentUserId],
    queryFn: () => getListingDetail(listingId, currentUserId),
    enabled: Number.isFinite(listingId) && listingId > 0
  });
}

export function useWishlistToggle(currentUserId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (listingId: number) => toggleWishlist(listingId, currentUserId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["listings"] });
      queryClient.invalidateQueries({ queryKey: ["listing"] });
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });
}

export function useWishlist(currentUserId: number) {
  return useQuery({
    queryKey: ["wishlist", currentUserId],
    queryFn: () => getWishlist(currentUserId),
    enabled: currentUserId > 0
  });
}

export function useMyBookings(currentUserId: number) {
  return useQuery({
    queryKey: ["bookings", currentUserId],
    queryFn: () => getMyBookings(currentUserId),
    enabled: currentUserId > 0
  });
}

export function useCreateBooking(currentUserId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: BookingCreate) => createBooking(payload, currentUserId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["listings"] });
      queryClient.invalidateQueries({ queryKey: ["listing"] });
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });
}

export function useCancelBooking(currentUserId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bookingId: number) => cancelBooking(bookingId, currentUserId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["listings"] });
      queryClient.invalidateQueries({ queryKey: ["listing"] });
      queryClient.invalidateQueries({ queryKey: ["host-dashboard"] });
      toast.success("Booking cancelled.");
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });
}

export function useHostDashboard(currentUserId: number) {
  return useQuery({
    queryKey: ["host-dashboard", currentUserId],
    queryFn: () => getHostDashboard(currentUserId),
    enabled: currentUserId > 0
  });
}

export function useCreateListing(currentUserId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ListingWritePayload) => createListing(payload, currentUserId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["host-dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["listings"] });
      toast.success("Listing created.");
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });
}

export function useUpdateListing(currentUserId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ listingId, payload }: { listingId: number; payload: ListingWritePayload }) =>
      updateListing(listingId, payload, currentUserId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["host-dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["listing", variables.listingId] });
      queryClient.invalidateQueries({ queryKey: ["listings"] });
      toast.success("Listing updated.");
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });
}

export function useDeleteListing(currentUserId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (listingId: number) => deleteListing(listingId, currentUserId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["host-dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["listings"] });
      toast.success("Listing deleted.");
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });
}

export function useCreateReview(currentUserId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ReviewCreate) => createReview(payload, currentUserId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["listing", variables.listing_id] });
      queryClient.invalidateQueries({ queryKey: ["listings"] });
      toast.success("Review posted.");
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });
}
