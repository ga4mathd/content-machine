import { NextRequest, NextResponse } from 'next/server';
import { getScriptWithProduct } from '@/lib/db/scripts';
import { createGeneration, getGenerationsByScript } from '@/lib/db/generations';
import { incrementTimesMultiplied } from '@/lib/db/scripts';
import { generateVariation } from '@/lib/ai/claude-client';
import { generateFingerprint, computeSimilarity } from '@/lib/anti-dup/fingerprint';
import { buildPreviousVariationsContext } from '@/lib/anti-dup/context-injector';
import type { GenerateRequest, VariationOutput } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body: GenerateRequest = await req.json();
    const { script_id, variation_types, variation_params, num_variations = 1 } = body;

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

    // Call Claude API
    const results = await generateVariation({
      productName: scriptWithProduct.product_name,
      productMarket: scriptWithProduct.product_market,
      productKb: scriptWithProduct.product_kb,
      originalScript: scriptWithProduct.content,
      variationTypes: variation_types,
      variationParams: variation_params || {},
      numVariations: num_variations,
      previousVariations,
    });

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

    return NextResponse.json({ success: true, data: savedGenerations });
  } catch (error) {
    console.error('Generate error:', error);
    const message = error instanceof Error ? error.message : 'Lỗi không xác định';
    return NextResponse.json(
      { success: false, error: `Lỗi tạo biến thể: ${message}` },
      { status: 500 }
    );
  }
}
