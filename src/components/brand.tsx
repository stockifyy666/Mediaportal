import { LuClapperboard } from "react-icons/lu";

export function BrandMark({ size = "md" }: { size?: "md" | "lg" }) {
  const box = size === "lg" ? "h-12 w-12 rounded-2xl" : "h-9 w-9 rounded-xl";
  const icon = size === "lg" ? "h-6 w-6" : "h-[18px] w-[18px]";
  return (
    <div
      className={`flex shrink-0 items-center justify-center bg-gradient-to-br from-primary to-fuchsia-500 text-white shadow-lg shadow-primary/30 ${box}`}
    >
      <LuClapperboard className={icon} aria-hidden="true" />
    </div>
  );
}

export function Brand() {
  return (
    <div className="flex items-center gap-2.5">
      <BrandMark />
      <div className="leading-tight">
        <div className="font-semibold tracking-tight">Media Team</div>
        <div className="text-[11px] text-muted">Task workspace</div>
      </div>
    </div>
  );
}
