import { Sparkles, ShieldCheck, History } from "lucide-react";

const FEATURES = [
  { icon: Sparkles, text: "Instant AI nutrition analysis from a single photo" },
  { icon: ShieldCheck, text: "Secure, passwordless magic-link sign-in" },
  { icon: History, text: "Every meal saved automatically to your history" },
];

export default function FeatureHighlights() {
  return (
    <ul className="space-y-2.5 border-t border-slate-100 pt-4 dark:border-white/10">
      {FEATURES.map(({ icon: Icon, text }) => (
        <li key={text} className="flex items-start gap-2.5 text-xs text-slate-500 dark:text-slate-400">
          <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-indigo-400 dark:text-indigo-300/80" strokeWidth={2.25} aria-hidden="true" />
          <span>{text}</span>
        </li>
      ))}
    </ul>
  );
}
