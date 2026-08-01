import { motion } from 'framer-motion'

const GRADES = Array.from({ length: 11 }, (_, i) => i + 1)

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.03 } },
}
const item = {
  hidden: { opacity: 0, scale: 0.85 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] } },
}

export default function GradePicker({ value, onChange }) {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-4 gap-3 sm:grid-cols-6"
    >
      {GRADES.map((grade) => {
        const selected = value === grade
        return (
          <motion.button
            key={grade}
            type="button"
            variants={item}
            whileTap={{ scale: 0.92 }}
            onClick={() => onChange(grade)}
            aria-pressed={selected}
            className={`flex aspect-square min-h-[56px] items-center justify-center rounded-full border-2 font-heading text-xl font-bold transition-colors ${
              selected
                ? 'border-brand-600 bg-gradient-to-br from-brand-500 to-purple-500 text-white shadow-sm'
                : 'border-border bg-white text-text hover:border-brand-300'
            }`}
          >
            {grade}
          </motion.button>
        )
      })}
    </motion.div>
  )
}
