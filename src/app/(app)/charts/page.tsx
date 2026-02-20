import { ChartsExample } from "@/components/charts/charts-example";
import { getCurrentUser } from "@/lib/auth/service";
import { redirect } from "next/navigation";

export default async function ChartsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-700/40 bg-panel/70 p-6 backdrop-blur-xl">
        <h1 className="text-2xl font-bold text-slate-100">Analytics Charts</h1>
        <p className="text-slate-400 mt-2">
          Interactive crypto analytics with real-time data integration
        </p>
      </div>

      <ChartsExample />
    </div>
  );
}