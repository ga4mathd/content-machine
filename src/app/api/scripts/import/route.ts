import { NextRequest, NextResponse } from 'next/server';
import { createScript } from '@/lib/db/scripts';
import { getProductById } from '@/lib/db/products';
import * as XLSX from 'xlsx';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const productId = formData.get('product_id') as string | null;

    if (!file) {
      return NextResponse.json({ success: false, error: 'Chưa chọn file' }, { status: 400 });
    }

    if (!productId) {
      return NextResponse.json({ success: false, error: 'Chưa chọn sản phẩm' }, { status: 400 });
    }

    // Verify product exists
    const product = getProductById(productId);
    if (!product) {
      return NextResponse.json({ success: false, error: 'Sản phẩm không tồn tại' }, { status: 404 });
    }

    // Parse Excel file
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      return NextResponse.json({ success: false, error: 'File Excel trống' }, { status: 400 });
    }

    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json<Record<string, string>>(sheet);

    if (rows.length === 0) {
      return NextResponse.json({ success: false, error: 'File không có dữ liệu' }, { status: 400 });
    }

    // Validate and import each row
    const results: { title: string; success: boolean; error?: string }[] = [];
    let imported = 0;

    for (const row of rows) {
      const title = (row['Tiêu đề'] || row['title'] || '').toString().trim();
      const content = (row['Nội dung'] || row['content'] || '').toString().trim();
      const performanceNotes = (row['Ghi chú'] || row['performance_notes'] || '').toString().trim();

      if (!title) {
        results.push({ title: '(trống)', success: false, error: 'Thiếu tiêu đề' });
        continue;
      }

      if (!content) {
        results.push({ title, success: false, error: 'Thiếu nội dung' });
        continue;
      }

      try {
        createScript({
          product_id: productId,
          title,
          content,
          performance_notes: performanceNotes,
        });
        imported++;
        results.push({ title, success: true });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Lỗi không xác định';
        results.push({ title, success: false, error: message });
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        total: rows.length,
        imported,
        failed: rows.length - imported,
        results,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Lỗi không xác định';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
