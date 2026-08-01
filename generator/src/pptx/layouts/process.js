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
 * "process" maketi — bosqichma-bosqich jarayon diagrammasi: raqamlangan
 * doiralar vertikal bog'lovchi chiziq bilan ulanadi, har biriga qadam
 * sarlavhasi va izohi yoziladi.
 *
 * Bu maket son talab qilmaydi (grafikdan farqli), shuning uchun raqamli
 * ma'lumoti yo'q mavzularda ham vizual xilma-xillik beradi — o'ylab
 * topilgan statistika yozish xavfisiz.
 */

const TOP = 1.0
const BOTTOM = 5.1

function stepFontSizes(count) {
  if (count <= 3) return { head: 14, body: 12 }
  if (count === 4) return { head: 13, body: 11 }
  return { head: 12, body: 10 }
}

export function buildProcessSlide(pptx, slide, theme, meta = {}) {
  const s = pptx.addSlide()

  s.background = { color: theme.cream }

  addEdgeStripe(s, { color: theme.brand })
  addNumberBadge(s, { pageNumber: meta.pageNumber ?? 0, theme })
  addHeading(s, { title: slide.title, theme, width: WIDE_W, underlineWidth: WIDE_W })

  const steps = (slide.steps ?? []).filter((st) => st && st.title).slice(0, 5)

  if (steps.length === 0) {
    return s
  }

  const { head, body } = stepFontSizes(steps.length)
  const rowH = (BOTTOM - TOP) / steps.length
  const badge = 0.46
  const badgeX = TEXT_X + 0.05

  // Doiralarni bog'lab turuvchi vertikal chiziq — birinchi va oxirgi
  // doiraning markazlari orasida.
  if (steps.length > 1) {
    const firstCy = TOP + rowH / 2
    const lastCy = TOP + rowH * (steps.length - 1) + rowH / 2

    s.addShape('rect', {
      x: badgeX + badge / 2 - 0.015,
      y: firstCy,
      w: 0.03,
      h: lastCy - firstCy,
      fill: { color: theme.accent },
      line: { type: 'none' },
    })
  }

  steps.forEach((step, i) => {
    const rowY = TOP + rowH * i
    const cy = rowY + rowH / 2

    s.addShape('ellipse', {
      x: badgeX,
      y: cy - badge / 2,
      w: badge,
      h: badge,
      fill: { color: theme.brand },
      line: { color: theme.cream, pt: 2.5 },
    })

    s.addText(String(i + 1), {
      x: badgeX,
      y: cy - badge / 2,
      w: badge,
      h: badge,
      fontFace: theme.headFont,
      fontSize: 13,
      bold: true,
      color: 'FFFFFF',
      align: 'center',
      valign: 'middle',
    })

    const textX = badgeX + badge + 0.28
    const textW = SLIDE_W - textX - 0.5

    const parts = [
      { text: step.title, options: { fontSize: head, bold: true, color: theme.deep, breakLine: !!step.detail } },
    ]

    if (step.detail) {
      parts.push({ text: step.detail, options: { fontSize: body, color: theme.body } })
    }

    s.addText(parts, {
      x: textX,
      y: rowY + 0.06,
      w: textW,
      h: rowH - 0.12,
      fontFace: theme.bodyFont,
      align: 'left',
      valign: 'middle',
      lineSpacingMultiple: 1.15,
    })
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
