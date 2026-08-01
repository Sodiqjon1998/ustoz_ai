import { motion } from 'framer-motion'
import Button from './Button'

export default function EmptyState({ icon: Icon, title, description, actionLabel, onAction }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-bg-subtle px-6 py-12 text-center"
    >
      {Icon && (
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm">
          <Icon className="h-8 w-8 text-brand-500" strokeWidth={1.75} />
        </div>
      )}
      <h3 className="font-heading text-lg font-semibold text-text">{title}</h3>
      {description && (
        <p className="max-w-xs text-sm text-text-mute">{description}</p>
      )}
      {actionLabel && (
        <Button size="lg" onClick={onAction} className="mt-2">
          {actionLabel}
        </Button>
      )}
    </motion.div>
  )
}
