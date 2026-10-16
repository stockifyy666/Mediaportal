import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

/** All team members (non-admins), active first, by name. */
export async function getMembers({ activeOnly = false } = {}): Promise<Profile[]> {
  const supabase = await createClient();
  let query = supabase.from("profiles").select("*").eq("role", "member");
  if (activeOnly) query = query.eq("is_active", true);
  const { data } = await query
    .order("is_active", { ascending: false })
    .order("full_name")
    .returns<Profile[]>();
  return data ?? [];
}
