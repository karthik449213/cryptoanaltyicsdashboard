"use client";

import { LogOut } from "lucide-react";
import { useTransition } from "react";
import { logoutAction } from "@/lib/auth/actions";

export function LogoutButton() {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      onClick={() => {
        startTransition(async () => {
          await logoutAction();
        });
      }}
      disabled={pending}
      className="inline-flex items-center gap-2 rounded-lg border border-slate-700/60 bg-slate-900/60 px-3 py-2 text-xs font-medium text-slate-200 transition hover:border-neon-purple/50 hover:text-neon-purple disabled:opacity-60"
    >
      <LogOut className="h-4 w-4" />
      {pending ? "Signing out..." : "Sign Out"}
    </button>
  );
}
