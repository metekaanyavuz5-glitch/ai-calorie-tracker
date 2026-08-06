import { Flame } from "lucide-react";
import AuthForm from "@/components/AuthForm";

export default function LoginPage() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <main className="relative flex min-h-screen items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-6 flex flex-col items-center text-center">
            <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-sm shadow-indigo-500/30">
              <Flame className="h-6 w-6 text-white" strokeWidth={2.25} aria-hidden="true" />
            </span>
            <h1 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-white">
              AI Calorie Tracker
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Yemek fotoğrafını analiz et, kalori ve besin değerlerini öğren.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-900 sm:p-7">
            <AuthForm />
          </div>
        </div>
      </main>
    </div>
  );
}
