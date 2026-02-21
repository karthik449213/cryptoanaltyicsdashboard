import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/service";
import { priceAlertsRepository } from "@/lib/alerts/repository";
import { validateCreatePriceAlert } from "@/lib/alerts/validation";
import { toAlertsError, AlertsUnauthorizedError } from "@/lib/alerts/errors";
import { withApiErrorHandling } from "@/lib/market/http";

export async function GET() {
  return withApiErrorHandling(async () => {
    const user = await getCurrentUser();
    if (!user) {
      throw new AlertsUnauthorizedError();
    }

    const alerts = await priceAlertsRepository.findByUserId(user.id);

    return NextResponse.json({
      success: true,
      data: alerts,
    });
  });
}

export async function POST(request: NextRequest) {
  return withApiErrorHandling(async () => {
    const user = await getCurrentUser();
    if (!user) {
      throw new AlertsUnauthorizedError();
    }

    const body = await request.json();
    const validatedInput = validateCreatePriceAlert(body);

    const alert = await priceAlertsRepository.create(validatedInput, user.id);

    return NextResponse.json({
      success: true,
      data: alert,
    }, { status: 201 });
  });
}