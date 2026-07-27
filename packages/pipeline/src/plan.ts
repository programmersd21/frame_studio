import { callLLM } from "./llmClient.js";
import { PLAN_SYSTEM_PROMPT } from "./prompts/planSystemPrompt.js";
import { PlanResultSchema, type PlanResult } from "./schemas.js";

export interface PlanOptions {
  model?: string;
  durationSeconds?: number;
  pdfContent?: string;
}

export async function planFromPrompt(userPrompt: string, options?: PlanOptions): Promise<PlanResult> {
  const { model, durationSeconds, pdfContent } = options || {};

  let userContent = `User Prompt: "${userPrompt}"`;
  if (durationSeconds) {
    userContent += `\nUser Duration Preference: ${durationSeconds} seconds`;
  }
  if (pdfContent) {
    const truncated = pdfContent.length > 4000 ? pdfContent.slice(0, 4000) + "\n[...truncated...]" : pdfContent;
    userContent += `\n\n--- EXTRACTED PDF CONTENT ---\n${truncated}\n--- END PDF CONTENT ---`;
  }

  const messages = [
    { role: "system" as const, content: PLAN_SYSTEM_PROMPT },
    { role: "user" as const, content: userContent },
  ];

  const responseText = await callLLM(messages, true, model);
  const json = JSON.parse(responseText);
  return PlanResultSchema.parse(json);
}
