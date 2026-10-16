"use client";

import { useActionState } from "react";
import { LuBriefcase, LuKeyRound, LuLock, LuMail, LuSave, LuUser, LuUserPlus } from "react-icons/lu";
import { IconInput } from "@/components/icon-input";
import { createMember, resetMemberPassword, type FormState } from "../actions";

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
