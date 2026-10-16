import {
  LuCalendarDays,
  LuCircleCheck,
  LuNotebookPen,
  LuSparkles,
  LuTimer,
  LuTrendingUp,
  LuUsers,
} from "react-icons/lu";
import { Brand, BrandMark } from "./brand";
import { ThemeToggle } from "./theme-toggle";

const features = [
  { icon: LuUsers, text: "Assign daily tasks to one or many team members" },
  { icon: LuNotebookPen, text: "Everyone closes their day with a short note" },
  { icon: LuCalendarDays, text: "A full month-by-month record for every member" },
];

/** Split-screen shell for the login page: animated brand panel + form. */
export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <main className="grid min-h-screen flex-1 lg:grid-cols-[1.1fr_1fr]">
      {/* Brand panel */}
      <section className="relative hidden overflow-hidden bg-[linear-gradient(135deg,#4338ca,#6d28d9,#c026d3,#4f46e5)] bg-[length:300%_300%] animate-gradient p-12 text-white lg:flex lg:flex-col">
        {/* Soft moving blobs */}
        <div className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 animate-blob rounded-full bg-fuchsia-400/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 right-0 h-[28rem] w-[28rem] animate-blob rounded-full bg-indigo-300/30 blur-3xl [animation-delay:-5s]" />
        <div className="pointer-events-none absolute right-1/3 top-1/3 h-64 w-64 animate-blob rounded-full bg-violet-300/20 blur-3xl [animation-delay:-9s]" />
        {/* Subtle grid */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:44px_44px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />

        <div className="relative flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/25 backdrop-blur">
            <LuSparkles className="h-5 w-5" />
          </div>
          <div className="leading-tight">
            <div className="text-lg font-semibold">Media Team</div>
            <div className="text-xs text-white/70">Task workspace</div>
          </div>
        </div>

        <div className="relative mt-auto max-w-lg">
          <h2 className="animate-fade-up text-4xl font-semibold leading-tight tracking-tight xl:text-5xl">
            Plan the day.
            <br />
            Close the day.
            <br />
            <span className="text-white/70">See the whole month.</span>
          </h2>
          <ul className="mt-8 space-y-3">
            {features.map(({ icon: Icon, text }, i) => (
              <li
                key={text}
                className="flex animate-fade-up items-center gap-3 text-sm text-white/85"
                style={{ animationDelay: `${150 + i * 120}ms` }}
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15 ring-1 ring-white/20">
                  <Icon className="h-4 w-4" />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>

        {/* Floating preview cards */}
        <div className="relative mt-12 h-44">
          <div className="absolute left-0 top-0 w-72 animate-float rounded-2xl bg-white/95 p-4 text-zinc-900 shadow-2xl shadow-indigo-950/30">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">Edit Friday promo reel</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                <LuCircleCheck className="h-3 w-3" /> Completed
              </span>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500" />
              <div className="h-2 w-24 rounded-full bg-zinc-200" />
            </div>
          </div>
          <div className="absolute left-56 top-20 w-60 animate-float rounded-2xl bg-white/95 p-4 text-zinc-900 shadow-2xl shadow-indigo-950/30 [animation-delay:-3s]">
            <div className="flex items-center gap-2 text-xs font-medium text-zinc-500">
              <LuTrendingUp className="h-4 w-4 text-indigo-600" /> October completion
            </div>
            <div className="mt-1 text-2xl font-semibold">92%</div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-200">
              <div className="h-full w-[92%] rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500" />
            </div>
          </div>
          <div className="absolute right-4 top-2 hidden animate-float items-center gap-2 rounded-xl bg-white/15 px-3 py-2 text-xs ring-1 ring-white/25 backdrop-blur [animation-delay:-1.5s] xl:flex">
            <LuTimer className="h-4 w-4" /> 3 tasks in progress
          </div>
        </div>
      </section>

      {/* Form panel */}
      <section className="relative flex flex-col bg-background">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(ellipse_at_top,var(--primary-soft),transparent_70%)] lg:hidden" />
        <div className="relative flex items-center justify-between p-4 sm:p-6">
          <div className="lg:invisible">
            <Brand />
          </div>
          <ThemeToggle />
        </div>

        <div className="relative flex flex-1 items-center justify-center px-4 pb-12 sm:px-6">
          <div className="w-full max-w-sm animate-fade-up">
            <div className="mb-8">
              <div className="mb-5 hidden lg:block">
                <BrandMark size="lg" />
              </div>
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
              <p className="mt-2 text-sm text-muted">{subtitle}</p>
            </div>
            {children}
            <div className="mt-8 text-center text-sm text-muted">{footer}</div>
          </div>
        </div>
      </section>
    </main>
  );
}
