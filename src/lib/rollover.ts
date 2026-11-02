import { today } from "@/lib/dates";
import { createAdminClient } from "@/lib/supabase/server";

let lastRun = 0;
let lastDay = "";

/**
 * Moves every unfinished task from an earlier day onto today (see
 * mt_rollover_tasks in supabase/schema.sql). Runs before pages read tasks;
 * throttled per server instance, and always re-runs when the day changes.
 */
export async function rolloverTasks(): Promise<void> {
  const day = today();
  const now = Date.now();
  if (day === lastDay && now - lastRun < 60_000) return;

  const { error } = await createAdminClient().rpc("mt_rollover_tasks", { p_today: day });
  if (error) {
    // Most likely migration 002 hasn't been run yet; pages still work without it.
    console.error("Task rollover failed:", error.message);
    return;
  }
  lastRun = now;
  lastDay = day;
}
