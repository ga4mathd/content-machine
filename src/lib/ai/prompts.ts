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
${paramsDescription || buildAutoModeGuide(variationTypes)}

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
  },
  "auto_params": {
    "param_key": "giá trị AI đã tự chọn (liệt kê TẤT CẢ tham số AI quyết định)"
  }
}

QUAN TRỌNG:
- Giữ đúng DNA kịch bản gốc (cấu trúc, nhịp, insight chính)
- Kịch bản phải có cùng độ dài tương đương với gốc
- Storyboard phải chi tiết đủ để editor quay/dựng ngay
- Giọng văn tự nhiên, đời thường, có nhịp
- JSON hợp lệ, không thêm markdown hay text ngoài JSON
- Luôn điền "auto_params" liệt kê các tham số AI đã tự chọn (kể cả khi user cung cấp sẵn)`;
}

function buildAutoModeGuide(variationTypes: string[]): string {
  const guides: string[] = [
    '== CHẾ ĐỘ TỰ ĐỘNG — AI TỰ CHỌN TẤT CẢ THAM SỐ ==',
    'Hãy TỰ SÁNG TẠO các tham số dưới đây sao cho PHÙ HỢP với sản phẩm, đối tượng mục tiêu trong KB, và kịch bản gốc:',
    '',
  ];

  const typeSet = new Set(variationTypes);

  if (typeSet.has('A1')) {
    guides.push('- NHÂN VẬT MỚI: Tự chọn nghề nghiệp, độ tuổi, hoàn cảnh gần gũi với đối tượng mục tiêu trong KB. Ví dụ: "Anh xe ôm 35 tuổi nuôi 2 con", "Cô sinh viên năm cuối đang thực tập"');
  }
  if (typeSet.has('A2')) {
    guides.push('- GÓC NHÌN MỚI: Tự chọn POV phù hợp (ngôi thứ nhất, người quan sát, người được tặng, con cái...). Kể lại câu chuyện từ góc nhìn bất ngờ.');
  }
  if (typeSet.has('A3')) {
    guides.push('- BỐI CẢNH MỚI: Tự chọn địa điểm đời thường, cụ thể (quán cà phê lúc sáng sớm, trên xe bus đi làm, góc bếp lúc khuya...). Bối cảnh phải tạo cảm xúc.');
  }
  if (typeSet.has('B1')) {
    guides.push('- SOURCE UY TÍN: Tự chọn danh tính source phù hợp ngành hàng (bác sĩ, giảng viên, CEO, KOL...) với kinh nghiệm cụ thể.');
  }
  if (typeSet.has('B2')) {
    guides.push('- CÂU CHUYỆN VIRAL: Tự sáng tạo câu chuyện viral hấp dẫn rồi twist về sản phẩm. Chọn chủ đề drama/bất ngờ/hài hước.');
  }
  if (typeSet.has('B3')) {
    guides.push('- NHÂN VẬT HOẠT HÌNH/PHIM: Tự chọn nhân vật phổ biến (Doraemon, Shin, Naruto, Elsa...) và phong cách đối thoại đặc trưng.');
  }
  if (typeSet.has('B4')) {
    guides.push('- SỐ LIỆU/NGHIÊN CỨU: Tự tạo số liệu ấn tượng (có thể fictional nhưng phải hợp lý) từ nguồn uy tín (Harvard, WHO, khảo sát...). ');
  }
  if (typeSet.has('C1')) {
    guides.push('- HOOK GÂY TRANH CÃI: Tự tạo câu mở đầu gây sốc ở mức vừa phải, kích thích comment. Đừng quá phản cảm.');
  }
  if (typeSet.has('C2')) {
    guides.push('- HOOK CÂU HỎI/BÍ MẬT: Tự tạo câu hỏi gây tò mò hoặc hứa tiết lộ bí mật hấp dẫn.');
  }
  if (typeSet.has('C3')) {
    guides.push('- HOOK TRENDING: Tự gắn với trend/sự kiện phù hợp thời điểm hiện tại và kết nối tự nhiên với sản phẩm.');
  }
  if (typeSet.has('C4')) {
    guides.push('- HOOK SỐ LIỆU SỐC: Tự tạo con số bất ngờ (tiền bạc, thời gian, phần trăm) gây ấn tượng mạnh ngay dòng đầu.');
  }
  if (typeSet.has('D1')) {
    guides.push('- FORMAT LISTICLE: Tự chọn số lượng items (3-7) và dạng list phù hợp (lý do, sai lầm, bước, bí mật...).');
  }
  if (typeSet.has('D2')) {
    guides.push('- MICRO-CONTENT: Rút gọn thành 2-3 clip ngắn 15-30s, mỗi clip lấy 1 moment mạnh nhất.');
  }
  if (typeSet.has('D3')) {
    guides.push('- ĐỐI THOẠI: Tự chọn quan hệ 2 nhân vật (bạn bè, vợ chồng, đồng nghiệp...) và phong cách (tự nhiên, hài hước, tranh luận nhẹ...).');
  }
  if (typeSet.has('E1')) {
    guides.push('- KẾT QUẢ MỚI: Tự sáng tạo outcome khác biệt, cảm xúc mạnh (tự hào, xúc động, bất ngờ...).');
  }
  if (typeSet.has('E2')) {
    guides.push('- CTA MỚI: Tự chọn kiểu CTA phù hợp kênh (Comment keyword, Inbox, Link bio, Flash sale, Quà tặng kèm...).');
  }

  guides.push('');
  guides.push('QUAN TRỌNG: Trong "auto_params", liệt kê TẤT CẢ tham số bạn đã tự chọn để người dùng biết AI đã quyết định gì.');

  return guides.join('\n');
}
