// ===== Database Models =====

export interface Product {
  id: string;
  name: string;
  market: 'VN' | 'KH' | 'LA' | 'PH';
  kb_content: string;
  created_at: string;
  updated_at: string;
}

export interface Script {
  id: string;
  product_id: string;
  title: string;
  content: string;
  structure_tags: string; // JSON string of StructureTag[]
  performance_notes: string;
  times_multiplied: number;
  is_active: number;
  created_at: string;
  updated_at: string;
}

export interface StructureTag {
  tag: 'hook' | 'problem' | 'build-up' | 'solution' | 'climax' | 'cta' | 'insight';
  label: string;
  start: number;
  end: number;
}

export interface Generation {
  id: string;
  script_id: string;
  variation_type: string;
  variation_params: string; // JSON string
  output_text: string;
  output_storyboard: string; // JSON string of StoryboardScene[]
  fingerprint: string;
  similarity_score: number;
  is_favorite: number;
  is_winner: number;
  created_by: string;
  created_at: string;
}

// ===== Storyboard =====

export interface StoryboardScene {
  scene: number;
  duration: string;
  voiceover: string;
  visual: string;
  text_overlay: string;
  music_mood: string;
  transition: string;
}

// ===== Variation Types =====

export interface VariationParam {
  key: string;
  label_vi: string;
  type: 'text' | 'select' | 'number';
  options?: string[];
  placeholder?: string;
  required: boolean;
}

export interface VariationType {
  id: string;
  group: 'A' | 'B' | 'C' | 'D' | 'E';
  name_vi: string;
  description_vi: string;
  example_vi: string;
  params: VariationParam[];
}

export interface VariationGroup {
  id: string;
  name_vi: string;
  description_vi: string;
  types: string[];
}

// ===== AI Output =====

export interface VariationOutput {
  variation_label: string;
  variation_description: string;
  full_script: string;
  storyboard: StoryboardScene[];
  fingerprint: {
    hook_type: string;
    character: string;
    source_type: string;
    cta_type: string;
    format: string;
  };
  auto_params?: Record<string, string>;
}

// ===== Generation Request =====

export interface GenerateRequest {
  script_id: string;
  variation_types: string[]; // e.g. ['A1', 'C2']
  variation_params: Record<string, string>;
  num_variations?: number;
  strategy_id?: string; // auto mode: AI picks params
}

// ===== Auth =====

export interface SessionPayload {
  role: 'admin' | 'team';
  exp: number;
}

// ===== API Responses =====

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// ===== Dashboard =====

export interface DashboardStats {
  total_products: number;
  total_scripts: number;
  total_generations: number;
  avg_freshness: number;
}

export interface HeatmapCell {
  script_id: string;
  script_title: string;
  variation_type: string;
  count: number;
}

export interface FreshnessInfo {
  script_id: string;
  script_title: string;
  freshness_score: number;
  times_multiplied: number;
  unique_combos_used: number;
}
