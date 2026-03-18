export interface Strategy {
  id: string;
  name_vi: string;
  description_vi: string;
  icon: string;
  combos: string[][];
}

export const STRATEGIES: Strategy[] = [
  {
    id: 'character-scene',
    name_vi: 'Đổi nhân vật & bối cảnh',
    description_vi: 'AI tự chọn nhân vật và bối cảnh mới phù hợp sản phẩm',
    icon: '🎭',
    combos: [['A1', 'A3'], ['A1'], ['A3'], ['A2']],
  },
  {
    id: 'viral-hook',
    name_vi: 'Hook viral gây sốc',
    description_vi: 'AI tạo hook viral + twist bất ngờ để câu view',
    icon: '🔥',
    combos: [['B2', 'C1'], ['C1', 'E2'], ['B2'], ['C1']],
  },
  {
    id: 'credible-source',
    name_vi: 'Source uy tín + số liệu',
    description_vi: 'AI chọn source đáng tin và số liệu thuyết phục',
    icon: '📊',
    combos: [['B1', 'B4'], ['B4', 'C4'], ['B4'], ['B1']],
  },
  {
    id: 'format-change',
    name_vi: 'Đổi format kịch bản',
    description_vi: 'AI chuyển sang listicle, micro-content hoặc đối thoại',
    icon: '🔄',
    combos: [['D1'], ['D2'], ['D3'], ['D1', 'E2'], ['D3', 'A1']],
  },
  {
    id: 'question-cta',
    name_vi: 'Hook câu hỏi + CTA mới',
    description_vi: 'AI tạo câu hỏi gây tò mò và CTA thu hút',
    icon: '❓',
    combos: [['C2', 'E2'], ['C2', 'E1'], ['C2'], ['E2']],
  },
  {
    id: 'trending',
    name_vi: 'Trending & thời sự',
    description_vi: 'AI gắn kịch bản với trend hoặc sự kiện nóng',
    icon: '📈',
    combos: [['C3', 'E2'], ['A1', 'C3'], ['C3'], ['C3', 'E1']],
  },
  {
    id: 'cartoon-film',
    name_vi: 'Phong cách phim/hoạt hình',
    description_vi: 'AI chuyển sang giọng nhân vật hoạt hình/phim nổi tiếng',
    icon: '🎬',
    combos: [['B3'], ['B3', 'D3'], ['D3', 'A1']],
  },
  {
    id: 'full-makeover',
    name_vi: 'Full makeover',
    description_vi: 'AI thay đổi toàn diện: nhân vật + hook + CTA',
    icon: '✨',
    combos: [['A1', 'C1', 'E2'], ['A1', 'B2', 'E2'], ['A1', 'C2', 'E1'], ['A2', 'C1', 'E2']],
  },
];

export function getStrategy(id: string): Strategy | undefined {
  return STRATEGIES.find((s) => s.id === id);
}
