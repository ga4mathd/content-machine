import type { VariationOutput } from '@/types';

export function parseAIOutput(rawText: string): VariationOutput | VariationOutput[] {
  // Remove markdown code blocks if present
  let cleaned = rawText.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.slice(0, -3);
  }
  cleaned = cleaned.trim();

  const parsed = JSON.parse(cleaned);

  if (Array.isArray(parsed)) {
    return parsed.map(validateSingleOutput);
  }
  return validateSingleOutput(parsed);
}

function validateSingleOutput(data: Record<string, unknown>): VariationOutput {
  // Ensure required fields
  const output: VariationOutput = {
    variation_label: String(data.variation_label || 'Biến thể'),
    variation_description: String(data.variation_description || ''),
    full_script: String(data.full_script || ''),
    storyboard: [],
    fingerprint: {
      hook_type: '',
      character: '',
      source_type: '',
      cta_type: '',
      format: '',
    },
  };

  // Parse storyboard
  if (Array.isArray(data.storyboard)) {
    output.storyboard = data.storyboard.map((scene: Record<string, unknown>, idx: number) => ({
      scene: Number(scene.scene ?? idx + 1),
      duration: String(scene.duration || ''),
      voiceover: String(scene.voiceover || ''),
      visual: String(scene.visual || ''),
      text_overlay: String(scene.text_overlay || ''),
      music_mood: String(scene.music_mood || ''),
      transition: String(scene.transition || 'cut'),
    }));
  }

  // Parse fingerprint
  if (data.fingerprint && typeof data.fingerprint === 'object') {
    const fp = data.fingerprint as Record<string, unknown>;
    output.fingerprint = {
      hook_type: String(fp.hook_type || ''),
      character: String(fp.character || ''),
      source_type: String(fp.source_type || ''),
      cta_type: String(fp.cta_type || ''),
      format: String(fp.format || ''),
    };
  }

  return output;
}
