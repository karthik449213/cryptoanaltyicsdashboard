import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/service";
import { priceAlertsRepository } from "@/lib/alerts/repository";
import { validateUpdatePriceAlert } from "@/lib/alerts/validation";
import { toAlertsError, AlertsUnauthorizedError, AlertsNotFoundError } from "@/lib/alerts/errors";
import { withApiErrorHandling } from "@/lib/market/http";

interface RouteParams {
  params: Promise<{ alertId: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  return withApiErrorHandling(async () => {
    const user = await getCurrentUser();
    if (!user) {
      throw new AlertsUnauthorizedError();
    }

    const { alertId } = await params;

    const alert = await priceAlertsRepository.findById(alertId, user.id);
    if (!alert) {
      throw new AlertsNotFoundError();
    }

    return NextResponse.json({
      success: true,
      data: alert,
    });
  });
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  return withApiErrorHandling(async () => {
    const user = await getCurrentUser();
    if (!user) {
      throw new AlertsUnauthorizedError();
    }

    const { alertId } = await params;
    const body = await request.json();
    const validatedInput = validateUpdatePriceAlert(body);

    const alert = await priceAlertsRepository.update(alertId, user.id, validatedInput);

    return NextResponse.json({
      success: true,
      data: alert,
    });
  });
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  return withApiErrorHandling(async () => {
    const user = await getCurrentUser();
    if (!user) {
      throw new AlertsUnauthorizedError();
    }

    const { alertId } = await params;

    await priceAlertsRepository.delete(alertId, user.id);

    return NextResponse.json({
      success: true,
      data: null,
    });
  });
}