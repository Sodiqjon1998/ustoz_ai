import { useEffect, useState } from 'react'
import { Copy, Pause, Play, KeyRound, Trash2 } from 'lucide-react'
import Badge from '../ui/Badge'
import Button from '../ui/Button'
import Select from '../ui/Select'
import { ProgressBar } from '../ui/Progress'
import {
  getTeacher,
  extendTeacher,
  suspendTeacher,
  activateTeacher,
  resetTeacherPassword,
  deleteTeacher,
  listPlans,
} from '../../api/admin'

const STATUS_BADGE = {
  pending: { text: 'Kutilmoqda', variant: 'warning' },
  active: { text: 'Faol', variant: 'success' },
  suspended: { text: "To'xtatilgan", variant: 'danger' },
}

export default function TeacherDetail({ teacherId, onChanged, onDeleted }) {
  const [teacher, setTeacher] = useState(null)
  const [busy, setBusy] = useState(false)
  const [tempPassword, setTempPassword] = useState(null)
  const [plans, setPlans] = useState([])
  const [planId, setPlanId] = useState('')
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  function refresh() {
    return getTeacher(teacherId).then(setTeacher)
  }

  useEffect(() => {
    refresh()
  }, [teacherId])

  useEffect(() => {
    if (!teacher || teacher.subscription) return
    listPlans().then((data) => {
      setPlans(data)
      const paid = data.find((p) => p.price_uzs > 0)
      if (paid) setPlanId(String(paid.id))
    })
  }, [teacher?.id, teacher?.subscription])

  async function run(action) {
    setBusy(true)
    try {
      await action()
      await refresh()
      onChanged?.()
    } finally {
      setBusy(false)
    }
  }

  function extend(days) {
    return run(() => extendTeacher(teacher.id, days, teacher.subscription ? undefined : Number(planId)))
  }

  async function handleDelete() {
    setBusy(true)
    try {
      await deleteTeacher(teacher.id)
      onDeleted?.()
    } finally {
      setBusy(false)
    }
  }

  if (!teacher) {
    return <div className="py-8 text-center text-text-mute">Yuklanmoqda...</div>
  }

  const status = STATUS_BADGE[teacher.status] ?? STATUS_BADGE.pending
  const sub = teacher.subscription
  const progress = sub
    ? (() => {
        const total = (new Date(sub.ends_at) - new Date(sub.starts_at)) / 86400000
        const left = (new Date(sub.ends_at) - Date.now()) / 86400000
        return total > 0 ? Math.max(0, Math.min(100, (left / total) * 100)) : 0
      })()
    : 0

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="text-sm text-text-mute">
          {teacher.teacher_code ?? 'Kod yo\'q'} · {teacher.phone}
        </p>
        <div className="mt-1.5 flex items-center gap-2">
          <Badge variant={status.variant}>{status.text}</Badge>
          {teacher.region && <span className="text-sm text-text-mute">{teacher.region}</span>}
        </div>
      </div>

      {sub ? (
        <div className="rounded-xl border border-border p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-text">Obuna: {sub.plan}</span>
            <span className="text-text-mute">{sub.ends_at} gacha</span>
          </div>
          <ProgressBar value={progress} className="my-2" />
          <p className="text-sm text-text-mute">{sub.days_left} kun qoldi</p>
          {sub.generation_limit && (
            <p className="mt-1 text-sm text-text-mute">
              Kvota: {sub.generations_used} / {sub.generation_limit}
            </p>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <p className="rounded-xl border border-dashed border-border px-4 py-3 text-center text-sm text-text-mute">
            Hali obunasi yo'q — birinchi obuna uchun tarif tanlang
          </p>
          <Select label="Tarif" value={planId} onChange={(e) => setPlanId(e.target.value)}>
            {plans.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} · {p.price_uzs.toLocaleString('uz-UZ')} so'm
              </option>
            ))}
          </Select>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <Button size="lg" disabled={busy || (!sub && !planId)} onClick={() => extend(30)}>
          ✅ +30 kun uzaytirish
        </Button>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="secondary" disabled={busy || (!sub && !planId)} onClick={() => extend(90)}>
            +90 kun
          </Button>
          <Button variant="secondary" disabled={busy || (!sub && !planId)} onClick={() => extend(365)}>
            +365 kun
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-2 border-t border-border pt-4">
        {teacher.status === 'suspended' ? (
          <ActionRow
            icon={Play}
            label="Qayta faollashtirish"
            disabled={busy}
            onClick={() => run(() => activateTeacher(teacher.id))}
          />
        ) : (
          <ActionRow
            icon={Pause}
            label="Vaqtincha to'xtatish"
            disabled={busy}
            onClick={() => run(() => suspendTeacher(teacher.id))}
          />
        )}
        <ActionRow
          icon={KeyRound}
          label="Parolni tiklash"
          disabled={busy}
          onClick={() =>
            run(async () => {
              const res = await resetTeacherPassword(teacher.id)
              setTempPassword(res.temp_password)
            })
          }
        />
      </div>

      {tempPassword && (
        <div className="flex items-center justify-between gap-2 rounded-xl bg-warning/10 px-4 py-3">
          <div>
            <p className="text-sm font-medium text-text">Yangi vaqtinchalik parol:</p>
            <p className="font-heading text-lg font-bold text-text">{tempPassword}</p>
          </div>
          <button
            type="button"
            onClick={() => navigator.clipboard.writeText(tempPassword)}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-text-mute hover:text-text"
            aria-label="Nusxalash"
          >
            <Copy className="h-4 w-4" />
          </button>
        </div>
      )}
      {tempPassword && (
        <p className="text-xs text-text-mute">
          ⚠️ Parol faqat hozir ko'rinadi. O'qituvchiga qo'lda yetkazing.
        </p>
      )}

      <div className="border-t border-border pt-4 text-sm text-text-mute">
        <p>Darslar: {teacher.lessons_count} · To'lagan: {teacher.total_paid_uzs.toLocaleString('uz-UZ')} so'm</p>
        {teacher.last_login_at && <p>Oxirgi kirish: {new Date(teacher.last_login_at).toLocaleString('uz-UZ')}</p>}
      </div>

      <div className="border-t border-border pt-4">
        {confirmingDelete ? (
          <div className="flex flex-col gap-2 rounded-xl bg-danger/10 p-3.5">
            <p className="text-sm font-medium text-danger">
              {teacher.full_name}ni butunlay o'chirish — darslari va to'lov tarixi ham o'chadi. Ortga qaytarib bo'lmaydi.
            </p>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="secondary" disabled={busy} onClick={() => setConfirmingDelete(false)}>
                Bekor qilish
              </Button>
              <Button variant="danger" disabled={busy} onClick={handleDelete}>
                Ha, o'chirilsin
              </Button>
            </div>
          </div>
        ) : (
          <ActionRow
            icon={Trash2}
            label="O'qituvchini o'chirish"
            disabled={busy}
            danger
            onClick={() => setConfirmingDelete(true)}
          />
        )}
      </div>
    </div>
  )
}

function ActionRow({ icon: Icon, label, onClick, disabled, danger }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex h-12 items-center gap-3 rounded-xl px-3 text-left hover:bg-bg-subtle disabled:opacity-50 ${
        danger ? 'text-danger' : 'text-text'
      }`}
    >
      <Icon className={`h-4 w-4 ${danger ? 'text-danger' : 'text-text-mute'}`} />
      {label}
    </button>
  )
}
