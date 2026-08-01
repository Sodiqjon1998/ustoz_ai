// Namunadan (Prezentatsiya.pptx) aynan o'lchab olingan to'r. Har bir raqam
// o'sha fayldagi shakl koordinatalarining o'zi — "taxminan shunga o'xshash"
// emas, bir xil:
//
//   chap chekka chizig'i   x=0    w=0.09 (muqovada 0.12), balandligi to'liq
//   raqam doirasi          x=0.22 y=0.15 0.50x0.50
//   sarlavha               x=0.87 y=0.15 w=4.90 h=0.55
//   sarlavha osti chizig'i x=0.87 y=0.78 w=4.85 h=0.04
//   matn                   x=0.87 y=0.95 w=4.85 h=4.10
//   rasm                   x=5.90 y=0.18 w=3.85 h=5.15
//   pastki tasma           x=0    y=5.30 w=10   h=0.33

export const SLIDE_W = 10
export const SLIDE_H = 5.63

export const TEXT_X = 0.87
export const TEXT_W = 4.85
export const TITLE_W = 4.9

export const IMAGE_BOX = { x: 5.9, y: 0.18, w: 3.85, h: 5.15 }
export const BAR = { y: 5.3, h: 0.33 }

export function addEdgeStripe(slide, { color, width = 0.09 }) {
  slide.addShape('rect', {
    x: 0,
    y: 0,
    w: width,
    h: SLIDE_H,
    fill: { color },
    line: { type: 'none' },
  })
}

export function addBottomBar(slide, { text, barColor, textColor, font, fontSize = 10 }) {
  slide.addShape('rect', {
    x: 0,
    y: BAR.y,
    w: SLIDE_W,
    h: BAR.h,
    fill: { color: barColor },
    line: { type: 'none' },
  })

  if (!text) return

  slide.addText(text, {
    x: 0,
    y: BAR.y + 0.02,
    w: SLIDE_W,
    h: BAR.h - 0.03,
    fontFace: font,
    fontSize,
    color: textColor,
    align: 'center',
    valign: 'middle',
  })
}

export function addNumberBadge(slide, { pageNumber, theme }) {
  if (!pageNumber) return

  slide.addShape('ellipse', {
    x: 0.22,
    y: 0.15,
    w: 0.5,
    h: 0.5,
    fill: { color: theme.brand },
    line: { type: 'none' },
  })

  slide.addText(String(pageNumber), {
    x: 0.22,
    y: 0.15,
    w: 0.5,
    h: 0.5,
    fontFace: theme.headFont,
    fontSize: 15,
    bold: true,
    color: 'FFFFFF',
    align: 'center',
    valign: 'middle',
  })
}

// Namunada sarlavha bir qatorga sig'adi (22pt). Bizda mavzu nomi uzunroq
// bo'lishi mumkin, shuning uchun uzunlikka qarab kichraytiriladi — aks holda
// matn ostidagi ingichka chiziq ustiga chiqib ketadi.
function titleFontSize(title) {
  const n = (title ?? '').length
  if (n <= 26) return 22
  if (n <= 40) return 19
  if (n <= 58) return 17
  return 15
}

// Grafik/diagramma maketlari sarlavhani slayd bo'ylab cho'zadi (o'ng tomonda
// illyustratsiya kartasi yo'q), shuning uchun kenglik parametr sifatida beriladi.
export const WIDE_W = SLIDE_W - TEXT_X - 0.4

export function addHeading(slide, { title, theme, width = TITLE_W, underlineWidth = TEXT_W }) {
  slide.addText(title ?? '', {
    x: TEXT_X,
    y: 0.13,
    w: width,
    h: 0.6,
    fontFace: theme.headFont,
    fontSize: titleFontSize(title),
    bold: true,
    color: theme.deep,
    align: 'left',
    valign: 'middle',
  })

  slide.addShape('rect', {
    x: TEXT_X,
    y: 0.78,
    w: underlineWidth,
    h: 0.04,
    fill: { color: theme.accent },
    line: { type: 'none' },
  })
}

// Matn qutisi 4.85 x 4.10 — namunadagidek 15pt da ~420 belgi sig'adi.
// Undan uzunroq mazmun uchun shrift bosqichma-bosqich kichrayadi, shunda
// matn qutidan oshib ketmaydi.
export function bodyFontSize(paragraphs, base = 15) {
  const chars = paragraphs.join(' ').length
  if (chars <= 420) return base
  if (chars <= 560) return base - 1
  if (chars <= 700) return base - 2
  if (chars <= 860) return base - 3
  return base - 4
}
