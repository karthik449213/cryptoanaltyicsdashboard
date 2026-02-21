import Link from "next/link";
import { LayoutDashboard, BarChart3, Bell } from "lucide-react";
import { cn } from "@/lib/utils";

type SidebarProps = {
  open: boolean;
  onClose: () => void;
};

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/charts", label: "Analytics", icon: BarChart3 },
  { href: "/alerts", label: "Alerts", icon: Bell },
] as const;

export function Sidebar({ open, onClose }: SidebarProps) {
  return (
    <>
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 transform border-r border-slate-700/40 bg-bg-900/95 p-4 backdrop-blur-xl transition-transform md:static md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="mb-6 rounded-xl border border-neon-cyan/20 bg-slate-900/60 p-4 shadow-neon">
          <p className="text-xs text-slate-400">Workspace</p>
          <h2 className="mt-1 text-sm font-semibold text-slate-100">Crypto Desk Pro</h2>
        </div>
        <nav className="space-y-2">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={label}
              href={href}
              onClick={onClose}
              className="flex items-center gap-3 rounded-lg border border-transparent px-3 py-2 text-sm text-slate-300 transition hover:border-neon-cyan/30 hover:bg-slate-800/60 hover:text-neon-cyan"
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>
      </aside>
      {open ? (
        <button
          type="button"
          aria-label="Close sidebar"
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={onClose}
        />
      ) : null}
    </>
  );
}
