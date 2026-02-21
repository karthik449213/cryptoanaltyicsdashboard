export class AlertsError extends Error {
  public readonly code: string;
  public readonly statusCode: number;

  constructor(message: string, code: string = "ALERTS_ERROR", statusCode: number = 500) {
    super(message);
    this.name = "AlertsError";
    this.code = code;
    this.statusCode = statusCode;
  }
}

export class AlertsValidationError extends AlertsError {
  constructor(message: string) {
    super(message, "VALIDATION_ERROR", 400);
  }
}

export class AlertsNotFoundError extends AlertsError {
  constructor(resource: string = "Alert") {
    super(`${resource} not found`, "NOT_FOUND", 404);
  }
}

export class AlertsUnauthorizedError extends AlertsError {
  constructor(message: string = "Unauthorized access to alert") {
    super(message, "UNAUTHORIZED", 403);
  }
}

export class AlertsLimitExceededError extends AlertsError {
  constructor(limit: number) {
    super(`Alert limit exceeded. Maximum ${limit} alerts allowed.`, "LIMIT_EXCEEDED", 429);
  }
}

export function toAlertsError(error: unknown): AlertsError {
  if (error instanceof AlertsError) {
    return error;
  }

  if (error instanceof Error) {
    // Handle specific database errors
    if (error.message.includes("duplicate key")) {
      return new AlertsValidationError("An alert for this coin and threshold already exists");
    }

    if (error.message.includes("violates check constraint")) {
      return new AlertsValidationError("Invalid alert data provided");
    }

    return new AlertsError(error.message, "DATABASE_ERROR", 500);
  }

  return new AlertsError("An unexpected error occurred", "UNKNOWN_ERROR", 500);
}