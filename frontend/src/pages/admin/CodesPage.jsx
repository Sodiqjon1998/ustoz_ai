import { useCallback, useEffect, useState } from 'react'
import { Plus, Ticket, Download } from 'lucide-react'
import Modal from '../../components/ui/Modal'
import Badge from '../../components/ui/Badge'
import EmptyState from '../../components/ui/EmptyState'
import { SkeletonLessonCard } from '../../components/ui/Skeleton'
import GenerateCodesForm from '../../components/admin/GenerateCodesForm'
import { listCodes, revokeCode, exportCodes } from '../../api/admin'

const STATUS_TABS = [
  { value: '', label: 'Hammasi' },
  { value: 'unused', label: 'Ishlatilmagan' },
  { value: 'used', label: 'Ishlatilgan' },
  { value: 'revoked', label: 'Bekor qilingan' },
]

const STATUS_BADGE = {
  unused: { text: 'Ishlatilmagan', variant: 'info' },
  used: { text: 'Ishlatilgan', variant: 'success' },
  revoked: { text: 'Bekor qilingan', variant: 'neutral' },
}

export default function CodesPage() {
  const [status, setStatus] = useState('')
  const [codes, setCodes] = useState(null)
  const [creating, setCreating] = useState(false)
  const [busyId, setBusyId] = useState(null)

  const refresh = useCallback(() => {
    setCodes(null)
    listCodes({ status: status || undefined }).then((res) => setCodes(res.data))
  }, [status])

  useEffect(() => {
    refresh()
  }, [refresh])

  async function handleRevoke(code) {
    setBusyId(code.id)
    try {
      await revokeCode(code.id)
      refresh()
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="flex flex-col gap-4 pb-4">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-xl font-bold text-text">Faollashtirish kodlari</h1>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => exportCodes()}
            aria-label="CSV yuklab olish"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-bg-subtle text-text-mute hover:text-text"
          >
            <Download className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setCreating(true)}
            className="flex h-10 items-center gap-1.5 rounded-full bg-brand-50 px-3 text-sm font-semibold text-brand-700 hover:bg-brand-100"
          >
            <Plus className="h-4 w-4" />
            Yaratish
          </button>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setStatus(tab.value)}
            className={`shrink-0 rounded-full px-3.5 py-2 text-sm font-medium ${
              status === tab.value
                ? 'bg-text text-white'
                : 'bg-bg-subtle text-text-mute hover:text-text'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {codes === null ? (
        <div className="flex flex-col gap-3">
          <SkeletonLessonCard />
          <SkeletonLessonCard />
        </div>
      ) : codes.length === 0 ? (
        <EmptyState icon={Ticket} title="Kod topilmadi" description="Yangi to'plam yarating" />
      ) : (
        <div className="flex flex-col gap-2">
          {codes.map((code) => {
            const badge = STATUS_BADGE[code.status] ?? STATUS_BADGE.unused
            return (
              <div
                key={code.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-border bg-white p-3.5"
              >
                <div className="min-w-0">
                  <p className="font-heading text-base font-semibold tracking-wide text-text">{code.code}</p>
                  <p className="truncate text-sm text-text-mute">
                    {code.plan?.name}
                    {code.used_by && ` · ${code.used_by.full_name}`}
                    {code.note && ` · ${code.note}`}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Badge variant={badge.variant}>{badge.text}</Badge>
                  {code.status === 'unused' && (
                    <button
                      type="button"
                      disabled={busyId === code.id}
                      onClick={() => handleRevoke(code)}
                      className="text-sm font-medium text-danger hover:underline disabled:opacity-50"
                    >
                      Bekor qilish
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <Modal open={creating} onClose={() => setCreating(false)} title="Kod to'plami yaratish">
        <GenerateCodesForm onCreated={refresh} />
      </Modal>
    </div>
  )
}
