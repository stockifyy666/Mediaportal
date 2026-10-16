import type { IconType } from "react-icons";

const tones = {
  primary: "bg-primary-soft text-primary-fg",
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  danger: "bg-danger-soft text-danger",
  neutral: "bg-surface-muted text-fg-soft",
} as const;

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = "neutral",
  hint,
}: {
  label: string;
  value: string | number;
  icon: IconType;
  tone?: keyof typeof tones;
  hint?: string;
}) {
  return (
    <div className="card flex items-center gap-3 p-4">
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tones[tone]}`}>
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <div className="truncate text-xs font-medium text-muted">{label}</div>
        <div className="text-xl font-semibold tracking-tight">{value}</div>
        {hint && <div className="text-xs text-danger">{hint}</div>}
      </div>
    </div>
  );
}
