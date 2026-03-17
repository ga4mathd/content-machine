import { getGenerationsByScript } from '@/lib/db/generations';

export function buildPreviousVariationsContext(scriptId: string, limit: number = 10): string[] {
  const generations = getGenerationsByScript(scriptId, limit);

  return generations.map((gen) => {
    const params = JSON.parse(gen.variation_params || '{}');
    const paramsStr = Object.entries(params)
      .filter(([, v]) => v)
      .map(([k, v]) => `${k}=${v}`)
      .join(', ');

    // Truncate output_text to first 100 chars for context
    const preview = gen.output_text.substring(0, 150).replace(/\n/g, ' ');

    return `[${gen.variation_type}] ${paramsStr ? `(${paramsStr})` : ''} — "${preview}..."`;
  });
}
