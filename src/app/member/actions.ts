"use server";

import { revalidatePath } from "next/cache";
import { requireMember } from "@/lib/auth";
import { today } from "@/lib/dates";
import { createClient } from "@/lib/supabase/server";
import type { TaskStatus } from "@/lib/types";

export type FormState = { ok?: string; error?: string };

const STATUS_VALUES: TaskStatus[] = ["pending", "in_progress", "completed", "blocked"];

export async function updateTask(_prev: FormState, formData: FormData): Promise<FormState> {
  const me = await requireMember();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "") as TaskStatus;
  const comment = String(formData.get("member_comment") ?? "").trim();

  if (!STATUS_VALUES.includes(status)) return { error: "Invalid status." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("tasks")
    .update({ status, member_comment: comment })
    .eq("id", id)
    .eq("assigned_to", me.id);
  if (error) return { error: error.message };

  revalidatePath("/member", "layout");
  return { ok: "Saved" };
}

export async function saveDailyReport(_prev: FormState, formData: FormData): Promise<FormState> {
  const me = await requireMember();
  const note = String(formData.get("note") ?? "").trim();
  if (note.length < 10) return { error: "Please write a little more about your day (10+ characters)." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("daily_reports")
    .upsert({ user_id: me.id, report_date: today(), note }, { onConflict: "user_id,report_date" });
  if (error) return { error: error.message };

  revalidatePath("/member", "layout");
  return { ok: "Today's closing note is saved." };
}
