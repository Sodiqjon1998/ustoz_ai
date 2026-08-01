import pdfmake from 'pdfmake'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const FONTS_DIR = path.resolve(__dirname, '..', '..', 'node_modules', 'pdfmake', 'fonts', 'Roboto')

pdfmake.setFonts({
  Roboto: {
    normal: path.join(FONTS_DIR, 'Roboto-Regular.ttf'),
    bold: path.join(FONTS_DIR, 'Roboto-Medium.ttf'),
    italics: path.join(FONTS_DIR, 'Roboto-Italic.ttf'),
    bolditalics: path.join(FONTS_DIR, 'Roboto-MediumItalic.ttf'),
  },
})
pdfmake.setLocalAccessPolicy(() => true)
pdfmake.setUrlAccessPolicy(() => false)

/**
 * @param {object} docDefinition pdfmake hujjat ta'rifi (content, styles, ...)
 * @returns {Promise<Buffer>}
 */
export async function renderPdf(docDefinition) {
  const doc = pdfmake.createPdf({
    pageMargins: [50, 50, 50, 60],
    defaultStyle: { font: 'Roboto', fontSize: 11 },
    footer: (currentPage, pageCount) => ({
      text: `${currentPage} / ${pageCount}`,
      alignment: 'center',
      fontSize: 9,
      color: '#9CA3AF',
      margin: [0, 10, 0, 0],
    }),
    ...docDefinition,
  })

  return doc.getBuffer()
}

// Bo'lim ichidagi paragraf/ro'yxat bloklarini pdfmake "content" elementlariga
// aylantiradi — DocxOutlineBuilder'dagi block shakli bilan bir xil ({type, text}).
export function blocksToPdfContent(blocks) {
  const content = []
  let bulletBuffer = []

  const flushBullets = () => {
    if (bulletBuffer.length) {
      content.push({ ul: bulletBuffer, style: 'body', margin: [0, 0, 0, 10] })
      bulletBuffer = []
    }
  }

  for (const block of blocks ?? []) {
    if (block.type === 'bullet') {
      bulletBuffer.push(block.text)
    } else {
      flushBullets()
      content.push({ text: block.text, style: 'body' })
    }
  }
  flushBullets()

  return content
}

export const LETTERS = ['A', 'B', 'C', 'D']

// test-simple.js va test-quarter.js ikkalasi ham shu uslublardan foydalanadi —
// bitta joyda saqlash ikkalasini ham vizual jihatdan bir xil ushlab turadi.
export const TEST_STYLES = {
  h1: { fontSize: 20, bold: true, margin: [0, 0, 0, 4] },
  subtitle: { fontSize: 12, color: '374151', margin: [0, 0, 0, 2] },
  meta: { fontSize: 10, color: '6B7280', margin: [0, 0, 0, 4] },
  studentInfo: { fontSize: 11, margin: [0, 3, 0, 3] },
  sectionHeader: {
    fontSize: 13,
    bold: true,
    margin: [0, 16, 0, 8],
    color: '1F2937',
  },
  question: { fontSize: 11, bold: true, margin: [0, 10, 0, 4] },
  option: { fontSize: 11, margin: [14, 0, 0, 2] },
}

// test-simple.js va test-quarter.js'da bir xil sarlavha bloki: fan nomi,
// sinf qatori, mavzu va o'quvchi to'ldiradigan maydonlar qatori
// (referens: "Ism-Familiya / Sana / Guruh / Ball" — chop etib qo'lda
// to'ldiriladigan hujjat).
export function buildTestHeader({ title, subjectName, grade, topic, maxScore }) {
  return [
    { text: title ?? 'Test', style: 'h1' },
    { text: `${grade ?? ''}-sinf o'quvchilari uchun`, style: 'subtitle' },
    { text: topic ?? '', style: 'meta' },
    {
      margin: [0, 10, 0, 18],
      table: {
        widths: ['*', '*'],
        body: [
          [
            { text: 'Ism-Familiya: ______________________________', style: 'studentInfo', border: [false, false, false, false] },
            { text: 'Sana: ______________', style: 'studentInfo', border: [false, false, false, false] },
          ],
          [
            { text: `Sinf: ${grade ?? ''}-______`, style: 'studentInfo', border: [false, false, false, false] },
            { text: `Ball: __________ / ${maxScore ?? ''}`, style: 'studentInfo', border: [false, false, false, false] },
          ],
        ],
      },
      layout: 'noBorders',
    },
  ]
}

// Ikki bosqichli savollar bo'limi: "I. Asosiy savollar" (1 ball) va
// "II. Qo'shimcha savollar" (2 ball) — raqamlash tier1'dan tier2'ga
// uzluksiz davom etadi (referens namunadagi kabi).
export function buildTestSections(tier1, tier2) {
  const content = []
  let counter = 0

  const renderQuestion = (question) => {
    counter += 1
    content.push({ text: `${counter}. ${question.text}`, style: 'question' })
    for (const [i, option] of (question.options ?? []).entries()) {
      content.push({ text: `${LETTERS[i] ?? i}) ${option}`, style: 'option' })
    }
  }

  if ((tier1 ?? []).length) {
    content.push({
      text: `I. Asosiy savollar (har biri 1 ball)`,
      style: 'sectionHeader',
    })
    tier1.forEach(renderQuestion)
  }

  if ((tier2 ?? []).length) {
    content.push({
      text: `II. Qo'shimcha savollar (har biri 2 ball)`,
      style: 'sectionHeader',
    })
    tier2.forEach(renderQuestion)
  }

  return content
}
