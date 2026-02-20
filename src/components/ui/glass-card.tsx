import { cn } from "@/lib/utils";

type GlassCardProps = {
  title?: string;
  subtitle?: string;
  className?: string;
  children: React.ReactNode;
};

export function GlassCard({ title, subtitle, className, children }: GlassCardProps) {
  return (
    <section
      className={cn(
        "rounded-xl border border-slate-700/40 bg-panel/80 backdrop-blur-xl shadow-glass",
        className,
      )}
    >
      {(title || subtitle) && (
        <header className="border-b border-slate-700/30 px-5 py-4">
          {title ? <h3 className="text-sm font-semibold text-slate-100">{title}</h3> : null}
          {subtitle ? <p className="mt-1 text-xs text-slate-400">{subtitle}</p> : null}
        </header>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}
