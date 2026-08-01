import { useEffect, useState } from 'react'
import { CircleCheck, Search, X } from 'lucide-react'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Select from '../ui/Select'
import { listTeachers, listPlans, createPayment } from '../../api/admin'

export default function RecordPaymentForm({ onCreated }) {
  const [q, setQ] = useState('')
  const [results, setResults] = useState([])
  const [teacher, setTeacher] = useState(null)
  const [plans, setPlans] = useState([])
  const [planId, setPlanId] = useState('')
  const [amount, setAmount] = useState('')
  const [method, setMethod] = useState('card_transfer')
  const [cardLast4, setCardLast4] = useState('')
  const [senderName, setSenderName] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

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

  useEffect(() => {
    if (!q.trim() || teacher) {
      setResults([])
      return
    }
    const timeout = setTimeout(() => {
      listTeachers({ q }).then((res) => setResults(res.data))
    }, 250)
    return () => clearTimeout(timeout)
  }, [q, teacher])

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
      await createPayment({
        user_id: teacher.id,
        plan_id: Number(planId),
        amount_uzs: Number(amount),
        method,
        card_last4: cardLast4 || undefined,
        sender_name: senderName || undefined,
      })
      setDone(true)
      onCreated?.()
    } catch (err) {
      setError(err.response?.data?.errors?.[0]?.message ?? 'Xatolik yuz berdi.')
    } finally {
      setSubmitting(false)
    }
  }

  if (done) {
    return (
      <div className="flex flex-col items-center gap-3 py-6 text-center">
        <CircleCheck className="h-12 w-12 text-success" />
        <p className="font-heading text-lg font-semibold text-text">To'lov qayd etildi</p>
        <p className="text-sm text-text-mute">{teacher.full_name} obunasi yangilandi</p>
      </div>
    )
  }

  if (!teacher) {
    return (
      <div className="flex flex-col gap-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-mute" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="O'qituvchini qidiring (ism, telefon, kod)"
            className="h-12 w-full rounded-xl border border-border pl-11 pr-4 text-base focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <div className="flex flex-col gap-2">
          {results.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setTeacher(r)}
              className="flex items-center justify-between rounded-xl border border-border p-3 text-left hover:border-brand-200"
            >
              <span className="font-medium text-text">{r.full_name}</span>
              <span className="text-sm text-text-mute">{r.phone}</span>
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex items-center justify-between rounded-xl bg-bg-subtle px-4 py-3">
        <div>
          <p className="font-medium text-text">{teacher.full_name}</p>
          <p className="text-sm text-text-mute">{teacher.phone}</p>
        </div>
        <button
          type="button"
          onClick={() => setTeacher(null)}
          aria-label="Boshqasini tanlash"
          className="text-text-mute hover:text-text"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <Select label="Tarif" value={planId} onChange={(e) => handlePlanChange(e.target.value)} required>
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
        label="Yuboruvchi (ixtiyoriy)"
        value={senderName}
        onChange={(e) => setSenderName(e.target.value)}
      />
      {error && <p className="text-sm text-danger">{error}</p>}
      <Button type="submit" size="lg" disabled={submitting}>
        {submitting ? 'Saqlanmoqda...' : "To'lovni qayd etish"}
      </Button>
    </form>
  )
}
