import { useEffect, useState } from 'react'
import { CircleCheck, Copy } from 'lucide-react'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Select from '../ui/Select'
import { listPlans, convertLead } from '../../api/admin'

export default function ConvertLeadForm({ lead, onConverted }) {
  const [plans, setPlans] = useState([])
  const [planId, setPlanId] = useState('')
  const [amount, setAmount] = useState('')
  const [method, setMethod] = useState('card_transfer')
  const [cardLast4, setCardLast4] = useState('')
  const [senderName, setSenderName] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState(null)

  useEffect(() => {
    listPlans().then((data) => {
      setPlans(data)
      const paid = data.find((p) => p.price_uzs > 0)
      if (paid) {
        setPlanId(String(paid.id))
        setAmount(String(paid.price_uzs))
      }
    })
  }, [])

  function handlePlanChange(id) {
    setPlanId(id)
    const plan = plans.find((p) => String(p.id) === id)
    if (plan) setAmount(String(plan.price_uzs))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const data = await convertLead(lead.id, {
        plan_id: Number(planId),
        amount_uzs: Number(amount),
        method,
        card_last4: cardLast4 || undefined,
        sender_name: senderName || undefined,
      })
      setResult(data)
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
        <h3 className="font-heading text-lg font-semibold text-text">Akkaunt ochildi</h3>
        <div className="w-full rounded-xl border border-border p-4 text-left">
          <Row label="Kod" value={result.user.teacher_code} />
          <Row label="Login" value={result.user.phone} />
          <Row label="Parol" value={result.user.temp_password} copy />
          <Row label="Obuna" value={`${result.subscription.plan} · ${result.subscription.ends_at} gacha`} />
        </div>
        <p className="text-xs text-text-mute">
          ⚠️ Parol faqat hozir ko'rinadi. O'qituvchiga qo'lda yetkazing (SMS/Telegram avtomatlashtirilmagan).
        </p>
        <Button size="lg" className="w-full" onClick={() => onConverted?.()}>
          Tayyor
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <p className="text-sm text-text-mute">
        {lead.full_name} · {lead.phone}
      </p>
      <Select label="Tarif" value={planId} onChange={(e) => handlePlanChange(e.target.value)} required>
        <option value="" disabled>
          — tanlang —
        </option>
        {plans.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name} · {p.duration_days} kun · {p.price_uzs.toLocaleString('uz-UZ')} so'm
          </option>
        ))}
      </Select>
      <Input
        label="Kelgan summa (so'm)"
        type="number"
        min="0"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        required
      />
      <Select label="To'lov usuli" value={method} onChange={(e) => setMethod(e.target.value)}>
        <option value="card_transfer">Karta o'tkazma</option>
        <option value="cash">Naqd</option>
        <option value="bank">Bank</option>
      </Select>
      <Input
        label="Karta oxirgi 4 raqami (ixtiyoriy)"
        maxLength={4}
        value={cardLast4}
        onChange={(e) => setCardLast4(e.target.value.replace(/\D/g, ''))}
      />
      <Input
        label="Yuboruvchi (chekdagi ism, ixtiyoriy)"
        value={senderName}
        onChange={(e) => setSenderName(e.target.value)}
      />
      {error && <p className="text-sm text-danger">{error}</p>}
      <Button type="submit" size="lg" disabled={submitting || !planId}>
        {submitting ? 'Ochilmoqda...' : '✅ Akkaunt ochish'}
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
