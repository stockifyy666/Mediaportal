"use client";

import { useActionState } from "react";
import {
  LuArrowRight,
  LuBriefcase,
  LuCircleAlert,
  LuLoaderCircle,
  LuLock,
  LuMail,
  LuUser,
} from "react-icons/lu";
import { IconInput } from "@/components/icon-input";
import { signUp, type LoginState } from "../login/actions";

export function SignupForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(signUp, {});

  return (
    <form action={action} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="full_name" className="label">
            Full name
          </label>
          <IconInput icon={LuUser} id="full_name" name="full_name" required autoComplete="name" placeholder="Your name" />
        </div>
        <div>
          <label htmlFor="designation" className="label">
            Designation
          </label>
          <IconInput icon={LuBriefcase} id="designation" name="designation" placeholder="Video Editor" />
        </div>
      </div>
      <div>
        <label htmlFor="email" className="label">
          Email
        </label>
        <IconInput
          icon={LuMail}
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@company.com"
        />
      </div>
      <div>
        <label htmlFor="password" className="label">
          Password
        </label>
        <IconInput
          icon={LuLock}
          id="password"
          name="password"
          type="password"
          minLength={8}
          required
          autoComplete="new-password"
          placeholder="At least 8 characters"
        />
      </div>
      {state.error && (
        <p className="flex animate-fade-up items-start gap-2 rounded-lg bg-danger-soft px-3 py-2.5 text-sm text-danger">
          <LuCircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="btn-primary group w-full bg-gradient-to-r from-primary to-fuchsia-600 py-2.5 shadow-lg shadow-primary/25 hover:opacity-95"
      >
        {pending ? (
          <>
            <LuLoaderCircle className="h-4 w-4 animate-spin" /> Creating account…
          </>
        ) : (
          <>
            Create account <LuArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
          </>
        )}
      </button>
    </form>
  );
}
