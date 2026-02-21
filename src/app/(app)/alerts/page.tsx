import { AlertsList } from "@/components/alerts/alerts-list";
import { CreateAlertForm } from "@/components/alerts/create-alert-form";
import { getCurrentUser } from "@/lib/auth/service";
import { redirect } from "next/navigation";

export default async function AlertsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-700/40 bg-panel/70 p-6 backdrop-blur-xl">
        <h1 className="text-2xl font-bold text-slate-100">Price Alerts</h1>
        <p className="text-slate-400 mt-2">
          Get notified when cryptocurrency prices reach your target thresholds
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <AlertsList />
        <CreateAlertForm />
      </div>

      {/* Info Section */}
      <div className="rounded-xl border border-slate-700/40 bg-panel/70 p-6 backdrop-blur-xl">
        <h2 className="text-lg font-semibold text-slate-100 mb-4">How It Works</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="text-center">
            <div className="w-12 h-12 bg-neon-cyan/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-neon-cyan font-bold text-lg">1</span>
            </div>
            <h3 className="font-medium text-slate-200 mb-2">Set Alerts</h3>
            <p className="text-sm text-slate-400">
              Choose cryptocurrencies and set price thresholds for alerts
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-purple-400 font-bold text-lg">2</span>
            </div>
            <h3 className="font-medium text-slate-200 mb-2">Monitor Prices</h3>
            <p className="text-sm text-slate-400">
              Our system checks prices every few minutes automatically
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-emerald-400 font-bold text-lg">3</span>
            </div>
            <h3 className="font-medium text-slate-200 mb-2">Get Notified</h3>
            <p className="text-sm text-slate-400">
              Receive instant notifications via Telegram or email
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}