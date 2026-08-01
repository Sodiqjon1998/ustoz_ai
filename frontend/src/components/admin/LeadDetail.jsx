import { useState } from 'react'
import { Phone, Send } from 'lucide-react'
import Badge from '../ui/Badge'
import Button from '../ui/Button'
import ConvertLeadForm from './ConvertLeadForm'
import { updateLead } from '../../api/admin'

const STATUS_BADGE = {
  new: { text: 'Yangi', variant: 'danger' },
  contacted: { text: "Bog'lanildi", variant: 'info' },
  awaiting_payment: { text: "To'lov kutilmoqda", variant: 'warning' },
  paid: { text: "To'landi", variant: 'success' },
  rejected: { text: 'Rad etildi', variant: 'neutral' },
  lost: { text: "Yo'qotildi", variant: 'neutral' },
}

export default function LeadDetail({ lead, onChanged }) {
  const [current, setCurrent] = useState(lead)
  const [mode, setMode] = useState('detail')
  const [busy, setBusy] = useState(false)

  async function setStatus(status) {
    setBusy(true)
    try {
      const updated = await updateLead(current.id, { status })
      setCurrent(updated)
      onChanged?.()
    } finally {
      setBusy(false)
    }
  }

  if (mode === 'convert') {
    return <ConvertLeadForm lead={current} onConverted={() => onChanged?.()} />
  }

  const status = STATUS_BADGE[current.status] ?? STATUS_BADGE.new
  const alreadyConverted = !!current.user_id

  return (
    <div className="flex flex-col gap-4">
      <Badge variant={status.variant}>{status.text}</Badge>

      <div className="flex flex-col gap-1 text-sm text-text-mute">
        <p>{[current.subject?.name_uz, current.region, current.school].filter(Boolean).join(' · ') || '—'}</p>
        {current.plan_interest && <p>Qiziqqan tarif: {current.plan_interest}</p>}
        {current.note && <p>Izoh: {current.note}</p>}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <a
          href={`tel:${current.phone}`}
          className="flex h-12 items-center justify-center gap-2 rounded-xl bg-bg-subtle font-medium text-text"
        >
          <Phone className="h-4 w-4" />
          Qo'ng'iroq
        </a>
        {current.telegram ? (
          <a
            href={`https://t.me/${current.telegram.replace('@', '')}`}
            target="_blank"
            rel="noreferrer"
            className="flex h-12 items-center justify-center gap-2 rounded-xl bg-bg-subtle font-medium text-text"
          >
            <Send className="h-4 w-4" />
            Telegram
          </a>
        ) : (
          <div />
        )}
      </div>

      {alreadyConverted ? (
        <p className="rounded-xl bg-success/10 px-4 py-3 text-center text-sm font-medium text-success">
          Bu murojaat bo'yicha akkaunt allaqachon ochilgan
        </p>
      ) : (
        <>
          <Button size="lg" onClick={() => setMode('convert')}>
            ✅ To'lov keldi
          </Button>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="secondary"
              disabled={busy || current.status === 'contacted'}
              onClick={() => setStatus('contacted')}
            >
              Bog'landim
            </Button>
            <Button variant="ghost" disabled={busy} onClick={() => setStatus('rejected')}>
              Rad etdi
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
