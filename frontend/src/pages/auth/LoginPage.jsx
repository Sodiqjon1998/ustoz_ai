import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const user = await login(phone, password)
      navigate(user.role === 'teacher' ? '/' : '/admin')
    } catch {
      setError('Telefon raqami yoki parol noto\'g\'ri.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-svh max-w-sm flex-col justify-center gap-6 px-6">
      <div className="text-center">
        <h1 className="font-heading text-3xl font-bold bg-gradient-to-br from-brand-500 to-purple-500 bg-clip-text text-transparent">
          USTOZ AI
        </h1>
        <p className="mt-1 text-text-mute">Dars materiallari — 2 daqiqada</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Telefon raqami"
          type="tel"
          placeholder="+998 XX XXX XX XX"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
        />
        <Input
          label="Parol"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <p className="text-sm text-danger">{error}</p>}
        <Button type="submit" size="lg" disabled={submitting}>
          {submitting ? 'Tekshirilmoqda...' : 'Kirish'}
        </Button>
      </form>
    </div>
  )
}
