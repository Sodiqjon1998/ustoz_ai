import { illustrationCard } from '../visuals/card.js'
import {
  addBottomBar,
  addEdgeStripe,
  addHeading,
  addNumberBadge,
  bodyFontSize,
  IMAGE_BOX,
  TEXT_W,
  TEXT_X,
} from './shared.js'

/**
 * "bullets" maketi — "prose" bilan bir xil to'r (namunadagidek), farqi faqat
 * matn punktlar ro'yxati ko'rinishida: faktlar, qadamlar, formulalar uchun.
 * @param {import('pptxgenjs')} pptx
 * @param {{title: string, items?: string[], footer?: string, notes?: string}} slide
 * @param {object} theme themes/index.js palitrasi
 * @param {{ pageNumber?: number }} [meta]
 */
export function buildBulletsSlide(pptx, slide, theme, meta = {}) {
  const s = pptx.addSlide()
  const page = meta.pageNumber ?? 0

  s.background = { color: theme.cream }

  addEdgeStripe(s, { color: theme.brand })
  addNumberBadge(s, { pageNumber: page, theme })
  addHeading(s, { title: slide.title, theme })

  s.addImage({ data: illustrationCard(theme, meta.contentIndex ?? 0), ...IMAGE_BOX })

  const items = (slide.items ?? []).filter(Boolean)

  if (items.length > 0) {
    const bullets = items.map((text, i) => ({
      text,
      options: {
        bullet: { code: '2022', indent: 18 },
        breakLine: i < items.length - 1,
        paraSpaceAfter: 11,
      },
    }))

    s.addText(bullets, {
      x: TEXT_X,
      y: 0.95,
      w: TEXT_W,
      h: 4.1,
      fontFace: theme.bodyFont,
      fontSize: bodyFontSize(items),
      color: theme.body,
      align: 'left',
      valign: 'top',
      lineSpacingMultiple: 1.25,
    })
  }

  addBottomBar(s, {
    text: slide.footer,
    barColor: theme.deep,
    textColor: theme.accent,
    font: theme.bodyFont,
    fontSize: 10,
  })

  if (slide.notes) {
    s.addNotes(slide.notes)
  }

  return s
}
