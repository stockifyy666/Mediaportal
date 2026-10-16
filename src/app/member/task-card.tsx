"use client";

import { useActionState } from "react";
import { LuCircleCheck, LuHistory, LuSave } from "react-icons/lu";
import { PriorityTag, StatusBadge } from "@/components/badges";
import { STATUSES, type Task } from "@/lib/types";
import { updateTask, type FormState } from "./actions";

export function TaskCard({ task, overdueLabel }: { task: Task; overdueLabel?: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(updateTask, {});

  return (
    <div className="card p-4 transition hover:shadow-md">
      <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold">{task.title}</h3>
            <PriorityTag priority={task.priority} />
          </div>
          {overdueLabel && (
            <div className="mt-1 flex items-center gap-1 text-xs font-medium text-warning">
              <LuHistory className="h-3.5 w-3.5" /> Carried over from {overdueLabel}
            </div>
          )}
        </div>
        <StatusBadge status={task.status} />
      </div>
      {task.description && (
        <p className="mb-3 whitespace-pre-wrap text-sm text-fg-soft">{task.description}</p>
      )}

      <form action={action} className="flex flex-col gap-2 border-t border-line pt-3 sm:flex-row sm:items-end">
        <input type="hidden" name="id" value={task.id} />
        <div className="sm:w-44">
          <label className="label" htmlFor={`status-${task.id}`}>
            Status
          </label>
          <select id={`status-${task.id}`} name="status" defaultValue={task.status} className="input">
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="label" htmlFor={`comment-${task.id}`}>
            Comment (optional)
          </label>
          <input
            id={`comment-${task.id}`}
            name="member_comment"
            defaultValue={task.member_comment}
            placeholder="Progress, blockers, links…"
            className="input"
          />
        </div>
        <button disabled={pending} className="btn-primary">
          <LuSave className="h-4 w-4" />
          {pending ? "Saving…" : "Update"}
        </button>
      </form>
      {state.error && <p className="mt-2 text-xs text-danger">{state.error}</p>}
      {state.ok && !pending && <p className="mt-2 flex items-center gap-1 text-xs text-success">
          <LuCircleCheck className="h-3.5 w-3.5" /> {state.ok}
        </p>}
    </div>
  );
}
