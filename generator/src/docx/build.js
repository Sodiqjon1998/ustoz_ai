import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  WidthType,
  ShadingType,
  BorderStyle,
  VerticalAlign,
  PageOrientation,
} from 'docx'

const PAGE_WIDTH = 11906 // A4, DXA
const PAGE_HEIGHT = 16838
const PAGE_MARGIN = 1134 // ~2cm
const CONTENT_WIDTH = PAGE_WIDTH - PAGE_MARGIN * 2 // 9638

const LABEL_COL_WIDTH = 2500
const VALUE_COL_WIDTH = CONTENT_WIDTH - LABEL_COL_WIDTH

const PHASE_NAME_COL_WIDTH = 2600
const PHASE_CONTENT_COL_WIDTH = CONTENT_WIDTH - PHASE_NAME_COL_WIDTH

const COLOR_LABEL_BG = 'F1F5F9'
const COLOR_BORDER = 'CBD5E1'
const COLOR_MUTED = '64748B'

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X']

const CELL_BORDER = {
  top: { style: BorderStyle.SINGLE, size: 2, color: COLOR_BORDER },
  bottom: { style: BorderStyle.SINGLE, size: 2, color: COLOR_BORDER },
  left: { style: BorderStyle.SINGLE, size: 2, color: COLOR_BORDER },
  right: { style: BorderStyle.SINGLE, size: 2, color: COLOR_BORDER },
}

const CELL_MARGIN = { top: 100, bottom: 100, left: 150, right: 150 }

/**
 * @param {{
 *   title: string, subjectName: string, grade: number, duration: number,
 *   lessonType: string, objectiveMain: string,
 *   objectives: { educational: string, developmental: string, upbringing: string },
 *   equipment: string[],
 *   phases: Array<{ name: string, durationMin: number, blocks: Array<{ type: 'paragraph'|'bullet', runs: Array<{ text: string, bold: boolean }> }> }>,
 *   homework: string,
 * }} outline
 * @returns {Promise<Buffer>}
 */
export async function buildDocx(outline) {
  const children = []

  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 60 },
      children: [
        new TextRun({ text: 'DARS KONSPEKTI', bold: true, size: 32, characterSpacing: 20 }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 300 },
      children: [
        new TextRun({
          text: `${outline.subjectName ?? ''} • ${outline.grade ?? ''}-sinf`,
          size: 22,
          color: COLOR_MUTED,
        }),
      ],
    }),
  )

  children.push(buildMetaTable(outline))

  children.push(
    new Paragraph({
      spacing: { before: 400, after: 200 },
      children: [new TextRun({ text: 'DARS BORISHI', bold: true, size: 26, characterSpacing: 10 })],
    }),
  )

  children.push(buildPhaseTable(outline.phases ?? []))

  children.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 400, after: 150 },
      text: 'Uy vazifasi',
    }),
    new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      children: [new TextRun({ text: outline.homework || '—' })],
    }),
  )

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            size: { width: PAGE_WIDTH, height: PAGE_HEIGHT, orientation: PageOrientation.PORTRAIT },
            margin: { top: PAGE_MARGIN, bottom: PAGE_MARGIN, left: PAGE_MARGIN, right: PAGE_MARGIN },
          },
        },
        children,
      },
    ],
  })

  return Packer.toBuffer(doc)
}

function labelCell(text) {
  return new TableCell({
    width: { size: LABEL_COL_WIDTH, type: WidthType.DXA },
    borders: CELL_BORDER,
    margins: CELL_MARGIN,
    verticalAlign: VerticalAlign.CENTER,
    shading: { type: ShadingType.CLEAR, color: 'auto', fill: COLOR_LABEL_BG },
    children: [new Paragraph({ children: [new TextRun({ text, bold: true })] })],
  })
}

