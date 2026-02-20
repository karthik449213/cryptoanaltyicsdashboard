export class PortfolioError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "PortfolioError";
  }
}

export class PortfolioValidationError extends PortfolioError {
  constructor(message: string) {
    super(message, "VALIDATION_ERROR", 400);
    this.name = "PortfolioValidationError";
  }
}

export class PortfolioUnauthorizedError extends PortfolioError {
  constructor() {
    super("Authentication required.", "UNAUTHORIZED", 401);
    this.name = "PortfolioUnauthorizedError";
  }
}

export class PortfolioNotFoundError extends PortfolioError {
  constructor() {
    super("Holding not found.", "NOT_FOUND", 404);
    this.name = "PortfolioNotFoundError";
  }
}

export function toPortfolioError(error: unknown): PortfolioError {
  if (error instanceof PortfolioError) {
    return error;
  }

  if (error instanceof Error) {
    return new PortfolioError(error.message, "INTERNAL_ERROR", 500);
  }

  return new PortfolioError("Unknown error", "INTERNAL_ERROR", 500);
}
