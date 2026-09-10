import { renderPdf } from './printer.js'

// Tarqatma material — o'quvchi to'ldiradigan RANGLI ish daftari. Har bir o'yin
// (anagramma, moslashtirish, so'z izlash, krossvord) HandoutBuilder'da mavzu
// atamalaridan mexanik yasaladi; bu yerda faqat CHIROYLI chiziladi.
//
// Ranglar sinfga qarab:
//   primary (1-4 sinf)  — yorqin, o'yinbop; har o'yin boshqa rangda (kamalak).
//   senior  (5-11 sinf) — fan palitrasi; bitta uyg'un brend rangi.

// Sahifa geometriyasi — referens shablondan olingan aniq o'lchamlar (pt).
const PAGE_W = 595.28
const PAGE_H = 841.89
const MARGIN = 32
const CONTENT_W = PAGE_W - MARGIN * 2 // 531.3
const COL_W = 255 // ikki ustunli tarqatmada bitta ustun kengligi
const COL2_X = 295 - MARGIN // ikkinchi ustungacha bo'lgan siljish

// Harf katagi: 22x22, qadam 25 (3pt oraliq).
const BOX = 22
const BOX_GAP = 3
const BOX_PITCH = BOX + BOX_GAP

// pdfmake'da 11pt Roboto qatorining haqiqiy balandligi (o'lchab topilgan) —
// harflarni katak ichida markazlash va qator balandligini saqlash uchun kerak.
const OVERLAY_LINE_H = 12.9

const CELL = 16 // so'z izlash / krossvord grid katagi

// Varaqdagi STATIK yorliqlar dars tiliga tarjima qilinadi — atama/ta'riflar
// AI'dan o'sha tilda keladi, lekin bu satrlar qattiq kodlangan edi.
// ky/tg/kaa uchun ataylab tarjima yo'q — o'zbekchaga qaytadi.
const LABELS = {
  uz: {
    date: 'Sana:',
    name: 'Ism:',
    findWords: 'Topiladigan so’zlar:',
    cipherKey: 'Shifr kaliti:',
    yes: 'T',
    no: 'N',
    front: 'OLD TOMON',
    back: 'ORQA TOMON',
    answerKey: 'Javoblar kaliti (o’qituvchi uchun)',
    noGames: 'Bu dars uchun o’yinli topshiriqlar tayyorlanmadi.',
    footer: 'ustoz.ai orqali tayyorlangan',
    across: 'Gorizontal',
    down: 'Vertikal',
    grammar: ['Shakl', 'Tuzilma', 'Misol'],
  },
  ru: {
    date: 'Дата:',
    name: 'Имя:',
    findWords: 'Найдите слова:',
    cipherKey: 'Ключ шифра:',
    yes: 'В',
    no: 'Н',
    front: 'ЛИЦЕВАЯ СТОРОНА',
    back: 'ОБРАТНАЯ СТОРОНА',
    answerKey: 'Ключ ответов (для учителя)',
    noGames: 'Для этого урока игровые задания не подготовлены.',
    footer: 'подготовлено через ustoz.ai',
    across: 'По горизонтали',
    down: 'По вертикали',
    grammar: ['Форма', 'Структура', 'Пример'],
  },
  en: {
    date: 'Date:',
    name: 'Name:',
    findWords: 'Words to find:',
    cipherKey: 'Cipher key:',
    yes: 'T',
    no: 'F',
    front: 'FRONT',
    back: 'BACK',
    answerKey: 'Answer key (for teacher)',
    noGames: 'No game tasks were prepared for this lesson.',
    footer: 'prepared with ustoz.ai',
    across: 'Across',
    down: 'Down',
    grammar: ['Form', 'Structure', 'Example'],
  },
}

// Joriy varaq tili. buildHandoutPdf() boshida o'rnatiladi va butun kontent
// SINXRON quriladi (hech qayerda await yo'q), shuning uchun bir vaqtda kelgan
// ikkinchi so'rov oraga tushib qiymatni almashtira olmaydi.
let LANG = 'uz'

function L(key) {
  return (LABELS[LANG] ?? LABELS.uz)[key] ?? LABELS.uz[key]
}

