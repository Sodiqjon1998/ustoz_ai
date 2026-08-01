import { motion } from 'framer-motion'
import Badge from '../ui/Badge'

const STATUS_BADGE = {
  pending: { text: 'Kutilmoqda', variant: 'warning' },
  active: { text: 'Faol', variant: 'success' },
  suspended: { text: "To'xtatilgan", variant: 'danger' },
}

export default function TeacherCard({ teacher, onOpen }) {
  const status = STATUS_BADGE[teacher.status] ?? STATUS_BADGE.pending
  const sub = teacher.subscriptions?.[0]
  const daysLeft = sub ? Math.max(0, Math.ceil((new Date(sub.ends_at) - Date.now()) / 86400000)) : null

  return (
    <motion.button
      type="button"
      onClick={() => onOpen(teacher)}
      whileTap={{ scale: 0.99 }}
      className="flex w-full items-center gap-3 rounded-xl border border-border bg-white p-4 text-left hover:border-brand-200"
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-50 font-heading text-base font-semibold text-brand-700">
        {teacher.full_name?.[0]?.toUpperCase() ?? '?'}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate font-heading text-base font-semibold text-text">{teacher.full_name}</p>
        <p className="truncate text-sm text-text-mute">
          {teacher.phone}
          {teacher.teacher_code ? ` · ${teacher.teacher_code}` : ''}
        </p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1.5">
        <Badge variant={status.variant}>{status.text}</Badge>
        <span className="text-xs text-text-mute">
          {sub ? `${daysLeft} kun qoldi` : 'Obuna yo\'q'}
        </span>
      </div>
    </motion.button>
  )
}
