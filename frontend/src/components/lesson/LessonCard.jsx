import { motion } from 'framer-motion'
import { Zap } from 'lucide-react'
import Badge from '../ui/Badge'
import { subjectIcon } from '../../lib/subjectIcons'
import { formatRelativeTime } from '../../lib/format'

const STATUS_BADGE = {
  queued: { text: 'Navbatda', variant: 'warning' },
  generating: { text: 'Yaratilmoqda', variant: 'warning' },
  ready: { text: 'Tayyor', variant: 'success' },
  failed: { text: 'Xato', variant: 'danger' },
}

export default function LessonCard({ lesson, onOpen }) {
  const Icon = subjectIcon(lesson.subject?.icon)
  const status = STATUS_BADGE[lesson.status] ?? STATUS_BADGE.queued
  const color = lesson.subject?.color ?? '#4F46E5'

  return (
    <motion.button
      type="button"
      onClick={() => onOpen(lesson)}
      whileTap={{ scale: 0.99 }}
      className="flex w-full items-center gap-3 rounded-xl border border-border bg-white p-4 text-left transition-colors hover:border-brand-200"
    >
      <span
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
        style={{ backgroundColor: `${color}1a`, color }}
      >
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate font-heading text-base font-semibold text-text">
          {lesson.title ?? lesson.topic_raw}
        </p>
        <p className="truncate text-sm text-text-mute">
          {lesson.subject?.name_uz} · {lesson.grade}-sinf · {lesson.duration} daq
          {lesson.was_cache_hit && (
            <span className="ml-1 inline-flex items-center gap-0.5 text-info">
              <Zap className="inline h-3.5 w-3.5" />
            </span>
          )}
        </p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1.5">
        <Badge variant={status.variant}>{status.text}</Badge>
        <span className="text-xs text-text-mute">{formatRelativeTime(lesson.created_at)}</span>
      </div>
    </motion.button>
  )
}