// Shablon palitrasi — barcha tarqatmalar uchun bitta, o'zgarmas.
const TPL = {
  blue: '#3A96FF', // ajratgich chizig'i, aksent
  boxFill: '#EBF4FF', // harf katagi foni
  boxLine: '#3A96FF', // harf katagi chegarasi
  emptyLine: '#C8CDD3', // bo'sh javob katagi chegarasi
  cardLine: '#E9E9E9', // topshiriq kartasi chegarasi
  ink: '#1F2937',
  clue: '#4B5563',
  muted: '#9CA3AF',
  panel: '#F7F8FA',
  // burchak bezaklari
  cornerDeep: '#0080C5',
  cornerLight: '#7CD3F6',
  cornerPink: '#F287B6',
  cornerYellow: '#FEC124',
  cornerGreen: '#28EF7B',
}

function resolvePalette() {
  return {
    headers: [TPL.blue],
    chip: TPL.boxFill,
    chipInk: TPL.ink,
    ink: TPL.ink,
    clue: TPL.clue,
    card: TPL.panel,
    line: TPL.cardLine,
    block: TPL.cornerDeep,
    cellInk: TPL.ink,
    cover: TPL.blue,
  }
}

// Har bir sahifaga chiziladigan burchak bezaklari — referens shablondagi
// aniq joylashuv va ranglar.
function pageFrame() {
  return {
    canvas: [
      // yuqori-chap
      { type: 'rect', x: 0, y: 0, w: 16, h: 60, color: TPL.cornerDeep },
      { type: 'rect', x: 0, y: 0, w: 60, h: 16, color: TPL.cornerLight },
      // yuqori-o'ng
      { type: 'rect', x: PAGE_W - 16, y: 0, w: 16, h: 60, color: TPL.cornerDeep },
      { type: 'rect', x: PAGE_W - 60, y: 0, w: 60, h: 16, color: TPL.cornerLight },
      { type: 'rect', x: 522, y: 0, w: 10, h: 16, color: TPL.cornerPink },
      { type: 'rect', x: 513, y: 0, w: 6, h: 16, color: TPL.cornerYellow },
      { type: 'rect', x: 507, y: 0, w: 3, h: 16, color: TPL.cornerGreen },
      // past-o'ng
      { type: 'rect', x: PAGE_W - 16, y: PAGE_H - 60, w: 16, h: 60, color: TPL.cornerYellow },
      { type: 'rect', x: PAGE_W - 60, y: PAGE_H - 16, w: 60, h: 16, color: TPL.cornerYellow },
    ],
  }
}

// --- kichik chizma yordamchilari ---------------------------------------------

function gridLayout(lineColor) {
  return {
    hLineWidth: () => 0.7,
    vLineWidth: () => 0.7,
    hLineColor: () => lineColor,
    vLineColor: () => lineColor,
    paddingLeft: () => 0,
    paddingRight: () => 0,
    paddingTop: () => 0,
    paddingBottom: () => 0,
  }
}

// Yumaloq burchakli harf kataklari qatori. pdfmake jadvallari yumaloq burchak
// chiza olmaydi, shuning uchun kataklar canvas bilan chiziladi, harflar esa
// ustidan manfiy margin bilan qo'yiladi — ikkalasi ham bir xil x boshlanishiga
// ega bo'lgani uchun aniq mos tushadi.
function boxRow(letters, { filled }) {
  const boxes = {
    canvas: letters.map((_, i) => {
      const rect = {
        type: 'rect',
        x: i * BOX_PITCH,
        y: 0,
        w: BOX,
        h: BOX,
        r: 4,
        lineWidth: 1,
        lineColor: filled ? TPL.boxLine : TPL.emptyLine,
      }
      if (filled) rect.color = TPL.boxFill
      return rect
    }),
  }

  if (!filled) return boxes

  // Matn canvas ustiga manfiy margin bilan qo'yiladi. Pastki margin ATAYLAB
  // `up - LINE_H`ga teng: shunda stack balandligi aniq BOX bo'lib qoladi,
  // aks holda har bir harf qatori 4pt "yutib", keyingi qator ustiga chiqadi.
  const up = BOX - (BOX - OVERLAY_LINE_H) / 2

  return {
    stack: [
      boxes,
      {
        columns: letters.map((ch) => ({
          width: BOX,
          text: ch || '',
          alignment: 'center',
          bold: true,
          fontSize: 11,
          color: TPL.blue,
        })),
        columnGap: BOX_GAP,
        margin: [0, -up, 0, up - OVERLAY_LINE_H],
      },
    ],
  }
}

