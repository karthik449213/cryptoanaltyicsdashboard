"use client";

import { Menu } from "lucide-react";
import { useState } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";

type AppShellProps = {
  children: React.ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-terminal-gradient bg-bg-900 text-slate-100">
      <div className="flex min-h-screen">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-center border-b border-slate-700/40 bg-bg-900/60 px-4 py-3 md:hidden">
            <button
              type="button"
              aria-label="Open sidebar"
              className="rounded-md border border-slate-700/60 bg-slate-900/60 p-2"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-4 w-4" />
            </button>
            <span className="ml-3 text-sm font-semibold tracking-wide text-slate-200">TERMINAL</span>
          </div>
          <Navbar />
          <main className="flex-1 p-4 md:p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
