export function formatFileSize(bytes) {
  if (bytes == null) return null
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// Eslatma: Intl.RelativeTimeFormat('uz', ...) ataylab ishlatilmaydi — ko'p
// muhitlarning ICU ma'lumotlar bazasida "uz" lokali to'liq qo'llab-quvvatlanmaydi
// va natijada "-8 min" kabi inglizcha-uslubdagi chiqish qaytaradi. Shu sabab
// o'zbekcha iboralar qo'lda yoziladi — barcha muhitlarda bir xil ishlaydi.
export function formatRelativeTime(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const diffMs = date.getTime() - Date.now()
  const diffMin = Math.round(diffMs / 60000)

  if (Math.abs(diffMin) < 1) return 'hozir'
  if (Math.abs(diffMin) < 60) {
    return `${Math.abs(diffMin)} daqiqa oldin`
  }
  const diffHour = Math.round(diffMin / 60)
  if (Math.abs(diffHour) < 24) {
    return `${Math.abs(diffHour)} soat oldin`
  }
  const diffDay = Math.round(diffHour / 24)
  if (Math.abs(diffDay) < 7) {
    if (diffDay === -1) return 'kecha'
    return `${Math.abs(diffDay)} kun oldin`
  }
  return date.toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short' })
}

export function isSameDay(dateStr, ref = new Date()) {
  const d = new Date(dateStr)
  return (
    d.getFullYear() === ref.getFullYear() &&
    d.getMonth() === ref.getMonth() &&
    d.getDate() === ref.getDate()
  )
}

export function isSameMonth(dateStr, ref = new Date()) {
  const d = new Date(dateStr)
  return d.getFullYear() === ref.getFullYear() && d.getMonth() === ref.getMonth()
}
