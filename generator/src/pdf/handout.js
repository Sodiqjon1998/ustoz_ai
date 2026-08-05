import { renderPdf } from './printer.js'
import { getTheme } from '../pptx/themes/index.js'

// Tarqatma material — o'quvchi to'ldiradigan RANGLI ish daftari. Har bir o'yin
// (anagramma, moslashtirish, so'z izlash, krossvord) HandoutBuilder'da mavzu
// atamalaridan mexanik yasaladi; bu yerda faqat CHIROYLI chiziladi.
//
// Ranglar sinfga qarab:
//   primary (1-4 sinf)  — yorqin, o'yinbop; har o'yin boshqa rangda (kamalak).
//   senior  (5-11 sinf) — fan palitrasi; bitta uyg'un brend rangi.

const PRIMARY_ACCENTS = ['#E11D48', '#EA580C', '#16A34A', '#2563EB', '#7C3AED', '#DB2777']

const CELL = 16 // grid katak o'lchami (pt)

function resolvePalette(band, themeKey) {
  if (band === 'primary') {
    return {
      band: 'primary',
      headers: PRIMARY_ACCENTS,
      chip: '#FDE68A',
      chipInk: '#7C2D12',
      ink: '#1F2937',
      clue: '#4B5563',
      card: '#FFFBEB',
      line: '#D1D5DB',
      block: '#475569',
      cellInk: '#111827',
      cover: '#7C3AED',
    }
  }

  const t = getTheme(themeKey)
  const hx = (c) => '#' + c

  return {
    band: 'senior',
    // Uyg'unlik uchun bitta brend rangi; xilma-xillik chip/aksentda.
    headers: [hx(t.brand)],
    chip: hx(t.soft),
    chipInk: hx(t.deep),
    ink: hx(t.body),
    clue: '#4B5563',
    card: hx(t.cream),
    line: '#CBD5E1',
    block: hx(t.deep),
    cellInk: hx(t.body),
    cover: hx(t.deep),
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

// Harflar qatorini (aralashgan yoki bo'sh) kvadrat kataklar sifatida chizadi.
function letterRow(letters, { fill, color, line, box = true }) {
  return {
    table: {
      widths: letters.map(() => CELL),
      heights: CELL - 4,
      body: [
        letters.map((ch) => ({
          text: ch || '',
          alignment: 'center',
          bold: true,
          fontSize: 11,
          color,
          fillColor: fill,
          margin: [0, 2, 0, 0],
        })),
      ],
    },
    layout: box ? gridLayout(line) : 'noBorders',
  }
}

// --- muqova / sarlavha --------------------------------------------------------

function coverBlock(input, pal) {
  return [
    {
      table: {
        widths: ['*'],
        body: [
          [
            {
              stack: [
                { text: input.title ?? '', color: '#FFFFFF', bold: true, fontSize: 20, margin: [0, 0, 0, 3] },
                {
                  text: `${input.subjectName ?? ''}  ·  ${input.grade ?? ''}-sinf  ·  Tarqatma material`,
                  color: '#FFFFFF',
                  fontSize: 11,
                  opacity: 0.9,
                },
              ],
              fillColor: pal.cover,
              margin: [14, 12, 14, 12],
            },
          ],
        ],
      },
      layout: 'noBorders',
      margin: [0, 0, 0, 6],
    },
    {
      columns: [
        { text: 'Ism-familiya: ______________________________', fontSize: 10, color: pal.ink },
        { text: 'Sana: ______________', fontSize: 10, color: pal.ink, alignment: 'right' },
      ],
      margin: [2, 0, 2, 10],
    },
  ]
}

function gameHeader(index, game, pal) {
  const color = pal.headers[index % pal.headers.length]

  return [
    {
      table: {
        widths: ['auto', '*'],
        body: [
          [
            { text: String(index + 1), color: '#FFFFFF', bold: true, fontSize: 13, fillColor: color, alignment: 'center', margin: [7, 5, 7, 5] },
            { text: game.title, color: '#FFFFFF', bold: true, fontSize: 13, fillColor: color, margin: [8, 5, 8, 5] },
          ],
        ],
      },
      layout: 'noBorders',
      margin: [0, 10, 0, 3],
      unbreakable: true,
    },
    { text: game.instruction ?? '', italics: true, fontSize: 9.5, color: pal.clue, margin: [2, 0, 0, 7] },
  ]
}

// --- o'yinlar -----------------------------------------------------------------

function renderAnagram(game, pal, color) {
  const rows = []

  for (const [i, item] of game.items.entries()) {
    const scrambled = String(item.scrambled).split(' ')
    const blanks = Array.from({ length: item.length }, () => '')

    rows.push({
      columns: [
        { width: 16, text: `${i + 1}.`, bold: true, fontSize: 11, color: pal.ink, margin: [0, 4, 0, 0] },
        { width: 'auto', ...letterRow(scrambled, { fill: pal.chip, color: pal.chipInk, line: pal.line }) },
        { width: 18, text: '=', alignment: 'center', bold: true, fontSize: 12, color, margin: [0, 3, 0, 0] },
        { width: 'auto', ...letterRow(blanks, { fill: null, color: pal.ink, line: color }) },
      ],
      columnGap: 5,
      margin: [0, 0, 0, 2],
    })
    rows.push({ text: item.clue, fontSize: 9, italics: true, color: pal.clue, margin: [16, 0, 0, 6] })
  }

  return rows
}

function renderMatching(game, pal, color) {
  // Raqam chipini alohida jadval ichida chizamiz — columns ichidagi cell
  // fillColor'ni matn ostidagi butun katakka bo'yamaydi.
  const numberChip = (label) => ({
    table: {
      widths: [18],
      body: [[{ text: label, alignment: 'center', bold: true, fontSize: 11, color: '#FFFFFF', fillColor: color, margin: [0, 2, 0, 2] }]],
    },
    layout: 'noBorders',
  })

  const leftStack = game.left.map((l) => ({
    columns: [
      { width: 22, stack: [numberChip(l.label + '.')] },
      { width: '*', text: l.term, bold: true, fontSize: 11, color: pal.ink, margin: [4, 3, 0, 0] },
    ],
    margin: [0, 0, 0, 8],
  }))

  const rightStack = game.right.map((r) => ({
    columns: [
      { width: 14, text: r.label + ')', bold: true, fontSize: 10, color, margin: [0, 2, 0, 0] },
      { width: '*', text: r.clue, fontSize: 9.5, color: pal.ink, margin: [2, 0, 0, 0] },
    ],
    margin: [0, 0, 0, 8],
  }))

  return [
    {
      columns: [
        { width: '42%', stack: leftStack },
        { width: '6%', text: '' },
        { width: '52%', stack: rightStack },
      ],
      margin: [0, 0, 0, 4],
    },
  ]
}

function renderWordSearch(game, pal, color) {
  const grid = {
    table: {
      widths: game.grid[0].map(() => CELL),
      heights: game.grid.map(() => CELL - 3),
      body: game.grid.map((row) =>
        row.map((ch) => ({
          text: ch,
          alignment: 'center',
          fontSize: 10.5,
          color: pal.cellInk,
          margin: [0, 2, 0, 0],
        })),
      ),
    },
    layout: gridLayout(pal.line),
  }

  // So'zlar ro'yxati — rangli chiplar, ikki ustunda.
  const chips = game.words.map((w) => ({
    text: w,
    fontSize: 10,
    bold: true,
    color: pal.chipInk,
    fillColor: pal.chip,
    margin: [6, 3, 6, 3],
  }))

  const half = Math.ceil(chips.length / 2)
  const chipCol = (arr) => ({
    stack: arr.map((c) => ({ table: { widths: ['auto'], body: [[c]] }, layout: 'noBorders', margin: [0, 0, 0, 4] })),
  })

  return [
    {
      columns: [
        { width: 'auto', ...grid },
        { width: 16, text: '' },
        {
          width: '*',
          stack: [
            { text: 'Topiladigan so’zlar:', bold: true, fontSize: 10, color, margin: [0, 2, 0, 6] },
            { columns: [chipCol(chips.slice(0, half)), chipCol(chips.slice(half))] },
          ],
        },
      ],
      margin: [0, 0, 0, 4],
      // Grid sahifa chegarasida qatorlarga bo'linib, chala/g'alati ko'rinmasin —
      // yoki butunlay shu sahifaga sig'adi, yoki to'liq keyingi sahifaga o'tadi.
      unbreakable: true,
    },
  ]
}

function renderCrossword(game, pal, color) {
  const grid = {
    table: {
      widths: game.grid[0].map(() => CELL + 2),
      heights: game.grid.map(() => CELL),
      body: game.grid.map((row) =>
        row.map((cell) => {
          if (cell === null) {
            return { text: '', fillColor: pal.block }
          }
          return {
            text: cell.number ? String(cell.number) : '',
            fontSize: 6,
            color: color,
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
        game.across.length ? clueList('Gorizontal', game.across) : { width: '*', text: '' },
        { width: 14, text: '' },
        game.down.length ? clueList('Vertikal', game.down) : { width: '*', text: '' },
      ],
    },
  ]
}

// "To'g'ri tartib" — aralashgan bosqichlar ro'yxati, har biriga qutili raqam joyi.
function renderSequence(game, pal, color) {
  const rows = game.items.map((it) => ({
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
    margin: [0, 0, 0, 8],
  }))

  return rows
}

// "To'g'ri yoki noto'g'ri" — atama+ta'rif juftliklari, har biri yoniga T/N kataklari.
function renderTrueFalse(game, pal, color) {
  const rows = game.items.map((it) => ({
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
            { text: 'T', alignment: 'center', bold: true, fontSize: 11, color },
            { text: 'N', alignment: 'center', bold: true, fontSize: 11, color },
          ]],
        },
        layout: gridLayout(color),
      },
    ],
    columnGap: 8,
    margin: [0, 0, 0, 8],
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
    { text: 'OLD TOMON', bold: true, fontSize: 9, color: pal.clue, margin: [0, 0, 0, 4] },
    cardGrid(game.items, pal, color, 'front'),
    { text: '', pageBreak: 'before' },
    { text: 'ORQA TOMON', bold: true, fontSize: 9, color: pal.clue, margin: [0, 0, 0, 4] },
    cardGrid(game.items, pal, color, 'back'),
  ]
}

// --- taqqoslash varag'i (compare) -----------------------------------------------

function renderCompareSheet(game, pal, color) {
  const column = (side, headColor) => ({
    width: '48%',
    stack: [
      {
        table: { widths: ['*'], body: [[{ text: side.heading ?? '', bold: true, fontSize: 11, color: '#FFFFFF', fillColor: headColor, margin: [8, 5, 8, 5] }]] },
        layout: 'noBorders',
        margin: [0, 0, 0, 6],
      },
      { ul: side.items ?? [], fontSize: 10.5, color: pal.ink, margin: [0, 0, 0, 0] },
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
  const header = ['Shakl', 'Tuzilma', 'Misol'].map((h) => ({
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

function renderGame(index, game, pal) {
  const color = pal.headers[index % pal.headers.length]
  const content = []

  // So'z izlash/krossvord grid'lari katta va `columns` ichidagi jadval
  // uchun `unbreakable` ishonchli ishlamaydi (grid baribir sahifa
  // chegarasida bo'linib qolgan edi). Shu sabab bu turlar doim yangi
  // sahifadan boshlanadi — alohida bo'sh pageBreak belgisi bilan (xuddi
  // renderAnswerKey'dagi kabi — bitta tugunga unbreakable+pageBreak'ni
  // birga qo'yish e'tiborga olinmay qolgan edi). Kartochkalar/taqqoslash/
  // grammatika ham shu ro'yxatda — ular oldingi blokning oxiri bilan bir
  // sahifada qisilib, chala-chulpa ko'rinib qolgan edi (masalan Kartochkalar
  // orqa tomoni bilan Taqqoslash varag'i bitta betda tiqilishib qolardi).
  const forceNewPage = ['wordsearch', 'crossword', 'flashcard', 'compare', 'grammar']
  if (index > 0 && forceNewPage.includes(game.type)) {
    content.push({ text: '', pageBreak: 'before' })
  }

  content.push(...gameHeader(index, game, pal))

  if (game.type === 'anagram') content.push(...renderAnagram(game, pal, color))
  else if (game.type === 'matching') content.push(...renderMatching(game, pal, color))
  else if (game.type === 'wordsearch') content.push(...renderWordSearch(game, pal, color))
  else if (game.type === 'crossword') content.push(...renderCrossword(game, pal, color))
  else if (game.type === 'sequence') content.push(...renderSequence(game, pal, color))
  else if (game.type === 'truefalse') content.push(...renderTrueFalse(game, pal, color))
  else if (game.type === 'flashcard') content.push(...renderFlashcard(game, pal, color))
  else if (game.type === 'compare') content.push(...renderCompareSheet(game, pal, color))
  else if (game.type === 'grammar') content.push(...renderGrammarTable(game, pal, color))

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
    { text: 'Javoblar kaliti (o’qituvchi uchun)', bold: true, fontSize: 12, color: pal.cover, margin: [0, 0, 0, 8] },
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
  const pal = resolvePalette(input.grade_band ?? 'senior', input.theme)
  const content = [...coverBlock(input, pal)]

  const games = input.games ?? []

  if (games.length === 0) {
    content.push({
      text: 'Bu dars uchun o’yinli topshiriqlar tayyorlanmadi.',
      italics: true,
      color: pal.clue,
      margin: [0, 20, 0, 0],
    })
  } else {
    games.forEach((game, i) => content.push(...renderGame(i, game, pal)))
    content.push(...renderAnswerKey(input.answer_key, pal))
  }

  return renderPdf({
    content,
    defaultStyle: { font: 'Roboto', fontSize: 11 },
  })
}