// Ustunga sig'maydigan uzun so'zni bir nechta qatorga bo'ladi.
function chunk(arr, size) {
  const out = []
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
  return out
}

const BOXES_PER_ROW = Math.floor((COL_W + BOX_GAP) / BOX_PITCH)

// Varaq sarlavhasi (mavzu + Sana/Ism + ko'k chiziq) va o'yin sarlavhasi
// egallagandan keyin topshiriqlarga qoladigan taxminiy balandlik.
const SHEET_CONTENT_H = PAGE_H - 40 - 48 - 38 - 35

/**
 * Topshiriqlar sahifani to'ldirishi uchun qatorlar orasidagi bo'sh joyni
 * hisoblaydi — kam elementli tarqatma sahifa yarmida osilib qolmasin.
 */
function spreadGap(rowCount, rowHeight, { min = 6, max = 90 } = {}) {
  if (rowCount <= 0) return min
  const free = SHEET_CONTENT_H - rowCount * rowHeight
  // Bo'sh joy (rowCount + 1) ga bo'linadi, rowCount ga emas: oxirgi qatordan
  // keyin ham chekka qoladi. Aks holda jami balandlik sahifani AYNAN to'ldirib,
  // oxirgi marginni keyingi betga surib yuborardi (bo'sh sahifa paydo bo'lardi).
  return Math.max(min, Math.min(max, free / (rowCount + 1)))
}

// Savollar orasidagi nuqtali ajratgich.
function dottedRule(width = COL_W) {
  return {
    canvas: [{
      type: 'line',
      x1: 0, y1: 0, x2: width, y2: 0,
      lineWidth: 0.8,
      lineColor: TPL.cardLine,
      dash: { length: 2, space: 2 },
    }],
    margin: [0, 10, 0, 10],
  }
}

// --- muqova / sarlavha --------------------------------------------------------

// "Sana: ______" ko'rinishidagi to'ldiriladigan maydon.
function blankField(label, lineWidth) {
  return {
    width: 'auto',
    columns: [
      { width: 'auto', text: label, fontSize: 10, color: TPL.ink, margin: [0, 0, 4, 0] },
      {
        width: lineWidth,
        canvas: [{ type: 'line', x1: 0, y1: 10, x2: lineWidth, y2: 10, lineWidth: 0.8, lineColor: TPL.ink }],
      },
    ],
  }
}

function coverBlock(input) {
  return [
    {
      columns: [
        { width: '*', text: input.title ?? '', bold: true, fontSize: 12, color: TPL.ink },
        blankField(L('date'), 110),
        { width: 24, text: '' },
        blankField(L('name'), 110),
      ],
      margin: [0, 0, 0, 9],
    },
    {
      canvas: [{ type: 'rect', x: 0, y: 0, w: CONTENT_W, h: 3, r: 1.5, color: TPL.blue }],
      margin: [0, 0, 0, 14],
    },
  ]
}

// O'yin nomi va ko'rsatmasi. Referens shablonda rangli raqamli nishon YO'Q —
// varaq mavzu sarlavhasi bilan boshlanadi, o'yin nomi esa uning ostida
// yengil ko'k satr bo'lib turadi.
function gameHeader(game) {
  const rows = [
    { text: game.title, bold: true, fontSize: 11.5, color: TPL.blue, margin: [0, 0, 0, 3] },
  ]

  if (game.instruction) {
    rows.push({ text: game.instruction, italics: true, fontSize: 9.5, color: TPL.clue, margin: [0, 0, 0, 9] })
  } else {
    rows.push({ text: '', margin: [0, 0, 0, 5] })
  }

  return rows
}

// --- o'yinlar -----------------------------------------------------------------

// Bitta anagramma topshirig'i: raqam+izoh, aralashgan harflar, bo'sh javob
// kataklari va ostidagi nuqtali ajratgich.
function anagramCell(number, item) {
  const scrambled = String(item.scrambled).split(' ').filter(Boolean)
  const blanks = Array.from({ length: item.length }, () => '')
  const stack = [
    {
      text: [{ text: `${number}. `, bold: true }, item.clue],
      fontSize: 10,
      color: TPL.ink,
      margin: [0, 0, 0, 7],
    },
  ]

  for (const row of chunk(scrambled, BOXES_PER_ROW)) {
    stack.push({ ...boxRow(row, { filled: true }), margin: [0, 0, 0, BOX_GAP] })
  }
  for (const row of chunk(blanks, BOXES_PER_ROW)) {
    stack.push({ ...boxRow(row, { filled: false }), margin: [0, 0, 0, BOX_GAP] })
  }

  stack.push(dottedRule())

  return { width: COL_W, stack }
}

