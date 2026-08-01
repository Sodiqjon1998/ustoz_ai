import { motion } from 'framer-motion'
import { cn } from '../../lib/utils'

/**
 * Chiziqli progress — wizard qadam ko'rsatkichi va h.k. uchun.
 * `value` 0..100. `steps` berilsa, segmentlarga bo'linadi (wizard uchun qulay).
 */
export function ProgressBar({ value = 0, steps, className }) {
  if (steps) {
    return (
      <div className={cn('flex gap-1.5', className)}>
        {Array.from({ length: steps }).map((_, i) => (
          <div key={i} className="h-1.5 flex-1 overflow-hidden rounded-full bg-border">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-brand-500 to-purple-500"
              initial={false}
              animate={{ width: i < value ? '100%' : '0%' }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className={cn('h-1.5 w-full overflow-hidden rounded-full bg-border', className)}>
      <motion.div
        className="h-full rounded-full bg-gradient-to-r from-brand-500 to-purple-500"
        initial={false}
        animate={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      />
    </div>
  )
}

/** Doiraviy progress — generatsiya ekrani markazidagi indikator uchun. */
export function ProgressRing({ value = 0, size = 96, strokeWidth = 8, className }) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - Math.min(100, Math.max(0, value)) / 100)

  return (
    <svg width={size} height={size} className={cn('-rotate-90', className)}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="var(--color-border)"
        strokeWidth={strokeWidth}
      />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="url(#progress-gradient)"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        animate={{ strokeDashoffset: offset }}
        initial={false}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      />
      <defs>
        <linearGradient id="progress-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>
      </defs>
    </svg>
  )
}
