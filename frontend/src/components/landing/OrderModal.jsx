import { useEffect, useState } from 'react'
import { Phone, Send } from 'lucide-react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Select from '../ui/Select'
import { CONTACTS } from '../../lib/contacts'
import { listPublicPlans, listPublicSubjects, submitLead } from '../../api/public'

/**
 * Landing sahifadagi "Buyurtma berish" modali. Yuborilgach — "muvaffaqiyat"
 * ekraniga o'tadi, u yerda foydalanuvchi telefon yoki Telegram orqali
 * to'g'ridan-to'g'ri bog'lanish tugmalarini ham ko'radi (docs §3.2 §4.1
 * kuchli talab: forma to'ldirgan foydalanuvchini bloklab qo'yma).
 */
export default function OrderModal({ open, onClose, defaultPlan = null }) {
  const [plans, setPlans] = useState([])
  const [subjects, setSubjects] = useState([])
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [telegram, setTelegram] = useState('')
  const [region, setRegion] = useState('')
  const [subjectId, setSubjectId] = useState('')
  const [planId, setPlanId] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!open) return
    listPublicPlans().then(setPlans)
    listPublicSubjects().then(setSubjects)
  }, [open])

  useEffect(() => {
    if (defaultPlan && plans.length) {
      const match = plans.find((p) => p.name.toLowerCase() === defaultPlan.toLowerCase())
      if (match) setPlanId(String(match.id))
    }
  }, [defaultPlan, plans])

  function reset() {
    setFullName('')
    setPhone('')
    setTelegram('')
    setRegion('')
    setSubjectId('')
    setPlanId('')
    setError('')
    setSuccess(false)
  }

  function handleClose() {
    reset()
    onClose?.()
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const chosenPlan = plans.find((p) => String(p.id) === planId)
      await submitLead({
        full_name: fullName,
        phone,
        telegram: telegram || undefined,
        region: region || undefined,
        subject_id: subjectId ? Number(subjectId) : undefined,
        plan_interest: chosenPlan?.name,
      })
      setSuccess(true)
    } catch (err) {
      setError(err.response?.data?.errors?.[0]?.message ?? "Yuborishda xatolik. Qayta urinib ko'ring.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal open={open} onClose={handleClose} title={success ? '' : 'Buyurtma berish'}>
      {success ? (
        <div className="flex flex-col items-center gap-4 py-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10 text-4xl text-success">
            ✅
          </div>
          <h3 className="font-heading text-xl font-bold text-text">Murojaatingiz qabul qilindi</h3>
          <p className="text-text-mute">
            1 soat ichida bog'lanamiz. Shoshilinch bo'lsa — quyidagi tugmalar orqali o'zingiz yozing:
          </p>
          <div className="flex w-full flex-col gap-2">
            <a
              href={`https://t.me/${CONTACTS.telegramUsername}`}
              target="_blank"
              rel="noreferrer"
              className="flex h-14 items-center justify-center gap-2 rounded-xl bg-brand-50 font-heading text-lg font-semibold text-brand-700 hover:bg-brand-100"
            >
              <Send className="h-5 w-5" />
              Telegramda yozish
            </a>
            <a
              href={`tel:${CONTACTS.phoneE164}`}
              className="flex h-14 items-center justify-center gap-2 rounded-xl border border-border font-heading text-lg font-semibold text-text hover:bg-bg-subtle"
            >
              <Phone className="h-5 w-5" />
              Qo'ng'iroq qilish
            </a>
          </div>
          <Button variant="ghost" onClick={handleClose} className="mt-2">
            Yopish
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <p className="text-sm text-text-mute">
            Ma'lumotlaringizni qoldiring — 1 soat ichida bog'lanamiz.
          </p>
          <Input
            label="Ism familiya *"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
          <Input
            label="Telefon raqami *"
            type="tel"
            placeholder="+998 XX XXX XX XX"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
          <Input
            label="Telegram (ixtiyoriy)"
            placeholder="@username"
            value={telegram}
            onChange={(e) => setTelegram(e.target.value)}
          />
          <Input
            label="Viloyat / shahar"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
          />
          <Select
            label="Qaysi fandan dars berasiz?"
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value)}
          >
            <option value="">— tanlanmagan —</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name_uz}
              </option>
            ))}
          </Select>
          <Select
            label="Tarif"
            value={planId}
            onChange={(e) => setPlanId(e.target.value)}
          >
            <option value="">— hali qaror qilmadim —</option>
            {plans.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} · {p.price_uzs.toLocaleString('uz-UZ')} so'm
              </option>
            ))}
          </Select>
          {error && <p className="text-sm text-danger">{error}</p>}
          <Button type="submit" size="lg" disabled={submitting}>
            {submitting ? 'Yuborilmoqda...' : 'Yuborish →'}
          </Button>
          <div className="border-t border-border pt-4 text-center text-sm text-text-mute">
            Yoki to'g'ridan-to'g'ri:{' '}
            <a href={`tel:${CONTACTS.phoneE164}`} className="font-medium text-brand-600">
              {CONTACTS.phoneDisplay}
            </a>
            {' · '}
            <a
              href={`https://t.me/${CONTACTS.telegramUsername}`}
              target="_blank"
              rel="noreferrer"
              className="font-medium text-brand-600"
            >
              {CONTACTS.telegramHandle}
            </a>
          </div>
        </form>
      )}
    </Modal>
  )
}
