import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, UserPlus2, Clock } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { getStats, listLeads } from '../../api/admin'
import { formatRelativeTime } from '../../lib/format'
import { SkeletonLessonCard } from '../../components/ui/Skeleton'

export default function AdminDashboardPage() {
  const { user, loading } = useAuth()
  const [stats, setStats] = useState(null)
  const [newLeads, setNewLeads] = useState(null)

  useEffect(() => {
    getStats().then(setStats)
    listLeads({ status: 'new' }).then((res) => setNewLeads(res.data.slice(0, 3)))
  }, [])

  if (loading) {
    return <div className="p-6 text-center text-text-mute">Yuklanmoqda...</div>
  }

  if (!user || !['admin', 'super_admin'].includes(user.role)) {
    window.location.href = '/login'
    return null
  }

  return (
    <div className="flex flex-col gap-6 pb-4">
      <div className="grid grid-cols-2 gap-3">
        <StatTile value={stats?.teacher_count} label="O'qituvchi" />
        <StatTile value={stats?.active_count} label="Faol" />
        <StatTile value={stats ? `${(stats.month_revenue_uzs / 1000).toLocaleString('uz-UZ')} ming so'm` : undefined} label="Bu oy daromad" small />
        <StatTile value={stats ? `$${stats.month_ai_cost_usd}` : undefined} label="AI xarajat" />
        <StatTile value={stats ? `${stats.cache_hit_rate}%` : undefined} label="Kesh hit" />
        <StatTile value={stats?.month_lessons} label="Bu oy dars" />
      </div>

      {stats?.expiring_soon_count > 0 && (
        <div className="flex items-center gap-2 rounded-xl bg-warning/10 px-4 py-3 text-warning">
          <Clock className="h-5 w-5 shrink-0" />
          <p className="text-sm font-medium">
            {stats.expiring_soon_count} ta obuna 3 kun ichida tugaydi —{' '}
            <Link to="/admin/oqituvchilar" className="underline">
              ko'rish
            </Link>
          </p>
        </div>
      )}

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-heading font-semibold text-text">
            Yangi murojaatlar {stats?.new_leads_count > 0 && `(${stats.new_leads_count})`}
          </h2>
          <Link to="/admin/murojaatlar" className="text-sm font-medium text-brand-600">
            Barchasi →
          </Link>
        </div>

        {newLeads === null ? (
          <div className="flex flex-col gap-2.5">
            <SkeletonLessonCard />
            <SkeletonLessonCard />
          </div>
        ) : newLeads.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border px-4 py-6 text-center text-sm text-text-mute">
            Yangi murojaat yo'q.
          </p>
        ) : (
          <div className="flex flex-col gap-2.5">
            {newLeads.map((lead) => (
              <Link
                key={lead.id}
                to="/admin/murojaatlar"
                className="flex items-center justify-between gap-3 rounded-xl border border-border bg-white p-3.5"
              >
                <div className="min-w-0">
                  <p className="truncate font-heading text-base font-semibold text-text">{lead.full_name}</p>
                  <p className="truncate text-sm text-text-mute">
                    {lead.subject?.name_uz ?? lead.plan_interest ?? lead.phone}
                  </p>
                </div>
                <span className="shrink-0 text-xs text-text-mute">{formatRelativeTime(lead.created_at)}</span>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="mb-3 font-heading font-semibold text-text">Tezkor amallar</h2>
        <div className="flex flex-col gap-2">
          <Link
            to="/admin/oqituvchilar"
            className="flex h-14 items-center gap-3 rounded-xl border border-border bg-white px-4 font-medium text-text hover:border-brand-200"
          >
            <Search className="h-5 w-5 text-brand-600" />
            O'qituvchini topish
          </Link>
          <Link
            to="/admin/oqituvchilar?new=1"
            className="flex h-14 items-center gap-3 rounded-xl border border-border bg-white px-4 font-medium text-text hover:border-brand-200"
          >
            <UserPlus2 className="h-5 w-5 text-brand-600" />
            Yangi akkaunt
          </Link>
        </div>
      </div>
    </div>
  )
}

function StatTile({ value, label, small }) {
  return (
    <div className="flex flex-col items-center justify-center gap-0.5 rounded-xl border border-border bg-white px-2 py-4 text-center">
      <span className={`font-heading font-bold text-text ${small ? 'text-base' : 'text-2xl'}`}>
        {value ?? <span className="inline-block h-6 w-10 animate-pulse rounded bg-bg-subtle" />}
      </span>
      <span className="text-sm text-text-mute">{label}</span>
    </div>
  )
}
