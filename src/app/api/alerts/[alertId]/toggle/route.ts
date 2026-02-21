import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/service";
import { priceAlertsRepository } from "@/lib/alerts/repository";
import { AlertsUnauthorizedError, AlertsNotFoundError } from "@/lib/alerts/errors";
import { withApiErrorHandling } from "@/lib/market/http";

interface RouteParams {
  params: Promise<{ alertId: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  return withApiErrorHandling(async () => {
    const user = await getCurrentUser();
    if (!user) {
      throw new AlertsUnauthorizedError();
    }

    const { alertId } = await params;
    const body = await request.json();
    const { isActive } = body;

    if (typeof isActive !== "boolean") {
      throw new Error("isActive must be a boolean");
    }

    const alert = await priceAlertsRepository.update(alertId, user.id, { isActive });

    return NextResponse.json({
      success: true,
      data: alert,
    });
  });
}