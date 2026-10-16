import { connection } from "next/server";
import { Suspense } from "react";
import {
  LuCircleCheck,
  LuClipboardList,
  LuHistory,
  LuInbox,
  LuNotebookPen,
  LuTimer,
} from "react-icons/lu";
import { StatCard } from "@/components/stat-card";
import { PageLoading } from "@/components/page-loading";
import { PageHeader } from "@/components/app-shell";
import { requireMember } from "@/lib/auth";
import { formatDate, today } from "@/lib/dates";
import { createClient } from "@/lib/supabase/server";
import type { DailyReport, Task } from "@/lib/types";
import { ReportForm } from "./report-form";
import { TaskCard } from "./task-card";

async function MemberTodayContent() {
  await connection();
  const me = await requireMember();
  const date = today();
  const supabase = await createClient();

  const [{ data: todayTasks }, { data: carried }, { data: report }] = await Promise.all([
    supabase
      .from("tasks")
      .select("*")
      .eq("assigned_to", me.id)
      .eq("task_date", date)
      .order("created_at")
      .returns<Task[]>(),
    // Unfinished tasks from earlier days stay on the list until completed.
    supabase
      .from("tasks")
      .select("*")
      .eq("assigned_to", me.id)
      .lt("task_date", date)
      .neq("status", "completed")
      .order("task_date")
      .returns<Task[]>(),
    supabase
      .from("daily_reports")
      .select("*")
      .eq("user_id", me.id)
      .eq("report_date", date)
      .maybeSingle<DailyReport>(),
  ]);

  const tasks = todayTasks ?? [];
  const done = tasks.filter((t) => t.status === "completed").length;
  const active = tasks.filter((t) => t.status === "in_progress").length;
  const firstName = me.full_name.split(" ")[0] || "there";

  return (
    <div className="animate-fade-up">
      <PageHeader title={`Hi ${firstName}`} subtitle={formatDate(date)} />

      <div className="mb-5 grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard label="Today's tasks" value={tasks.length} icon={LuClipboardList} tone="primary" />
        <StatCard label="Completed" value={`${done}/${tasks.length}`} icon={LuCircleCheck} tone="success" />
        <StatCard label="In progress" value={active} icon={LuTimer} tone="warning" />
        <StatCard label="Carried over" value={carried?.length ?? 0} icon={LuHistory} tone="danger" />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <section>
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted">
              <LuClipboardList className="h-4 w-4" /> Today&apos;s tasks
            </h2>
            {tasks.length === 0 ? (
              <div className="card flex flex-col items-center gap-2 p-10 text-center text-sm text-muted">
                <LuInbox className="h-8 w-8 text-subtle" />
                No tasks assigned for today yet.
              </div>
            ) : (
              <div className="space-y-3">
                {tasks.map((t) => (
                  <TaskCard key={t.id} task={t} />
                ))}
              </div>
            )}
          </section>

          {!!carried?.length && (
            <section>
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-warning">
                <LuHistory className="h-4 w-4" /> Unfinished from earlier days
              </h2>
              <div className="space-y-3">
                {carried.map((t) => (
                  <TaskCard key={t.id} task={t} overdueLabel={formatDate(t.task_date)} />
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="lg:sticky lg:top-8 lg:self-start">
          <div className="card p-5">
            <div className="mb-1 flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-semibold">
                <LuNotebookPen className="h-4 w-4 text-primary-fg" /> Day closing note
              </h2>
              {report ? (
                <span className="rounded-full bg-success-soft px-2 py-0.5 text-xs font-medium text-success">
                  Submitted
                </span>
              ) : (
                <span className="rounded-full bg-warning-soft px-2 py-0.5 text-xs font-medium text-warning">
                  Pending
                </span>
              )}
            </div>
            <p className="mb-3 text-xs text-muted">
              Before you finish for the day, write what you did today. You can edit it until midnight.
            </p>
            <ReportForm existingNote={report?.note} />
          </div>
        </aside>
      </div>
    </div>
  );
}

// Request-time data streams in behind Suspense so navigation stays instant.
export default function MemberToday() {
  return (
    <Suspense fallback={<PageLoading />}>
      <MemberTodayContent />
    </Suspense>
  );
}