function renderAnagram(game) {
  const cells = game.items.map((item, i) => anagramCell(i + 1, item))
  const rows = []

  // Ikki ustunli to'r — qatorlar juft-juft, shuning uchun ikkala ustundagi
  // topshiriqlar boshi bir sathda turadi (referens shablondagi kabi).
  for (let i = 0; i < cells.length; i += 2) {
    rows.push({
      columns: [
        cells[i],
        { width: 8, text: '' },
        cells[i + 1] ?? { width: COL_W, text: '' },
      ],
    })
  }

  return rows
}

// Yumshoq to'ldirilgan quticha — moslashtirish/shifr panellari uchun.
function softBoxLayout() {
  return {
    hLineWidth: () => 1,
    vLineWidth: () => 1,
    hLineColor: () => TPL.cardLine,
    vLineColor: () => TPL.cardLine,
    paddingLeft: () => 7,
    paddingRight: () => 7,
    paddingTop: () => 4,
    paddingBottom: () => 4,
  }
}

function softBox(text, { bold = false, size = 9 } = {}) {
  return {
    table: {
      widths: ['*'],
      body: [[{ text, bold, fontSize: size, color: TPL.ink, fillColor: TPL.panel }]],
    },
    layout: softBoxLayout(),
  }
}

// Chiziq tortiladigan ulanish nuqtasi.
function connectorDot(side) {
  const dashX1 = side === 'left' ? 0 : 7
  const dashX2 = side === 'left' ? 7 : 14
  const cx = side === 'left' ? 10 : 4
  return {
    width: 16,
    canvas: [
      { type: 'line', x1: dashX1, y1: 11, x2: dashX2, y2: 11, lineWidth: 0.8, lineColor: TPL.emptyLine },
      { type: 'ellipse', x: cx, y: 11, r1: 2.6, r2: 2.6, lineWidth: 1, lineColor: TPL.blue, color: '#FFFFFF' },
    ],
  }
}

function renderMatching(game) {
  const rows = []
  const count = Math.max(game.left.length, game.right.length)
  // Qatorlar sahifa bo'yicha teng yoyiladi — o'quvchiga chiziq tortishga
  // joy qoladi va varaq yarmida tugab qolmaydi.
  const gap = spreadGap(count, 24, { min: 8, max: 64 })

  for (let i = 0; i < count; i++) {
    const l = game.left[i]
    const r = game.right[i]

    rows.push({
      columns: [
        { width: 14, text: l ? `${l.label}.` : '', bold: true, fontSize: 9.5, color: TPL.ink, margin: [0, 5, 0, 0] },
        l ? { width: '*', ...softBox(l.term, { bold: true }) } : { width: '*', text: '' },
        connectorDot('left'),
        { width: 10, text: '' },
        connectorDot('right'),
        r ? { width: '*', ...softBox(r.clue) } : { width: '*', text: '' },
        { width: 14, text: r ? r.label : '', bold: true, fontSize: 9.5, color: TPL.blue, alignment: 'right', margin: [0, 5, 0, 0] },
      ],
      columnGap: 3,
      margin: [0, 0, 0, i === count - 1 ? 0 : gap],
    })
  }

  return rows
}

