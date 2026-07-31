/**
 * "bullets" maketi — sarlavha + ro'yxat shaklidagi kontent slaydi.
 * @param {import('pptxgenjs')} pptx
 * @param {{title: string, bullets?: string[], notes?: string}} slide
 * @param {{primary: string, accent: string, font: string}} theme
 */
export function buildBulletsSlide(pptx, slide, theme) {
  const s = pptx.addSlide()

  s.background = { color: 'FFFFFF' }

  s.addShape('rect', {
    x: 0,
    y: 0,
    w: '100%',
    h: 0.9,
    fill: { color: theme.primary },
  })

  s.addText(slide.title ?? '', {
    x: 0.5,
    y: 0,
    w: '90%',
    h: 0.9,
    fontFace: theme.font,
    fontSize: 24,
    bold: true,
    color: 'FFFFFF',
    valign: 'middle',
  })

  const bullets = (slide.bullets ?? []).map((text) => ({
    text,
    options: { bullet: { code: '2022', indent: 20 }, color: '1F2937' },
  }))

  if (bullets.length > 0) {
    s.addText(bullets, {
      x: 0.6,
      y: 1.3,
      w: '85%',
      h: 3.9,
      fontFace: theme.font,
      fontSize: 16,
      valign: 'top',
      lineSpacingMultiple: 1.3,
    })
  }

  if (slide.notes) {
    s.addNotes(slide.notes)
  }

  return s
}
