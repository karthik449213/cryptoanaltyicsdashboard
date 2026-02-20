import { Bell, Search } from "lucide-react";

export function Navbar() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-slate-700/40 bg-bg-900/70 px-4 backdrop-blur-xl md:px-6">
      <div className="hidden text-sm font-semibold tracking-wide text-slate-200 sm:block">
        CRYPTO ANALYTICS TERMINAL
      </div>
      <label className="flex flex-1 items-center gap-2 rounded-lg border border-slate-700/50 bg-slate-900/60 px-3 py-2">
        <Search className="h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search assets, symbols, markets..."
          className="w-full bg-transparent text-sm text-slate-200 outline-none placeholder:text-slate-500"
        />
      </label>
      <button
        type="button"
        className="rounded-lg border border-slate-700/50 bg-slate-900/60 p-2 text-slate-300 transition hover:border-neon-cyan/40 hover:text-neon-cyan"
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4" />
      </button>
    </header>
  );
}
