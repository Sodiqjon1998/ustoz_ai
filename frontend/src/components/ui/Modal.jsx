import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { X } from 'lucide-react'
import { cn } from '../../lib/utils'

/**
 * Modal — docs/04-UI-UX.md §7: mobilda bottom sheet, desktopda markazlashgan.
 * Yopilganda ham ortidagi holat (masalan generatsiya so'rovi) davom etadi —
 * chaqiruvchi komponent shu uchun javobgar (state modalning o'zida emas).
 *
 * Eslatma: AnimatePresence ataylab ishlatilmaydi — bir nechta Modal instansiyasi
 * bir vaqtda sahifada bo'lganda (masalan dars ro'yxati kartochkasi + wizard)
 * "exit" animatsiyasi ba'zan hech qachon tugamay, eski modal DOM'da abadiy
 * ochiq qolib ketishi kuzatildi. Shu sabab faqat kirish animatsiyasi bor —
 * yopilganda darhol (animatsiyasiz) olib tashlanadi. Bu ishonchlilik uchun ataylab
 * qilingan kelishuv — bezakli chiqish animatsiyasidan ko'ra ishonchli yopilish muhim.
 */
export default function Modal({ open, onClose, title, children, className, dismissible = true }) {
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape' && dismissible) onClose?.()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose, dismissible])

  if (!open) return null

  const sheetTransition = { duration: reduceMotion ? 0.01 : 0.25, ease: [0.16, 1, 0.3, 1] }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <motion.div
        className="absolute inset-0 bg-text/40 backdrop-blur-[1px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={sheetTransition}
        onClick={() => dismissible && onClose?.()}
      />
      <motion.div
        role="dialog"
        aria-modal="true"
        className={cn(
          'relative flex max-h-[90svh] w-full flex-col overflow-hidden bg-white',
          'rounded-t-modal sm:max-w-lg sm:rounded-modal sm:m-4',
          'shadow-lg',
          className,
        )}
        initial={{ y: reduceMotion ? 0 : 32, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={sheetTransition}
      >
        <div className="mx-auto mt-2 h-1.5 w-10 shrink-0 rounded-full bg-border sm:hidden" />
        {(title || dismissible) && (
          <div className="flex shrink-0 items-center justify-between px-5 pb-2 pt-3">
            <h2 className="font-heading text-lg font-semibold text-text">{title}</h2>
            {dismissible && (
              <button
                onClick={() => onClose?.()}
                aria-label="Yopish"
                className="flex h-12 w-12 items-center justify-center rounded-full text-text-mute hover:bg-bg-subtle"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        )}
        <div className="overflow-y-auto px-5 pb-6">{children}</div>
      </motion.div>
    </div>,
    document.body,
  )
}
