"use server";

import model from "@/ai/config/llm";
import { handleAIError } from "@/utils/ai-error-handler";

export interface NotesSuggestionResult {
  success: boolean;
  notes?: string[];
  raw?: string;
  message?: string;
}

/**
 * Generate 2-3 concise, actionable notes for a given activity title using the LLM.
 * Returns JSON array of strings (notes).
 */
export async function generateNotesSuggestion(
  activityTitle: string
): Promise<NotesSuggestionResult> {
  try {
    if (!activityTitle || activityTitle.trim().length === 0) {
      return { success: false, message: "Activity title is required" };
    }

    // Build prompt similar to plan prompt guidance for notes
    const prompt = `You are CalmHive's note generator assistant. Given an activity title, return a JSON array of 2-3 short, practical, actionable notes for the activity. Each note should be concise (one sentence) and practical (e.g., steps, cues, or quick guidance). Return ONLY a valid JSON array of strings. Activity title: "${activityTitle.replace(
      /"/g,
      '\\"'
    )}"`;

    const response = await model.invoke(prompt);
    const content =
      typeof response.content === "string"
        ? response.content
        : JSON.stringify(response.content);

    // Try to parse JSON array first
    try {
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed) && parsed.every((p) => typeof p === "string")) {
        return { success: true, notes: parsed, raw: content };
      }
    } catch {
      // ignore and try to extract bullets
    }

    // Fallback: extract lines starting with '-' or numbered list or split by newline
    const lines = content
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0)
      .map((l) => l.replace(/^[-*\d\.\)\s]+/, ""));

    const candidates = lines.slice(0, 3);

    if (candidates.length > 0) {
      return { success: true, notes: candidates, raw: content };
    }

    return {
      success: false,
      message: "LLM did not return usable notes",
      raw: content,
    };
  } catch (error) {
    const { error: errorMessage } = handleAIError(error);
    return { success: false, message: errorMessage };
  }
}
