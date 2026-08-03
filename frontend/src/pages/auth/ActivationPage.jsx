import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import { useAuth, resolveAuthRoute } from '../../hooks/useAuth'
import { activate } from '../../api/auth'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'

export default function ActivationPage() {
  const { logout, refreshUser } = useAuth()
  const navigate = useNavigate()
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!code.trim()) return

    setSubmitting(true)
    try {
      await activate(code.trim())
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
          <Sparkles className="h-6 w-6" />
        </div>
        <h1 className="font-heading text-2xl font-bold text-text">Hisobingizni faollashtiring</h1>
        <p className="mt-1 text-text-mute">
          Obunangiz hali faol emas. Administratordan olgan faollashtirish kodini kiriting.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Faollashtirish kodi"
          placeholder="K7XQ93RT"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          autoFocus
          required
          className="text-center text-lg tracking-wide uppercase"
        />
        {error && <p className="text-sm text-danger">{error}</p>}
        <Button type="submit" size="lg" disabled={submitting}>
          {submitting ? 'Tekshirilmoqda...' : 'Faollashtirish'}
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