function renderWordSearch(game) {
  // Referens shablonda kataklar chegarasiz — butun to'r bitta ingichka ko'k
  // ramkali panel ichida turadi.
  // To'r butun kenglikni egallaydi, so'zlar ro'yxati esa ostiga tushadi —
  // shunda varaq bo'sh qolmaydi va kataklar yozish uchun yetarlicha katta.
  const cols = game.grid[0].length
  const rows = game.grid.length
  const cell = Math.max(14, Math.min(38, Math.floor(Math.min(CONTENT_W / cols, 480 / rows))))

  // Kataklar chegarasiz; ramka faqat to'rning tashqi qirrasida chiziladi.
  const panel = {
    table: {
      widths: game.grid[0].map(() => cell),
      heights: game.grid.map(() => cell - 4),
      body: game.grid.map((row) =>
        row.map((ch) => ({
          text: ch,
          alignment: 'center',
          fontSize: 9.5,
          color: TPL.ink,
          margin: [0, 2, 0, 0],
        })),
      ),
    },
    layout: {
      hLineWidth: (i, node) => (i === 0 || i === node.table.body.length ? 1 : 0),
      vLineWidth: (i, node) => (i === 0 || i === node.table.widths.length ? 1 : 0),
      hLineColor: () => TPL.boxLine,
      vLineColor: () => TPL.boxLine,
      paddingLeft: () => 1,
      paddingRight: () => 1,
      paddingTop: () => 1,
      paddingBottom: () => 1,
    },
  }

  const chip = (w) => ({
    table: { widths: ['auto'], body: [[{ text: w, fontSize: 9.5, bold: true, color: TPL.blue, fillColor: TPL.boxFill, margin: [8, 4, 8, 4] }]] },
    layout: 'noBorders',
    margin: [0, 0, 0, 6],
  })

  // So'z chiplari to'rt ustunga taqsimlanadi.
  const chipCols = [[], [], [], []]
  game.words.forEach((w, i) => chipCols[i % 4].push(chip(w)))

  return [
    { columns: [{ width: 'auto', ...panel }], margin: [0, 0, 0, 16], unbreakable: true },
    { text: L('findWords'), bold: true, fontSize: 10, color: TPL.ink, margin: [0, 0, 0, 8] },
    { columns: chipCols.map((c) => ({ stack: c })), columnGap: 8 },
  ]
}

function renderCrossword(game, pal, color) {
  const grid = {
    table: {
      widths: game.grid[0].map(() => CELL + 2),
      heights: game.grid.map(() => CELL),
      body: game.grid.map((row) =>
        row.map((cell) => {
          // Referens shablonda so'zga tegishli bo'lmagan kataklar UMUMAN
          // chizilmaydi — to'r so'zlarning o'z shakli bo'lib ko'rinadi.
          if (cell === null) {
            return { text: '', border: [false, false, false, false] }
          }
          return {
            text: cell.number ? String(cell.number) : '',
            fontSize: 6,
            color: TPL.blue,
            alignment: 'left',
            margin: [1.5, 0.5, 0, 0],
          }
        }),
      ),
    },
    layout: gridLayout(pal.line),
  }

  const clueList = (title, items) => ({
    width: '*',
    stack: [
      { text: title, bold: true, fontSize: 10.5, color, margin: [0, 0, 0, 4] },
      ...items.map((it) => ({
        text: [{ text: `${it.number}. `, bold: true }, it.clue],
        fontSize: 9,
        color: pal.ink,
        margin: [0, 0, 0, 4],
      })),
    ],
  })

  return [
    { columns: [{ width: 'auto', ...grid }], margin: [0, 0, 0, 8], unbreakable: true },
    {
      columns: [
        game.across.length ? clueList(L('across'), game.across) : { width: '*', text: '' },
        { width: 14, text: '' },
        game.down.length ? clueList(L('down'), game.down) : { width: '*', text: '' },
      ],
    },
  ]
}

// --- kod ochish (code cracker) --------------------------------------------

// Bir qator raqam-kodni ikki qatorli jadval sifatida chizadi: yuqorida
// kichik raqam, pastda katak — "ochiq" (revealed) harflar rangli fon bilan
// oldindan to'ldirilgan, qolganlari o'quvchi to'ldirishi uchun bo'sh.
function codeBox(codes, pal, color) {
  return {
    table: {
      widths: codes.map(() => CELL),
      heights: [9, CELL - 3],
      body: [
        codes.map((c) => ({ text: String(c.number), alignment: 'center', fontSize: 6, color: pal.clue, margin: [0, 1, 0, 0] })),
        codes.map((c) => ({
          text: c.revealed ? c.letter : '',
          alignment: 'center',
          bold: true,
          fontSize: 11,
          color: c.revealed ? '#FFFFFF' : pal.ink,
          fillColor: c.revealed ? color : null,
          margin: [0, 2, 0, 0],
        })),
      ],
    },
    layout: gridLayout(pal.line),
  }
}

function chunkArray(arr, size) {
  const out = []
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
  return out
}

