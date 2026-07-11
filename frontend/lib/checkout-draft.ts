import type { CheckoutDraft } from "@/types/api";

export const CHECKOUT_DRAFT_KEY = "airbnb_checkout_draft";

export function readCheckoutDraft(): CheckoutDraft | null {
  if (typeof window === "undefined") {
    return null;
  }

  const rawValue = window.localStorage.getItem(CHECKOUT_DRAFT_KEY);
  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue) as CheckoutDraft;
  } catch {
    return null;
  }
}

export function clearCheckoutDraft() {
  window.localStorage.removeItem(CHECKOUT_DRAFT_KEY);
}
