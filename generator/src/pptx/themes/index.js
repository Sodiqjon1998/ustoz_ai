// Fan bo'yicha "editorial" palitra — o'qituvchi yuborgan namuna
// (Prezentatsiya.pptx) dan aynan o'lchab olingan rol tuzilishi:
//
//   deep   — muqova foni; kontent slaydda sarlavha matni va pastki tasma
//   brand  — chap chekka chizig'i, raqam doirasi, muqovadagi pastki tasma
//   accent — muqova chizig'i, sarlavha ostidagi ingichka chiziq, footer matni
//   cream  — kontent slayd foni
//   soft   — muqovadagi uchinchi qator (hook) matni
//   body   — asosiy matn rangi
//
// language_arts qiymatlari namunadagi ranglarning o'zi (2C1A0E / 7B3F00 /
// C8956C / FDF6EC / D4B896 / 3A2510) — qolgan fanlar shu rol tuzilishini
// saqlagan holda o'z rang oilasiga ko'chirilgan.
//
// Shriftlar: sarlavhalar uchun Georgia (namunadagidek — Windows va macOS
// bilan birga keladi), matn uchun Calibri. Manrope/Inter ishlatilmaydi —
// ular o'qituvchi kompyuterida bo'lmaydi va matn qutidan chiqib ketadi.
const HEAD = 'Georgia'
const BODY = 'Calibri'

export const themes = {
  language_arts: {
    deep: '2C1A0E',
    brand: '7B3F00',
    accent: 'C8956C',
    cream: 'FDF6EC',
    soft: 'D4B896',
    body: '3A2510',
    headFont: HEAD,
    bodyFont: BODY,
    icons: 'language_arts',
  },
  mathematics: {
    deep: '0B2545',
    brand: '134D7C',
    accent: '8AB6D6',
    cream: 'F2F7FB',
    soft: 'C6DCEC',
    body: '12263A',
    headFont: HEAD,
    bodyFont: BODY,
    icons: 'mathematics',
  },
  natural_sci: {
    deep: '0F2A1D',
    brand: '216B47',
    accent: '93C4A6',
    cream: 'F2F8F3',
    soft: 'C3DFCC',
    body: '18321F',
    headFont: HEAD,
    bodyFont: BODY,
    icons: 'natural_sci',
  },
  humanities: {
    deep: '2A2117',
    brand: '8A6A1F',
    accent: 'D3B778',
    cream: 'FBF6EA',
    soft: 'E3D2A8',
    body: '332B1C',
    headFont: HEAD,
    bodyFont: BODY,
    icons: 'humanities',
  },
  it: {
    deep: '1A1730',
    brand: '4B3B99',
    accent: 'A99BE0',
    cream: 'F5F3FC',
    soft: 'CFC7EE',
    body: '231F3D',
    headFont: HEAD,
    bodyFont: BODY,
    icons: 'it',
  },
}

export function getTheme(themeKey) {
  return themes[themeKey] ?? themes.language_arts
}
