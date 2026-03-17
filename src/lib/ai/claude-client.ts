import Anthropic from '@anthropic-ai/sdk';
import { SYSTEM_PROMPT, buildUserPrompt } from './prompts';
import { parseAIOutput } from './output-parser';
import type { VariationOutput } from '@/types';

const client = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

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

export async function generateVariation(params: GenerateParams): Promise<VariationOutput[]> {
  const userPrompt = buildUserPrompt(params);

  const response = await client.messages.create({
    model: 'claude-opus-4-20250514',
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userPrompt }],
  });

  // Extract text content
  const textBlock = response.content.find((c) => c.type === 'text');
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('No text response from Claude');
  }

  const parsed = parseAIOutput(textBlock.text);
  const results = Array.isArray(parsed) ? parsed : [parsed];

  return results;
}
