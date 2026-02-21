import { PriceAlert, CreatePriceAlertInput, UpdatePriceAlertInput } from "@/types/alerts";
import { toAlertsError } from "./errors";

type ApiResponse<T> = {
  success: boolean;
  data: T;
  error?: {
    code: string;
    message: string;
  };
};

async function requestJson<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
  const response = await fetch(endpoint, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw toAlertsError(new Error(errorData.error?.message || `HTTP ${response.status}`));
  }

  return response.json();
}

export async function fetchUserAlerts(): Promise<PriceAlert[]> {
  const response = await requestJson<PriceAlert[]>("/api/alerts");
  return response.data;
}

export async function createAlert(input: CreatePriceAlertInput): Promise<PriceAlert> {
  const response = await requestJson<PriceAlert>("/api/alerts", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return response.data;
}

export async function updateAlert(alertId: string, input: UpdatePriceAlertInput): Promise<PriceAlert> {
  const response = await requestJson<PriceAlert>(`/api/alerts/${alertId}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
  return response.data;
}

export async function deleteAlert(alertId: string): Promise<void> {
  await requestJson<void>(`/api/alerts/${alertId}`, {
    method: "DELETE",
  });
}

export async function toggleAlert(alertId: string, isActive: boolean): Promise<PriceAlert> {
  const response = await requestJson<PriceAlert>(`/api/alerts/${alertId}/toggle`, {
    method: "PATCH",
    body: JSON.stringify({ isActive }),
  });
  return response.data;
}