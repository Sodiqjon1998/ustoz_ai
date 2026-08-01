import { useEffect, useState } from 'react'
import { Copy, CircleCheck } from 'lucide-react'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Select from '../ui/Select'
import { listPlans, createCodes, exportCodes } from '../../api/admin'

export default function GenerateCodesForm({ onCreated }) {
  const [plans, setPlans] = useState([])
  const [planId, setPlanId] = useState('')
  const [count, setCount] = useState(10)
  const [note, setNote] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState(null)

  useEffect(() => {
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
      const data = await createCodes({
        plan_id: Number(planId),
        count: Number(count),
        note: note || undefined,
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
      <div className="flex flex-col gap-4">
        <div className="flex flex-col items-center gap-2 py-2 text-center">
          <CircleCheck className="h-9 w-9 text-success" />
          <p className="font-heading text-lg font-semibold text-text">
            {result.codes.length} ta kod yaratildi
          </p>
        </div>
        <div className="max-h-60 overflow-y-auto rounded-xl border border-border p-3">
          {result.codes.map((code) => (
            <p key={code} className="py-1 text-center font-heading text-base tracking-wide text-text">
              {code}
            </p>
          ))}
        </div>
        <Button
          variant="secondary"
          onClick={() => {
            navigator.clipboard.writeText(result.codes.join('\n'))
          }}
        >
          <Copy className="h-4 w-4" />
          Barchasini nusxalash
        </Button>
        <Button variant="secondary" onClick={() => exportCodes(result.batch_id)}>
          CSV yuklab olish
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Select label="Tarif" value={planId} onChange={(e) => setPlanId(e.target.value)} required>
        {plans.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name} · {p.duration_days} kun
          </option>
        ))}
      </Select>
      <Input
        label="Nechta kod"
        type="number"
        min="1"
        max="200"
        value={count}
        onChange={(e) => setCount(e.target.value)}
        required
      />
      <Input
        label="Izoh (ixtiyoriy)"
        placeholder="Masalan: Andijon seminari"
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />
      {error && <p className="text-sm text-danger">{error}</p>}
      <Button type="submit" size="lg" disabled={submitting || !planId}>
        {submitting ? 'Yaratilmoqda...' : 'Kodlarni yaratish'}
      </Button>
    </form>
  )
}
