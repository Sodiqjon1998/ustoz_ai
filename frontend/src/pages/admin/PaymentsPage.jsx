import { useCallback, useEffect, useState } from 'react'
import { Plus, Receipt } from 'lucide-react'
import Modal from '../../components/ui/Modal'
import EmptyState from '../../components/ui/EmptyState'
import { SkeletonLessonCard } from '../../components/ui/Skeleton'
import RecordPaymentForm from '../../components/admin/RecordPaymentForm'
import { listPayments } from '../../api/admin'
import { formatRelativeTime } from '../../lib/format'

const METHOD_LABEL = {
  card_transfer: "Karta o'tkazma",
  cash: 'Naqd',
  bank: 'Bank',
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState(null)
  const [totalPaid, setTotalPaid] = useState(0)
  const [creating, setCreating] = useState(false)

  const refresh = useCallback(() => {
    setPayments(null)
    listPayments().then((res) => {
      setPayments(res.data)
      setTotalPaid(res.meta.total_paid_uzs)
    })
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  return (
    <div className="flex flex-col gap-4 pb-4">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-xl font-bold text-text">To'lovlar</h1>
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="flex h-10 items-center gap-1.5 rounded-full bg-brand-50 px-3 text-sm font-semibold text-brand-700 hover:bg-brand-100"
        >
          <Plus className="h-4 w-4" />
          Qo'shish
        </button>
      </div>

      <div className="rounded-xl border border-border bg-white p-4 text-center">
        <p className="font-heading text-2xl font-bold text-text">{totalPaid.toLocaleString('uz-UZ')} so'm</p>
        <p className="text-sm text-text-mute">Jami tushum</p>
      </div>

      {payments === null ? (
        <div className="flex flex-col gap-3">
          <SkeletonLessonCard />
          <SkeletonLessonCard />
        </div>
      ) : payments.length === 0 ? (
        <EmptyState icon={Receipt} title="To'lov yo'q" description="Hali qayd etilgan to'lov yo'q" />
      ) : (
        <div className="flex flex-col gap-2">
          {payments.map((p) => (
            <div key={p.id} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-white p-3.5">
              <div className="min-w-0">
                <p className="truncate font-heading text-base font-semibold text-text">{p.user?.full_name}</p>
                <p className="truncate text-sm text-text-mute">
                  {METHOD_LABEL[p.method]}
                  {p.card_last4 && ` · **** ${p.card_last4}`}
                  {p.received_by && ` · ${p.received_by.full_name} qabul qildi`}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="font-heading font-semibold text-success">
                  +{p.amount_uzs.toLocaleString('uz-UZ')}
                </p>
                <p className="text-xs text-text-mute">{formatRelativeTime(p.paid_at)}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={creating} onClose={() => setCreating(false)} title="To'lov qayd etish">
        <RecordPaymentForm onCreated={refresh} />
      </Modal>
    </div>
  )
}
