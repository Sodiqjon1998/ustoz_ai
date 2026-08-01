// Har fan uchun 6 ta chiziqli chizma (line-art). Namunadagi slaydlarda
// o'ng tomonni to'liq egallagan fotosurat bor — biz surat generatsiya
// qila olmaymiz, shuning uchun o'sha o'ringa fan mavzusiga mos, qo'lda
// chizilgan vektor illyustratsiya joylashtiriladi.
//
// Har bir chizma 0 0 200 200 viewBox ichida, faqat stroke bilan (fill
// kerak bo'lgan joyda "@" belgisi rang bilan almashtiriladi — card.js
// stroke/fill ranglarini o'zi qo'yadi).
//
// Slaydlar ketma-ketligida takrorlanmasligi uchun card.js slayd raqamiga
// qarab ro'yxatdan aylanma tanlaydi.

// Tomirlar o'rta tomirni kesib o'tmaydi — har biri undan chetga, barg uchiga
// qarab burilib chiqadi (qarama-qarshi venatsiya). Uzunliklari barg enidan
// oshmasligi uchun hisoblab qo'yilgan: chetlarda qisqa, o'rtada uzunroq.
const leaf = `
  <path d="M42 158C42 88 88 42 158 42c0 70-46 116-116 116Z"/>
  <path d="M42 158 158 42"/>
  <path d="M76.8 123.2 71.8 103.8"/>
  <path d="M76.8 123.2 96.2 128.2"/>
  <path d="M97.7 102.3 91.2 77.1"/>
  <path d="M97.7 102.3 122.9 108.8"/>
  <path d="M118.6 81.4 113.6 62"/>
  <path d="M118.6 81.4 138 86.4"/>
`

const atom = `
  <ellipse cx="100" cy="100" rx="80" ry="31"/>
  <ellipse cx="100" cy="100" rx="80" ry="31" transform="rotate(60 100 100)"/>
  <ellipse cx="100" cy="100" rx="80" ry="31" transform="rotate(120 100 100)"/>
  <circle cx="100" cy="100" r="15" data-solid="1"/>
`

const flask = `
  <path d="M78 34v54l-38 68a12 12 0 0 0 10 18h100a12 12 0 0 0 10-18l-38-68V34"/>
  <path d="M68 34h64"/>
  <path d="M62 130h76"/>
  <circle cx="86" cy="150" r="7" data-solid="1"/>
  <circle cx="112" cy="156" r="5" data-solid="1"/>
`

// Pastga qaragan nur ufq chizig'i bilan kesishmasligi uchun olib tashlangan.
const sun = `
  <circle cx="100" cy="82" r="32"/>
  <path d="M100 38V24"/>
  <path d="M131.1 50.9 141 41"/>
  <path d="M144 82h14"/>
  <path d="M131.1 113.1 141 123"/>
  <path d="M68.9 113.1 59 123"/>
  <path d="M56 82H42"/>
  <path d="M68.9 50.9 59 41"/>
  <path d="M24 162h152"/>
`

const droplet = `
  <path d="M100 26s52 62 52 90a52 52 0 0 1-104 0c0-28 52-90 52-90Z"/>
  <path d="M78 118a22 22 0 0 0 12 30"/>
`

// "Zinapoya" chiziqlari egri chiziqlarning aynan kesishuv nuqtalarida
// bo'lishi uchun bezye koordinatalari hisoblab chiqilgan.
const dna = `
  <path d="M70 24C132 62 132 138 70 176"/>
  <path d="M130 24C68 62 68 138 130 176"/>
  <path d="M87.7 74.6h24.6"/>
  <path d="M83.5 100h33"/>
  <path d="M87.7 125.4h24.6"/>
`

const openBook = `
  <path d="M100 60C80 42 52 38 28 42v106c24-4 52 0 72 18"/>
  <path d="M100 60c20-18 48-22 72-18v106c-24-4-52 0-72 18"/>
  <path d="M100 60v106"/>
  <path d="M46 72h30"/><path d="M46 96h30"/>
  <path d="M124 72h30"/><path d="M124 96h30"/>
`

const quill = `
  <path d="M48 168C48 108 96 44 164 34c6 62-34 116-96 122"/>
  <path d="M164 34 62 148"/>
  <path d="M28 178l30-18"/>
`

const dialogue = `
  <path d="M28 46h92a12 12 0 0 1 12 12v46a12 12 0 0 1-12 12H70l-26 22v-22H28a12 12 0 0 1-12-12V58a12 12 0 0 1 12-12Z"/>
  <path d="M150 82h22a12 12 0 0 1 12 12v46a12 12 0 0 1-12 12h-8v22l-26-22h-28a12 12 0 0 1-12-12v-12"/>
`

const scroll = `
  <path d="M56 40h96v112a24 24 0 0 0 24 24H72"/>
  <path d="M72 176a24 24 0 0 1-24-24V64a24 24 0 0 1 24-24"/>
  <path d="M80 72h48"/><path d="M80 98h48"/><path d="M80 124h30"/>
`

const inkwell = `
  <path d="M52 108h76v46a18 18 0 0 1-18 18H70a18 18 0 0 1-18-18v-46Z"/>
  <path d="M42 108h96"/>
  <path d="M114 102 127.7 97 175.3 42.6 164.8 33.4 117.2 87.8Z"/>
  <path d="M117.2 87.8 127.7 97"/>
`

const pages = `
  <path d="M64 34h60l32 32v100H64Z"/>
  <path d="M124 34v32h32"/>
  <path d="M44 58v108h84"/>
  <path d="M84 92h48"/><path d="M84 116h48"/><path d="M84 140h28"/>
`

