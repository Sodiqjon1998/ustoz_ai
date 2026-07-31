import { renderPdf, blocksToPdfContent } from './printer.js'

const STYLES = {
  h1: { fontSize: 20, bold: true, margin: [0, 0, 0, 4] },
  meta: { fontSize: 10, color: '#6B7280', margin: [0, 0, 0, 14] },
  h2: { fontSize: 14, bold: true, margin: [0, 14, 0, 6] },
  body: { fontSize: 11, margin: [0, 0, 0, 8], alignment: 'justify' },
  placeholder: { fontSize: 11, italics: true, color: '#6B7280', margin: [0, 10, 0, 0] },
}

/**
 * lecture_html'ning oxirgi <h2> bo'limi (odatda xulosa/qo'shimcha) mavjud
 * bo'lsa, shu bo'lim "qo'shimcha material" sifatida chop etiladi. Aks holda
 * — hali alohida "qo'shimcha material" kontenti generatsiya qilinmaganda —
 * halol placeholder ko'rsatiladi (TODO: kelajakda GeminiService alohida
 * "extras" kontent maydonini qaytarishi mumkin).
 *
 * @param {{
 *   title: string,
 *   subjectName: string,
 *   objective: string,
 *   heading: string|null,
 *   blocks: Array<{ type: 'paragraph'|'bullet', text: string }>,
 * }} input
 * @returns {Promise<Buffer>}
 */
export async function buildExtrasPdf(input) {
  const content = []

  content.push({ text: input.title ?? '', style: 'h1' })
  content.push({ text: input.subjectName ?? '', style: 'meta' })

  if (input.heading && (input.blocks ?? []).length) {
    content.push({ text: input.heading, style: 'h2' })
    content.push(...blocksToPdfContent(input.blocks))
  } else {
    if (input.objective) {
      content.push({
        text: [{ text: 'Dars maqsadi: ', bold: true }, input.objective],
      })
    }
    // TODO: hozircha lecture_html'da alohida qo'shimcha material bo'limi
    // topilmasa, oddiy halol placeholder ko'rsatiladi.
    content.push({
      text: "Qo'shimcha materiallar tez orada qo'shiladi.",
      style: 'placeholder',
    })
  }

  return renderPdf({ content, styles: STYLES })
}
