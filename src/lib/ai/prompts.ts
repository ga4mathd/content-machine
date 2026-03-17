import { getVariationType } from './variation-types';

export const SYSTEM_PROMPT = `Bạn là Content Multiplication Engine của Lollibooks — chuyên nhân bản kịch bản video marketing đã chạy thắng thành nhiều biến thể khác nhau.

NGUYÊN TẮC VÀNG:
1. GIỮ 80% CỐT LÕI: Cấu trúc kịch bản gốc (nhịp kể, cao trào, insight chính, độ dài tương đương) phải được giữ nguyên. Đây là "DNA" đã chứng minh hiệu quả.
2. THAY 20% THỂ HIỆN: Chỉ thay các yếu tố bề mặt theo yêu cầu (hook, nhân vật, source, CTA, bối cảnh).
3. KHÔNG TRÙNG LẶP: Mỗi biến thể phải thực sự khác biệt với các biến thể đã tạo (sẽ được cung cấp).
4. PHÂN CẢNH CHI TIẾT: Luôn xuất kịch bản phân cảnh với gợi ý hình ảnh/footage cụ thể cho editor.
5. GIỌNG VĂN TỰ NHIÊN: Viết như người thật nói, không dùng giọng AI. Ngắn gọn, có nhịp, dùng từ ngữ đời thường.

MARKET: Lollibooks bán sách giáo dục (sách thiếu nhi, sách kỹ năng văn phòng, sách kỹ năng mềm) tại VN, Cambodia, Laos, Philippines.

Luôn trả về kết quả ở dạng JSON hợp lệ. Không thêm markdown code block, không thêm text ngoài JSON.`;

interface BuildPromptParams {
  productName: string;
  productMarket: string;
  productKb: string;
  originalScript: string;
  variationTypes: string[];
  variationParams: Record<string, string>;
  numVariations: number;
  previousVariations: string[];
}

export function buildUserPrompt(params: BuildPromptParams): string {
  const {
    productName,
    productMarket,
    productKb,
    originalScript,
    variationTypes,
    variationParams,
    numVariations,
    previousVariations,
  } = params;

  // Build variation type descriptions
  const variationDescriptions = variationTypes.map((typeId) => {
    const vType = getVariationType(typeId);
    if (!vType) return typeId;
    return `${vType.id} - ${vType.name_vi}: ${vType.description_vi}`;
  }).join('\n');

  // Build params description
  const paramsDescription = Object.entries(variationParams)
    .filter(([, v]) => v)
    .map(([k, v]) => `- ${k}: ${v}`)
    .join('\n');

  // Build previous variations context
  let previousContext = '';
  if (previousVariations.length > 0) {
    previousContext = `\n== CÁC BIẾN THỂ ĐÃ TẠO (TUYỆT ĐỐI TRÁNH TRÙNG) ==\n${previousVariations.map((v, i) => `${i + 1}. ${v}`).join('\n')}`;
  }

  const outputSchema = numVariations > 1
    ? `Trả về JSON array gồm ${numVariations} objects, mỗi object có cấu trúc:`
    : `Trả về 1 JSON object có cấu trúc:`;

  return `== SẢN PHẨM ==
${productName} (Thị trường: ${productMarket})

== KIẾN THỨC SẢN PHẨM ==
${productKb}

== KỊCH BẢN GỐC (ĐÃ CHẠY THẮNG) ==
${originalScript}

== YÊU CẦU BIẾN THỂ ==
Kiểu biến thể:
${variationDescriptions}

Tham số cụ thể:
${paramsDescription || '(Không có tham số cụ thể, AI tự chọn phù hợp)'}

Số biến thể cần tạo: ${numVariations}
${previousContext}

== FORMAT ĐẦU RA ==
${outputSchema}
{
  "variation_label": "Tên ngắn gọn của biến thể",
  "variation_description": "Mô tả đã thay gì so với gốc (1-2 câu)",
  "full_script": "Kịch bản đầy đủ dạng text, viết tự nhiên như người thật nói",
  "storyboard": [
    {
      "scene": 1,
      "duration": "0:00-0:03",
      "voiceover": "Lời nói/voice trong cảnh này",
      "visual": "Mô tả hình ảnh/footage cần quay hoặc dùng",
      "text_overlay": "Chữ hiển thị trên màn hình (nếu có, không thì để trống)",
      "music_mood": "Mood nhạc nền (trending sound, buồn nhẹ, upbeat, etc.)",
      "transition": "Kiểu chuyển cảnh (cut, fade, zoom, etc.)"
    }
  ],
  "fingerprint": {
    "hook_type": "loại hook sử dụng",
    "character": "nhân vật chính",
    "source_type": "loại source/nguồn tin",
    "cta_type": "loại CTA",
    "format": "format kịch bản (story/listicle/dialogue/micro)"
  }
}

QUAN TRỌNG:
- Giữ đúng DNA kịch bản gốc (cấu trúc, nhịp, insight chính)
- Kịch bản phải có cùng độ dài tương đương với gốc
- Storyboard phải chi tiết đủ để editor quay/dựng ngay
- Giọng văn tự nhiên, đời thường, có nhịp
- JSON hợp lệ, không thêm markdown hay text ngoài JSON`;
}
