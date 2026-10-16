"use client";

import { useSearchParams } from "next/navigation";
import { useActionState } from "react";
import { LuArrowRight, LuCircleAlert, LuLoaderCircle, LuLock, LuMail } from "react-icons/lu";
import { IconInput } from "@/components/icon-input";
import { signIn, type LoginState } from "./actions";

export function LoginForm() {
  const initialError =
    useSearchParams().get("error") === "inactive"
      ? "Your account is not active yet. Ask your admin to approve it."
      : undefined;
  const [state, action, pending] = useActionState<LoginState, FormData>(signIn, {
    error: initialError,
  });

  return (
    <form action={action} className="space-y-4">
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
          className="py-2.5"
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
          required
          autoComplete="current-password"
          placeholder="••••••••"
          className="py-2.5"
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
            <LuLoaderCircle className="h-4 w-4 animate-spin" /> Signing in…
          </>
        ) : (
          <>
            Sign in <LuArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
          </>
        )}
      </button>
    </form>
  );
}
