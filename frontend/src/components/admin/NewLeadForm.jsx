import { useEffect, useState } from 'react'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Select from '../ui/Select'
import { createLead } from '../../api/admin'
import { listSubjects } from '../../api/lessons'

export default function NewLeadForm({ onCreated }) {
  const [subjects, setSubjects] = useState([])
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [telegram, setTelegram] = useState('')
  const [region, setRegion] = useState('')
  const [subjectId, setSubjectId] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    listSubjects().then(setSubjects)
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await createLead({
        full_name: fullName,
        phone,
        telegram: telegram || undefined,
        region: region || undefined,
        subject_id: subjectId || undefined,
      })
      onCreated?.()
    } catch (err) {
      setError(err.response?.data?.errors?.[0]?.message ?? 'Xatolik yuz berdi.')
    } finally {
      setSubmitting(false)
    }
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
      <Input label="Telegram (ixtiyoriy)" value={telegram} onChange={(e) => setTelegram(e.target.value)} />
      <Input label="Viloyat" value={region} onChange={(e) => setRegion(e.target.value)} />
      <Select label="Fan" value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
        <option value="">— tanlanmagan —</option>
        {subjects.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name_uz}
          </option>
        ))}
      </Select>
      {error && <p className="text-sm text-danger">{error}</p>}
      <Button type="submit" size="lg" disabled={submitting}>
        {submitting ? 'Saqlanmoqda...' : 'Qo\'shish'}
      </Button>
    </form>
  )
}
