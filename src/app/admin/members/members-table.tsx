"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  LuCalendarDays,
  LuCircleCheck,
  LuKeyRound,
  LuSearch,
  LuUserCheck,
  LuUserPlus,
  LuUsers,
  LuUserX,
  LuX,
} from "react-icons/lu";
import { Modal } from "@/components/modal";
import { SubmitButton } from "@/components/submit-button";
import type { Profile } from "@/lib/types";
import { setMemberActive } from "../actions";
import { CreateMemberForm, ResetPasswordForm } from "./member-forms";

type StatusFilter = "all" | "active" | "inactive";

const joined = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });

export function MembersTable({
  members,
  month,
  initialStatus,
}: {
  members: Profile[];
  month: string;
  initialStatus: StatusFilter;
}) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>(initialStatus);
  const [addOpen, setAddOpen] = useState(false);
  const [resetFor, setResetFor] = useState<Profile | null>(null);
  const [flash, setFlash] = useState("");

  const counts = {
    all: members.length,
    active: members.filter((m) => m.is_active).length,
    inactive: members.filter((m) => !m.is_active).length,
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return members.filter((m) => {
      if (status === "active" && !m.is_active) return false;
      if (status === "inactive" && m.is_active) return false;
      if (!q) return true;
      return [m.full_name, m.email, m.designation].some((v) => v.toLowerCase().includes(q));
    });
  }, [members, query, status]);

  return (
    <>
      {flash && (
        <div className="mb-4 flex animate-fade-up items-center gap-2 rounded-xl border border-success/30 bg-success-soft px-4 py-3 text-sm text-success">
          <LuCircleCheck className="h-5 w-5 shrink-0" />
          <span className="flex-1">{flash}</span>
          <button onClick={() => setFlash("")} className="rounded p-0.5 hover:opacity-70" aria-label="Dismiss">
            <LuX className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="card overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-col gap-3 border-b border-line p-4 md:flex-row md:items-center">
          <div className="relative flex-1 md:max-w-sm">
            <LuSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, email or designation…"
              className="input pl-9"
              aria-label="Search members"
            />
          </div>

          <div className="flex rounded-lg border border-line bg-surface-muted p-1 text-sm">
            {(["all", "active", "inactive"] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatus(s)}
                className={`rounded-md px-3 py-1.5 font-medium capitalize transition ${
                  status === s ? "bg-surface text-fg shadow-sm" : "text-muted hover:text-fg"
                }`}
              >
                {s === "inactive" ? "Not active" : s}
                <span className="ml-1.5 text-xs text-subtle">{counts[s]}</span>
              </button>
            ))}
          </div>

          <button type="button" onClick={() => setAddOpen(true)} className="btn-primary md:ml-auto">
            <LuUserPlus className="h-4 w-4" /> Add member
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-line bg-surface-muted/60 text-left text-xs font-medium uppercase tracking-wide text-muted">
                <th className="px-4 py-3">Member</th>
                <th className="px-4 py-3">Designation</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Joined</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filtered.map((m) => (
                <tr key={m.id} className="transition hover:bg-surface-muted/60">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white ${
                          m.is_active ? "bg-gradient-to-br from-primary to-fuchsia-500" : "bg-subtle"
                        }`}
                      >
                        {(m.full_name || m.email).slice(0, 1).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="truncate font-medium">{m.full_name || "—"}</div>
                        <div className="truncate text-xs text-muted">{m.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-fg-soft">{m.designation || <span className="text-subtle">—</span>}</td>
                  <td className="px-4 py-3">
                    {m.is_active ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-success-soft px-2.5 py-0.5 text-xs font-medium text-success">
                        <span className="h-1.5 w-1.5 rounded-full bg-success" /> Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-warning-soft px-2.5 py-0.5 text-xs font-medium text-warning">
                        <span className="h-1.5 w-1.5 rounded-full bg-warning" /> Not active
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted">{joined(m.created_at)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link
                        href={`/admin/reports?member=${m.id}&month=${month}`}
                        className="rounded-lg p-2 text-muted transition hover:bg-surface-hover hover:text-primary-fg"
                        title="Monthly records"
                        aria-label={`Monthly records for ${m.full_name}`}
                      >
                        <LuCalendarDays className="h-4 w-4" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => setResetFor(m)}
                        className="rounded-lg p-2 text-muted transition hover:bg-surface-hover hover:text-primary-fg"
                        title="Reset password"
                        aria-label={`Reset password for ${m.full_name}`}
                      >
                        <LuKeyRound className="h-4 w-4" />
                      </button>
                      <form action={setMemberActive}>
                        <input type="hidden" name="id" value={m.id} />
                        <input type="hidden" name="active" value={String(!m.is_active)} />
                        {m.is_active ? (
                          <SubmitButton className="btn-danger px-2.5 py-1.5 text-xs" pendingText="…">
                            <LuUserX className="h-3.5 w-3.5" /> Deactivate
                          </SubmitButton>
                        ) : (
                          <SubmitButton className="btn-primary px-2.5 py-1.5 text-xs" pendingText="…">
                            <LuUserCheck className="h-3.5 w-3.5" /> Approve
                          </SubmitButton>
                        )}
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="flex flex-col items-center gap-2 p-10 text-center text-sm text-muted">
              <LuUsers className="h-8 w-8 text-subtle" />
              {members.length === 0 ? "No members yet. Add your first one." : "No members match your search."}
            </div>
          )}
        </div>
      </div>

      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add team member"
        description="The account is active right away."
        icon={LuUserPlus}
      >
        <CreateMemberForm
          onSuccess={(msg) => {
            setFlash(msg);
            setAddOpen(false);
          }}
        />
      </Modal>

      <Modal
        open={!!resetFor}
        onClose={() => setResetFor(null)}
        title="Reset password"
        description={resetFor ? `Set a new password for ${resetFor.full_name || resetFor.email}.` : undefined}
        icon={LuKeyRound}
      >
        {resetFor && (
          <ResetPasswordForm
            key={resetFor.id}
            memberId={resetFor.id}
            onSuccess={(msg) => {
              setFlash(`${msg} (${resetFor.full_name || resetFor.email})`);
              setResetFor(null);
            }}
          />
        )}
      </Modal>
    </>
  );
}
