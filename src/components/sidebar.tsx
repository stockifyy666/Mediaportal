"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import type { IconType } from "react-icons";
import {
  LuCalendarDays,
  LuLayoutDashboard,
  LuListTodo,
  LuLogOut,
  LuMenu,
  LuSquareCheckBig,
  LuUsers,
  LuX,
} from "react-icons/lu";
import { signOut } from "@/app/login/actions";
import type { Profile } from "@/lib/types";
import { Brand } from "./brand";
import { ThemeToggle } from "./theme-toggle";

export type IconName = "overview" | "tasks" | "records" | "members" | "today";

export type SidebarLink = { href: string; label: string; icon: IconName };

const icons: Record<IconName, IconType> = {
  overview: LuLayoutDashboard,
  tasks: LuSquareCheckBig,
  records: LuCalendarDays,
  members: LuUsers,
  today: LuListTodo,
};

/** `profile` is undefined while it streams in; the nav renders immediately either way. */
export function Sidebar({
  profile,
  links,
  section,
}: {
  profile?: Profile;
  links: SidebarLink[];
  section: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href.split("/").length <= 2 ? pathname === href : pathname.startsWith(href);

  const name = profile ? profile.full_name || profile.email : "";
  const subtitle = profile?.role === "admin" ? "Admin" : profile?.designation || "Member";

  return (
    <>
      {/* Mobile top bar */}
      <div className="sticky top-0 z-30 flex items-center gap-3 border-b border-line bg-surface/90 px-4 py-3 backdrop-blur lg:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-lg p-1.5 text-fg-soft hover:bg-surface-hover"
          aria-label="Open menu"
        >
          <LuMenu className="h-5 w-5" />
        </button>
        <Brand />
        <ThemeToggle className="ml-auto" />
      </div>

      {/* Backdrop on mobile */}
      {open && (
        <div
          className="fixed inset-0 z-40 animate-fade-in bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-56 flex-col border-r border-line bg-surface transition-transform duration-300 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-4 py-4">
          <Brand />
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-lg p-1.5 text-muted hover:bg-surface-hover lg:hidden"
            aria-label="Close menu"
          >
            <LuX className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 pt-2">
          <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-subtle">
            {section}
          </div>
          {links.map((l) => {
            const active = isActive(l.href);
            const Icon = icons[l.icon];
            return (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className={`group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  active
                    ? "bg-primary-soft text-primary-fg"
                    : "text-fg-soft hover:bg-surface-hover hover:text-fg"
                }`}
              >
                {active && (
                  <span className="absolute inset-y-2 left-0 w-1 rounded-r-full bg-primary" aria-hidden="true" />
                )}
                <Icon
                  className={`h-[18px] w-[18px] transition ${
                    active ? "text-primary-fg" : "text-subtle group-hover:text-fg-soft"
                  }`}
                />
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-line p-3">
          <div className="flex items-center gap-2 rounded-lg px-1 py-1.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-fuchsia-500 text-sm font-semibold text-white">
              {name.slice(0, 1).toUpperCase()}
            </div>
            {profile ? (
              <div className="min-w-0 flex-1 leading-tight">
                <div className="truncate text-sm font-medium">{name}</div>
                <div className="truncate text-xs text-muted">{subtitle}</div>
              </div>
            ) : (
              <div className="min-w-0 flex-1 space-y-1.5">
                <div className="h-3 w-20 animate-pulse rounded bg-surface-hover" />
                <div className="h-2.5 w-12 animate-pulse rounded bg-surface-hover" />
              </div>
            )}
            <ThemeToggle />
            <form action={signOut}>
              <button
                className="rounded-lg p-2 text-muted transition hover:bg-danger-soft hover:text-danger"
                aria-label="Sign out"
                title="Sign out"
              >
                <LuLogOut className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </aside>
    </>
  );
}
