/**
 * Risk Engine API types (structured JSON contract).
 */

export type RiskLevel = "low" | "medium" | "high" | "critical";

export interface RiskFactor {
  label: string;
  severity: RiskLevel;
  description: string;
}

export interface RiskAnalysisResult {
  score: number;
  level: RiskLevel;
  factors: RiskFactor[];
  summary: string;
  recommendation: string;
}

export interface RiskAnalysisRequest {
  context: string;
  projectId?: string;
  categories?: string[];
}

export interface ApiMeta {
  model?: string;
  timestamp: string;
  requestId?: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

export interface RiskApiSuccessResponse {
  success: true;
  data: RiskAnalysisResult;
  meta: ApiMeta;
}

export interface RiskApiErrorResponse {
  success: false;
  error: ApiError;
  meta: ApiMeta;
}

export type RiskApiResponse = RiskApiSuccessResponse | RiskApiErrorResponse;