function valueCell(paragraphs, width = VALUE_COL_WIDTH) {
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    borders: CELL_BORDER,
    margins: CELL_MARGIN,
    verticalAlign: VerticalAlign.CENTER,
    children: paragraphs.length ? paragraphs : [new Paragraph({ text: '—' })],
  })
}

function buildMetaTable(outline) {
  const objectives = outline.objectives ?? {}

  const rows = [
    ['Mavzu', [new Paragraph({ children: [new TextRun({ text: outline.title ?? '', bold: true })] })]],
    ['Sinf', [new Paragraph({ text: `${outline.grade ?? ''}-sinf` })]],
    ['Dars turi', [new Paragraph({ text: outline.lessonType || '—' })]],
    ['Davomiylik', [new Paragraph({ text: `${outline.duration ?? ''} daqiqa` })]],
    ['Maqsad', [new Paragraph({ text: outline.objectiveMain || '—' })]],
    [
      'Vazifalar',
      [
        new Paragraph({
          spacing: { after: 60 },
          children: [
            new TextRun({ text: "Ta'limiy: ", bold: true }),
            new TextRun({ text: objectives.educational || '—' }),
          ],
        }),
        new Paragraph({
          spacing: { after: 60 },
          children: [
            new TextRun({ text: 'Rivojlantiruvchi: ', bold: true }),
            new TextRun({ text: objectives.developmental || '—' }),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({ text: 'Tarbiyaviy: ', bold: true }),
            new TextRun({ text: objectives.upbringing || '—' }),
          ],
        }),
      ],
    ],
    ['Jihozlar', [new Paragraph({ text: (outline.equipment ?? []).join(', ') || '—' })]],
  ]

  return new Table({
    width: { size: CONTENT_WIDTH, type: WidthType.DXA },
    columnWidths: [LABEL_COL_WIDTH, VALUE_COL_WIDTH],
    rows: rows.map(
      ([label, valueParagraphs]) => new TableRow({ children: [labelCell(label), valueCell(valueParagraphs)] }),
    ),
  })
}

function buildPhaseTable(phases) {
  const rows = phases.map((phase, index) => {
    const nameCell = new TableCell({
      width: { size: PHASE_NAME_COL_WIDTH, type: WidthType.DXA },
      borders: CELL_BORDER,
      margins: CELL_MARGIN,
      verticalAlign: VerticalAlign.CENTER,
      shading: { type: ShadingType.CLEAR, color: 'auto', fill: COLOR_LABEL_BG },
      children: [
        new Paragraph({
          children: [
            new TextRun({ text: `${ROMAN[index] ?? index + 1}. ${phase.name ?? ''}`, bold: true }),
          ],
        }),
        new Paragraph({
          children: [new TextRun({ text: `(${phase.durationMin ?? 0} daqiqa)`, italics: true, size: 18, color: COLOR_MUTED })],
        }),
      ],
    })

    const contentCell = new TableCell({
      width: { size: PHASE_CONTENT_COL_WIDTH, type: WidthType.DXA },
      borders: CELL_BORDER,
      margins: CELL_MARGIN,
      children: blocksToParagraphs(phase.blocks ?? []),
    })

    return new TableRow({ children: [nameCell, contentCell] })
  })

  return new Table({
    width: { size: CONTENT_WIDTH, type: WidthType.DXA },
    columnWidths: [PHASE_NAME_COL_WIDTH, PHASE_CONTENT_COL_WIDTH],
    rows,
  })
}

function blocksToParagraphs(blocks) {
  const paragraphs = blocks.map((block) => {
    const runs = (block.runs ?? []).map(
      (run) => new TextRun({ text: run.text, bold: !!run.bold }),
    )

    if (block.type === 'bullet') {
      return new Paragraph({ children: runs, bullet: { level: 0 }, spacing: { after: 80 } })
    }

    return new Paragraph({ children: runs, alignment: AlignmentType.JUSTIFIED, spacing: { after: 120 } })
  })

  return paragraphs.length ? paragraphs : [new Paragraph({ text: '—' })]
}
