import { redirect } from "next/navigation";
import { Suspense } from "react";
import { PageLoading } from "@/components/page-loading";
import { getCurrentProfile } from "@/lib/auth";

async function RedirectByRole(): Promise<null> {
  const profile = await getCurrentProfile();
  redirect(profile.role === "admin" ? "/admin" : "/member");
}

export default function Home() {
  return (
    <Suspense fallback={<PageLoading />}>
      <RedirectByRole />
    </Suspense>
  );
}