const compassTool = `
  <path d="M32 148a68 68 0 0 1 136 0"/>
  <path d="M28 148h144"/>
  <path d="M100 148 150 96"/>
  <path d="M126 148a26 26 0 0 0-8-18"/>
  <circle cx="100" cy="148" r="6" data-solid="1"/>
`

const circleRadius = `
  <circle cx="100" cy="100" r="66"/>
  <path d="M100 100h66"/>
  <path d="M100 100 54 146"/>
  <circle cx="100" cy="100" r="6" data-solid="1"/>
`

const barChart = `
  <path d="M26 168h150"/>
  <path d="M44 118h24v50H44Z"/>
  <path d="M80 92h24v76H80Z"/>
  <path d="M116 64h24v104h-24Z"/>
  <path d="M152 36h24v132h-24Z"/>
`

// O'qlar markazlashgan: parabola aynan y o'qiga nisbatan simmetrik.
const parabola = `
  <path d="M30 160h140"/>
  <path d="M100 28v146"/>
  <path d="M52 46Q100 210 148 46"/>
`

const cube = `
  <path d="M60 74 100 50l40 24v54l-40 24-40-24Z"/>
  <path d="M60 74 100 98l40-24"/>
  <path d="M100 98v54"/>
`

const pieChart = `
  <circle cx="100" cy="100" r="64"/>
  <path d="M100 100V36a64 64 0 0 1 55 96Z"/>
  <path d="M100 100 155 132"/>
`

const column = `
  <path d="M52 52h96"/>
  <path d="M60 52v96"/><path d="M84 52v96"/>
  <path d="M116 52v96"/><path d="M140 52v96"/>
  <path d="M44 34h112v18H44Z"/>
  <path d="M44 148h112v18H44Z"/>
`

const globe = `
  <circle cx="100" cy="100" r="70"/>
  <ellipse cx="100" cy="100" rx="30" ry="70"/>
  <path d="M30 100h140"/>
  <path d="M44 62h112"/><path d="M44 138h112"/>
`

const compassRose = `
  <circle cx="100" cy="100" r="72"/>
  <path d="M100 24 118 82 176 100 118 118 100 176 82 118 24 100 82 82Z"/>
  <circle cx="100" cy="100" r="7" data-solid="1"/>
`

const mapPin = `
  <path d="M100 28a44 44 0 0 1 44 44c0 34-44 82-44 82S56 106 56 72a44 44 0 0 1 44-44Z"/>
  <circle cx="100" cy="72" r="15"/>
  <path d="M40 172c26-10 94-10 120 0" stroke-dasharray="10 12"/>
`

const amphora = `
  <path d="M76 40h48"/>
  <path d="M84 40c0 22-32 30-32 62a48 48 0 0 0 96 0c0-32-32-40-32-62"/>
  <path d="M84 62C60 62 52 84 68 96"/>
  <path d="M116 62c24 0 32 22 16 34"/>
  <path d="M78 168h44"/>
`

const hourglass = `
  <path d="M52 30h96"/><path d="M52 170h96"/>
  <path d="M66 30v22c0 26 34 34 34 48 0 14-34 22-34 48v22"/>
  <path d="M134 30v22c0 26-34 34-34 48 0 14 34 22 34 48v22"/>
  <path d="M78 150h44"/>
`

const monitor = `
  <path d="M30 40h140v92H30Z"/>
  <path d="M76 156h48"/><path d="M100 132v24"/>
  <path d="M82 66 62 86l20 20"/>
  <path d="M118 66l20 20-20 20"/>
`

const nodeGraph = `
  <circle cx="52" cy="58" r="16"/><circle cx="150" cy="48" r="16"/>
  <circle cx="100" cy="106" r="18"/>
  <circle cx="46" cy="156" r="16"/><circle cx="152" cy="150" r="16"/>
  <path d="M64 68 86 94"/><path d="M138 60 116 92"/>
  <path d="M88 120 58 142"/><path d="M114 120 140 138"/>
`

const chip = `
  <path d="M62 62h76v76H62Z"/>
  <path d="M84 84h32v32H84Z"/>
  <path d="M84 62V34"/><path d="M116 62V34"/>
  <path d="M84 138v28"/><path d="M116 138v28"/>
  <path d="M62 84H34"/><path d="M62 116H34"/>
  <path d="M138 84h28"/><path d="M138 116h28"/>
`

const cloudSync = `
  <path d="M62 138a34 34 0 0 1 2-68 44 44 0 0 1 84-6 32 32 0 0 1-4 74Z"/>
  <path d="M100 108v56"/>
  <path d="M82 146l18 18 18-18"/>
`

const terminal = `
  <path d="M28 44h144v112H28Z"/>
  <path d="M28 74h144"/>
  <path d="M54 100l22 20-22 20"/>
  <path d="M92 140h52"/>
  <circle cx="48" cy="59" r="5" data-solid="1"/>
  <circle cx="68" cy="59" r="5" data-solid="1"/>
`

const database = `
  <ellipse cx="100" cy="52" rx="58" ry="22"/>
  <path d="M42 52v96c0 12 26 22 58 22s58-10 58-22V52"/>
  <path d="M42 100c0 12 26 22 58 22s58-10 58-22"/>
`

export const iconSets = {
  language_arts: [openBook, quill, dialogue, scroll, inkwell, pages],
  mathematics: [circleRadius, parabola, cube, barChart, compassTool, pieChart],
  natural_sci: [leaf, atom, flask, dna, droplet, sun],
  humanities: [globe, column, compassRose, mapPin, amphora, hourglass],
  it: [monitor, nodeGraph, chip, terminal, cloudSync, database],
}

export function pickIcon(setKey, index) {
  const set = iconSets[setKey] ?? iconSets.language_arts
  return set[index % set.length]
}
