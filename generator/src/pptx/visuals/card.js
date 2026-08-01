import { Resvg } from '@resvg/resvg-js'
import { pickIcon } from './icons.js'

// Namunadagi har bir kontent slaydda o'ng tomonni to'liq egallagan
// fotosurat bor (x=5.90 y=0.18 w=3.85 h=5.15). Biz surat generatsiya qila
// olmaymiz va tashqi tarmoqqa ham chiqmaymiz, shuning uchun o'sha o'lchamda
// SVG illyustratsiya kartasi chiziladi va PNG'ga o'giriladi (@resvg/resvg-js).
//
// Karta tarkibi: fan rangidagi gradient fon + ingichka ramka + katta yumshoq
// doira + fan mavzusiga mos chiziqli chizma + nuqtali to'r aksenti.
// Slayd raqamiga qarab 6 xil kompozitsiya varianti almashib turadi, shuning
// uchun ketma-ket slaydlar bir xil ko'rinmaydi.

const VB_W = 385
const VB_H = 515
const PX_W = 770

// Bir xil (mavzu + variant) uchun rasterizatsiya qayta bajarilmasin.
const cache = new Map()

const VARIANTS = [
  { blobX: 300, blobY: 92, blobR: 150, dotX: 44, dotY: 398, angle: 155 },
  { blobX: 80, blobY: 430, blobR: 165, dotX: 268, dotY: 58, angle: 25 },
  { blobX: 330, blobY: 400, blobR: 140, dotX: 44, dotY: 58, angle: 200 },
  { blobX: 56, blobY: 100, blobR: 155, dotX: 268, dotY: 398, angle: 340 },
  { blobX: 192, blobY: 470, blobR: 170, dotX: 44, dotY: 58, angle: 90 },
  { blobX: 192, blobY: 44, blobR: 160, dotX: 268, dotY: 398, angle: 270 },
]

function dotGrid(x, y, color) {
  const dots = []
  for (let r = 0; r < 4; r += 1) {
    for (let c = 0; c < 4; c += 1) {
      dots.push(`<circle cx="${x + c * 24}" cy="${y + r * 24}" r="3.2" fill="${color}"/>`)
    }
  }
  return `<g opacity="0.4">${dots.join('')}</g>`
}

function buildSvg(theme, seed) {
  const v = VARIANTS[seed % VARIANTS.length]
  const deep = `#${theme.deep}`
  const brand = `#${theme.brand}`
  const accent = `#${theme.accent}`
  const soft = `#${theme.soft}`

  // Ikonka 200x200 viewBox'da chizilgan — kartaning markaziga 1.05 masshtabda.
  const icon = pickIcon(theme.icons, seed).replaceAll('data-solid="1"', `fill="${soft}" stroke="none"`)

  const rad = (v.angle * Math.PI) / 180
  const x1 = 50 + Math.cos(rad) * 50
  const y1 = 50 + Math.sin(rad) * 50
  const x2 = 50 - Math.cos(rad) * 50
  const y2 = 50 - Math.sin(rad) * 50

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VB_W} ${VB_H}" width="${VB_W}" height="${VB_H}">
  <defs>
    <linearGradient id="bg" x1="${x1}%" y1="${y1}%" x2="${x2}%" y2="${y2}%">
      <stop offset="0%" stop-color="${brand}"/>
      <stop offset="100%" stop-color="${deep}"/>
    </linearGradient>
    <clipPath id="frame"><rect x="0" y="0" width="${VB_W}" height="${VB_H}"/></clipPath>
  </defs>
  <g clip-path="url(#frame)">
    <rect x="0" y="0" width="${VB_W}" height="${VB_H}" fill="url(#bg)"/>
    <circle cx="${v.blobX}" cy="${v.blobY}" r="${v.blobR}" fill="${accent}" opacity="0.13"/>
    <circle cx="${v.blobX}" cy="${v.blobY}" r="${v.blobR * 0.62}" fill="${accent}" opacity="0.1"/>
    ${dotGrid(v.dotX, v.dotY, accent)}
  </g>
  <rect x="17" y="17" width="${VB_W - 34}" height="${VB_H - 34}" fill="none" stroke="${accent}" stroke-width="1.6" opacity="0.45"/>
  <g transform="translate(87.5 152) scale(1.05)" fill="none" stroke="${soft}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">
    ${icon}
  </g>
  <rect x="152" y="404" width="81" height="3" fill="${accent}"/>
</svg>`
}

/**
 * Slayd uchun illyustratsiya kartasini PNG base64 ko'rinishida qaytaradi.
 * @param {object} theme themes/index.js dagi palitra
 * @param {number} seed slayd raqami (kompozitsiya varianti shunga bog'liq)
 * @returns {string} pptxgenjs addImage uchun "image/png;base64,..." satri
 */
export function illustrationCard(theme, seed) {
  const key = `${theme.icons}|${seed % VARIANTS.length}`
  if (cache.has(key)) {
    return cache.get(key)
  }

  const png = new Resvg(buildSvg(theme, seed), {
    fitTo: { mode: 'width', value: PX_W },
  })
    .render()
    .asPng()

  const data = `image/png;base64,${png.toString('base64')}`
  cache.set(key, data)

  return data
}

// Vizual tekshiruv uchun (test skriptlari SVG'ni to'g'ridan-to'g'ri oladi).
export { buildSvg as _buildSvgForTest }
