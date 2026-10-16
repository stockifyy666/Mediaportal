"use client";

import { useActionState } from "react";
import { LuSend } from "react-icons/lu";
import { saveDailyReport, type FormState } from "./actions";

export function ReportForm({ existingNote }: { existingNote?: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveDailyReport, {});

  return (
    <form action={action} className="space-y-3">
      <textarea
        name="note"
        rows={6}
        required
        defaultValue={existingNote}
        className="input"
        placeholder="What did you work on today? What got finished, what's still pending, any blockers?"
      />
      {state.error && (
        <p className="rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">{state.error}</p>
      )}
      {state.ok && (
        <p className="rounded-lg bg-success-soft px-3 py-2 text-sm text-success">{state.ok}</p>
      )}
      <button disabled={pending} className="btn-primary w-full">
        <LuSend className="h-4 w-4" />
        {pending ? "Saving…" : existingNote ? "Update closing note" : "Submit day closing"}
      </button>
    </form>
  );
}
