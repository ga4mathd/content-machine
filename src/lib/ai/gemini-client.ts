import { GoogleGenAI } from '@google/genai';
import { SYSTEM_PROMPT, buildUserPrompt } from './prompts';
import { parseAIOutput } from './output-parser';
import type { VariationOutput } from '@/types';

interface GenerateParams {
  productName: string;
  productMarket: string;
  productKb: string;
  originalScript: string;
  variationTypes: string[];
  variationParams: Record<string, string>;
  numVariations: number;
  previousVariations: string[];
}

export async function generateVariationGemini(params: GenerateParams): Promise<VariationOutput[]> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY chưa được cấu hình');
  }

  const ai = new GoogleGenAI({ apiKey });
  const userPrompt = buildUserPrompt(params);

  const response = await ai.models.generateContent({
    model: 'gemini-3.1-pro-preview',
    contents: userPrompt,
    config: {
      systemInstruction: SYSTEM_PROMPT,
      maxOutputTokens: 8192,
      temperature: 0.8,
    },
  });

  const text = response.text;
  if (!text) {
    throw new Error('No text response from Gemini');
  }

  const parsed = parseAIOutput(text);
  const results = Array.isArray(parsed) ? parsed : [parsed];

  return results;
}
