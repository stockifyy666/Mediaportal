"use client";

import { useActionState, useState } from "react";
import {
  LuBriefcase,
  LuKeyRound,
  LuLock,
  LuMail,
  LuSave,
  LuTrash2,
  LuTriangleAlert,
  LuUser,
  LuUserPlus,
} from "react-icons/lu";
import { IconInput } from "@/components/icon-input";
import { createMember, deleteMember, resetMemberPassword, type FormState } from "../actions";

export function CreateMemberForm({ onSuccess }: { onSuccess: (message: string) => void }) {
  const [state, action, pending] = useActionState<FormState, FormData>(async (prev, formData) => {
    const result = await createMember(prev, formData);
    if (result.ok) onSuccess(result.ok);
    return result;
  }, {});

  return (
    <form action={action} className="space-y-4">
      <div>
        <label className="label" htmlFor="full_name">
          Full name
        </label>
        <IconInput icon={LuUser} id="full_name" name="full_name" required placeholder="e.g. Hamza Ali" autoFocus />
      </div>
      <div>
        <label className="label" htmlFor="designation">
          Designation
        </label>
        <IconInput
          icon={LuBriefcase}
          id="designation"
          name="designation"
          placeholder="e.g. Video Editor, Graphic Designer"
        />
      </div>
      <div>
        <label className="label" htmlFor="email">
          Email (login)
        </label>
        <IconInput icon={LuMail} id="email" name="email" type="email" required placeholder="name@company.com" />
      </div>
      <div>
        <label className="label" htmlFor="password">
          Temporary password
        </label>
        <IconInput
          icon={LuLock}
          id="password"
          name="password"
          type="password"
          minLength={8}
          required
          autoComplete="new-password"
        />
        <p className="mt-1 text-xs text-muted">At least 8 characters. Share it with the member.</p>
      </div>
      {state.error && (
        <p className="rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">{state.error}</p>
      )}
      <button type="submit" disabled={pending} className="btn-primary w-full">
        <LuUserPlus className="h-4 w-4" />
        {pending ? "Creating…" : "Create account"}
      </button>
    </form>
  );
}

export function ResetPasswordForm({
  memberId,
  onSuccess,
}: {
  memberId: string;
  onSuccess: (message: string) => void;
}) {
  const [state, action, pending] = useActionState<FormState, FormData>(async (prev, formData) => {
    const result = await resetMemberPassword(prev, formData);
    if (result.ok) onSuccess(result.ok);
    return result;
  }, {});

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="id" value={memberId} />
      <div>
        <label className="label" htmlFor="new-password">
          New password
        </label>
        <IconInput
          icon={LuKeyRound}
          id="new-password"
          name="password"
          type="password"
          minLength={8}
          required
          autoFocus
          autoComplete="new-password"
        />
        <p className="mt-1 text-xs text-muted">At least 8 characters. Share it with the member.</p>
      </div>
      {state.error && (
        <p className="rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">{state.error}</p>
      )}
      <button type="submit" disabled={pending} className="btn-primary w-full">
        <LuSave className="h-4 w-4" />
        {pending ? "Saving…" : "Update password"}
      </button>
    </form>
  );
}

export function DeleteMemberForm({
  memberId,
  name,
  onCancel,
  onSuccess,
}: {
  memberId: string;
  name: string;
  onCancel: () => void;
  onSuccess: (message: string) => void;
}) {
  const [confirm, setConfirm] = useState("");
  const [state, action, pending] = useActionState<FormState, FormData>(async (prev, formData) => {
    const result = await deleteMember(prev, formData);
    if (result.ok) onSuccess(result.ok);
    return result;
  }, {});
  const confirmed = confirm.trim().toLowerCase() === "delete";

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="id" value={memberId} />
      <div className="flex gap-3 rounded-lg border border-danger/30 bg-danger-soft p-3 text-sm text-danger">
        <LuTriangleAlert className="mt-0.5 h-5 w-5 shrink-0" />
        <div className="space-y-1">
          <p className="font-medium">This permanently deletes {name}.</p>
          <p className="text-danger/90">
            Their login, all their tasks and every daily closing note are removed, and their monthly
            records will be gone. This can&apos;t be undone. To keep their history, deactivate them instead.
          </p>
        </div>
      </div>
      <div>
        <label className="label" htmlFor="confirm-delete">
          Type <span className="font-semibold text-fg">delete</span> to confirm
        </label>
        <input
          id="confirm-delete"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          autoComplete="off"
          autoFocus
          className="input"
        />
      </div>
      {state.error && (
        <p className="rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">{state.error}</p>
      )}
      <div className="flex gap-2">
        <button type="button" onClick={onCancel} className="btn-secondary flex-1">
          Cancel
        </button>
        <button
          type="submit"
          disabled={!confirmed || pending}
          className="btn flex-1 bg-danger text-white hover:opacity-90"
        >
          <LuTrash2 className="h-4 w-4" />
          {pending ? "Deleting…" : "Delete member"}
        </button>
      </div>
    </form>
  );
}
