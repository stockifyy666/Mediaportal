import {
  LuBan,
  LuCalendarX,
  LuCircleCheck,
  LuClipboardList,
  LuMessageSquare,
  LuNotebookPen,
  LuTrendingUp,
} from "react-icons/lu";
import { createClient } from "@/lib/supabase/server";
import { formatDay, formatMonth, monthRange, today } from "@/lib/dates";
import type { DailyReport, Task } from "@/lib/types";
import { PriorityTag, StatusBadge } from "./badges";
import { StatCard } from "./stat-card";

/** A member's full day-by-day record for one month: tasks, statuses and closing notes. */
export async function MonthlyRecord({ userId, month }: { userId: string; month: string }) {
  const supabase = await createClient();
  const { start, end, days } = monthRange(month);
  const todayStr = today();

  const [{ data: tasks }, { data: reports }] = await Promise.all([
    supabase
      .from("tasks")
      .select("*")
      .eq("assigned_to", userId)
      .gte("task_date", start)
      .lte("task_date", end)
      .order("created_at")
      .returns<Task[]>(),
    supabase
      .from("daily_reports")
      .select("*")
      .eq("user_id", userId)
      .gte("report_date", start)
      .lte("report_date", end)
      .returns<DailyReport[]>(),
  ]);

  const tasksByDay = new Map<string, Task[]>();
  for (const t of tasks ?? []) {
    tasksByDay.set(t.task_date, [...(tasksByDay.get(t.task_date) ?? []), t]);
  }
  const reportByDay = new Map((reports ?? []).map((r) => [r.report_date, r]));

  const total = tasks?.length ?? 0;
  const completed = tasks?.filter((t) => t.status === "completed").length ?? 0;
  const blocked = tasks?.filter((t) => t.status === "blocked").length ?? 0;
  const rate = total ? Math.round((completed / total) * 100) : 0;
  const daysWithTasks = [...tasksByDay.keys()].filter((d) => d <= todayStr);
  const missedNotes = daysWithTasks.filter((d) => d < todayStr && !reportByDay.has(d)).length;

  const visibleDays = days.filter((d) => d <= todayStr || tasksByDay.has(d)).reverse();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 2xl:grid-cols-5">
        <StatCard label="Tasks assigned" value={total} icon={LuClipboardList} tone="primary" />
        <StatCard label="Completed" value={completed} icon={LuCircleCheck} tone="success" />
        <StatCard label="Completion rate" value={`${rate}%`} icon={LuTrendingUp} tone="primary" />
        <StatCard label="Blocked" value={blocked} icon={LuBan} tone="danger" />
        <StatCard
          label="Daily notes"
          value={reports?.length ?? 0}
          icon={LuNotebookPen}
          hint={missedNotes ? `${missedNotes} missed` : undefined}
        />
      </div>

      {visibleDays.length === 0 ? (
        <div className="card flex flex-col items-center gap-2 p-10 text-center text-sm text-muted">
          <LuCalendarX className="h-8 w-8 text-subtle" />
          No records for {formatMonth(month)} yet.
        </div>
      ) : (
        <div className="card divide-y divide-line">
          {visibleDays.map((day) => {
            const dayTasks = tasksByDay.get(day) ?? [];
            const report = reportByDay.get(day);
            const empty = dayTasks.length === 0 && !report;
            return (
              <div key={day} className={`grid gap-4 p-4 md:grid-cols-[110px_1fr_1fr] ${empty ? "opacity-50" : ""}`}>
                <div>
                  <div className="text-sm font-semibold">{formatDay(day)}</div>
                  {day === todayStr && <div className="text-xs font-medium text-primary-fg">Today</div>}
                </div>
                <div>
                  <div className="label">Tasks</div>
                  {dayTasks.length === 0 ? (
                    <p className="text-sm text-subtle">No tasks</p>
                  ) : (
                    <ul className="space-y-2">
                      {dayTasks.map((t) => (
                        <li key={t.id} className="text-sm">
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-medium">{t.title}</span>
                            <StatusBadge status={t.status} />
                          </div>
                          <PriorityTag priority={t.priority} />
                          {t.member_comment && (
                            <p className="mt-0.5 flex items-start gap-1.5 text-xs text-muted">
                              <LuMessageSquare className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                              {t.member_comment}
                            </p>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div>
                  <div className="label">Closing note</div>
                  {report ? (
                    <p className="whitespace-pre-wrap text-sm text-fg-soft">{report.note}</p>
                  ) : dayTasks.length > 0 && day < todayStr ? (
                    <p className="text-sm font-medium text-danger">Not submitted</p>
                  ) : (
                    <p className="text-sm text-subtle">—</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

