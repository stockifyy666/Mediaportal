import { connection } from "next/server";
import { Suspense } from "react";
import { LuArrowLeft, LuArrowRight } from "react-icons/lu";
import { PageLoading } from "@/components/page-loading";
import Link from "next/link";
import { PageHeader } from "@/components/app-shell";
import { requireAdmin } from "@/lib/auth";
import { MonthNav } from "@/components/month-nav";
import { MonthlyRecord } from "@/components/monthly-record";
import { currentMonth, formatMonth, isValidMonth, monthRange } from "@/lib/dates";
import { getMembers } from "@/lib/members";
import { createClient } from "@/lib/supabase/server";

async function ReportsPageContent({ searchParams }: PageProps<"/admin/reports">) {
  await connection();
  await requireAdmin();
  const { month: monthParam, member } = await searchParams;
  const month = typeof monthParam === "string" && isValidMonth(monthParam) ? monthParam : currentMonth();
  const members = await getMembers();
  const selected = typeof member === "string" ? members.find((m) => m.id === member) : undefined;

  if (selected) {
    return (
      <div className="animate-fade-up">
        <PageHeader
          title={selected.full_name}
          subtitle={`${selected.designation || selected.email} · ${formatMonth(month)} record`}
        >
          <MonthNav month={month} basePath="/admin/reports" params={{ member: selected.id }} />
        </PageHeader>
        <Link
          href={`/admin/reports?month=${month}`}
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary-fg hover:underline"
        >
          <LuArrowLeft className="h-4 w-4" /> All members
        </Link>
        <MonthlyRecord userId={selected.id} month={month} />
      </div>
    );
  }

  // Team summary for the month
  const { start, end } = monthRange(month);
  const supabase = await createClient();
  const [{ data: tasks }, { data: reports }] = await Promise.all([
    supabase
      .from("tasks")
      .select("assigned_to, status")
      .gte("task_date", start)
      .lte("task_date", end)
      .returns<{ assigned_to: string; status: string }[]>(),
    supabase
      .from("daily_reports")
      .select("user_id")
      .gte("report_date", start)
      .lte("report_date", end)
      .returns<{ user_id: string }[]>(),
  ]);

  const rows = members.map((m) => {
    const mine = (tasks ?? []).filter((t) => t.assigned_to === m.id);
    const completed = mine.filter((t) => t.status === "completed").length;
    return {
      member: m,
      total: mine.length,
      completed,
      blocked: mine.filter((t) => t.status === "blocked").length,
      rate: mine.length ? Math.round((completed / mine.length) * 100) : 0,
      notes: (reports ?? []).filter((r) => r.user_id === m.id).length,
    };
  });

  return (
    <div className="animate-fade-up">
      <PageHeader title="Monthly records" subtitle={`Team performance for ${formatMonth(month)}`}>
        <MonthNav month={month} basePath="/admin/reports" />
      </PageHeader>

      <div className="card overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-line bg-surface-muted/60 text-left text-xs font-medium uppercase tracking-wide text-muted">
              <th className="px-4 py-3">Member</th>
              <th className="px-4 py-3 text-right">Tasks</th>
              <th className="px-4 py-3 text-right">Completed</th>
              <th className="px-4 py-3 text-right">Blocked</th>
              <th className="px-4 py-3">Completion</th>
              <th className="px-4 py-3 text-right">Daily notes</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-muted">
                  No members yet.
                </td>
              </tr>
            )}
            {rows.map((r) => (
              <tr
                key={r.member.id}
                className={`transition hover:bg-surface-muted/60 ${r.member.is_active ? "" : "text-subtle"}`}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-fuchsia-500 text-xs font-semibold text-white">
                      {r.member.full_name.slice(0, 1).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium">{r.member.full_name}</div>
                      <div className="text-xs text-muted">{r.member.designation}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-right">{r.total}</td>
                <td className="px-4 py-3 text-right text-success">{r.completed}</td>
                <td className="px-4 py-3 text-right text-danger">{r.blocked}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-24 overflow-hidden rounded-full bg-surface-muted">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${r.rate}%` }} />
                    </div>
                    <span className="text-xs font-medium">{r.rate}%</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-right">{r.notes}</td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/reports?member=${r.member.id}&month=${month}`}
                    className="inline-flex items-center gap-1 text-xs font-medium text-primary-fg hover:underline"
                  >
                    Day-by-day <LuArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Request-time data streams in behind Suspense so navigation stays instant.
export default function ReportsPage(props: PageProps<"/admin/reports">) {
  return (
    <Suspense fallback={<PageLoading />}>
      <ReportsPageContent {...props} />
    </Suspense>
  );
}
