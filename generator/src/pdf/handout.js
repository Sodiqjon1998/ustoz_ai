import { renderPdf, blocksToPdfContent } from './printer.js'

const STYLES = {
  h1: { fontSize: 20, bold: true, margin: [0, 0, 0, 4] },
  meta: { fontSize: 10, color: '#6B7280', margin: [0, 0, 0, 14] },
  h2: { fontSize: 14, bold: true, margin: [0, 14, 0, 6] },
  body: { fontSize: 11, margin: [0, 0, 0, 8], alignment: 'justify' },
}

/**
 * @param {{
 *   title: string,
 *   subjectName: string,
 *   grade: number,
 *   duration: number,
 *   objective: string,
 *   sections: Array<{ heading: string, blocks: Array<{ type: 'paragraph'|'bullet', text: string }> }>,
 * }} input
 * @returns {Promise<Buffer>}
 */
export async function buildHandoutPdf(input) {
  const content = []

  content.push({ text: input.title ?? '', style: 'h1' })
  content.push({
    text: `${input.subjectName ?? ''} · ${input.grade ?? ''}-sinf · ${input.duration ?? ''} daqiqa`,
    style: 'meta',
  })

  if (input.objective) {
    content.push({
      text: [{ text: 'Dars maqsadi: ', bold: true }, input.objective],
      margin: [0, 0, 0, 16],
    })
  }

  for (const section of input.sections ?? []) {
    content.push({ text: section.heading ?? '', style: 'h2' })
    content.push(...blocksToPdfContent(section.blocks))
  }

  return renderPdf({ content, styles: STYLES })
}
