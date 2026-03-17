import type { VariationType, VariationGroup } from '@/types';

export const VARIATION_GROUPS: Record<string, VariationGroup> = {
  A: { id: 'A', name_vi: 'Nhân vật & Góc nhìn', description_vi: 'Thay đổi nhân vật, góc kể chuyện, bối cảnh', types: ['A1', 'A2', 'A3'] },
  B: { id: 'B', name_vi: 'Source & Độ tin cậy', description_vi: 'Thay nguồn recommend, source viral, hoạt hình, số liệu', types: ['B1', 'B2', 'B3', 'B4'] },
  C: { id: 'C', name_vi: 'Hook & Mở đầu', description_vi: 'Thay cách mở đầu: gây tranh cãi, câu hỏi, trending, số liệu sốc', types: ['C1', 'C2', 'C3', 'C4'] },
  D: { id: 'D', name_vi: 'Định dạng', description_vi: 'Thay format: story→listicle, dài→micro, monologue→đối thoại', types: ['D1', 'D2', 'D3'] },
  E: { id: 'E', name_vi: 'Kết quả & CTA', description_vi: 'Thay kết quả câu chuyện và lời kêu gọi hành động', types: ['E1', 'E2'] },
};

export const VARIATION_TYPES: VariationType[] = [
  // ===== Nhóm A: Nhân vật & Góc nhìn =====
  {
    id: 'A1',
    group: 'A',
    name_vi: 'Đổi nhân vật chính',
    description_vi: 'Giữ nguyên cốt truyện, thay người trong câu chuyện',
    example_vi: '"Mẹ đơn thân" → "Anh shipper", "Cô giáo vùng cao"',
    params: [
      { key: 'character_name', label_vi: 'Tên/nghề nghiệp nhân vật mới', type: 'text', placeholder: 'VD: Anh shipper 25 tuổi', required: true },
      { key: 'character_context', label_vi: 'Hoàn cảnh nhân vật', type: 'text', placeholder: 'VD: Làm shipper nuôi mẹ già', required: false },
    ],
  },
  {
    id: 'A2',
    group: 'A',
    name_vi: 'Đổi góc nhìn kể chuyện (POV)',
    description_vi: 'Cùng câu chuyện nhưng kể từ góc khác',
    example_vi: 'Góc người mua → góc người tặng, góc con cái',
    params: [
      { key: 'pov', label_vi: 'Góc nhìn mới', type: 'select', options: ['Ngôi thứ nhất', 'Ngôi thứ ba', 'Người quan sát', 'Người được tặng', 'Con cái'], required: true },
      { key: 'pov_detail', label_vi: 'Chi tiết góc nhìn', type: 'text', placeholder: 'VD: Kể từ góc đứa con 10 tuổi', required: false },
    ],
  },
  {
    id: 'A3',
    group: 'A',
    name_vi: 'Đổi bối cảnh/địa điểm',
    description_vi: 'Cùng nhân vật nhưng đổi không gian',
    example_vi: 'Nhà → quán cà phê, văn phòng, trên xe bus, chợ quê',
    params: [
      { key: 'location', label_vi: 'Địa điểm/bối cảnh mới', type: 'text', placeholder: 'VD: Quán cà phê lúc 6h sáng', required: true },
    ],
  },

  // ===== Nhóm B: Source & Độ tin cậy =====
  {
    id: 'B1',
    group: 'B',
    name_vi: 'Source người thật khác',
    description_vi: 'Thay người recommend/review sản phẩm',
    example_vi: 'Mẹ bỉm → giáo viên, bác sĩ, CEO startup',
    params: [
      { key: 'source_identity', label_vi: 'Danh tính source mới', type: 'text', placeholder: 'VD: Bác sĩ nhi khoa', required: true },
      { key: 'source_role', label_vi: 'Vai trò/uy tín', type: 'text', placeholder: 'VD: 15 năm kinh nghiệm', required: false },
    ],
  },
  {
    id: 'B2',
    group: 'B',
    name_vi: 'Source viral không liên quan',
    description_vi: 'Mở đầu bằng câu chuyện viral rồi twist về sản phẩm',
    example_vi: '"Đêm qua thấy chồng lén lút lúc 2h sáng..." → hóa ra đang đọc sách',
    params: [
      { key: 'viral_topic', label_vi: 'Chủ đề viral', type: 'select', options: ['Tình cảm/drama', 'Bí mật gia đình', 'Đời vỡ/bất ngờ', 'Hài hước', 'Kinh dị nhẹ'], required: true },
      { key: 'viral_detail', label_vi: 'Chi tiết câu chuyện viral', type: 'text', placeholder: 'VD: Bắt gặp chồng lén làm gì đó lúc nửa đêm', required: false },
    ],
  },
  {
    id: 'B3',
    group: 'B',
    name_vi: 'Source hoạt hình/phim',
    description_vi: 'Chuyển source từ người thật sang nhân vật hoạt hình/phim',
    example_vi: 'Doraemon khuyên Nobita đọc sách, Shin review',
    params: [
      { key: 'character', label_vi: 'Nhân vật hoạt hình/phim', type: 'text', placeholder: 'VD: Doraemon', required: true },
      { key: 'style', label_vi: 'Phong cách đối thoại', type: 'text', placeholder: 'VD: Hài hước kiểu Shin', required: false },
    ],
  },
  {
    id: 'B4',
    group: 'B',
    name_vi: 'Source số liệu/nghiên cứu',
    description_vi: 'Thay lời kể bằng data cứng, nghiên cứu',
    example_vi: '"Theo Harvard, 73% người thành công đọc ít nhất 30 phút/ngày"',
    params: [
      { key: 'data_type', label_vi: 'Loại số liệu', type: 'select', options: ['Nghiên cứu đại học', 'Thống kê quốc gia', 'Survey/khảo sát', 'Báo cáo ngành'], required: true },
      { key: 'data_topic', label_vi: 'Chủ đề số liệu', type: 'text', placeholder: 'VD: Lợi ích của việc đọc sách với trẻ em', required: false },
    ],
  },

  // ===== Nhóm C: Hook & Mở đầu =====
  {
    id: 'C1',
    group: 'C',
    name_vi: 'Hook gây tranh cãi',
    description_vi: 'Mở đầu bằng câu gây sốc để người ta phải comment',
    example_vi: '"Tôi đã vứt hết sách của con", "Người Việt không biết đọc sách"',
    params: [
      { key: 'shock_level', label_vi: 'Mức độ gây sốc', type: 'select', options: ['Nhẹ - gây tò mò', 'Vừa - gây tranh luận', 'Mạnh - gây sốc thật sự'], required: true },
      { key: 'hook_direction', label_vi: 'Hướng gây tranh cãi', type: 'text', placeholder: 'VD: Phản đối việc ép con đọc sách', required: false },
    ],
  },
  {
    id: 'C2',
    group: 'C',
    name_vi: 'Hook câu hỏi/bí mật',
    description_vi: 'Mở bằng câu hỏi hoặc hứa hẹn tiết lộ bí mật',
    example_vi: '"Có 1 điều tôi ước gì biết sớm hơn 10 năm"',
    params: [
      { key: 'question_type', label_vi: 'Dạng câu hỏi', type: 'select', options: ['Tò mò - bí mật', 'Thách thức - dám không?', 'Hứa hẹn - tiết lộ'], required: true },
      { key: 'question_detail', label_vi: 'Nội dung câu hỏi', type: 'text', placeholder: 'VD: Bí mật mà 90% bố mẹ không biết', required: false },
    ],
  },
  {
    id: 'C3',
    group: 'C',
    name_vi: 'Hook trending/thời sự',
    description_vi: 'Gắn với sự kiện đang hot, trend TikTok',
    example_vi: 'Gắn với mùa thi, Ngày Nhà giáo, trend TikTok đang viral',
    params: [
      { key: 'trend_event', label_vi: 'Sự kiện/trend cụ thể', type: 'text', placeholder: 'VD: Mùa thi cuối năm 2024', required: true },
      { key: 'trend_connection', label_vi: 'Cách kết nối với sản phẩm', type: 'text', placeholder: 'VD: Sách giúp con ôn thi hiệu quả', required: false },
    ],
  },
  {
    id: 'C4',
    group: 'C',
    name_vi: 'Hook số liệu sốc',
    description_vi: 'Mở bằng con số bất ngờ',
    example_vi: '"3 triệu đồng — số tiền tôi đầu tư để thay đổi cuộc đời con gái"',
    params: [
      { key: 'number_type', label_vi: 'Loại số liệu', type: 'select', options: ['Tiền bạc', 'Thời gian', 'Phần trăm', 'Số lượng'], required: true },
      { key: 'number_detail', label_vi: 'Chi tiết con số', type: 'text', placeholder: 'VD: 3 triệu đồng thay đổi cuộc đời', required: false },
    ],
  },

  // ===== Nhóm D: Định dạng =====
  {
    id: 'D1',
    group: 'D',
    name_vi: 'Chuyển story → listicle',
    description_vi: 'Từ kể chuyện liền mạch → dạng "5 lý do", "3 sai lầm"',
    example_vi: 'Câu chuyện mẹ đơn thân → "5 điều mẹ đơn thân nào cũng cần biết"',
    params: [
      { key: 'list_count', label_vi: 'Số lượng item', type: 'select', options: ['3', '5', '7', '10'], required: true },
      { key: 'list_style', label_vi: 'Dạng list', type: 'select', options: ['Lý do', 'Sai lầm', 'Bước/cách', 'Bí mật', 'Điều cần biết'], required: true },
    ],
  },
  {
    id: 'D2',
    group: 'D',
    name_vi: 'Chuyển dài → micro-content',
    description_vi: 'Rút gọn kịch bản 60s → nhiều clip ngắn 15-30s',
    example_vi: 'Mỗi clip lấy 1 hook hoặc 1 moment mạnh nhất',
    params: [
      { key: 'target_duration', label_vi: 'Độ dài mỗi clip', type: 'select', options: ['15 giây', '30 giây'], required: true },
      { key: 'num_clips', label_vi: 'Số clip cần tạo', type: 'select', options: ['2', '3', '4', '5'], required: true },
    ],
  },
  {
    id: 'D3',
    group: 'D',
    name_vi: 'Chuyển monologue → đối thoại',
    description_vi: 'Từ 1 người nói → 2 người nói chuyện',
    example_vi: 'Bạn bè hỏi nhau, vợ chồng tranh luận, mẹ dạy con',
    params: [
      { key: 'relationship', label_vi: 'Quan hệ 2 nhân vật', type: 'select', options: ['Bạn bè', 'Vợ chồng', 'Mẹ - con', 'Đồng nghiệp', 'Người lạ'], required: true },
      { key: 'dialogue_style', label_vi: 'Phong cách đối thoại', type: 'select', options: ['Tự nhiên/đời thường', 'Hài hước', 'Tranh luận nhẹ', 'Chia sẻ chân thành'], required: true },
    ],
  },

  // ===== Nhóm E: Kết quả & CTA =====
  {
    id: 'E1',
    group: 'E',
    name_vi: 'Đổi kết quả cụ thể',
    description_vi: 'Đổi outcome của câu chuyện',
    example_vi: '"Con đọc sách mỗi ngày" → "Con tự tin thuyết trình trước lớp"',
    params: [
      { key: 'new_outcome', label_vi: 'Kết quả mới', type: 'text', placeholder: 'VD: Con tự tin thuyết trình trước lớp', required: true },
      { key: 'outcome_emotion', label_vi: 'Cảm xúc đi kèm', type: 'select', options: ['Tự hào', 'Xúc động', 'Bất ngờ', 'Hạnh phúc', 'Biết ơn'], required: false },
    ],
  },
  {
    id: 'E2',
    group: 'E',
    name_vi: 'Đổi CTA/ưu đãi',
    description_vi: 'Giữ nguyên câu chuyện, đổi phần kêu gọi hành động',
    example_vi: '"Mua ngay" → "Inbox nhận tư vấn", "Comment SÁCH để nhận link"',
    params: [
      { key: 'cta_type', label_vi: 'Kiểu CTA', type: 'select', options: ['Comment keyword', 'Inbox/DM', 'Link bio', 'Flash sale', 'Free ship', 'Quà tặng kèm'], required: true },
      { key: 'cta_detail', label_vi: 'Chi tiết CTA', type: 'text', placeholder: 'VD: Comment "SÁCH" để nhận link giảm 30%', required: false },
    ],
  },
];