function renderCodeCracker(game, pal, color) {
  const content = [
    { text: L('cipherKey'), bold: true, fontSize: 9.5, color: pal.clue, margin: [0, 0, 0, 4] },
  ]

  for (const row of chunkArray(game.key, 13)) {
    content.push({ columns: [{ width: 'auto', ...codeBox(row, pal, color) }], margin: [0, 0, 0, 4] })
  }

  content.push({ text: '', margin: [0, 4, 0, 0] })

  const gap = spreadGap(game.items.length, 56, { min: 6, max: 56 })

  game.items.forEach((it, i) => {
    content.push({ text: `${i + 1}. ${it.clue}`, fontSize: 10, color: pal.ink, margin: [0, 6, 0, 4] })
    content.push({ columns: [{ width: 'auto', ...codeBox(it.codes, pal, color) }], margin: [0, 0, 0, i === game.items.length - 1 ? 0 : gap] })
  })

  return content
}

// --- matematik amallar varag'i (mathworksheet) ----------------------------

function renderMathWorksheet(game, pal, color) {
  // Misol kam bo'lsa ustunlarni kamaytiramiz — qator ko'payib, varaq
  // teng to'ladi va har bir misolga yozish uchun kengroq joy qoladi.
  const cols = game.items.length <= 12 ? 3 : 4
  const gutter = 12
  // Chiziq aynan o'ng tomonga tekislangan sonlar ostidan o'tishi uchun
  // katak kengligidan hisoblanadi.
  const cellW = (CONTENT_W - (cols - 1) * gutter) / cols - gutter

  const cell = (it, i) => ({
    stack: [
      { text: `${i + 1})`, bold: true, fontSize: 9.5, color, margin: [0, 0, 0, 2] },
      { text: String(it.a), alignment: 'right', fontSize: 12, color: pal.ink },
      {
        text: [{ text: game.symbol, color: TPL.blue }, ` ${it.b}`],
        alignment: 'right',
        fontSize: 12,
        color: pal.ink,
        margin: [0, 0, 0, 3],
      },
      { canvas: [{ type: 'line', x1: 0, y1: 0, x2: cellW, y2: 0, lineWidth: 1, lineColor: pal.line }] },
    ],
    margin: [0, 0, gutter, 0],
  })

  const rowCount = Math.ceil(game.items.length / cols)
  const gap = spreadGap(rowCount, 52, { min: 16, max: 200 })
  const rows = []

  for (let i = 0; i < game.items.length; i += cols) {
    const rowItems = game.items.slice(i, i + cols).map((it, j) => cell(it, i + j))
    while (rowItems.length < cols) rowItems.push({ text: '' })
    rows.push({ columns: rowItems, margin: [0, 0, 0, i + cols >= game.items.length ? 0 : gap] })
  }

  return rows
}

// "To'g'ri tartib" — aralashgan bosqichlar ro'yxati, har biriga qutili raqam joyi.
function renderSequence(game, pal, color) {
  const gap = spreadGap(game.items.length, 22, { min: 8, max: 64 })

  const rows = game.items.map((it, i) => ({
    columns: [
      // Chapdan chip: harf yorlig'i (A/B/C...).
      {
        width: 24,
        table: {
          widths: [20],
          body: [[{ text: it.label, alignment: 'center', bold: true, fontSize: 10, color: '#FFFFFF', fillColor: color, margin: [0, 2, 0, 2] }]],
        },
        layout: 'noBorders',
      },
      // Bosqich matni.
      { width: '*', text: it.text, fontSize: 11, color: pal.ink, margin: [4, 3, 4, 0] },
      // O'ngdan bo'sh qutili tartib raqami uchun joy.
      {
        width: 30,
        table: {
          widths: [24],
          heights: [16],
          body: [[{ text: '', fillColor: null }]],
        },
        layout: gridLayout(color),
      },
    ],
    margin: [0, 0, 0, i === game.items.length - 1 ? 0 : gap],
  }))

  return rows
}

