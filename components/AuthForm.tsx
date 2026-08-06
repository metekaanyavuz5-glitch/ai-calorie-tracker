"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Mail, CheckCircle2, KeyRound } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Status = "idle" | "sending" | "sent" | "verifying";

export default function AuthForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSendLink(event: FormEvent) {
    event.preventDefault();
    setStatus("sending");
    setErrorMessage("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setStatus("idle");
      setErrorMessage(error.message);
      return;
    }

    setStatus("sent");
  }

  async function handleVerifyCode(event: FormEvent) {
    event.preventDefault();
    setStatus("verifying");
    setErrorMessage("");

    const supabase = createClient();
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: "email",
    });

    if (error) {
      setStatus("sent");
      setErrorMessage(error.message);
      return;
    }

    router.push("/");
    router.refresh();
  }

  if (status === "sent" || status === "verifying") {
    return (
      <div className="space-y-4">
        <div className="flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2} />
          <p>
            <strong>{email}</strong> adresine bir giriş bağlantısı gönderdik. Gelen kutunu kontrol et.
          </p>
        </div>

        <form onSubmit={handleVerifyCode} className="space-y-3">
          <div>
            <label htmlFor="code" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Bağlantı çalışmazsa, e-postadaki 6 haneli kodu gir
            </label>
            <div className="relative">
              <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" strokeWidth={2} />
              <input
                id="code"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                required
                value={code}
                onChange={(event) => setCode(event.target.value)}
                placeholder="123456"
                className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 dark:border-white/10 dark:bg-slate-950 dark:text-slate-100"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={status === "verifying" || !code}
            className="w-full rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-indigo-500/25 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {status === "verifying" ? "Doğrulanıyor..." : "Verify Code"}
          </button>
          {errorMessage && <p className="text-sm text-rose-600 dark:text-rose-400">{errorMessage}</p>}
        </form>

        <button
          type="button"
          onClick={() => {
            setStatus("idle");
            setCode("");
            setErrorMessage("");
          }}
          className="text-xs text-slate-400 hover:text-slate-600 hover:underline dark:text-slate-500 dark:hover:text-slate-300"
        >
          Farklı e-posta kullan
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSendLink} className="space-y-3">
      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
          E-posta
        </label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" strokeWidth={2} />
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 dark:border-white/10 dark:bg-slate-950 dark:text-slate-100"
          />
        </div>
      </div>
      <button
        type="submit"
        disabled={status === "sending"}
        className="w-full rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-indigo-500/25 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {status === "sending" ? "Gönderiliyor..." : "Send Magic Link"}
      </button>
      {errorMessage && <p className="text-sm text-rose-600 dark:text-rose-400">{errorMessage}</p>}
    </form>
  );
}
