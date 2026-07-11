import { create } from "zustand";
import type { GuestBreakdown } from "@/components/guest-picker";

type SearchState = {
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  guests: number;
  infants: number;
  isOpen: boolean;
  location: string;
  close: () => void;
  open: () => void;
  setCheckIn: (value: string) => void;
  setCheckOut: (value: string) => void;
  setGuestBreakdown: (value: GuestBreakdown) => void;
  setGuests: (value: number) => void;
  setLocation: (value: string) => void;
};

export const useSearchStore = create<SearchState>((set) => ({
  checkIn: "",
  checkOut: "",
  adults: 1,
  children: 0,
  guests: 1,
  infants: 0,
  isOpen: false,
  location: "",
  close: () => set({ isOpen: false }),
  open: () => set({ isOpen: true }),
  setCheckIn: (checkIn) => set({ checkIn }),
  setCheckOut: (checkOut) => set({ checkOut }),
  setGuestBreakdown: ({ adults, children, infants }) => set({ adults, children, infants, guests: adults + children }),
  setGuests: (guests) => set({ adults: guests, children: 0, guests }),
  setLocation: (location) => set({ location })
}));