// "To'g'ri yoki noto'g'ri" — atama+ta'rif juftliklari, har biri yoniga T/N kataklari.
function renderTrueFalse(game, pal, color) {
  const gap = spreadGap(game.items.length, 40, { min: 8, max: 56 })

  const rows = game.items.map((it, i) => ({
    columns: [
      { width: 20, text: `${it.number}.`, bold: true, fontSize: 11, color: pal.ink, margin: [0, 4, 0, 0] },
      {
        width: '*',
        stack: [
          { text: it.term, bold: true, fontSize: 11, color: pal.chipInk, fillColor: pal.chip, margin: [4, 2, 4, 2] },
          { text: it.clue, fontSize: 10, color: pal.ink, margin: [0, 3, 0, 0] },
        ],
      },
      {
        width: 60,
        table: {
          widths: [22, 22],
          heights: [18],
          body: [[
            { text: L('yes'), alignment: 'center', bold: true, fontSize: 11, color },
            { text: L('no'), alignment: 'center', bold: true, fontSize: 11, color },
          ]],
        },
        layout: gridLayout(color),
      },
    ],
    columnGap: 8,
    margin: [0, 0, 0, i === game.items.length - 1 ? 0 : gap],
  }))

  return rows
}

// --- kartochkalar (flashcard) --------------------------------------------------

const CARD_H = 78

function cardLayout(lineColor, fill) {
  return {
    hLineWidth: () => 1,
    vLineWidth: () => 1,
    hLineColor: () => lineColor,
    vLineColor: () => lineColor,
    paddingLeft: () => 6,
    paddingRight: () => 6,
    paddingTop: () => 6,
    paddingBottom: () => 6,
    fillColor: () => fill,
  }
}

// Old (term) va orqa (clue) tomonlar bir xil 2-ustunli to'r tartibida
// chiziladi — duplex chop etilganda kartalar mos tushishi uchun.
function cardGrid(items, pal, color, side) {
  const rows = []
  for (let i = 0; i < items.length; i += 2) {
    const pair = [items[i], items[i + 1]]
    rows.push(
      pair.map((it) => {
        if (!it) return { text: '', border: [false, false, false, false] }
        return side === 'front'
          ? { text: it.term, bold: true, fontSize: 15, alignment: 'center', color: pal.ink, margin: [4, CARD_H / 2 - 12, 4, 0] }
          : { text: it.clue, fontSize: 9.5, alignment: 'center', color: pal.clue, margin: [6, CARD_H / 2 - 16, 6, 0] }
      }),
    )
  }

  return {
    table: { widths: ['*', '*'], heights: CARD_H, body: rows },
    layout: cardLayout(color, pal.card),
  }
}

function renderFlashcard(game, pal, color) {
  return [
    { text: L('front'), bold: true, fontSize: 9, color: pal.clue, margin: [0, 0, 0, 4] },
    cardGrid(game.items, pal, color, 'front'),
    { text: '', pageBreak: 'before' },
    { text: L('back'), bold: true, fontSize: 9, color: pal.clue, margin: [0, 0, 0, 4] },
    cardGrid(game.items, pal, color, 'back'),
  ]
}

// --- taqqoslash varag'i (compare) -----------------------------------------------

function renderCompareSheet(game, pal, color) {
  const maxItems = Math.max((game.left.items ?? []).length, (game.right.items ?? []).length)
  const gap = spreadGap(maxItems, 20, { min: 10, max: 150 })

  const column = (side, headColor) => ({
    width: '48%',
    stack: [
      {
        table: { widths: ['*'], body: [[{ text: side.heading ?? '', bold: true, fontSize: 11, color: '#FFFFFF', fillColor: headColor, margin: [8, 5, 8, 5] }]] },
        layout: 'noBorders',
        margin: [0, 0, 0, 10],
      },
      ...(side.items ?? []).map((it, i) => ({
        stack: [
          { text: `•  ${it}`, fontSize: 10.5, color: pal.ink, margin: [0, 0, 0, 6] },
          { canvas: [{ type: 'line', x1: 0, y1: 0, x2: COL_W - 10, y2: 0, lineWidth: 0.8, lineColor: TPL.cardLine, dash: { length: 2, space: 2 } }] },
        ],
        margin: [0, 0, 0, i === (side.items ?? []).length - 1 ? 0 : gap],
      })),
    ],
  })

  return [
    {
      columns: [column(game.left, color), { width: '4%', text: '' }, column(game.right, pal.block)],
    },
  ]
}

// --- grammatika jadvali (grammar) -----------------------------------------------

function renderGrammarTable(game, pal, color) {
  const header = L('grammar').map((h) => ({
    text: h,
    bold: true,
    fontSize: 10,
    color: '#FFFFFF',
    fillColor: color,
    margin: [6, 5, 6, 5],
  }))

  const rows = game.rows.map((r) => [
    { text: r.label, bold: true, fontSize: 10, color: pal.ink, margin: [6, 6, 6, 6] },
    { text: r.structure, fontSize: 10, color: pal.ink, margin: [6, 6, 6, 6] },
    { text: r.example, italics: true, fontSize: 10, color: pal.clue, margin: [6, 6, 6, 6] },
  ])

  return [
    {
      table: { widths: ['22%', '33%', '45%'], body: [header, ...rows] },
      layout: gridLayout(pal.line),
    },
  ]
}

