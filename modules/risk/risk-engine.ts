/**
 * AI Risk Engine — business logic only.
 * No HTTP, no request/response; pure input -> structured output.
 */

import { getOpenAIClient } from "@/infrastructure/external-services";
import { env } from "@/infrastructure/config";
import {
  riskAnalysisRequestSchema,
  riskAnalysisResultSchema,
  type RiskAnalysisRequestInput,
} from "./schemas";
import type { RiskAnalysisResult } from "@/shared/types/risk";
import { RiskEngineError, RiskEngineConfigError } from "./errors";

const RISK_SYSTEM_PROMPT = `You are a construction risk analyst. Analyze the provided context and return a JSON object with this exact structure (no markdown, no extra text):
{
  "score": <number 0-100, overall risk score>,
  "level": "<low|medium|high|critical>",
  "factors": [
    { "label": "<short label>", "severity": "<low|medium|high|critical>", "description": "<brief explanation>" }
  ],
  "summary": "<2-4 sentence overall summary>",
  "recommendation": "<2-4 sentence actionable recommendation>"
}
Consider: schedule, budget, safety, compliance, contractor, and external factors. Be concise.`;

export interface AnalyzeRiskInput {
  context: string;
  projectId?: string;
  categories?: string[];
}

export interface AnalyzeRiskSuccess {
  ok: true;
  result: RiskAnalysisResult;
  meta: { model: string; timestamp: string };
}

export interface AnalyzeRiskFailure {
  ok: false;
  error: { code: string; message: string; details?: unknown };
  meta: { timestamp: string };
}

export type AnalyzeRiskOutcome = AnalyzeRiskSuccess | AnalyzeRiskFailure;

/**
 * Validates input and runs AI risk analysis. Returns a structured outcome (success or failure).
 */
export function validateRiskRequest(
  body: unknown
): { ok: true; input: RiskAnalysisRequestInput } | { ok: false; error: { code: string; message: string; details: unknown } } {
  const parsed = riskAnalysisRequestSchema.safeParse(body);
  if (!parsed.success) {
    return {
      ok: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid request body",
        details: parsed.error.flatten(),
      },
    };
  }
  return { ok: true, input: parsed.data };
}

/**
 * Runs the AI risk analysis. Throws only for config (missing API key).
 * Returns structured outcome; external/parsing failures are returned as outcome, not thrown.
 */
export async function analyzeRisk(input: AnalyzeRiskInput): Promise<AnalyzeRiskOutcome> {
  const timestamp = new Date().toISOString();
  const meta = { timestamp };

  try {
    const client = getOpenAIClient();
    const model = env.riskEngineModel;

    const categoriesNote =
      input.categories && input.categories.length > 0
        ? ` Focus especially on: ${input.categories.join(", ")}.`
        : "";
    const userContent = `${input.context}${categoriesNote}`.trim();

    const completion = await client.chat.completions.create({
      model,
      messages: [
        { role: "system", content: RISK_SYSTEM_PROMPT },
        { role: "user", content: userContent },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const rawContent = completion.choices[0]?.message?.content;
    if (typeof rawContent !== "string" || rawContent.length === 0) {
      return {
        ok: false,
        error: {
          code: "EMPTY_RESPONSE",
          message: "AI returned no content",
        },
        meta,
      };
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(rawContent);
    } catch {
      return {
        ok: false,
        error: {
          code: "PARSE_ERROR",
          message: "AI response was not valid JSON",
          details: { raw: rawContent.slice(0, 200) },
        },
        meta,
      };
    }

    const validated = riskAnalysisResultSchema.safeParse(parsed);
    if (!validated.success) {
      return {
        ok: false,
        error: {
          code: "SCHEMA_ERROR",
          message: "AI response did not match expected schema",
          details: validated.error.flatten(),
        },
        meta,
      };
    }

    const result: RiskAnalysisResult = validated.data as RiskAnalysisResult;
    return {
      ok: true,
      result,
      meta: { ...meta, model },
    };
  } catch (err) {
    if (err instanceof RiskEngineError) {
      if (err instanceof RiskEngineConfigError) {
        return {
          ok: false,
          error: { code: err.code, message: err.message },
          meta,
        };
      }
      return {
        ok: false,
        error: {
          code: err.code,
          message: err.message,
          details: err.details,
        },
        meta,
      };
    }
    if (err instanceof Error) {
      return {
        ok: false,
        error: {
          code: "EXTERNAL_SERVICE_ERROR",
          message: err.message,
          details: env.isDev ? { stack: err.stack } : undefined,
        },
        meta,
      };
    }
    return {
      ok: false,
      error: { code: "UNKNOWN_ERROR", message: "An unexpected error occurred" },
      meta,
    };
  }
}
