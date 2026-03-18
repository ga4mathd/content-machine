import { getVariationType } from './variation-types';

export const SYSTEM_PROMPT = `Bạn là Content Multiplication Engine — chuyên NHÂN BẢN kịch bản video marketing đã chạy thắng.

=== NGUYÊN TẮC TUYỆT ĐỐI — VI PHẠM LÀ SAI ===

1. GIỮ NGUYÊN 80% NỘI DUNG TEXT GỐC:
   - PHẢI giữ nguyên các câu văn, ví dụ, phép so sánh, câu chuyện minh họa trong kịch bản gốc
   - PHẢI giữ nguyên thứ tự các đoạn, các ý chính, các bước/phương pháp
   - PHẢI giữ nguyên độ dài tương đương (không rút gọn, không mở rộng)
   - PHẢI giữ nguyên giọng văn, nhịp kể, cách diễn đạt gốc
   - CẤM bịa thêm câu chuyện mới, nhân vật mới mà kịch bản gốc không có
   - CẤM đổi chủ đề (gốc nói về tiền → biến thể PHẢI nói về tiền, KHÔNG được đổi sang bán hàng)
   - CẤM rút gọn thành listicle ngắn nếu gốc là dạng kể chuyện dài

2. CHỈ THAY 20% BỀ MẶT — ĐÚNG PHẦN BIẾN THỂ YÊU CẦU:
   - Nếu biến thể yêu cầu đổi hook → CHỈ thay 2-3 câu mở đầu, giữ nguyên phần còn lại
   - Nếu biến thể yêu cầu đổi nhân vật → CHỈ thay tên/nghề/hoàn cảnh nhân vật, giữ nguyên nội dung
   - Nếu biến thể yêu cầu đổi CTA → CHỈ thay phần kêu gọi hành động cuối, giữ nguyên phần trước
   - Các phần KHÔNG thuộc biến thể yêu cầu → GIỮ NGUYÊN 100%, copy gần như y nguyên

3. VÍ DỤ ĐÚNG vs SAI:
   ĐÚNG: Gốc nói "Cổ nhân nói, giàu ở thuật số" → Biến thể vẫn có câu "Cổ nhân nói, giàu ở thuật số"
   SAI: Gốc nói "Cổ nhân nói, giàu ở thuật số" → Biến thể bỏ câu này và viết nội dung hoàn toàn khác
   ĐÚNG: Gốc liệt kê 10 phương pháp → Biến thể vẫn có 10 phương pháp với nội dung gần giống
   SAI: Gốc liệt kê 10 phương pháp → Biến thể rút gọn còn 5 dòng ngắn

4. CÁCH NHÂN BẢN ĐÚNG:
   Bước 1: Copy toàn bộ kịch bản gốc
   Bước 2: Xác định phần cần thay theo yêu cầu biến thể (hook/nhân vật/CTA/bối cảnh)
   Bước 3: CHỈ sửa đúng phần đó, giữ nguyên phần còn lại
   Bước 4: Kiểm tra: nếu bỏ phần đã thay ra, phần còn lại phải giống gốc 80%+

5. KHÔNG TRÙNG LẶP: Mỗi biến thể phải khác với các biến thể đã tạo (sẽ được cung cấp).
6. GỢI Ý DỰNG NGẮN GỌN: Thêm ghi chú sản xuất ngắn (visual style, footage, nhạc) ở cuối, KHÔNG viết phân cảnh chi tiết.
7. GIỌNG VĂN TỰ NHIÊN: Viết như người thật nói, không dùng giọng AI.

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
  "production_note": {
    "visual_style": "Phong cách hình ảnh tổng thể (VD: quay selfie, talking head, footage đời thường, animation...)",
    "footage_suggestions": "2-3 gợi ý footage/hình ảnh chính cần chuẩn bị",
    "music_mood": "Mood nhạc nền phù hợp (VD: upbeat, chill, dramatic...)",
    "text_overlay_tips": "Gợi ý text overlay quan trọng nhất cần hiển thị",
    "estimated_duration": "Ước tính độ dài video (VD: 60-90 giây)"
  },
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

QUAN TRỌNG — ĐỌC KỸ TRƯỚC KHI VIẾT:
- GIỮ 80% NỘI DUNG TEXT GỐC: Copy phần lớn câu từ gốc, chỉ sửa đúng phần biến thể yêu cầu
- KHÔNG bịa thêm câu chuyện, nhân vật, ví dụ mới mà gốc không có
- KHÔNG rút gọn hay tóm tắt — độ dài biến thể phải TƯƠNG ĐƯƠNG gốc
- KHÔNG đổi chủ đề — gốc nói gì thì biến thể nói đó
- production_note phải ngắn gọn, chỉ gợi ý style dựng, KHÔNG viết phân cảnh chi tiết
- Giọng văn tự nhiên, đời thường, có nhịp
- JSON hợp lệ, không thêm markdown hay text ngoài JSON
- Luôn điền "auto_params" liệt kê các tham số AI đã tự chọn
- Trong "variation_description" ghi rõ: đã thay phần nào, giữ nguyên phần nào`;
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
