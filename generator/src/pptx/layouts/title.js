/**
 * "title" maketi — prezentatsiyaning birinchi slaydi.
 * @param {import('pptxgenjs')} pptx
 * @param {{title: string, subtitle?: string, notes?: string}} slide
 * @param {{primary: string, accent: string, font: string}} theme
 */
export function buildTitleSlide(pptx, slide, theme) {
  const s = pptx.addSlide()

  s.background = { color: theme.primary }

  s.addText(slide.title ?? '', {
    x: 0.6,
    y: 2.0,
    w: '85%',
    h: 1.5,
    fontFace: theme.font,
    fontSize: 40,
    bold: true,
    color: 'FFFFFF',
    align: 'left',
  })

  if (slide.subtitle) {
    s.addText(slide.subtitle, {
      x: 0.6,
      y: 3.4,
      w: '85%',
      h: 0.8,
      fontFace: theme.font,
      fontSize: 20,
      color: 'FFFFFF',
      align: 'left',
      transparency: 15,
    })
  }

  if (slide.notes) {
    s.addNotes(slide.notes)
  }

  return s
}
