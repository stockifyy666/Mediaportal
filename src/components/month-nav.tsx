import Link from "next/link";
import { LuChevronLeft, LuChevronRight } from "react-icons/lu";
import { formatMonth, shiftMonth } from "@/lib/dates";

/** Prev/next month links plus a picker. `params` are extra query params to keep. */
export function MonthNav({
  month,
  basePath,
  params = {},
}: {
  month: string;
  basePath: string;
  params?: Record<string, string>;
}) {
  const href = (m: string) => `${basePath}?${new URLSearchParams({ ...params, month: m })}`;
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center rounded-lg border border-line-strong bg-surface">
        <Link
          href={href(shiftMonth(month, -1))}
          className="rounded-l-lg p-2 text-fg-soft transition hover:bg-surface-hover"
          aria-label="Previous month"
        >
          <LuChevronLeft className="h-4 w-4" />
        </Link>
        <span className="min-w-32 border-x border-line px-3 text-center text-sm font-medium">
          {formatMonth(month)}
        </span>
        <Link
          href={href(shiftMonth(month, 1))}
          className="rounded-r-lg p-2 text-fg-soft transition hover:bg-surface-hover"
          aria-label="Next month"
        >
          <LuChevronRight className="h-4 w-4" />
        </Link>
      </div>
      <form action={basePath} className="flex items-center gap-2">
        {Object.entries(params).map(([k, v]) => (
          <input key={k} type="hidden" name={k} value={v} />
        ))}
        <input type="month" name="month" defaultValue={month} className="input w-40" aria-label="Pick a month" />
        <button className="btn-secondary px-3">Go</button>
      </form>
    </div>
  );
}
