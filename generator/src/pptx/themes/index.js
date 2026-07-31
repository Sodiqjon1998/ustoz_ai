// Fan bo'yicha rang/shrift — docs/03-AI-KESH-GENERATSIYA.md § 4.4
export const themes = {
  language_arts: { primary: '4F46E5', accent: 'F59E0B', font: 'Manrope' },
  mathematics: { primary: '0891B2', accent: 'F97316', font: 'Inter' },
  natural_sci: { primary: '059669', accent: 'EAB308', font: 'Inter' },
  humanities: { primary: 'B45309', accent: '0EA5E9', font: 'Manrope' },
  it: { primary: '7C3AED', accent: '10B981', font: 'Inter' },
}

export function getTheme(themeKey) {
  return themes[themeKey] ?? themes.language_arts
}
