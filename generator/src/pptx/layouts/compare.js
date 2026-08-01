import {
  addBottomBar,
  addEdgeStripe,
  addHeading,
  addNumberBadge,
  SLIDE_W,
  TEXT_X,
  WIDE_W,
} from './shared.js'

/**
 * "compare" maketi — ikki ustunli taqqoslash paneli: "afzallik / kamchilik",
 * "oldin / keyin", "to'g'ri / noto'g'ri" kabi qarama-qarshi juftliklar uchun.
 * Grafikdagi kabi son talab qilmaydi.
 */

const TOP = 1.0
const PANEL_H = 4.05
const GAP = 0.3
const HEAD_H = 0.5

function itemFontSize(items) {
  const chars = items.join(' ').length
  if (chars <= 170) return 12
  if (chars <= 240) return 11
  return 10
}

function addColumn(slide, theme, { x, w, heading, items, headColor }) {
  slide.addShape('rect', {
    x,
    y: TOP,
    w,
    h: PANEL_H,
    fill: { color: 'FFFFFF' },
    line: { color: theme.accent, pt: 1 },
  })

  slide.addShape('rect', {
    x,
    y: TOP,
    w,
    h: HEAD_H,
    fill: { color: headColor },
    line: { type: 'none' },
  })

  slide.addText(heading ?? '', {
    x: x + 0.12,
    y: TOP,
    w: w - 0.24,
    h: HEAD_H,
    fontFace: theme.headFont,
    fontSize: 13,
    bold: true,
    color: 'FFFFFF',
    align: 'center',
    valign: 'middle',
  })

  const list = (items ?? []).filter(Boolean).slice(0, 6)

  if (list.length === 0) return

  const bullets = list.map((text, i) => ({
    text,
    options: {
      bullet: { code: '2022', indent: 16 },
      breakLine: i < list.length - 1,
      paraSpaceAfter: 9,
    },
  }))

  slide.addText(bullets, {
    x: x + 0.22,
    y: TOP + HEAD_H + 0.16,
    w: w - 0.44,
    h: PANEL_H - HEAD_H - 0.32,
    fontFace: theme.bodyFont,
    fontSize: itemFontSize(list),
    color: theme.body,
    align: 'left',
    valign: 'top',
    lineSpacingMultiple: 1.2,
  })
}

export function buildCompareSlide(pptx, slide, theme, meta = {}) {
  const s = pptx.addSlide()

  s.background = { color: theme.cream }

  addEdgeStripe(s, { color: theme.brand })
  addNumberBadge(s, { pageNumber: meta.pageNumber ?? 0, theme })
  addHeading(s, { title: slide.title, theme, width: WIDE_W, underlineWidth: WIDE_W })

  const compare = slide.compare ?? {}
  const totalW = SLIDE_W - TEXT_X - 0.5
  const colW = (totalW - GAP) / 2

  addColumn(s, theme, {
    x: TEXT_X,
    w: colW,
    heading: compare.left?.heading,
    items: compare.left?.items,
    headColor: theme.brand,
  })

  addColumn(s, theme, {
    x: TEXT_X + colW + GAP,
    w: colW,
    heading: compare.right?.heading,
    items: compare.right?.items,
    headColor: theme.deep,
  })

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
