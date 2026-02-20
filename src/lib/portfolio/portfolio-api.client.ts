import { CreateHoldingInput, Holding, PortfolioSummary, UpdateHoldingInput } from "@/types/portfolio";

type ApiResponse<T> = {
  data: T;
};

type ApiError = {
  error: {
    code: string;
    message: string;
  };
};

async function requestJson<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const response = await fetch(input, init);
  if (!response.ok) {
    const error = (await response.json().catch(() => null)) as ApiError | null;
    throw new Error(error?.error?.message ?? `Request failed: ${response.status}`);
  }

  return (await response.json()) as T;
}

export async function fetchHoldings() {
  const payload = await requestJson<ApiResponse<Holding[]>>("/api/portfolio/holdings");
  return payload.data;
}

export async function createHolding(input: CreateHoldingInput) {
  const payload = await requestJson<ApiResponse<Holding>>("/api/portfolio/holdings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  return payload.data;
}

export async function updateHolding(holdingId: string, input: UpdateHoldingInput) {
  const payload = await requestJson<ApiResponse<Holding>>(`/api/portfolio/holdings/${holdingId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  return payload.data;
}

export async function deleteHolding(holdingId: string) {
  const payload = await requestJson<ApiResponse<{ deleted: boolean }>>(
    `/api/portfolio/holdings/${holdingId}`,
    {
      method: "DELETE",
    },
  );

  return payload.data.deleted;
}

export async function fetchPortfolioSummary() {
  const payload = await requestJson<ApiResponse<PortfolioSummary>>("/api/portfolio/summary");
  return payload.data;
}
