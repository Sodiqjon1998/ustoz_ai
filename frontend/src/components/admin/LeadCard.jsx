import { motion } from 'framer-motion'
import { Phone } from 'lucide-react'
import Badge from '../ui/Badge'
import { formatRelativeTime } from '../../lib/format'

const STATUS_BADGE = {
  new: { text: 'Yangi', variant: 'danger' },
  contacted: { text: "Bog'lanildi", variant: 'info' },
  awaiting_payment: { text: "To'lov kutilmoqda", variant: 'warning' },
  paid: { text: "To'landi", variant: 'success' },
  rejected: { text: 'Rad etildi', variant: 'neutral' },
  lost: { text: "Yo'qotildi", variant: 'neutral' },
}

export default function LeadCard({ lead, onOpen }) {
  const status = STATUS_BADGE[lead.status] ?? STATUS_BADGE.new

  return (
    <motion.button
      type="button"
      onClick={() => onOpen(lead)}
      whileTap={{ scale: 0.99 }}
      className="flex w-full flex-col gap-2 rounded-xl border border-border bg-white p-4 text-left hover:border-brand-200"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="font-heading text-base font-semibold text-text">{lead.full_name}</p>
        <Badge variant={status.variant}>{status.text}</Badge>
      </div>
      <p className="flex items-center gap-1.5 text-sm text-text-mute">
        <Phone className="h-3.5 w-3.5" />
        {lead.phone}
      </p>
      <p className="text-sm text-text-mute">
        {[lead.subject?.name_uz, lead.region].filter(Boolean).join(' · ') || '—'}
      </p>
      <span className="text-xs text-text-mute">{formatRelativeTime(lead.created_at)}</span>
    </motion.button>
  )
}
