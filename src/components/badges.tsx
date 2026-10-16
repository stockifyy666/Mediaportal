import type { IconType } from "react-icons";
import { LuBan, LuCircleCheck, LuCircleDashed, LuFlag, LuTimer } from "react-icons/lu";
import type { TaskPriority, TaskStatus } from "@/lib/types";

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
