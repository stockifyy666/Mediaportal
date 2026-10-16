import { connection } from "next/server";
import { Suspense } from "react";
import { LuFilter, LuInbox, LuMessageSquare, LuRotateCcw, LuTrash2, LuUser } from "react-icons/lu";
import { PageLoading } from "@/components/page-loading";
import Link from "next/link";
import { PageHeader } from "@/components/app-shell";
import { requireAdmin } from "@/lib/auth";
import { PriorityTag, StatusBadge } from "@/components/badges";
import { SubmitButton } from "@/components/submit-button";
import { formatDate, isValidDate, today } from "@/lib/dates";
import { getMembers } from "@/lib/members";
import { createClient } from "@/lib/supabase/server";
import type { Task } from "@/lib/types";
import { deleteTask } from "../actions";
import { AssignTaskButton } from "./assign-form";

async function AdminTasksPageContent({ searchParams }: PageProps<"/admin/tasks">) {
  await connection();
  await requireAdmin();
  const { date: dateParam, member } = await searchParams;
  const date = typeof dateParam === "string" && isValidDate(dateParam) ? dateParam : today();
  const memberFilter = typeof member === "string" ? member : "";

  const supabase = await createClient();
  let query = supabase.from("tasks").select("*").eq("task_date", date);
  if (memberFilter) query = query.eq("assigned_to", memberFilter);

  const [members, { data: tasks }] = await Promise.all([
    getMembers({ activeOnly: true }),
    query.order("created_at", { ascending: false }).returns<Task[]>(),
  ]);
  const nameOf = new Map(members.map((m) => [m.id, m.full_name]));

  return (
    <div className="animate-fade-up">
      <PageHeader title="Assign tasks" subtitle="Create daily tasks and manage what is assigned">
        <AssignTaskButton members={members} defaultDate={today()} />
      </PageHeader>

      <div className="space-y-4">
          <form className="card flex flex-wrap items-end gap-3 p-4">
            <div>
              <label className="label" htmlFor="f-date">
                Date
              </label>
              <input id="f-date" type="date" name="date" defaultValue={date} className="input w-44" />
            </div>
            <div className="min-w-48 flex-1">
              <label className="label" htmlFor="f-member">
                Member
              </label>
              <select id="f-member" name="member" defaultValue={memberFilter} className="input">
                <option value="">All members</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.full_name}
                  </option>
                ))}
              </select>
            </div>
            <button className="btn-secondary">
              <LuFilter className="h-4 w-4" /> Filter
            </button>
            {(memberFilter || date !== today()) && (
              <Link href="/admin/tasks" className="btn-secondary">
                <LuRotateCcw className="h-4 w-4" /> Reset
              </Link>
            )}
          </form>

          <div className="card">
            <div className="border-b border-line px-4 py-3 text-sm font-semibold">
              {formatDate(date)} · {tasks?.length ?? 0} task{tasks?.length === 1 ? "" : "s"}
            </div>
            {!tasks?.length ? (
              <div className="flex flex-col items-center gap-2 p-10 text-center text-sm text-muted">
                <LuInbox className="h-8 w-8 text-subtle" />
                No tasks for this day.
              </div>
            ) : (
              <ul className="divide-y divide-line">
                {tasks.map((t) => (
                  <li key={t.id} className="flex items-start gap-4 p-4 transition hover:bg-surface-muted/60">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium">{t.title}</span>
                        <StatusBadge status={t.status} />
                        <PriorityTag priority={t.priority} />
                      </div>
                      <div className="mt-1 flex items-center gap-1 text-xs text-muted">
                        <LuUser className="h-3.5 w-3.5" /> Assigned to{" "}
                        <span className="font-medium text-fg-soft">
                          {nameOf.get(t.assigned_to) ?? "Inactive member"}
                        </span>
                      </div>
                      {t.description && (
                        <p className="mt-1 whitespace-pre-wrap text-sm text-fg-soft">{t.description}</p>
                      )}
                      {t.member_comment && (
                        <p className="mt-1 flex items-start gap-1.5 text-xs text-muted">
                          <LuMessageSquare className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                          {t.member_comment}
                        </p>
                      )}
                    </div>
                    <form action={deleteTask}>
                      <input type="hidden" name="id" value={t.id} />
                      <SubmitButton className="btn-danger px-2.5 py-1.5 text-xs" pendingText="…">
                        <LuTrash2 className="h-3.5 w-3.5" /> Delete
                      </SubmitButton>
                    </form>
                  </li>
                ))}
              </ul>
            )}
          </div>
      </div>
    </div>
  );
}

// Request-time data streams in behind Suspense so navigation stays instant.
export default function AdminTasksPage(props: PageProps<"/admin/tasks">) {
  return (
    <Suspense fallback={<PageLoading />}>
      <AdminTasksPageContent {...props} />
    </Suspense>
  );
}
