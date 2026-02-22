/**
 * Risk module errors. Use for consistent error handling and structured API responses.
 */

export class RiskEngineError extends Error {
  constructor(
    message: string,
    public readonly code: string = "RISK_ENGINE_ERROR",
    public readonly statusCode: number = 500,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = "RiskEngineError";
  }
}

export class RiskEngineValidationError extends RiskEngineError {
  constructor(message: string, details?: unknown) {
    super(message, "VALIDATION_ERROR", 400, details);
    this.name = "RiskEngineValidationError";
  }
}

export class RiskEngineConfigError extends RiskEngineError {
  constructor(message: string) {
    super(message, "CONFIG_ERROR", 503);
    this.name = "RiskEngineConfigError";
  }
}

export class RiskEngineExternalError extends RiskEngineError {
  constructor(message: string, details?: unknown) {
    super(message, "EXTERNAL_SERVICE_ERROR", 502, details);
    this.name = "RiskEngineExternalError";
  }
}