export function getVariationType(id: string): VariationType | undefined {
  return VARIATION_TYPES.find((t) => t.id === id);
}

export function getVariationsByGroup(group: string): VariationType[] {
  return VARIATION_TYPES.filter((t) => t.group === group);
}

// Valid 2-type combos (curated list of combos that make sense together)
export const VALID_DUAL_COMBOS: [string, string][] = [
  // A + C (character + hook)
  ['A1', 'C1'], ['A1', 'C2'], ['A1', 'C3'], ['A1', 'C4'],
  ['A2', 'C1'], ['A2', 'C2'], ['A2', 'C3'], ['A2', 'C4'],
  ['A3', 'C1'], ['A3', 'C2'], ['A3', 'C3'], ['A3', 'C4'],
  // A + B (character + source)
  ['A1', 'B1'], ['A1', 'B2'], ['A1', 'B4'],
  ['A3', 'B1'], ['A3', 'B2'],
  // A + E (character + CTA)
  ['A1', 'E1'], ['A1', 'E2'],
  ['A2', 'E1'], ['A2', 'E2'],
  ['A3', 'E1'], ['A3', 'E2'],
  // B + C (source + hook)
  ['B1', 'C1'], ['B1', 'C2'], ['B1', 'C3'],
  ['B2', 'C1'], ['B2', 'C2'],
  ['B4', 'C4'],
  // B + E (source + CTA)
  ['B1', 'E1'], ['B1', 'E2'],
  ['B2', 'E2'], ['B4', 'E2'],
  // C + E (hook + CTA)
  ['C1', 'E1'], ['C1', 'E2'],
  ['C2', 'E1'], ['C2', 'E2'],
  ['C3', 'E1'], ['C3', 'E2'],
  ['C4', 'E1'], ['C4', 'E2'],
  // D + others (format changes)
  ['D1', 'E2'], ['D3', 'A1'], ['D3', 'E2'],
  ['D1', 'C1'], ['D1', 'C2'],
];

