import { AppShell } from "@/components/app-shell";
import type { SidebarLink } from "@/components/sidebar";

const links: SidebarLink[] = [
  { href: "/member", label: "Today", icon: "today" },
  { href: "/member/history", label: "My records", icon: "records" },
];

export default function MemberLayout({ children }: LayoutProps<"/member">) {
  return (
    <AppShell role="member" links={links}>
      {children}
    </AppShell>
  );
}
