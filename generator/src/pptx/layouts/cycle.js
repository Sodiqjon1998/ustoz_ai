import { addBottomBar, addEdgeStripe, addHeading, addNumberBadge, WIDE_W } from './shared.js'
import { pickIcon } from '../visuals/icons.js'
import { DIAGRAM_BOX, esc, svgToPng, VB_H, VB_W, wrapText } from '../visuals/diagram.js'

/**
 * "cycle" maketi — aylanma jarayon (Цикл): tugunlar doira bo'ylab joylashadi va
 * soat mili yo'nalishidagi yoy-o'qlar bilan bog'lanadi. Takrorlanuvchi jarayonlar
 * uchun ("suvning aylanishi", hayot sikli, qayta aloqa halqasi). "process"dan
 * farqi — bu yopiq halqa: oxirgi qadam yana birinchisiga qaytadi.
 *
 * Ma'lumot "process" bilan bir xil `steps` massividan olinadi (tugun yorlig'i =
 * step.title), shuning uchun Gemini yangi maydon to'ldirmaydi.
 */

const CX = VB_W / 2
const CY = VB_H / 2 + 4
// Radius shunday tanlanganki, tepa/past tugunlarning tashqi yorlig'i ham 420px
// balandlikdagi viewBox ichiga sig'sin: CY - (RING_R + NODE_R + LABEL_OFF) > 0.
const RING_R = 122
const NODE_R = 42
const LABEL_OFF = 20

function polar(r, angleDeg) {
  const a = (angleDeg * Math.PI) / 180
  return [CX + r * Math.cos(a), CY + r * Math.sin(a)]
}

function arcArrow(ringR, a1, a2, color) {
  const gap = 15
  const start = polar(ringR, a1 + gap)
  const [bx, by] = polar(ringR, a2 - gap)
  const ta = ((a2 - gap) * Math.PI) / 180
  const tx = Math.cos(ta + Math.PI / 2)
  const ty = Math.sin(ta + Math.PI / 2)
  const ah = 12
  const aw = 7.5
  const p1 = [bx + tx * ah - ty * aw, by + ty * ah + tx * aw]
  const p2 = [bx + tx * ah + ty * aw, by + ty * ah - tx * aw]
  return `<path d="M ${start[0].toFixed(1)} ${start[1].toFixed(1)} A ${ringR} ${ringR} 0 0 1 ${bx.toFixed(1)} ${by.toFixed(1)}" fill="none" stroke="${color}" stroke-width="3.5" stroke-linecap="round" opacity="0.5"/>
    <path d="M ${bx.toFixed(1)} ${by.toFixed(1)} L ${p1[0].toFixed(1)} ${p1[1].toFixed(1)} L ${p2[0].toFixed(1)} ${p2[1].toFixed(1)} Z" fill="${color}"/>`
}

function buildCycleSvg(theme, steps) {
  const n = steps.length
  const brand = `#${theme.brand}`
  const deep = `#${theme.deep}`
  const accent = `#${theme.accent}`
  const angles = steps.map((_, i) => -90 + (360 / n) * i)

  let arrows = ''
  for (let i = 0; i < n; i += 1) {
    const a1 = angles[i]
    let a2 = angles[(i + 1) % n]
    if (a2 <= a1) a2 += 360
    arrows += arcArrow(RING_R, a1, a2, brand)
  }

  let nodes = ''
  steps.forEach((step, i) => {
    const [x, y] = polar(RING_R, angles[i])
    const icon = pickIcon(theme.icons, i).replaceAll('data-solid="1"', `fill="#${theme.cream}" stroke="none"`)
    const scale = (NODE_R * 1.15) / 200
    const tx = x - (200 * scale) / 2
    const ty = y - (200 * scale) / 2

    const cos = Math.cos((angles[i] * Math.PI) / 180)
    const anchor = Math.abs(cos) < 0.3 ? 'middle' : cos < 0 ? 'end' : 'start'
    const [lx, ly] = polar(RING_R + NODE_R + LABEL_OFF, angles[i])
    const lines = wrapText(step.title, 16).slice(0, 2)
    const tsp = lines
      .map((l, k) => `<tspan x="${lx.toFixed(1)}" dy="${k === 0 ? 0 : 18}">${esc(l)}</tspan>`)
      .join('')

    nodes += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${NODE_R + 6}" fill="#FFFFFF"/>
      <circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${NODE_R}" fill="url(#node)"/>
      <g transform="translate(${tx.toFixed(1)} ${ty.toFixed(1)}) scale(${scale.toFixed(3)})" fill="none" stroke="#${theme.cream}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round">${icon}</g>
      <circle cx="${(x + NODE_R * 0.72).toFixed(1)}" cy="${(y - NODE_R * 0.72).toFixed(1)}" r="14" fill="${accent}"/>
      <text x="${(x + NODE_R * 0.72).toFixed(1)}" y="${(y - NODE_R * 0.72).toFixed(1)}" font-family="Georgia, serif" font-size="14" font-weight="bold" fill="${deep}" text-anchor="middle" dominant-baseline="central">${i + 1}</text>
      <text x="${lx.toFixed(1)}" y="${(ly - (lines.length - 1) * 9).toFixed(1)}" font-family="Calibri, sans-serif" font-size="15" font-weight="bold" fill="${deep}" text-anchor="${anchor}" dominant-baseline="central">${tsp}</text>`
  })

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VB_W} ${VB_H}" width="${VB_W}" height="${VB_H}">
  <defs>
    <linearGradient id="node" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${brand}"/>
      <stop offset="100%" stop-color="${deep}"/>
    </linearGradient>
  </defs>
  ${arrows}
  ${nodes}
</svg>`
}

export function buildCycleSlide(pptx, slide, theme, meta = {}) {
  const s = pptx.addSlide()
  s.background = { color: theme.cream }

  addEdgeStripe(s, { color: theme.brand })
  addNumberBadge(s, { pageNumber: meta.pageNumber ?? 0, theme })
  addHeading(s, { title: slide.title, theme, width: WIDE_W, underlineWidth: WIDE_W })

  const steps = (slide.steps ?? []).filter((st) => st && st.title).slice(0, 6)

  if (steps.length >= 3) {
    const svg = buildCycleSvg(theme, steps)
    const key = `cycle|${theme.icons}|${steps.map((st) => st.title).join('|')}`
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
