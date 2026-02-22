/**
 * OpenAI client factory. Uses env config; lazy-initialized to avoid throwing at import time.
 */

import OpenAI from "openai";
import { env } from "@/infrastructure/config";

let client: OpenAI | null = null;

export function getOpenAIClient(): OpenAI {
  if (client === null) {
    client = new OpenAI({ apiKey: env.openaiApiKey });
  }
  return client;
}
