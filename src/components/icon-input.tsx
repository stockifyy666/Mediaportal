"use client";

import { useState } from "react";
import type { IconType } from "react-icons";
import { LuEye, LuEyeOff } from "react-icons/lu";

type Props = React.InputHTMLAttributes<HTMLInputElement> & { icon: IconType };

/** Text input with a leading icon. Password inputs get a show/hide toggle. */
export function IconInput({ icon: Icon, type = "text", className = "", ...props }: Props) {
  const [visible, setVisible] = useState(false);
  const isPassword = type === "password";

  return (
    <div className="group relative">
      <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle transition group-focus-within:text-primary" />
      <input
        {...props}
        type={isPassword && visible ? "text" : type}
        className={`input pl-9 ${isPassword ? "pr-10" : ""} ${className}`}
      />
      {isPassword && (
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-subtle transition hover:text-fg"
          aria-label={visible ? "Hide password" : "Show password"}
          tabIndex={-1}
        >
          {visible ? <LuEyeOff className="h-4 w-4" /> : <LuEye className="h-4 w-4" />}
        </button>
      )}
    </div>
  );
}
