import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
} from 'docx'

/**
 * @param {{
 *   title: string,
 *   subjectName: string,
 *   grade: number,
 *   duration: number,
 *   objective: string,
 *   sections: Array<{ heading: string, blocks: Array<{ type: 'paragraph'|'bullet', text: string }> }>,
 * }} outline
 * @returns {Promise<Buffer>}
 */
export async function buildDocx(outline) {
  const children = []

  children.push(
    new Paragraph({
      heading: HeadingLevel.TITLE,
      children: [new TextRun({ text: outline.title ?? '', bold: true })],
    }),
  )

  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `${outline.subjectName} · ${outline.grade}-sinf · ${outline.duration} daqiqa`,
          italics: true,
          color: '6B7280',
        }),
      ],
      spacing: { after: 200 },
    }),
  )

  if (outline.objective) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: 'Dars maqsadi: ', bold: true }),
          new TextRun({ text: outline.objective }),
        ],
        spacing: { after: 300 },
      }),
    )
  }

  for (const section of outline.sections ?? []) {
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        text: section.heading ?? '',
        spacing: { before: 300, after: 150 },
      }),
    )

    for (const block of section.blocks ?? []) {
      if (block.type === 'bullet') {
        children.push(
          new Paragraph({
            text: block.text,
            bullet: { level: 0 },
            spacing: { after: 80 },
          }),
        )
      } else {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: block.text })],
            spacing: { after: 150 },
            alignment: AlignmentType.JUSTIFIED,
          }),
        )
      }
    }
  }

  const doc = new Document({
    sections: [{ children }],
  })

  return Packer.toBuffer(doc)
}
