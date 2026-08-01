import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { KeyRound } from 'lucide-react'
import { useAuth, resolveAuthRoute } from '../../hooks/useAuth'
import { firstChangePassword } from '../../api/auth'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'

export default function ForceChangePasswordPage() {
  const { logout, refreshUser } = useAuth()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (password.length < 6) {
      setError('Parol kamida 6 ta belgidan iborat bo\'lishi kerak.')
      return
    }
    if (password !== confirm) {
      setError('Parollar mos kelmadi.')
      return
    }

    setSubmitting(true)
    try {
      await firstChangePassword(password, confirm)
      const fresh = await refreshUser()
      navigate(resolveAuthRoute(fresh), { replace: true })
    } catch (err) {
      setError(err.response?.data?.errors?.[0]?.message ?? 'Xatolik yuz berdi.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-svh max-w-sm flex-col justify-center gap-6 px-6">
      <div className="text-center">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-purple-500 text-white">
          <KeyRound className="h-6 w-6" />
        </div>
        <h1 className="font-heading text-2xl font-bold text-text">Yangi parol o'rnating</h1>
        <p className="mt-1 text-text-mute">
          Bu birinchi kirishingiz. Davom etish uchun o'zingizga qulay yangi parol tanlang.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Yangi parol"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoFocus
          required
        />
        <Input
          label="Yangi parolni takrorlang"
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
        />
        {error && <p className="text-sm text-danger">{error}</p>}
        <Button type="submit" size="lg" disabled={submitting}>
          {submitting ? 'Saqlanmoqda...' : 'Parolni saqlash'}
        </Button>
      </form>

      <button
        type="button"
        onClick={logout}
        className="text-center text-sm text-text-mute hover:text-text"
      >
        Boshqa akkaunt bilan kirish
      </button>
    </div>
  )
}
