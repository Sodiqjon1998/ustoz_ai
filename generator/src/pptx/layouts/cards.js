import { addBottomBar, addEdgeStripe, addHeading, addNumberBadge, WIDE_W } from './shared.js'
import { pickIcon } from '../visuals/icons.js'
import { DIAGRAM_BOX, esc, svgToPng, VB_H, VB_W, wrapText } from '../visuals/diagram.js'

/**
 * "cards" maketi — tushuncha kartochkalari to'ri. Har kartochkada fan ikonkasi,
 * atama sarlavhasi va qisqa ta'rif. Zerikarli matn ro'yxati o'rniga vizual to'r
 * beradi; son talab qilmaydi, shuning uchun har mavzuda xavfsiz.
 *
 * Kartalar soniga qarab to'r: 2 → 2×1, 3 → 3×1, 4 → 2×2, 5-6 → 3×2.
 */

function gridShape(count) {
  if (count <= 2) return { cols: count, rows: 1 }
  if (count === 3) return { cols: 3, rows: 1 }
  if (count === 4) return { cols: 2, rows: 2 }
  return { cols: 3, rows: 2 }
}

function iconChip(theme, seed, cx, cy, r) {
  const icon = pickIcon(theme.icons, seed).replaceAll('data-solid="1"', `fill="#${theme.cream}" stroke="none"`)
  const scale = (r * 1.5) / 200
  const tx = cx - (200 * scale) / 2
  const ty = cy - (200 * scale) / 2
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#chip)"/>
    <g transform="translate(${tx} ${ty}) scale(${scale})" fill="none" stroke="#${theme.cream}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round">${icon}</g>`
}

function cardSvg(theme, x, y, w, h, seed, title, desc) {
  const chipR = Math.min(30, h * 0.19)
  const chipCx = x + chipR + 12
  const chipCy = y + chipR + 12
  const titleX = chipCx + chipR + 16
  const titleSize = 19
  const descSize = 15

  const titleTspans = wrapText(title, Math.floor((w - (titleX - x) - 16) / (titleSize * 0.42)))
    .slice(0, 2)
    .map((l, i) => `<tspan x="${titleX}" dy="${i === 0 ? 0 : titleSize + 3}">${esc(l)}</tspan>`)
    .join('')

  const descY = chipCy + chipR + 22
  const descTspans = wrapText(desc, Math.floor((w - 40) / (descSize * 0.46)))
    .slice(0, 4)
    .map((l, i) => `<tspan x="${x + 22}" dy="${i === 0 ? 0 : descSize + 5}">${esc(l)}</tspan>`)
    .join('')

  return `<rect x="${x + 3}" y="${y + 4}" width="${w}" height="${h}" rx="18" fill="#000000" opacity="0.07"/>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="18" fill="#FFFFFF" stroke="#${theme.accent}" stroke-width="1.4"/>
    <rect x="${x}" y="${y}" width="6" height="${h}" rx="3" fill="#${theme.brand}"/>
    ${iconChip(theme, seed, chipCx, chipCy, chipR)}
    <text x="${titleX}" y="${y + chipR - 2}" font-family="Georgia, serif" font-size="${titleSize}" font-weight="bold" fill="#${theme.deep}">${titleTspans}</text>
    <text x="${x + 22}" y="${descY}" font-family="Calibri, sans-serif" font-size="${descSize}" fill="#${theme.body}">${descTspans}</text>`
}

function buildCardsSvg(theme, cards) {
  const list = cards.slice(0, 6)
  const { cols, rows } = gridShape(list.length)
  const gx = 26
  const gy = 22
  const padX = 6
  const cardW = (VB_W - padX * 2 - gx * (cols - 1)) / cols
  const cardH = (VB_H - gy * (rows - 1)) / rows

  const cells = list
    .map((c, i) => {
      const col = i % cols
      const row = Math.floor(i / cols)
      const x = padX + col * (cardW + gx)
      const y = row * (cardH + gy)
      return cardSvg(theme, x, y, cardW, cardH, i, c.title, c.desc)
    })
    .join('')

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VB_W} ${VB_H}" width="${VB_W}" height="${VB_H}">
  <defs>
    <linearGradient id="chip" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#${theme.brand}"/>
      <stop offset="100%" stop-color="#${theme.deep}"/>
    </linearGradient>
  </defs>
  ${cells}
</svg>`
}

export function buildCardsSlide(pptx, slide, theme, meta = {}) {
  const s = pptx.addSlide()
  s.background = { color: theme.cream }

  addEdgeStripe(s, { color: theme.brand })
  addNumberBadge(s, { pageNumber: meta.pageNumber ?? 0, theme })
  addHeading(s, { title: slide.title, theme, width: WIDE_W, underlineWidth: WIDE_W })

  const cards = (slide.cards ?? []).filter((c) => c && c.title)

  if (cards.length > 0) {
    const svg = buildCardsSvg(theme, cards)
    const key = `cards|${theme.icons}|${cards.map((c) => c.title).join('|')}`
    s.addImage({ data: svgToPng(svg, key), ...DIAGRAM_BOX })
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
