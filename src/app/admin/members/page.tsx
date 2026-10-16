import { connection } from "next/server";
import { Suspense } from "react";
import { PageHeader } from "@/components/app-shell";
import { PageLoading } from "@/components/page-loading";
import { requireAdmin } from "@/lib/auth";
import { currentMonth } from "@/lib/dates";
import { getMembers } from "@/lib/members";
import { MembersTable } from "./members-table";

async function MembersPageContent({ searchParams }: PageProps<"/admin/members">) {
  await connection();
  await requireAdmin();
  const { status } = await searchParams;
  const members = await getMembers();
  const active = members.filter((m) => m.is_active).length;

  return (
    <div className="animate-fade-up">
      <PageHeader
        title="Team members"
        subtitle={`${active} active · ${members.length - active} deactivated`}
      />
      <MembersTable
        members={members}
        month={currentMonth()}
        initialStatus={status === "inactive" || status === "active" ? status : "all"}
      />
    </div>
  );
}

// Request-time data streams in behind Suspense so navigation stays instant.
export default function MembersPage(props: PageProps<"/admin/members">) {
  return (
    <Suspense fallback={<PageLoading />}>
      <MembersPageContent {...props} />
    </Suspense>
  );
}
