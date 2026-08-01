import { motion } from 'framer-motion'
import { subjectIcon } from '../../lib/subjectIcons'

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04 } },
}
const item = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] } },
}

export default function SubjectPicker({ subjects, value, onChange }) {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-2 gap-3"
    >
      {subjects.map((subject) => {
        const Icon = subjectIcon(subject.icon)
        const selected = value === subject.id
        return (
          <motion.button
            key={subject.id}
            type="button"
            variants={item}
            whileTap={{ scale: 0.97 }}
            onClick={() => onChange(subject.id)}
            className={`flex min-h-[104px] flex-col items-center justify-center gap-2 rounded-xl border-2 px-3 py-4 text-center transition-colors ${
              selected
                ? 'border-brand-500 bg-brand-50'
                : 'border-border bg-white hover:border-brand-200'
            }`}
            style={selected ? { borderColor: subject.color } : undefined}
          >
            <span
              className="flex h-11 w-11 items-center justify-center rounded-full"
              style={{ backgroundColor: `${subject.color}1a`, color: subject.color }}
            >
              <Icon className="h-6 w-6" strokeWidth={2} />
            </span>
            <span className="font-heading text-base font-semibold leading-tight text-text">
              {subject.name_uz}
            </span>
          </motion.button>
        )
      })}
    </motion.div>
  )
}
