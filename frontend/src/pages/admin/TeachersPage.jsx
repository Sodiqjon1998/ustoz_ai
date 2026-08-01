import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, UserPlus2, Users } from 'lucide-react'
import Modal from '../../components/ui/Modal'
import EmptyState from '../../components/ui/EmptyState'
import { SkeletonLessonCard } from '../../components/ui/Skeleton'
import TeacherCard from '../../components/admin/TeacherCard'
import TeacherDetail from '../../components/admin/TeacherDetail'
import NewTeacherForm from '../../components/admin/NewTeacherForm'
import { listTeachers } from '../../api/admin'

const STATUS_TABS = [
  { value: '', label: 'Hammasi' },
  { value: 'active', label: 'Faol' },
  { value: 'pending', label: 'Kutilmoqda' },
  { value: 'suspended', label: "To'xtatilgan" },
]

export default function TeachersPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [teachers, setTeachers] = useState(null)
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('')
  const [selected, setSelected] = useState(null)
  const [creating, setCreating] = useState(searchParams.get('new') === '1')

  const refresh = useCallback(() => {
    setTeachers(null)
    listTeachers({ q: q || undefined, status: status || undefined }).then((res) => setTeachers(res.data))
  }, [q, status])

  useEffect(() => {
    const timeout = setTimeout(refresh, 250)
    return () => clearTimeout(timeout)
  }, [refresh])

  function openCreate() {
    setCreating(true)
  }

  function closeCreate() {
    setCreating(false)
    if (searchParams.get('new')) {
      searchParams.delete('new')
      setSearchParams(searchParams, { replace: true })
    }
  }

  return (
    <div className="flex flex-col gap-4 pb-4">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-xl font-bold text-text">O'qituvchilar</h1>
        <button
          type="button"
          onClick={openCreate}
          className="flex h-10 items-center gap-1.5 rounded-full bg-brand-50 px-3 text-sm font-semibold text-brand-700 hover:bg-brand-100"
        >
          <UserPlus2 className="h-4 w-4" />
          Yangi
        </button>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-mute" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Ism, telefon yoki kod bo'yicha qidirish"
          className="h-12 w-full rounded-xl border border-border pl-11 pr-4 text-base focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
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

      {teachers === null ? (
        <div className="flex flex-col gap-3">
          <SkeletonLessonCard />
          <SkeletonLessonCard />
          <SkeletonLessonCard />
        </div>
      ) : teachers.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Hech kim topilmadi"
          description="Qidiruv yoki filtrni o'zgartirib ko'ring"
        />
      ) : (
        <div className="flex flex-col gap-3">
          {teachers.map((teacher) => (
            <TeacherCard key={teacher.id} teacher={teacher} onOpen={setSelected} />
          ))}
        </div>
      )}

      <Modal open={!!selected} onClose={() => setSelected(null)} title={selected?.full_name}>
        {selected && (
          <TeacherDetail
            teacherId={selected.id}
            onChanged={refresh}
            onDeleted={() => {
              setSelected(null)
              refresh()
            }}
          />
        )}
      </Modal>

      <Modal open={creating} onClose={closeCreate} title="Yangi o'qituvchi akkaunti">
        <NewTeacherForm onCreated={refresh} />
      </Modal>
    </div>
  )
}
