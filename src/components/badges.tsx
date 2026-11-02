import type { IconType } from "react-icons";
import { LuBan, LuCircleCheck, LuCircleDashed, LuFlag, LuHistory, LuTimer } from "react-icons/lu";
import type { Task, TaskPriority, TaskStatus } from "@/lib/types";

const statusStyles: Record<TaskStatus, { cls: string; label: string; Icon: IconType }> = {
  pending: { cls: "bg-surface-muted text-fg-soft", label: "Pending", Icon: LuCircleDashed },
  in_progress: { cls: "bg-warning-soft text-warning", label: "In progress", Icon: LuTimer },
  completed: { cls: "bg-success-soft text-success", label: "Completed", Icon: LuCircleCheck },
  blocked: { cls: "bg-danger-soft text-danger", label: "Blocked", Icon: LuBan },
};

const priorityStyles: Record<TaskPriority, string> = {
  low: "text-muted",
  medium: "text-info",
  high: "text-danger",
};

export function StatusBadge({ status }: { status: TaskStatus }) {
  const { cls, label, Icon } = statusStyles[status];
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {label}
    </span>
  );
}

export function PriorityTag({ priority }: { priority: TaskPriority }) {
  return (
    <span
      className={`inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide ${priorityStyles[priority]}`}
    >
      <LuFlag className="h-3 w-3" aria-hidden="true" />
      {priority}
    </span>
  );
}

const shortDate = (d: string) =>
  new Date(`${d}T00:00:00Z`).toLocaleDateString("en-US", { day: "numeric", month: "short", timeZone: "UTC" });

/** "Carried from 16 Oct · 2 days" for tasks rolled over from an earlier day. */
export function CarriedTag({ task }: { task: Pick<Task, "carried_days" | "original_date"> }) {
  if (!task.carried_days || !task.original_date) return null;
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-warning-soft px-2 py-0.5 text-[11px] font-medium text-warning">
      <LuHistory className="h-3 w-3" aria-hidden="true" />
      Carried from {shortDate(task.original_date)} · {task.carried_days} day{task.carried_days === 1 ? "" : "s"}
    </span>
  );
}
