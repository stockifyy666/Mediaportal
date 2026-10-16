import { connection } from "next/server";
import { Suspense } from "react";
import { PageLoading } from "@/components/page-loading";
import { PageHeader } from "@/components/app-shell";
import { MonthNav } from "@/components/month-nav";
import { MonthlyRecord } from "@/components/monthly-record";
import { requireMember } from "@/lib/auth";
import { currentMonth, formatMonth, isValidMonth } from "@/lib/dates";

async function MemberHistoryContent({ searchParams }: PageProps<"/member/history">) {
  await connection();
  const me = await requireMember();
  const { month: monthParam } = await searchParams;
  const month = typeof monthParam === "string" && isValidMonth(monthParam) ? monthParam : currentMonth();

  return (
    <>
      <PageHeader title="My records" subtitle={`Everything you did in ${formatMonth(month)}`}>
        <MonthNav month={month} basePath="/member/history" />
      </PageHeader>
      <MonthlyRecord userId={me.id} month={month} />
    </>
  );
}

// Request-time data streams in behind Suspense so navigation stays instant.
export default function MemberHistory(props: PageProps<"/member/history">) {
  return (
    <Suspense fallback={<PageLoading />}>
      <MemberHistoryContent {...props} />
    </Suspense>
  );
}
