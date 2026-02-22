/**
 * Environment configuration.
 * Read and validate env vars in one place; fail fast when required keys are missing.
 */

function getEnv(key: string): string | undefined {
  return process.env[key];
}

function requireEnv(key: string): string {
  const value = getEnv(key);
  if (value === undefined || value.trim() === "") {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value.trim();
}

export const env = {
  nodeEnv: getEnv("NODE_ENV") ?? "development",
  isDev: process.env.NODE_ENV !== "production",

  /** OpenAI API key (required for AI Risk Engine and Assistant). */
  get openaiApiKey(): string {
    return requireEnv("OPENAI_API_KEY");
  },

  /** Optional: override model for risk engine. */
  riskEngineModel: getEnv("RISK_ENGINE_MODEL") ?? "gpt-4o-mini",
} as const;

export function hasOpenAIKey(): boolean {
  const key = process.env.OPENAI_API_KEY;
  return typeof key === "string" && key.trim() !== "";
}
