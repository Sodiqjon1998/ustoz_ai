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

// HALOLLIK ESLATMASI: "Chorak nazorat ishi" odatda mustaqil 30 ta savoldan
// iborat bo'lishi kerak, lekin app/Services/Ai/GeminiService.php hozircha har
// bir mavzu uchun faqat 20 ta test savoli generatsiya qiladi (bitta savol
// banki pptx/docx/pdf_test_simple bilan bo'lishiladi). Bu yerda soxta savollar
// to'qib chiqarilmaydi — mavjud 20 ta savol "chorak nazorat ishi" formatida
// chop etiladi, savollar soni sarlavhada haqiqiy sondan olinadi (qattiq
// kodlangan "30" emas). Kelajakda GeminiService'ga alohida, kattaroq chorak
// savol banki generatsiya qilish funksiyasi qo'shilishi kerak — bu ishning
// doirasidan tashqarida.
/**
 * @param {{
 *   title: string,
 *   subjectName: string,
 *   grade: number,
 *   duration: number,
 *   questions: Array<{ text: string, options: string[] }>,
 * }} input
 * @returns {Promise<Buffer>}
 */
export async function buildTestQuarterPdf(input) {
  const content = []
  const questions = input.questions ?? []

  content.push({ text: input.title ?? 'Chorak nazorat ishi', style: 'h1' })
  content.push({
    text: `${input.subjectName ?? ''} · ${input.grade ?? ''}-sinf · ${questions.length} ta savol`,
    style: 'meta',
  })
  content.push({
    text: "Har bir savol uchun faqat bitta to'g'ri javobni tanlang va javob qatoriga harfini yozing.",
    style: 'instructions',
  })

  questions.forEach((question, index) => {
    content.push({ text: `${index + 1}. ${question.text}`, style: 'question' })

    for (const [i, option] of (question.options ?? []).entries()) {
      content.push({ text: `${LETTERS[i] ?? i}) ${option}`, style: 'option' })
    }

    content.push({ text: 'Javob: ______', style: 'answerLine' })
  })

  return renderPdf({ content, styles: STYLES })
}
