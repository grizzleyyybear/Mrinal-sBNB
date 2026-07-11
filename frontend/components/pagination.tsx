"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ListingFilters } from "@/types/api";

type PaginationProps = {
  page: number;
  pages: number;
  total: number;
  filters: ListingFilters;
  onChange: (filters: ListingFilters) => void;
};

export function Pagination({ page, pages, total, filters, onChange }: PaginationProps) {
  if (pages <= 1) {
    return null;
  }

  function goToPage(nextPage: number) {
    onChange({ ...filters, page: nextPage });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="flex items-center justify-center gap-4 border-t border-hairline-soft pt-8">
      <button
        className="flex h-10 w-10 items-center justify-center rounded-full border border-hairline text-ink disabled:cursor-not-allowed disabled:text-muted"
        disabled={page <= 1}
        onClick={() => goToPage(page - 1)}
        aria-label="Previous page"
      >
        <ChevronLeft size={18} />
      </button>
      <p className="text-sm text-muted">
        Page <span className="font-semibold text-ink">{page}</span> of {pages} · {total} stays
      </p>
      <button
        className="flex h-10 w-10 items-center justify-center rounded-full border border-hairline text-ink disabled:cursor-not-allowed disabled:text-muted"
        disabled={page >= pages}
        onClick={() => goToPage(page + 1)}
        aria-label="Next page"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
}
