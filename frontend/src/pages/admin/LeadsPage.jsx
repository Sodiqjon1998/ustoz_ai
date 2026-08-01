import { useCallback, useEffect, useState } from 'react'
import { Plus, Inbox } from 'lucide-react'
import Modal from '../../components/ui/Modal'
import EmptyState from '../../components/ui/EmptyState'
import { SkeletonLessonCard } from '../../components/ui/Skeleton'
import LeadCard from '../../components/admin/LeadCard'
import LeadDetail from '../../components/admin/LeadDetail'
import NewLeadForm from '../../components/admin/NewLeadForm'
import { listLeads } from '../../api/admin'

const STATUS_TABS = [
  { value: 'new', label: 'Yangi' },
  { value: 'contacted', label: "Bog'lanildi" },
  { value: 'awaiting_payment', label: 'Kutilmoqda' },
  { value: 'paid', label: "To'landi" },
  { value: '', label: 'Hammasi' },
]

export default function LeadsPage() {
  const [status, setStatus] = useState('new')
  const [leads, setLeads] = useState(null)
  const [selected, setSelected] = useState(null)
  const [creating, setCreating] = useState(false)

  const refresh = useCallback(() => {
    setLeads(null)
    listLeads({ status: status || undefined }).then((res) => setLeads(res.data))
  }, [status])

  useEffect(() => {
    refresh()
  }, [refresh])

  function handleChanged() {
    refresh()
    setSelected(null)
  }

  return (
    <div className="flex flex-col gap-4 pb-4">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-xl font-bold text-text">Murojaatlar</h1>
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="flex h-10 items-center gap-1.5 rounded-full bg-brand-50 px-3 text-sm font-semibold text-brand-700 hover:bg-brand-100"
        >
          <Plus className="h-4 w-4" />
          Yangi
        </button>
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

      {leads === null ? (
        <div className="flex flex-col gap-3">
          <SkeletonLessonCard />
          <SkeletonLessonCard />
        </div>
      ) : leads.length === 0 ? (
        <EmptyState icon={Inbox} title="Murojaat yo'q" description="Bu bo'limda hozircha hech narsa yo'q" />
      ) : (
        <div className="flex flex-col gap-3">
          {leads.map((lead) => (
            <LeadCard key={lead.id} lead={lead} onOpen={setSelected} />
          ))}
        </div>
      )}

      <Modal open={!!selected} onClose={() => setSelected(null)} title={selected?.full_name}>
        {selected && <LeadDetail lead={selected} onChanged={handleChanged} />}
      </Modal>

      <Modal open={creating} onClose={() => setCreating(false)} title="Yangi murojaat">
        <NewLeadForm
          onCreated={() => {
            setCreating(false)
            refresh()
          }}
        />
      </Modal>
    </div>
  )
}
