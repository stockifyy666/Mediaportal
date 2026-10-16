"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { isValidDate } from "@/lib/dates";
import { createAdminClient, createClient } from "@/lib/supabase/server";
import type { TaskPriority } from "@/lib/types";

export type FormState = { ok?: string; error?: string };

const PRIORITY_VALUES: TaskPriority[] = ["low", "medium", "high"];

export async function createTasks(_prev: FormState, formData: FormData): Promise<FormState> {
  const admin = await requireAdmin();

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const taskDate = String(formData.get("task_date") ?? "");
  const priority = String(formData.get("priority") ?? "medium") as TaskPriority;
  const memberIds = formData.getAll("assigned_to").map(String).filter(Boolean);

  if (!title) return { error: "Task title is required." };
  if (!isValidDate(taskDate)) return { error: "Pick a valid date." };
  if (!PRIORITY_VALUES.includes(priority)) return { error: "Invalid priority." };
  if (memberIds.length === 0) return { error: "Select at least one team member." };

  const supabase = await createClient();
  const { error } = await supabase.from("tasks").insert(
    memberIds.map((id) => ({
      title,
      description,
      task_date: taskDate,
      priority,
      assigned_to: id,
      assigned_by: admin.id,
    })),
  );
  if (error) return { error: error.message };

  revalidatePath("/admin", "layout");
  return {
    ok: `Task assigned to ${memberIds.length} member${memberIds.length > 1 ? "s" : ""}.`,
  };
}

export async function deleteTask(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const supabase = await createClient();
  await supabase.from("tasks").delete().eq("id", id);
  revalidatePath("/admin", "layout");
}

export async function createMember(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();

  const fullName = String(formData.get("full_name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const designation = String(formData.get("designation") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!fullName || !email) return { error: "Name and email are required." };
  if (password.length < 8) return { error: "Password must be at least 8 characters." };

  const adminClient = createAdminClient();
  const { data, error } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName, designation },
  });
  if (error) return { error: error.message };

  // Self sign-ups start inactive; accounts the admin creates are approved straight away.
  await adminClient.from("profiles").update({ is_active: true }).eq("id", data.user.id);

  revalidatePath("/admin", "layout");
  return { ok: `Account created for ${fullName}. Share the email and password with them.` };
}

export async function setMemberActive(formData: FormData) {
  const admin = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const active = formData.get("active") === "true";
  if (id === admin.id) return;

  const supabase = await createClient();
  await supabase.from("profiles").update({ is_active: active }).eq("id", id);

  // Block / unblock sign-in at the auth level too.
  const adminClient = createAdminClient();
  await adminClient.auth.admin.updateUserById(id, {
    ban_duration: active ? "none" : "876000h",
  });

  revalidatePath("/admin", "layout");
}

export async function resetMemberPassword(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const password = String(formData.get("password") ?? "");
  if (password.length < 8) return { error: "Min 8 characters." };

  const adminClient = createAdminClient();
  const { error } = await adminClient.auth.admin.updateUserById(id, { password });
  if (error) return { error: error.message };
  return { ok: "Password updated." };
}
