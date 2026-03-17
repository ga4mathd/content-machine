import { sha256 } from 'js-sha256';
import type { VariationOutput } from '@/types';

export function generateFingerprint(output: VariationOutput): string {
  const { hook_type, character, source_type, cta_type, format } = output.fingerprint;
  const raw = `${hook_type}|${character}|${source_type}|${cta_type}|${format}`.toLowerCase();
  return sha256(raw);
}

export function computeSimilarity(
  newFp: VariationOutput['fingerprint'],
  existingFps: VariationOutput['fingerprint'][]
): number {
  if (existingFps.length === 0) return 0;

  let maxSimilarity = 0;

  for (const existing of existingFps) {
    const fields = ['hook_type', 'character', 'source_type', 'cta_type', 'format'] as const;
    let matchCount = 0;

    for (const field of fields) {
      const a = (newFp[field] || '').toLowerCase().trim();
      const b = (existing[field] || '').toLowerCase().trim();
      if (a && b) {
        // Token-level similarity
        const tokensA = new Set(a.split(/\s+/));
        const tokensB = new Set(b.split(/\s+/));
        const intersection = new Set([...tokensA].filter(t => tokensB.has(t)));
        const union = new Set([...tokensA, ...tokensB]);
        if (union.size > 0) {
          matchCount += intersection.size / union.size;
        }
      }
    }

    const similarity = matchCount / fields.length;
    if (similarity > maxSimilarity) {
      maxSimilarity = similarity;
    }
  }

  return maxSimilarity;
}
