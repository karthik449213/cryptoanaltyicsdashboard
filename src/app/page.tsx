import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/service";
import { getSubscriptionStatus } from "@/lib/subscription/services";

export default async function HomePage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect("/pricing");
  }

  try {
    const subscriptionStatus = await getSubscriptionStatus(user.id);
    
    // Allow access to dashboard if active or trial subscription
    if (subscriptionStatus.status === 'active' || subscriptionStatus.status === 'trial') {
      redirect("/dashboard");
    }
    
    // Redirect to pricing if no active subscription
    redirect("/pricing");
  } catch (error) {
    console.error("Error checking subscription:", error);
    // Fallback to pricing page if there's an error
    redirect("/pricing");
  }
}
