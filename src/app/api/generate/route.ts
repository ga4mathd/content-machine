import { NextRequest, NextResponse } from 'next/server';
import { getScriptWithProduct } from '@/lib/db/scripts';
import { createGeneration, getGenerationsByScript } from '@/lib/db/generations';
import { incrementTimesMultiplied } from '@/lib/db/scripts';
import { generateWithFallback } from '@/lib/ai/ai-client';
import type { AIModel } from '@/lib/ai/ai-client';
import { generateFingerprint, computeSimilarity } from '@/lib/anti-dup/fingerprint';
import { getSetting } from '@/lib/db/settings';
import { buildPreviousVariationsContext } from '@/lib/anti-dup/context-injector';
import { getStrategy } from '@/lib/ai/strategies';
import { getUsedCombos } from '@/lib/anti-dup/freshness-calculator';
import type { GenerateRequest, VariationOutput } from '@/types';

function getBestComboForStrategy(scriptId: string, strategyId: string): string[] {
  const strategy = getStrategy(strategyId);
  if (!strategy) return [];

  const usedCombos = getUsedCombos(scriptId);

  let bestCombo = strategy.combos[0];
  let bestCount = Infinity;

  for (const combo of strategy.combos) {
    const comboKey = [...combo].sort().join('+');
    const count = usedCombos.get(comboKey) || 0;
    if (count < bestCount) {
      bestCount = count;
      bestCombo = combo;
    }
  }

  return bestCombo;
}

export async function POST(req: NextRequest) {
  try {
    const body: GenerateRequest = await req.json();
    const { script_id, num_variations = 1 } = body;
    let { variation_types, variation_params } = body;
    const { strategy_id } = body;

    // Auto mode: resolve strategy to best combo
    if (strategy_id && script_id) {
      variation_types = getBestComboForStrategy(script_id, strategy_id);
      variation_params = {}; // AI will auto-fill
    }

    if (!script_id || !variation_types || variation_types.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Thiếu script_id hoặc variation_types' },
        { status: 400 }
      );
    }

    // Load script + product
    const scriptWithProduct = getScriptWithProduct(script_id);
    if (!scriptWithProduct) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy kịch bản' },
        { status: 404 }
      );
    }

    // Build previous variations context (anti-dup layer 3)
    const previousVariations = buildPreviousVariationsContext(script_id, 10);

    // Get existing fingerprints for similarity check
    const existingGenerations = getGenerationsByScript(script_id, 50);
    const existingFingerprints = existingGenerations
      .map((g) => {
        try {
          const storyboard = JSON.parse(g.output_storyboard || '[]');
          // Try to reconstruct fingerprint from stored data
          return storyboard.fingerprint || null;
        } catch {
          return null;
        }
      })
      .filter(Boolean);

    const variationType = variation_types.sort().join('+');

    // Get preferred AI model: client choice > admin setting > default
    const clientModel = (body as unknown as Record<string, unknown>).model as string | undefined;
    const preferredModel = (clientModel === 'claude' || clientModel === 'gemini')
      ? clientModel as AIModel
      : getSetting('ai_model', 'claude') as AIModel;

    // Call AI with fallback
    const { results, model_used, is_fallback } = await generateWithFallback({
      productName: scriptWithProduct.product_name,
      productMarket: scriptWithProduct.product_market,
      productKb: scriptWithProduct.product_kb,
      originalScript: scriptWithProduct.content,
      variationTypes: variation_types,
      variationParams: variation_params || {},
      numVariations: num_variations,
      previousVariations,
    }, preferredModel);

    // Save results
    const savedGenerations = [];

    for (const result of results) {
      const fingerprint = generateFingerprint(result);
      const similarity = computeSimilarity(result.fingerprint, existingFingerprints as VariationOutput['fingerprint'][]);

      const id = createGeneration({
        script_id,
        variation_type: variationType,
        variation_params: JSON.stringify(variation_params || {}),
        output_text: result.full_script,
        output_storyboard: JSON.stringify(result.storyboard),
        fingerprint,
        similarity_score: similarity,
        created_by: 'team',
      });

      incrementTimesMultiplied(script_id);

      savedGenerations.push({
        id,
        ...result,
        fingerprint_hash: fingerprint,
        similarity_score: similarity,
      });
    }

    return NextResponse.json({ success: true, data: savedGenerations, model_used, is_fallback });
  } catch (error) {
    console.error('Generate error:', error);
    const message = error instanceof Error ? error.message : 'Lỗi không xác định';
    return NextResponse.json(
      { success: false, error: `Lỗi tạo biến thể: ${message}` },
      { status: 500 }
    );
  }
}
