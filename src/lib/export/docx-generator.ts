import {
  Document,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  HeadingLevel,
  WidthType,
  BorderStyle,
  AlignmentType,
  Packer,
} from 'docx';
import type { StoryboardScene } from '@/types';

interface DocxParams {
  productName: string;
  variationLabel: string;
  variationType: string;
  variationDescription: string;
  fullScript: string;
  storyboard: StoryboardScene[];
  createdAt: string;
}

export async function generateDocxBuffer(params: DocxParams): Promise<Buffer> {
  const {
    productName,
    variationLabel,
    variationType,
    variationDescription,
    fullScript,
    storyboard,
    createdAt,
  } = params;

  const borderStyle = {
    style: BorderStyle.SINGLE,
    size: 1,
    color: 'CCCCCC',
  };

  const cellBorders = {
    top: borderStyle,
    bottom: borderStyle,
    left: borderStyle,
    right: borderStyle,
  };

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          // Title
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            children: [
              new TextRun({ text: `${productName} — ${variationLabel}`, bold: true, size: 32 }),
            ],
          }),

          // Metadata
          new Paragraph({
            spacing: { before: 200 },
            children: [
              new TextRun({ text: 'Loại biến thể: ', bold: true, size: 22 }),
              new TextRun({ text: variationType, size: 22 }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'Mô tả: ', bold: true, size: 22 }),
              new TextRun({ text: variationDescription, size: 22 }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'Ngày tạo: ', bold: true, size: 22 }),
              new TextRun({ text: createdAt, size: 22 }),
            ],
          }),

          // Separator
          new Paragraph({ spacing: { before: 400 }, children: [] }),

          // Script section
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            children: [new TextRun({ text: 'Kịch bản', bold: true, size: 28 })],
          }),
          ...fullScript.split('\n').map(
            (line) =>
              new Paragraph({
                spacing: { after: 100 },
                children: [new TextRun({ text: line, size: 22 })],
              })
          ),

          // Separator
          new Paragraph({ spacing: { before: 400 }, children: [] }),

          // Storyboard section
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            children: [new TextRun({ text: 'Kịch bản phân cảnh', bold: true, size: 28 })],
          }),

          // Storyboard table
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              // Header row
              new TableRow({
                children: [
                  makeHeaderCell('Cảnh'),
                  makeHeaderCell('Thời gian'),
                  makeHeaderCell('Lời nói (VO)'),
                  makeHeaderCell('Hình ảnh/Footage'),
                  makeHeaderCell('Text Overlay'),
                  makeHeaderCell('Nhạc/SFX'),
                ],
              }),
              // Data rows
              ...storyboard.map(
                (scene) =>
                  new TableRow({
                    children: [
                      makeCell(String(scene.scene), cellBorders),
                      makeCell(scene.duration, cellBorders),
                      makeCell(scene.voiceover, cellBorders),
                      makeCell(scene.visual, cellBorders),
                      makeCell(scene.text_overlay || '—', cellBorders),
                      makeCell(`${scene.music_mood}\n${scene.transition}`, cellBorders),
                    ],
                  })
              ),
            ],
          }),

          // Footer
          new Paragraph({
            spacing: { before: 400 },
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: 'Tạo bởi Content Multiplication Machine — Lollibooks',
                italics: true,
                size: 18,
                color: '999999',
              }),
            ],
          }),
        ],
      },
    ],
  });

  return Buffer.from(await Packer.toBuffer(doc));
}

function makeHeaderCell(text: string) {
  return new TableCell({
    shading: { fill: '4338CA', color: 'FFFFFF' },
    children: [
      new Paragraph({
        children: [new TextRun({ text, bold: true, size: 20, color: 'FFFFFF' })],
      }),
    ],
  });
}

function makeCell(text: string, borders: Record<string, unknown>) {
  return new TableCell({
    borders: borders as TableCell['options'] extends { borders?: infer B } ? B : never,
    children: text.split('\n').map(
      (line) =>
        new Paragraph({
          children: [new TextRun({ text: line, size: 20 })],
        })
    ),
  } as ConstructorParameters<typeof TableCell>[0]);
}
