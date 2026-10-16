"use client";

import { useActionState, useState } from "react";
import {
  LuCalendar,
  LuCircleCheck,
  LuClipboardList,
  LuFlag,
  LuPlus,
  LuSend,
  LuUsers,
  LuX,
} from "react-icons/lu";
import { Modal } from "@/components/modal";
import { PRIORITIES, type Profile } from "@/lib/types";
import { createTasks, type FormState } from "../actions";

/** "Assign task" button that opens the assign form in a popup. */
export function AssignTaskButton({ members, defaultDate }: { members: Profile[]; defaultDate: string }) {
  const [open, setOpen] = useState(false);
  const [flash, setFlash] = useState("");

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="btn-primary">
        <LuPlus className="h-4 w-4" /> Assign task
      </button>

      {flash && (
        <div className="fixed bottom-5 right-5 z-[70] flex max-w-sm animate-fade-up items-center gap-2 rounded-xl border border-success/30 bg-surface px-4 py-3 text-sm text-success shadow-xl">
          <LuCircleCheck className="h-5 w-5 shrink-0" />
          <span className="flex-1">{flash}</span>
          <button onClick={() => setFlash("")} className="rounded p-0.5 hover:opacity-70" aria-label="Dismiss">
            <LuX className="h-4 w-4" />
          </button>
        </div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Assign a new task"
        description="Each selected member gets their own copy of the task."
        icon={LuClipboardList}
        size="lg"
      >
        <AssignTaskForm
          members={members}
          defaultDate={defaultDate}
          onSuccess={(msg) => {
            setFlash(msg);
            setOpen(false);
          }}
        />
      </Modal>
    </>
  );
}

function AssignTaskForm({
  members,
  defaultDate,
  onSuccess,
}: {
  members: Profile[];
  defaultDate: string;
  onSuccess: (message: string) => void;
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [state, action, pending] = useActionState<FormState, FormData>(async (prev, formData) => {
    const result = await createTasks(prev, formData);
    if (result.ok) onSuccess(result.ok);
    return result;
  }, {});

  const allSelected = members.length > 0 && selected.size === members.length;
  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <form action={action} className="space-y-4">
      <div>
        <label className="label" htmlFor="title">
          Task title
        </label>
        <input
          id="title"
          name="title"
          required
          autoFocus
          className="input"
          placeholder="e.g. Edit Friday promo reel"
        />
      </div>
      <div>
        <label className="label" htmlFor="description">
          Details (optional)
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          className="input"
          placeholder="Instructions, links, deadlines…"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label flex items-center gap-1.5" htmlFor="task_date">
            <LuCalendar className="h-3.5 w-3.5" /> Date
          </label>
          <input id="task_date" name="task_date" type="date" required defaultValue={defaultDate} className="input" />
        </div>
        <div>
          <label className="label flex items-center gap-1.5" htmlFor="priority">
            <LuFlag className="h-3.5 w-3.5" /> Priority
          </label>
          <select id="priority" name="priority" defaultValue="medium" className="input">
            {PRIORITIES.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <fieldset>
        <div className="mb-1 flex items-center justify-between">
          <legend className="label mb-0 flex items-center gap-1.5">
            <LuUsers className="h-3.5 w-3.5" /> Assign to
            {selected.size > 0 && <span className="text-primary-fg">· {selected.size} selected</span>}
          </legend>
          {members.length > 0 && (
            <button
              type="button"
              onClick={() => setSelected(allSelected ? new Set() : new Set(members.map((m) => m.id)))}
              className="text-xs font-medium text-primary-fg hover:underline"
            >
              {allSelected ? "Clear all" : "Select all"}
            </button>
          )}
        </div>
        {members.length === 0 ? (
          <p className="rounded-lg border border-dashed border-line-strong p-4 text-center text-sm text-muted">
            Add team members first.
          </p>
        ) : (
          <div className="grid max-h-56 gap-1.5 overflow-y-auto rounded-lg border border-line p-2 sm:grid-cols-2">
            {members.map((m) => {
              const checked = selected.has(m.id);
              return (
                <label
                  key={m.id}
                  className={`flex cursor-pointer items-center gap-2.5 rounded-lg border px-2.5 py-2 text-sm transition ${
                    checked
                      ? "border-primary/40 bg-primary-soft"
                      : "border-transparent hover:bg-surface-hover"
                  }`}
                >
                  <input
                    type="checkbox"
                    name="assigned_to"
                    value={m.id}
                    checked={checked}
                    onChange={() => toggle(m.id)}
                    className="h-4 w-4 accent-primary"
                  />
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-fuchsia-500 text-xs font-semibold text-white">
                    {m.full_name.slice(0, 1).toUpperCase()}
                  </div>
                  <div className="min-w-0 leading-tight">
                    <div className="truncate font-medium">{m.full_name}</div>
                    {m.designation && <div className="truncate text-xs text-muted">{m.designation}</div>}
                  </div>
                </label>
              );
            })}
          </div>
        )}
      </fieldset>

      {state.error && (
        <p className="rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">{state.error}</p>
      )}

      <button type="submit" disabled={pending} className="btn-primary w-full">
        <LuSend className="h-4 w-4" />
        {pending
          ? "Assigning…"
          : selected.size > 1
            ? `Assign to ${selected.size} members`
            : "Assign task"}
      </button>
    </form>
  );
}
