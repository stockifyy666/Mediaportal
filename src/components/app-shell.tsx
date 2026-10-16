import { Suspense } from "react";
import { requireAdmin, requireMember } from "@/lib/auth";
import type { Role } from "@/lib/types";
import { Sidebar, type SidebarLink } from "./sidebar";

/**
 * The shell renders instantly; the signed-in profile (and the role check that
 * may redirect) streams into the sidebar. Pages run their own role check too.
 */
export function AppShell({
  role,
  links,
  children,
}: {
  role: Role;
  links: SidebarLink[];
  children: React.ReactNode;
}) {
  const section = role === "admin" ? "Admin" : "Workspace";
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <Suspense fallback={<Sidebar links={links} section={section} />}>
        <SidebarWithProfile role={role} links={links} section={section} />
      </Suspense>
      <div className="flex flex-1 flex-col lg:pl-56">
        <main className="w-full flex-1 px-3 py-5 sm:px-4 lg:py-5 lg:pl-3 lg:pr-5">{children}</main>
      </div>
    </div>
  );
}

async function SidebarWithProfile({
  role,
  links,
  section,
}: {
  role: Role;
  links: SidebarLink[];
  section: string;
}) {
  const profile = role === "admin" ? await requireAdmin() : await requireMember();
  return <Sidebar profile={profile} links={links} section={section} />;
}

export function PageHeader({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}
