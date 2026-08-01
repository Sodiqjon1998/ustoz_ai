import { useEffect, useState } from 'react'
import { CircleCheck, Copy } from 'lucide-react'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Select from '../ui/Select'
import { createTeacher, listPlans } from '../../api/admin'
import { listSubjects } from '../../api/lessons'

export default function NewTeacherForm({ onCreated }) {
  const [subjects, setSubjects] = useState([])
  const [plans, setPlans] = useState([])
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [school, setSchool] = useState('')
  const [region, setRegion] = useState('')
  const [subjectId, setSubjectId] = useState('')
  const [planId, setPlanId] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState(null)

  useEffect(() => {
    listSubjects().then(setSubjects)
    listPlans().then((data) => {
      setPlans(data)
      if (data[0]) setPlanId(String(data[0].id))
    })
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const data = await createTeacher({
        full_name: fullName,
        phone,
        school: school || undefined,
        region: region || undefined,
        subject_id: subjectId || undefined,
        plan_id: Number(planId),
      })
      setResult(data)
      onCreated?.()
    } catch (err) {
      setError(err.response?.data?.errors?.[0]?.message ?? 'Xatolik yuz berdi.')
    } finally {
      setSubmitting(false)
    }
  }

  if (result) {
    return (
      <div className="flex flex-col items-center gap-4 py-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
          <CircleCheck className="h-9 w-9 text-success" />
        </div>
        <div className="w-full rounded-xl border border-border p-4 text-left">
          <Row label="Kod" value={result.user.teacher_code} />
          <Row label="Login" value={result.user.phone} />
          <Row label="Parol" value={result.temp_password} copy />
          <Row label="Obuna" value={`${result.user.subscription?.plan} · ${result.user.subscription?.ends_at} gacha`} />
        </div>
        <p className="text-xs text-text-mute">
          ⚠️ Parol faqat hozir ko'rinadi. O'qituvchiga qo'lda yetkazing.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input label="Ism familiya" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
      <Input
        label="Telefon raqami"
        type="tel"
        placeholder="+998 XX XXX XX XX"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        required
      />
      <Input label="Maktab" value={school} onChange={(e) => setSchool(e.target.value)} />
      <Input label="Viloyat" value={region} onChange={(e) => setRegion(e.target.value)} />
      <Select label="Asosiy fan" value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
        <option value="">— tanlanmagan —</option>
        {subjects.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name_uz}
          </option>
        ))}
      </Select>
      <Select label="Tarif" value={planId} onChange={(e) => setPlanId(e.target.value)} required>
        {plans.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name} · {p.duration_days} kun · {p.price_uzs.toLocaleString('uz-UZ')} so'm
          </option>
        ))}
      </Select>
      {error && <p className="text-sm text-danger">{error}</p>}
      <Button type="submit" size="lg" disabled={submitting || !planId}>
        {submitting ? 'Ochilmoqda...' : 'Akkaunt ochish'}
      </Button>
    </form>
  )
}

function Row({ label, value, copy }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-sm text-text-mute">{label}:</span>
      <span className="flex items-center gap-1.5 font-heading font-semibold text-text">
        {value}
        {copy && (
          <button
            type="button"
            onClick={() => navigator.clipboard.writeText(value)}
            className="text-text-mute hover:text-text"
            aria-label="Nusxalash"
          >
            <Copy className="h-3.5 w-3.5" />
          </button>
        )}
      </span>
    </div>
  )
}
