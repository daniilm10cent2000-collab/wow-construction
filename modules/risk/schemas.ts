import { z } from "zod";

const riskLevelSchema = z.enum(["low", "medium", "high", "critical"]);

export const riskFactorSchema = z.object({
  label: z.string().min(1),
  severity: riskLevelSchema,
  description: z.string(),
});

export const riskAnalysisResultSchema = z.object({
  score: z.number().min(0).max(100),
  level: riskLevelSchema,
  factors: z.array(riskFactorSchema),
  summary: z.string(),
  recommendation: z.string(),
});

export const riskAnalysisRequestSchema = z.object({
  context: z.string().min(1, "Context is required").max(20_000),
  projectId: z.string().uuid().optional(),
  categories: z.array(z.string().min(1)).max(20).optional(),
});

export type RiskAnalysisRequestInput = z.infer<typeof riskAnalysisRequestSchema>;
export type RiskAnalysisResultOutput = z.infer<typeof riskAnalysisResultSchema>;
