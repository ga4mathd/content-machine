import { getVariationTypeUsage } from '@/lib/db/generations';
import { getAllValidCombos } from '@/lib/ai/variation-types';

export function calculateFreshnessScore(scriptId: string): number {
  const usage = getVariationTypeUsage(scriptId);
  const totalValidCombos = getAllValidCombos().length;
  const uniqueCombosUsed = usage.length;

  if (totalValidCombos === 0) return 100;

  const usedRatio = uniqueCombosUsed / totalValidCombos;
  const freshness = Math.max(0, Math.round(100 - usedRatio * 100));

  return freshness;
}

export function getUsedCombos(scriptId: string): Map<string, number> {
  const usage = getVariationTypeUsage(scriptId);
  const map = new Map<string, number>();
  for (const { variation_type, count } of usage) {
    map.set(variation_type, count);
  }
  return map;
}

export function suggestUnusedCombos(scriptId: string, limit: number = 5): string[] {
  const usedCombos = getUsedCombos(scriptId);
  const allCombos = getAllValidCombos();

  // Sort by usage (unused first, then least used)
  const sorted = allCombos
    .map((combo) => ({ combo, count: usedCombos.get(combo) || 0 }))
    .sort((a, b) => a.count - b.count);

  return sorted.slice(0, limit).map((s) => s.combo);
}
