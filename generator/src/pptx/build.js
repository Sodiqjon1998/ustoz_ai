import pptxgenjs from 'pptxgenjs'
import { getTheme } from './themes/index.js'
import { buildTitleSlide } from './layouts/title.js'
import { buildBulletsSlide } from './layouts/bullets.js'

// "title" va "bullets" maketlari ishlaydi. Qolgan 10 ta maket (objectives,
// two_col, image_right, image_full, table, chart, quote, quiz, activity,
// summary) shu ro'yxatga xuddi shu naqsh bilan qo'shiladi —
// docs/01-ARXITEKTURA.md § 4 va docs/03-AI-KESH-GENERATSIYA.md § 4.3
const layoutBuilders = {
  title: buildTitleSlide,
  bullets: buildBulletsSlide,
}

/**
 * @param {{theme: string, slides: Array<object>}} presentation
 * @returns {Promise<Buffer>}
 */
export async function buildPptx(presentation) {
  const pptx = new pptxgenjs()
  const theme = getTheme(presentation.theme)

  pptx.defineLayout({ name: 'USTOZ_16x9', width: 10, height: 5.63 })
  pptx.layout = 'USTOZ_16x9'

  for (const slide of presentation.slides ?? []) {
    const builder = layoutBuilders[slide.layout]
    if (!builder) {
      throw new Error(`Noma'lum slayd maketi: "${slide.layout}"`)
    }
    builder(pptx, slide, theme)
  }

  return pptx.write({ outputType: 'nodebuffer' })
}