function renderGame(index, game, pal, input) {
  const color = pal.headers[0]
  const content = []

  // Referens shablonda har bir tarqatma — MUSTAQIL varaq. Shuning uchun har
  // bir o'yin yangi sahifadan boshlanadi va o'z sarlavha blokini (mavzu nomi,
  // Sana/Ism, ko'k ajratgich) qaytaradi. Yon ta'siri: katta so'z izlash va
  // krossvord to'rlari sahifa chegarasida bo'linib qolmaydi.
  if (index > 0) {
    content.push({ text: '', pageBreak: 'before' })
  }

  content.push(...coverBlock(input))
  content.push(...gameHeader(game))

  if (game.type === 'anagram') content.push(...renderAnagram(game, pal, color))
  else if (game.type === 'matching') content.push(...renderMatching(game, pal, color))
  else if (game.type === 'wordsearch') content.push(...renderWordSearch(game, pal, color))
  else if (game.type === 'crossword') content.push(...renderCrossword(game, pal, color))
  else if (game.type === 'sequence') content.push(...renderSequence(game, pal, color))
  else if (game.type === 'truefalse') content.push(...renderTrueFalse(game, pal, color))
  else if (game.type === 'flashcard') content.push(...renderFlashcard(game, pal, color))
  else if (game.type === 'compare') content.push(...renderCompareSheet(game, pal, color))
  else if (game.type === 'grammar') content.push(...renderGrammarTable(game, pal, color))
  else if (game.type === 'codecracker') content.push(...renderCodeCracker(game, pal, color))
  else if (game.type === 'mathworksheet') content.push(...renderMathWorksheet(game, pal, color))

  return content
}

function renderAnswerKey(answerKey, pal) {
  if (!answerKey || !answerKey.length) return []

  const blocks = answerKey.map((section) => ({
    width: '50%',
    stack: [
      { text: section.title, bold: true, fontSize: 10, color: pal.ink, margin: [0, 0, 0, 3] },
      { text: section.lines.join('   '), fontSize: 8.5, color: pal.clue, margin: [0, 0, 0, 8] },
    ],
  }))

  const rows = []
  for (let i = 0; i < blocks.length; i += 2) {
    rows.push({ columns: [blocks[i], blocks[i + 1] ?? { width: '50%', text: '' }] })
  }

  return [
    { text: '', pageBreak: 'before' },
    { text: L('answerKey'), bold: true, fontSize: 12, color: pal.cover, margin: [0, 0, 0, 8] },
    ...rows,
  ]
}

/**
 * @param {{
 *   title: string, subjectName: string, theme: string, grade: number,
 *   grade_band: 'primary'|'senior',
 *   games: Array<object>,
 *   answer_key: Array<{title:string, lines:string[]}>,
 * }} input
 * @returns {Promise<Buffer>}
 */
export async function buildHandoutPdf(input) {
  LANG = LABELS[input.language] ? input.language : 'uz'
  const pal = resolvePalette()
  const content = []

  const games = input.games ?? []

  if (games.length === 0) {
    content.push(...coverBlock(input))
    content.push({
      text: L('noGames'),
      italics: true,
      color: pal.clue,
      margin: [0, 20, 0, 0],
    })
  } else {
    games.forEach((game, i) => content.push(...renderGame(i, game, pal, input)))
    content.push(...renderAnswerKey(input.answer_key, pal))
  }

  return renderPdf({
    content,
    pageMargins: [MARGIN, 40, MARGIN, 48],
    background: pageFrame,
    defaultStyle: { font: 'Roboto', fontSize: 11 },
    footer: (currentPage, pageCount) => ({
      columns: [
        { text: L('footer'), fontSize: 8.5, color: TPL.muted, margin: [MARGIN, 12, 0, 0] },
        { text: `${currentPage} / ${pageCount}`, fontSize: 8.5, color: TPL.muted, alignment: 'right', margin: [0, 12, MARGIN, 0] },
      ],
    }),
  })
}
