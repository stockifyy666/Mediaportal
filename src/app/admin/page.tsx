import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import {
  LuArrowRight,
  LuCalendarClock,
  LuCircleAlert,
  LuCircleCheck,
  LuClipboardList,
  LuMessageSquare,
  LuNotebookPen,
  LuTimer,
  LuUserPlus,
} from "react-icons/lu";
import { PageHeader } from "@/components/app-shell";
import { PriorityTag, StatusBadge } from "@/components/badges";
import { PageLoading } from "@/components/page-loading";
import { StatCard } from "@/components/stat-card";
import { requireAdmin } from "@/lib/auth";
import { formatDate, isValidDate, today } from "@/lib/dates";
import { getMembers } from "@/lib/members";
import { createClient } from "@/lib/supabase/server";
import type { DailyReport, Task } from "@/lib/types";

async function AdminOverviewContent({ searchParams }: PageProps<"/admin">) {
  await connection();
  await requireAdmin();
  const { date: dateParam } = await searchParams;
  const date = typeof dateParam === "string" && isValidDate(dateParam) ? dateParam : today();

  const supabase = await createClient();
  const [allMembers, { data: tasks }, { data: reports }] = await Promise.all([
    getMembers(),
    supabase.from("tasks").select("*").eq("task_date", date).order("created_at").returns<Task[]>(),
    supabase.from("daily_reports").select("*").eq("report_date", date).returns<DailyReport[]>(),
  ]);

  const members = allMembers.filter((m) => m.is_active);
  const pendingCount = allMembers.length - members.length;
  const allTasks = tasks ?? [];
  const done = allTasks.filter((t) => t.status === "completed").length;
  const inProgress = allTasks.filter((t) => t.status === "in_progress").length;
  const reportCount = reports?.length ?? 0;

  return (
    <div className="animate-fade-up">
      <PageHeader title="Team overview" subtitle={formatDate(date)}>
        <form className="flex items-center gap-2">
          <div className="relative">
            <LuCalendarClock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" />
            <input type="date" name="date" defaultValue={date} className="input w-48 pl-9" />
          </div>
          <button className="btn-secondary">View</button>
          {date !== today() && (
            <Link href="/admin" className="btn-secondary">
              Today
            </Link>
          )}
        </form>
      </PageHeader>

      {pendingCount > 0 && (
        <Link
          href="/admin/members?status=inactive"
          className="mb-5 flex items-center gap-3 rounded-xl border border-warning/30 bg-warning-soft px-4 py-3 text-sm text-warning transition hover:opacity-90"
        >
          <LuCircleAlert className="h-5 w-5 shrink-0" />
          <span className="flex-1">
            <span className="font-semibold">{pendingCount}</span> account
            {pendingCount === 1 ? " is" : "s are"} deactivated and can&apos;t sign in.
          </span>
          <span className="inline-flex items-center gap-1 font-medium">
            Review <LuArrowRight className="h-4 w-4" />
          </span>
        </Link>
      )}

      <div className="mb-5 grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard label="Tasks for the day" value={allTasks.length} icon={LuClipboardList} tone="primary" />
        <StatCard label="Completed" value={`${done}/${allTasks.length}`} icon={LuCircleCheck} tone="success" />
        <StatCard label="In progress" value={inProgress} icon={LuTimer} tone="warning" />
        <StatCard
          label="Closing notes"
          value={`${reportCount}/${members.length}`}
          icon={LuNotebookPen}
          tone="neutral"
        />
      </div>

      {members.length === 0 ? (
        <div className="card flex flex-col items-center gap-3 p-10 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-soft text-primary-fg">
            <LuUserPlus className="h-6 w-6" />
          </div>
          <p className="text-sm text-muted">No team members yet.</p>
          <Link href="/admin/members" className="btn-primary">
            Add your first member
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
          {members.map((m) => {
            const mine = allTasks.filter((t) => t.assigned_to === m.id);
            const report = reports?.find((r) => r.user_id === m.id);
            const mineDone = mine.filter((t) => t.status === "completed").length;
            const pct = mine.length ? Math.round((mineDone / mine.length) * 100) : 0;
            return (
              <div key={m.id} className="card flex flex-col p-4 transition hover:shadow-md">
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-fuchsia-500 text-sm font-semibold text-white">
                    {m.full_name.slice(0, 1).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-semibold">{m.full_name}</div>
                    <div className="truncate text-xs text-muted">{m.designation || m.email}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold">
                      {mineDone}/{mine.length}
                    </div>
                    <div className="text-xs text-muted">done</div>
                  </div>
                </div>
                <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-surface-muted">
                  <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
                </div>

                {mine.length === 0 ? (
                  <p className="mb-3 text-sm text-subtle">No tasks assigned for this day.</p>
                ) : (
                  <ul className="mb-3 space-y-2">
                    {mine.map((t) => (
                      <li key={t.id} className="rounded-lg bg-surface-muted px-3 py-2 text-sm">
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-medium">{t.title}</span>
                          <StatusBadge status={t.status} />
                        </div>
                        <PriorityTag priority={t.priority} />
                        {t.member_comment && (
                          <p className="mt-1 flex items-start gap-1.5 text-xs text-muted">
                            <LuMessageSquare className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                            {t.member_comment}
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>
                )}

                <div className="mt-auto border-t border-line pt-3">
                  <div className="label flex items-center gap-1.5">
                    <LuNotebookPen className="h-3.5 w-3.5" /> Closing note
                  </div>
                  {report ? (
                    <p className="whitespace-pre-wrap text-sm text-fg-soft">{report.note}</p>
                  ) : (
                    <p className="text-sm text-subtle">Not submitted yet</p>
                  )}
                  <Link
                    href={`/admin/reports?member=${m.id}&month=${date.slice(0, 7)}`}
                    className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary-fg hover:underline"
                  >
                    View monthly record <LuArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Request-time data streams in behind Suspense so navigation stays instant.
export default function AdminOverview(props: PageProps<"/admin">) {
  return (
    <Suspense fallback={<PageLoading />}>
      <AdminOverviewContent {...props} />
    </Suspense>
  );
}
