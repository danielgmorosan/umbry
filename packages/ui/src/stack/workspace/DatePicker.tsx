import { useState } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../../utils";

const GRANULARITIES = ["Day", "Month", "Quarter", "Half-year", "Year"] as const;
type Granularity = (typeof GRANULARITIES)[number];

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function buildCalendar(year: number, month: number) {
  const first = new Date(year, month, 1);
  const start = new Date(first);
  start.setDate(start.getDate() - first.getDay());
  const days: Array<{ date: number; month: number; year: number; current: boolean }> = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    days.push({
      date: d.getDate(),
      month: d.getMonth(),
      year: d.getFullYear(),
      current: d.getMonth() === month,
    });
  }
  return days;
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function DatePickerPopover({
  label = "Target date",
  value,
  selectedDay,
  onSelectDay,
  className,
}: {
  label?: string;
  value?: string;
  selectedDay?: number;
  onSelectDay?: (day: number) => void;
  className?: string;
}) {
  const [granularity, setGranularity] = useState<Granularity>("Day");
  const [month, setMonth] = useState(3);
  const year = 2026;
  const days = buildCalendar(year, month);

  return (
    <div
      className={cn(
        "w-[280px] overflow-hidden rounded-card border border-line bg-paper",
        "shadow-[var(--st-shadow-card)]",
        className,
      )}
    >
      <div className="border-b border-line px-3 py-2.5">
        <div className="mb-2 flex items-center gap-2 text-[12px] text-ink-mute">
          <Calendar className="size-3.5" />
          {label}
        </div>
        <input
          type="text"
          defaultValue={value}
          placeholder="Try: May 2027, Q4, 05/20/2027"
          className="w-full bg-field rounded-control border border-line px-2.5 py-1.5 text-[13px] text-ink placeholder:text-ink-faint outline-none focus:border-line-strong"
        />
      </div>

      <div className="flex gap-0.5 border-b border-line p-1.5">
        {GRANULARITIES.map((g) => (
          <button
            key={g}
            type="button"
            onClick={() => setGranularity(g)}
            className={cn(
              "flex-1 rounded-control px-1 py-1 text-[10px] font-medium transition-colors",
              granularity === g ? "bg-ink text-paper" : "text-ink-mute hover:bg-field",
            )}
          >
            {g}
          </button>
        ))}
      </div>

      {granularity === "Day" && (
        <>
          <div className="flex items-center justify-between px-3 py-2">
            <button
              type="button"
              aria-label="Previous month"
              onClick={() => setMonth((m) => (m === 0 ? 11 : m - 1))}
              className="rounded-control p-1 text-ink-faint hover:bg-field hover:text-ink"
            >
              <ChevronLeft className="size-4" />
            </button>
            <span className="text-[13px] font-medium text-ink">
              {MONTH_NAMES[month]} {year}
            </span>
            <button
              type="button"
              aria-label="Next month"
              onClick={() => setMonth((m) => (m === 11 ? 0 : m + 1))}
              className="rounded-control p-1 text-ink-faint hover:bg-field hover:text-ink"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
          <div className="grid grid-cols-7 gap-0 px-2 pb-3">
            {WEEKDAYS.map((d) => (
              <span key={d} className="py-1 text-center text-[10px] text-ink-faint">
                {d}
              </span>
            ))}
            {days.map((d, i) => (
              <button
                key={i}
                type="button"
                onClick={() => d.current && onSelectDay?.(d.date)}
                className={cn(
                  "mx-auto flex size-7 items-center justify-center rounded-full text-[12px]",
                  !d.current && "text-ink-faint/50",
                  d.current && "text-ink hover:bg-field",
                  d.current && selectedDay === d.date && "bg-field font-medium",
                )}
              >
                {d.date}
              </button>
            ))}
          </div>
        </>
      )}

      {granularity === "Quarter" && (
        <div className="space-y-2 p-3">
          {[2026, 2027, 2028].map((y) => (
            <div key={y} className="flex items-center gap-2">
              <span className="w-10 shrink-0 text-[12px] text-ink-faint">{y}</span>
              <div className="flex flex-1 gap-1">
                {["Q1", "Q2", "Q3", "Q4"].map((q) => (
                  <button
                    key={q}
                    type="button"
                    className="flex-1 rounded-control border border-line py-1.5 text-[11px] text-ink-mute hover:bg-field hover:text-ink"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {(granularity === "Month" || granularity === "Half-year" || granularity === "Year") && (
        <p className="px-3 py-6 text-center text-[12px] text-ink-faint">
          {granularity} picker — wire to your date logic
        </p>
      )}
    </div>
  );
}

export function DatePickerTrigger({
  label = "Target date",
  onClick,
  className,
}: {
  label?: string;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-control border border-line bg-field",
        "px-2.5 py-1.5 text-[12px] text-ink-mute hover:border-line-strong hover:text-ink",
        "transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--st-ring)]",
        className,
      )}
    >
      <Calendar className="size-3.5" />
      {label}
    </button>
  );
}
