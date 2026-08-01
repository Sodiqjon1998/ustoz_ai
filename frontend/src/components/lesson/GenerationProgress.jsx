import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { CircleCheck, Circle, Loader2, AlertTriangle, RefreshCw } from 'lucide-react'
import Button from '../ui/Button'
import { ProgressRing } from '../ui/Progress'

// Haqiqiy backend bitta so'rovda (createLesson) hammasini bajaradi va faqat
// oxirida javob qaytaradi — oraliq progress backend'dan kelmaydi. Shu sabab
// bu yerda "his qilinadigan" (perceived) bosqichlar simulyatsiya qilinadi:
// vaqt bo'yicha taxminiy siljiydi, lekin haqiqiy tugash kelganda darhol 100%
// ga sakraydi. Bu — soxta foiz emas, faqat "nimadir bosqichma-bosqich
// bajarilyapti" hissini beradigan standart UX andozasi.
const STEPS = [
  'Dars rejasi tuzilmoqda',
  'Prezentatsiya tayyorlanmoqda',
  'Konspekt yozilmoqda',
  'Testlar tayyorlanmoqda',
  'Tarqatma materiallar',
  "Fayllar yig'ilmoqda",
]

const STEP_MS = 4000

export default function GenerationProgress({ status, onBackground, onRetry, topic }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const timerRef = useRef(null)

  useEffect(() => {
    if (status !== 'running') return
    setActiveIndex(0)
    let i = 0
    timerRef.current = setInterval(() => {
      i += 1
      if (i >= STEPS.length - 1) {
        clearInterval(timerRef.current)
        setActiveIndex(STEPS.length - 1)
        return
      }
      setActiveIndex(i)
    }, STEP_MS + Math.random() * 600 - 300)
    return () => clearInterval(timerRef.current)
  }, [status])

  useEffect(() => {
    if (status === 'done') {
      clearInterval(timerRef.current)
      setActiveIndex(STEPS.length)
    }
  }, [status])

  if (status === 'error') {
    return (
      <div className="flex flex-col items-center gap-4 py-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-danger/10">
          <AlertTriangle className="h-8 w-8 text-danger" />
        </div>
        <div>
          <h3 className="font-heading text-lg font-semibold">Materialni yaratib bo'lmadi</h3>
          <p className="mt-1 text-sm text-text-mute">
            Server bilan bog'lanishda xatolik yuz berdi. Birozdan so'ng qayta urinib ko'ring.
          </p>
        </div>
        <Button onClick={onRetry}>
          <RefreshCw className="h-4 w-4" />
          Qayta urinish
        </Button>
      </div>
    )
  }

  const percent = Math.round((Math.min(activeIndex, STEPS.length) / STEPS.length) * 100)

  return (
    <div className="flex flex-col items-center gap-5 py-2 text-center">
      <div className="relative flex items-center justify-center">
        <ProgressRing value={percent} size={104} strokeWidth={9} />
        <span className="absolute font-heading text-xl font-bold text-text">
          {status === 'done' ? '✓' : `${percent}%`}
        </span>
      </div>

      <div>
        <h3 className="font-heading text-lg font-semibold text-text">
          AI materiallarni tayyorlamoqda
        </h3>
        {topic && <p className="mt-0.5 text-sm text-text-mute">{topic}</p>}
      </div>

      <ul className="w-full text-left">
        {STEPS.map((label, i) => {
          const isDone = i < activeIndex || status === 'done'
          const isActive = i === activeIndex && status !== 'done'
          return (
            <motion.li
              key={label}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, delay: i * 0.03 }}
              className={`flex items-center gap-3 border-b border-border/60 py-2.5 last:border-0 ${
                isDone || isActive ? 'text-text' : 'text-text-mute'
              }`}
            >
              {isDone ? (
                <CircleCheck className="h-5 w-5 shrink-0 text-success" />
              ) : isActive ? (
                <Loader2 className="h-5 w-5 shrink-0 animate-spin text-brand-500" />
              ) : (
                <Circle className="h-5 w-5 shrink-0 text-border" />
              )}
              <span className="text-base">{label}{isActive ? '...' : ''}</span>
            </motion.li>
          )
        })}
      </ul>

      {status === 'running' && (
        <div className="w-full">
          <Button variant="secondary" className="w-full" onClick={onBackground}>
            Fonda davom etsin →
          </Button>
          <p className="mt-2 text-sm text-text-mute">Tayyor bo'lganda xabar beramiz</p>
        </div>
      )}
    </div>
  )
}
