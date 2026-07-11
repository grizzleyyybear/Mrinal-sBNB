"use client";

import { Heart } from "lucide-react";
import clsx from "clsx";

type SaveButtonProps = {
  saved: boolean;
  disabled?: boolean;
  onToggle: () => void;
};

export function SaveButton({ saved, disabled = false, onToggle }: SaveButtonProps) {
  return (
    <button
      type="button"
      className={clsx(
        "absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full bg-white/95 text-ink shadow-[0_1px_3px_rgba(0,0,0,0.18)] transition duration-200 hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60",
        saved && "text-rausch"
      )}
      disabled={disabled}
      onClick={onToggle}
      aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
    >
      <Heart size={20} strokeWidth={2.3} className={saved ? "fill-rausch text-rausch" : "fill-white text-ink"} />
    </button>
  );
}
