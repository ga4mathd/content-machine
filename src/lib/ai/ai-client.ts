import { generateVariation } from './claude-client';
import { generateVariationGemini } from './gemini-client';
import type { VariationOutput } from '@/types';

export type AIModel = 'claude' | 'gemini';

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

export interface GenerateResult {
  results: VariationOutput[];
  model_used: AIModel;
  is_fallback: boolean;
}

export async function generateWithFallback(
  params: GenerateParams,
  preferredModel: AIModel = 'claude'
): Promise<GenerateResult> {
  const fallbackModel: AIModel = preferredModel === 'claude' ? 'gemini' : 'claude';

  // Try preferred model
  try {
    const results = await callModel(preferredModel, params);
    return { results, model_used: preferredModel, is_fallback: false };
  } catch (primaryError) {
    console.error(`[AI] ${preferredModel} failed:`, primaryError instanceof Error ? primaryError.message : primaryError);

    // Try fallback model
    try {
      const results = await callModel(fallbackModel, params);
      console.log(`[AI] Fallback to ${fallbackModel} succeeded`);
      return { results, model_used: fallbackModel, is_fallback: true };
    } catch (fallbackError) {
      console.error(`[AI] ${fallbackModel} fallback also failed:`, fallbackError instanceof Error ? fallbackError.message : fallbackError);
      throw new Error(
        `Cả 2 model đều lỗi. ${preferredModel}: ${primaryError instanceof Error ? primaryError.message : 'Unknown'}. ${fallbackModel}: ${fallbackError instanceof Error ? fallbackError.message : 'Unknown'}`
      );
    }
  }
}

async function callModel(model: AIModel, params: GenerateParams): Promise<VariationOutput[]> {
  if (model === 'claude') {
    return generateVariation(params);
  }
  return generateVariationGemini(params);
}
