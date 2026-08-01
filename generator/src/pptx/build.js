import pptxgenjs from 'pptxgenjs'
import { getTheme } from './themes/index.js'
import { buildTitleSlide } from './layouts/title.js'
import { buildBulletsSlide } from './layouts/bullets.js'
import { buildProseSlide } from './layouts/prose.js'
import { buildChartSlide } from './layouts/chart.js'
import { buildProcessSlide } from './layouts/process.js'
import { buildCompareSlide } from './layouts/compare.js'

// "title" — sarlavha slaydi. Qolganlari Gemini har bir kontent slaydi uchun
// mazmuniga qarab tanlaydigan uslublar:
//   bullets/prose — faktlar ro'yxati vs qisqa hikoya matni
//   chart         — haqiqiy raqamli ma'lumot bo'lsa, ustunli/doiraviy diagramma
//   process       — bosqichma-bosqich jarayon diagrammasi
//   compare       — ikki ustunli taqqoslash paneli
const layoutBuilders = {
  title: buildTitleSlide,
  bullets: buildBulletsSlide,
  prose: buildProseSlide,
  chart: buildChartSlide,
  process: buildProcessSlide,
  compare: buildCompareSlide,
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

  const slides = presentation.slides ?? []

  // pageNumber — slayddagi raqam doirasi uchun (muqova bilan birga sanaladi).
  // contentIndex — illyustratsiya tanlash uchun: birinchi kontent slaydi
  // fanning asosiy chizmasini olsin (biologiyada barg, adabiyotda kitob...).
  let contentIndex = 0

  slides.forEach((slide, index) => {
    const builder = layoutBuilders[slide.layout]
    if (!builder) {
      throw new Error(`Noma'lum slayd maketi: "${slide.layout}"`)
    }

    builder(pptx, slide, theme, { pageNumber: index + 1, contentIndex })

    if (slide.layout !== 'title') {
      contentIndex += 1
    }
  })

  return pptx.write({ outputType: 'nodebuffer' })
}
