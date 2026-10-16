import { AppShell } from "@/components/app-shell";
import type { SidebarLink } from "@/components/sidebar";

const links: SidebarLink[] = [
  { href: "/admin", label: "Overview", icon: "overview" },
  { href: "/admin/tasks", label: "Assign tasks", icon: "tasks" },
  { href: "/admin/reports", label: "Monthly records", icon: "records" },
  { href: "/admin/members", label: "Team members", icon: "members" },
];

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <AppShell role="admin" links={links}>
      {children}
    </AppShell>
  );
}
