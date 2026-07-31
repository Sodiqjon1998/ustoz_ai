import { renderPdf } from './printer.js'

const LETTERS = ['A', 'B', 'C', 'D']

const STYLES = {
  h1: { fontSize: 20, bold: true, margin: [0, 0, 0, 4] },
  meta: { fontSize: 10, color: '#6B7280', margin: [0, 0, 0, 4] },
  instructions: { fontSize: 10, italics: true, margin: [0, 0, 0, 16] },
  question: { fontSize: 11, bold: true, margin: [0, 12, 0, 4] },
  option: { fontSize: 11, margin: [12, 0, 0, 2] },
  answerLine: { fontSize: 10, color: '#9CA3AF', margin: [0, 4, 0, 0] },
}

/**
 * O'quvchi uchun chop etiladigan test — to'g'ri javob va izoh ko'rsatilmaydi.
 *
 * @param {{
 *   title: string,
 *   subjectName: string,
 *   grade: number,
 *   duration: number,
 *   questions: Array<{ text: string, options: string[] }>,
 * }} input
 * @returns {Promise<Buffer>}
 */
export async function buildTestSimplePdf(input) {
  const content = []

  content.push({ text: input.title ?? 'Test', style: 'h1' })
  content.push({
    text: `${input.subjectName ?? ''} · ${input.grade ?? ''}-sinf · ${input.duration ?? ''} daqiqa`,
    style: 'meta',
  })
  content.push({
    text: "Har bir savol uchun faqat bitta to'g'ri javobni tanlang va javob qatoriga harfini yozing.",
    style: 'instructions',
  })

  ;(input.questions ?? []).forEach((question, index) => {
    content.push({ text: `${index + 1}. ${question.text}`, style: 'question' })

    for (const [i, option] of (question.options ?? []).entries()) {
      content.push({ text: `${LETTERS[i] ?? i}) ${option}`, style: 'option' })
    }

    content.push({ text: 'Javob: ______', style: 'answerLine' })
  })

  return renderPdf({ content, styles: STYLES })
}
