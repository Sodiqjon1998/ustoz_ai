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
