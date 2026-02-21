"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { initialAuthActionState, type AuthActionState } from "@/types/auth";

type AuthFormProps = {
  title: string;
  subtitle: string;
  submitLabel: string;
  action: (prevState: AuthActionState, formData: FormData) => Promise<AuthActionState>;
  alternateText: string;
  alternateHref: string;
  alternateLabel: string;
};

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-2 inline-flex h-11 w-full items-center justify-center rounded-lg border border-neon-cyan/40 bg-gradient-to-r from-neon-cyan/20 to-neon-purple/20 text-sm font-semibold text-slate-100 transition hover:border-neon-cyan/70 disabled:cursor-not-allowed disabled:opacity-60"
      suppressHydrationWarning
    >
      {pending ? "Processing..." : label}
    </button>
  );
}

export function AuthForm({
  title,
  subtitle,
  submitLabel,
  action,
  alternateText,
  alternateHref,
  alternateLabel,
}: AuthFormProps) {
  const [state, formAction] = useActionState(action, initialAuthActionState);

  return (
    <section className="w-full max-w-md rounded-xl border border-slate-700/50 bg-panel/80 p-6 shadow-glass backdrop-blur-xl sm:p-8">
      <h1 className="text-xl font-semibold text-slate-100">{title}</h1>
      <p className="mt-2 text-sm text-slate-400">{subtitle}</p>

      <form action={formAction} className="mt-6 space-y-4" suppressHydrationWarning>
        <div>
          <label htmlFor="email" className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-400">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="h-11 w-full rounded-lg border border-slate-700/60 bg-bg-800/70 px-3 text-sm text-slate-100 outline-none transition focus:border-neon-cyan/60"
            placeholder="you@company.com"
            suppressHydrationWarning
          />
        </div>
        <div>
          <label htmlFor="password" className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-400">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            minLength={8}
            required
            className="h-11 w-full rounded-lg border border-slate-700/60 bg-bg-800/70 px-3 text-sm text-slate-100 outline-none transition focus:border-neon-purple/60"
            placeholder="Minimum 8 characters"
            suppressHydrationWarning
          />
        </div>

        {state.status !== "idle" ? (
          <p
            className={`rounded-lg border px-3 py-2 text-sm ${
              state.status === "error"
                ? "border-rose-500/40 bg-rose-500/10 text-rose-300"
                : "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
            }`}
          >
            {state.message}
          </p>
        ) : null}

        <SubmitButton label={submitLabel} />
      </form>

      <p className="mt-5 text-sm text-slate-400">
        {alternateText}{" "}
        <Link href={alternateHref} className="font-medium text-neon-cyan hover:text-neon-purple">
          {alternateLabel}
        </Link>
      </p>
    </section>
  );
}
