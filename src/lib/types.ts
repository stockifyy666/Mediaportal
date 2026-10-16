export type Role = "admin" | "member";
export type TaskStatus = "pending" | "in_progress" | "completed" | "blocked";
export type TaskPriority = "low" | "medium" | "high";

export type Profile = {
  id: string;
  email: string;
  full_name: string;
  designation: string;
  role: Role;
  is_active: boolean;
  created_at: string;
};

export type Task = {
  id: string;
  title: string;
  description: string;
  assigned_to: string;
  assigned_by: string | null;
  task_date: string;
  priority: TaskPriority;
  status: TaskStatus;
  member_comment: string;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type DailyReport = {
  id: string;
  user_id: string;
  report_date: string;
  note: string;
  created_at: string;
  updated_at: string;
};

export const STATUSES: { value: TaskStatus; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "in_progress", label: "In progress" },
  { value: "completed", label: "Completed" },
  { value: "blocked", label: "Blocked" },
];

export const PRIORITIES: { value: TaskPriority; label: string }[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];
