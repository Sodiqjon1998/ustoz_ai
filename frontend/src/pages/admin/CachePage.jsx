import { useCallback, useEffect, useState } from 'react'
import { Database, Trash2 } from 'lucide-react'
import Modal from '../../components/ui/Modal'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import { SkeletonLessonCard } from '../../components/ui/Skeleton'
import { listCache, getCacheItem, deleteCacheItem } from '../../api/admin'

const SORT_TABS = [
  { value: 'hit_count', label: "Ko'p ishlatilgan" },
  { value: 'rating', label: 'Reyting' },
  { value: 'newest', label: 'Yangi' },
]

export default function CachePage() {
  const [sort, setSort] = useState('hit_count')
  const [items, setItems] = useState(null)
  const [selected, setSelected] = useState(null)

  const refresh = useCallback(() => {
    setItems(null)
    listCache({ sort }).then((res) => setItems(res.data))
  }, [sort])

  useEffect(() => {
    refresh()
  }, [refresh])

  return (
    <div className="flex flex-col gap-4 pb-4">
      <h1 className="font-heading text-xl font-bold text-text">Kesh boshqaruvi</h1>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {SORT_TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setSort(tab.value)}
            className={`shrink-0 rounded-full px-3.5 py-2 text-sm font-medium ${
              sort === tab.value ? 'bg-text text-white' : 'bg-bg-subtle text-text-mute hover:text-text'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {items === null ? (
        <div className="flex flex-col gap-3">
          <SkeletonLessonCard />
          <SkeletonLessonCard />
        </div>
      ) : items.length === 0 ? (
        <EmptyState icon={Database} title="Kesh bo'sh" description="Hali hech qanday material keshlanmagan" />
      ) : (
        <div className="flex flex-col gap-2">
          {items.map((item) => {
            const avgRating = item.rating_count > 0 ? (item.rating_sum / item.rating_count).toFixed(1) : null
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelected(item)}
                className="flex items-center justify-between gap-3 rounded-xl border border-border bg-white p-3.5 text-left hover:border-brand-200"
              >
                <div className="min-w-0">
                  <p className="truncate font-heading text-base font-semibold text-text">
                    {item.topic_display ?? item.topic_raw}
                  </p>
                  <p className="truncate text-sm text-text-mute">
                    {item.subject?.name_uz} · {item.grade}-sinf · {item.duration} daq
                  </p>
                </div>
                <div className="shrink-0 text-right text-sm text-text-mute">
                  <p className="font-heading font-semibold text-text">{item.hit_count}x ishlatilgan</p>
                  {avgRating && <p>★ {avgRating}</p>}
                </div>
              </button>
            )
          })}
        </div>
      )}

      <Modal open={!!selected} onClose={() => setSelected(null)} title={selected?.topic_display ?? selected?.topic_raw}>
        {selected && (
          <CacheDetail
            id={selected.id}
            onDeleted={() => {
              setSelected(null)
              refresh()
            }}
          />
        )}
      </Modal>
    </div>
  )
}

function CacheDetail({ id, onDeleted }) {
  const [detail, setDetail] = useState(null)
  const [confirming, setConfirming] = useState(false)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    getCacheItem(id).then(setDetail)
  }, [id])

  async function handleDelete() {
    setBusy(true)
    try {
      await deleteCacheItem(id)
      onDeleted?.()
    } finally {
      setBusy(false)
    }
  }

  if (!detail) {
    return <div className="py-8 text-center text-text-mute">Yuklanmoqda...</div>
  }

  const avgRating = detail.rating_count > 0 ? (detail.rating_sum / detail.rating_count).toFixed(1) : null

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-text-mute">
        {detail.subject?.name_uz} · {detail.grade}-sinf · {detail.duration} daqiqa · {detail.language}
      </p>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <Stat label="Ishlatilgan" value={`${detail.hit_count}x`} />
        <Stat label="Reyting" value={avgRating ? `★ ${avgRating} (${detail.rating_count})` : 'Baho yo\'q'} />
        <Stat label="Fayllar" value={detail.materials?.length ?? 0} />
        <Stat label="AI xarajat" value={detail.cost_usd ? `$${detail.cost_usd}` : "kesh (bepul)"} />
      </div>

      {confirming ? (
        <div className="flex flex-col gap-2 rounded-xl bg-danger/10 p-3.5">
          <p className="text-sm font-medium text-danger">
            Bu materialni o'chirish — barcha fayllar o'chadi. Bu mavzuni endi hech kim keshdan olmaydi.
          </p>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="secondary" disabled={busy} onClick={() => setConfirming(false)}>
              Bekor qilish
            </Button>
            <Button variant="danger" disabled={busy} onClick={handleDelete}>
              Ha, o'chirilsin
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="flex h-12 items-center gap-3 rounded-xl px-3 text-left text-danger hover:bg-bg-subtle"
        >
          <Trash2 className="h-4 w-4" />
          Keshdan o'chirish
        </button>
      )}
    </div>
  )
}

function Stat({ label, value }) {
  return (
    <div className="rounded-xl border border-border p-3">
      <p className="font-heading font-semibold text-text">{value}</p>
      <p className="text-text-mute">{label}</p>
    </div>
  )
}