// Valid 3-type combos
export const VALID_TRIPLE_COMBOS: [string, string, string][] = [
  ['A1', 'C1', 'E2'], ['A1', 'C2', 'E1'], ['A1', 'C3', 'E2'],
  ['A1', 'B1', 'E2'], ['A1', 'B2', 'E2'], ['A1', 'C4', 'E1'],
  ['A2', 'C1', 'E2'], ['A2', 'C2', 'E1'], ['A2', 'B1', 'E2'],
  ['A3', 'C1', 'E2'], ['A3', 'C2', 'E1'], ['A3', 'B1', 'E2'],
  ['B1', 'C1', 'E2'], ['B1', 'C2', 'E1'], ['B1', 'C3', 'E2'],
  ['B2', 'C1', 'E2'], ['B4', 'C4', 'E2'],
  ['D1', 'C1', 'E2'], ['D1', 'C2', 'E2'],
  ['D3', 'A1', 'E2'], ['D3', 'C1', 'E2'],
];

export function isValidCombo(types: string[]): { valid: boolean; reason_vi?: string } {
  if (types.length === 1) return { valid: true };

  const sorted = [...types].sort();

  // Check for conflicts within same group (except some valid ones)
  const groups = sorted.map(t => t[0]);
  const groupCounts: Record<string, number> = {};
  for (const g of groups) {
    groupCounts[g] = (groupCounts[g] || 0) + 1;
  }

  // D group conflicts
  if ((groupCounts['D'] || 0) > 1) {
    return { valid: false, reason_vi: 'Không thể kết hợp 2 kiểu định dạng cùng lúc' };
  }

  if (types.length === 2) {
    const match = VALID_DUAL_COMBOS.some(
      ([a, b]) => (sorted[0] === a && sorted[1] === b) || (sorted[0] === b && sorted[1] === a)
    );
    if (!match) return { valid: false, reason_vi: 'Combo này không khả dụng, hãy thử combo khác' };
    return { valid: true };
  }

  if (types.length === 3) {
    const match = VALID_TRIPLE_COMBOS.some(
      ([a, b, c]) => {
        const combo = [a, b, c].sort();
        return sorted[0] === combo[0] && sorted[1] === combo[1] && sorted[2] === combo[2];
      }
    );
    if (!match) return { valid: false, reason_vi: 'Combo 3 kiểu này không khả dụng, hãy thử combo khác' };
    return { valid: true };
  }

  return { valid: false, reason_vi: 'Tối đa 3 kiểu biến thể' };
}

export function getAllValidCombos(): string[] {
  const singles = VARIATION_TYPES.map(t => t.id);
  const duals = VALID_DUAL_COMBOS.map(([a, b]) => `${a}+${b}`);
  const triples = VALID_TRIPLE_COMBOS.map(([a, b, c]) => `${a}+${b}+${c}`);
  return [...singles, ...duals, ...triples];
}
