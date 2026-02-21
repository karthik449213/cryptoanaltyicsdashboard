import { NextResponse } from "next/server";
import { processPriceAlerts } from "@/lib/alerts/worker";
import { withApiErrorHandling } from "@/lib/market/http";

// This endpoint should be protected and only callable by authorized cron services
// In production, add proper authentication (API key, Vercel cron secret, etc.)
export async function GET() {
  return withApiErrorHandling(async () => {
    // Basic security check - you should replace this with proper authentication
    const authHeader = process.env.CRON_SECRET;
    const requestSecret = process.env.CRON_SECRET; // In real implementation, get from headers

    if (!authHeader || authHeader !== requestSecret) {
      return NextResponse.json({
        success: false,
        error: { code: "UNAUTHORIZED", message: "Invalid cron secret" }
      }, { status: 401 });
    }

    console.log("⏰ Starting scheduled price alerts check...");

    const startTime = Date.now();
    await processPriceAlerts();
    const duration = Date.now() - startTime;

    console.log(`✅ Price alerts cron job completed in ${duration}ms`);

    return NextResponse.json({
      success: true,
      data: {
        message: "Price alerts processed successfully",
        duration: `${duration}ms`,
        timestamp: new Date().toISOString(),
      },
    });
  });
}

// Also support POST for cron services that prefer POST
export async function POST() {
  return GET();
}