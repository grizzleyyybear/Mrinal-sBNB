"use client";

import { format, isAfter, isBefore, startOfDay } from "date-fns";
import { CalendarDays } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { DateRange, DayPicker } from "react-day-picker";

type DateRangeCalendarProps = {
  value: DateRange | undefined;
  onChange: (value: DateRange | undefined) => void;
  onComplete?: () => void;
  closeOnComplete?: boolean;
  showSelection?: boolean;
  blockedRanges?: DateRange[];
};

type DateFocus = "check-in" | "check-out";

function displayDate(value: Date | undefined) {
  return value ? format(value, "dd MMM yyyy") : "Add date";
}

export function DateRangeCalendar({ value, onChange, onComplete, closeOnComplete = true, showSelection = true, blockedRanges = [] }: DateRangeCalendarProps) {
  const [focus, setFocus] = useState<DateFocus>(value?.from && !value.to ? "check-out" : "check-in");
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const transitionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const today = startOfDay(new Date());

  useEffect(() => {
    return () => {
      if (transitionTimer.current) clearTimeout(transitionTimer.current);
      if (closingTimer.current) clearTimeout(closingTimer.current);
    };
  }, []);

  function advanceToCheckout(nextRange: DateRange) {
    onChange(nextRange);
    setIsClosing(false);
    setIsAdvancing(true);
    transitionTimer.current = setTimeout(() => {
      setFocus("check-out");
      setIsAdvancing(false);
    }, 180);
  }

  function selectDay(day: Date, disabled: boolean) {
    if (disabled || isAdvancing) return;

    const selectedDay = startOfDay(day);
    if (focus === "check-in" || !value?.from) {
      advanceToCheckout({ from: selectedDay, to: undefined });
      return;
    }

    if (!isAfter(selectedDay, value.from)) {
      advanceToCheckout({ from: selectedDay, to: undefined });
      return;
    }

    onChange({ from: value.from, to: selectedDay });
    setIsAdvancing(true);
    setIsClosing(false);
    closingTimer.current = setTimeout(() => setIsClosing(true), 1180);
    transitionTimer.current = setTimeout(() => {
      setFocus("check-in");
      setIsAdvancing(false);
      if (closeOnComplete) onComplete?.();
    }, 1500);
  }

  const modifiers = {
    rangeStart: value?.from,
    rangeEnd: value?.to,
    rangeMiddle: (day: Date) => Boolean(value?.from && value.to && isAfter(day, value.from) && isBefore(day, value.to))
  };

  function isDisabled(day: Date) {
    const normalizedDay = startOfDay(day);
    return isBefore(normalizedDay, today) || blockedRanges.some((range) => {
      return Boolean(range.from && range.to && !isBefore(normalizedDay, range.from) && !isAfter(normalizedDay, range.to));
    });
  }

  return (
    <div className="rounded-xl bg-white p-3 sm:border sm:border-hairline-soft sm:p-4">
      {showSelection ? (
        <div className="mb-4 grid grid-cols-2 overflow-hidden rounded-lg border border-hairline">
          <button type="button" className={`p-3 text-left transition ${focus === "check-in" ? "bg-surface-soft" : "hover:bg-surface-soft"}`} onClick={() => setFocus("check-in")}>
            <span className="block text-[10px] font-semibold uppercase text-ink">Check in</span>
            <span className="mt-1 block text-sm text-body">{displayDate(value?.from)}</span>
          </button>
          <button type="button" className={`border-l border-hairline p-3 text-left transition ${focus === "check-out" ? "bg-surface-soft" : "hover:bg-surface-soft"}`} onClick={() => value?.from && setFocus("check-out")}>
            <span className="block text-[10px] font-semibold uppercase text-ink">Check out</span>
            <span className="mt-1 block text-sm text-body">{displayDate(value?.to)}</span>
          </button>
        </div>
      ) : null}

      <div className="mb-2 flex items-center gap-2 px-1 text-xs font-semibold text-muted"><CalendarDays size={14} /> {focus === "check-in" ? "Select check-in" : "Select checkout"}</div>
      <div className={`transition-all duration-300 ${isClosing ? "scale-[0.97] opacity-0" : "scale-100 opacity-100"}`}>
        <DayPicker
          onDayClick={(day, modifiersForDay) => selectDay(day, Boolean(modifiersForDay.disabled))}
          disabled={isDisabled}
          modifiers={modifiers}
          className="text-sm"
          classNames={{
          months: "flex justify-center",
          month: "w-full",
          caption: "relative flex min-h-9 items-center justify-center pb-3",
          caption_label: "px-12 text-sm font-semibold text-ink",
          nav: "pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between",
          button_previous: "pointer-events-auto flex h-8 w-8 items-center justify-center rounded-full border border-hairline hover:bg-surface-soft",
          button_next: "pointer-events-auto flex h-8 w-8 items-center justify-center rounded-full border border-hairline hover:bg-surface-soft",
          weekdays: "grid grid-cols-7 text-center text-xs font-semibold text-muted",
          week: "mt-1 grid grid-cols-7",
          day: "flex h-9 w-9 items-center justify-center rounded-full text-sm hover:bg-surface-soft",
          disabled: "text-hairline line-through"
          }}
          modifiersClassNames={{
          rangeStart: "bg-rausch text-white hover:bg-rausch",
          rangeEnd: "bg-rausch text-white hover:bg-rausch",
          rangeMiddle: "rounded-none bg-surface-soft text-ink"
          }}
        />
      </div>
      <p aria-live="polite" className={`mt-2 min-h-4 px-1 text-xs text-muted transition-opacity duration-200 ${isAdvancing || value?.to ? "opacity-100" : "opacity-0"}`}>
        {value?.to ? "Dates selected. You can adjust either date before searching." : "Check-in saved. Choose checkout next."}
      </p>
    </div>
  );
}
