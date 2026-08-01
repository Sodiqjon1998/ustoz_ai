import { addBottomBar, addEdgeStripe, SLIDE_W } from './shared.js'

// Namunadagi muqova: to'q fon, chap chekkada aksent chizig'i, markazlashgan
// uch qator (sarlavha / fan qatori / hook) va pastda kengligi bo'ylab tasma.
// Muqovada rasm yo'q — namunada ham yo'q, matn tipografiyasi yetarli.

// Mavzu nomi uzun bo'lsa 46pt ikki qatorga ham sig'maydi — uzunlikka qarab
// kichraytiriladi, shunda quyidagi fan qatori ustiga chiqib ketmaydi.
function titleFontSize(title) {
  const n = (title ?? '').length
  if (n <= 24) return 46
  if (n <= 40) return 38
  if (n <= 60) return 32
  return 26
}

/**
 * @param {import('pptxgenjs')} pptx
 * @param {{title: string, subjectLine?: string, hook?: string, metaLine?: string, notes?: string}} slide
 * @param {object} theme themes/index.js palitrasi
 */
export function buildTitleSlide(pptx, slide, theme) {
  const s = pptx.addSlide()

  s.background = { color: theme.deep }

  addEdgeStripe(s, { color: theme.accent, width: 0.12 })

  s.addText(slide.title ?? '', {
    x: 0.4,
    y: 1.1,
    w: SLIDE_W - 0.8,
    h: 1.5,
    fontFace: theme.headFont,
    fontSize: titleFontSize(slide.title),
    bold: true,
    color: 'FFFFFF',
    align: 'center',
    valign: 'middle',
  })

  if (slide.subjectLine) {
    s.addText(slide.subjectLine, {
      x: 0.4,
      y: 2.75,
      w: SLIDE_W - 0.8,
      h: 0.65,
      fontFace: theme.headFont,
      fontSize: 24,
      color: theme.accent,
      align: 'center',
      valign: 'middle',
    })
  }

  if (slide.hook) {
    s.addText(slide.hook, {
      x: 0.8,
      y: 3.55,
      w: SLIDE_W - 1.6,
      h: 0.6,
      fontFace: theme.bodyFont,
      fontSize: 15,
      color: theme.soft,
      align: 'center',
      valign: 'middle',
    })
  }

  addBottomBar(s, {
    text: slide.metaLine,
    barColor: theme.brand,
    textColor: 'FFFFFF',
    font: theme.bodyFont,
    fontSize: 11,
  })

  if (slide.notes) {
    s.addNotes(slide.notes)
  }

  return s
}
