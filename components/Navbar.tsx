import Link from "next/link";
import { Flame } from "lucide-react";
import LogoutButton from "@/components/LogoutButton";

export default function Navbar({ userEmail }: { userEmail?: string }) {
  const initial = userEmail ? userEmail.trim().charAt(0).toUpperCase() : null;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/85 backdrop-blur-md dark:border-white/10 dark:bg-slate-950/85">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-sm shadow-indigo-500/30">
            <Flame className="h-5 w-5 text-white" strokeWidth={2.25} aria-hidden="true" />
          </span>
          <span className="leading-tight">
            <span className="block text-[15px] font-semibold tracking-tight text-slate-900 dark:text-white">
              AI Calorie Tracker
            </span>
            <span className="hidden text-xs text-slate-500 dark:text-slate-400 sm:block">
              Analyze your meals with AI
            </span>
          </span>
        </Link>

        {userEmail && (
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-slate-50 py-1 pl-1 pr-3 dark:border-white/10 dark:bg-white/5 sm:flex">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-[11px] font-semibold text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300">
                {initial}
              </span>
              <span className="max-w-[160px] truncate text-xs font-medium text-slate-600 dark:text-slate-300">
                {userEmail}
              </span>
            </div>
            <LogoutButton />
          </div>
        )}
      </div>
    </header>
  );
}
