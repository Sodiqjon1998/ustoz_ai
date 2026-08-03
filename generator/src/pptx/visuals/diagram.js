import { Resvg } from '@resvg/resvg-js'

// Diagramma maketlari (cards, cycle) uchun umumiy yordamchilar.
//
// Sarlavha, raqam doirasi, pastki tasma va chekka chizig'i har doim NATIVE
// (pptxgenjs) chiziladi — shunda ular boshqa slaydlar bilan bir xil ko'rinadi
// va PowerPoint'da tahrirlanadi. Faqat diagrammaning O'ZI shu yerda SVG sifatida
// chizilib, PNG'ga o'giriladi va slaydning kontent qutisiga rasm bo'lib qo'yiladi.
//
// Kontent qutisi (dyuymda): sarlavha ostidagi chiziqdan (y≈0.9) pastki
// tasmagacha (y=5.3). Rasm shu qutiga sig'adi.
export const DIAGRAM_BOX = { x: 0.5, y: 0.95, w: 9.0, h: 4.2 }

// SVG viewBox — DIAGRAM_BOX nisbatiga mos (9.0 x 4.2 dyuym → 900 x 420 px).
export const VB_W = 900
export const VB_H = 420

export function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

// SVG'da avtomatik o'rash yo'q — matnni taxminiy belgi soni bo'yicha qatorlarga
// bo'lamiz. maxChars shrift o'lchamiga qarab chaqiruvchi tomonidan beriladi.
export function wrapText(text, maxChars) {
  const words = String(text ?? '').split(/\s+/).filter(Boolean)
  const lines = []
  let cur = ''
  for (const w of words) {
    if ((cur + ' ' + w).trim().length > maxChars && cur) {
      lines.push(cur.trim())
      cur = w
    } else {
      cur = (cur + ' ' + w).trim()
    }
  }
  if (cur) lines.push(cur.trim())
  return lines
}

// Kompozitsiya (theme + o'lcham) bir xil bo'lsa rasterizatsiya takrorlanmasin.
const cache = new Map()

/**
 * SVG matnini PNG data-URI ("image/png;base64,...") ga o'giradi.
 * @param {string} svg to'liq <svg>...</svg>
 * @param {string} cacheKey bir xil natija uchun kalit (null bo'lsa keshlanmaydi)
 * @param {number} pxWidth chiqish eni (balandlik nisbat bo'yicha)
 */
export function svgToPng(svg, cacheKey = null, pxWidth = 1800) {
  if (cacheKey && cache.has(cacheKey)) {
    return cache.get(cacheKey)
  }

  const png = new Resvg(svg, { fitTo: { mode: 'width', value: pxWidth } })
    .render()
    .asPng()

  const data = `image/png;base64,${png.toString('base64')}`
  if (cacheKey) cache.set(cacheKey, data)

  return data
}
