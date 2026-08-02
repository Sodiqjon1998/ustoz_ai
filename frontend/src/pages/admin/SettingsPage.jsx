import { useEffect, useState } from 'react'
import { KeyRound, CircleCheck } from 'lucide-react'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { getSettings, updateSettings } from '../../api/admin'

export default function SettingsPage() {
  const [settings, setSettings] = useState(null)
  const [newKey, setNewKey] = useState('')
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  function refresh() {
    return getSettings().then(setSettings)
  }

  useEffect(() => {
    refresh()
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSaved(false)
    setSubmitting(true)
    try {
      await updateSettings({ gemini_api_key: newKey.trim() })
      setNewKey('')
      setSaved(true)
      await refresh()
    } catch (err) {
      setError(err.response?.data?.errors?.[0]?.message ?? 'Xatolik yuz berdi.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-4 pb-4">
      <h1 className="font-heading text-xl font-bold text-text">Sozlamalar</h1>

      <div className="rounded-xl border border-border bg-white p-4">
        <div className="mb-3 flex items-center gap-2">
          <KeyRound className="h-4 w-4 text-brand-600" />
          <h2 className="font-heading font-semibold text-text">Gemini API kaliti</h2>
        </div>

        {settings && (
          <div className="mb-4 flex flex-col gap-1 text-sm text-text-mute">
            <p>
              Holati:{' '}
              {settings.gemini_api_key_set ? (
                <span className="font-medium text-success">
                  o'rnatilgan ({settings.gemini_api_key_masked})
                </span>
              ) : (
                <span className="font-medium text-danger">o'rnatilmagan (.env'dan olinadi)</span>
              )}
            </p>
            <p>Asosiy model: {settings.gemini_model}</p>
            <p>Zaxira model: {settings.gemini_fallback_model}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <Input
            label="Yangi kalit"
            type="text"
            placeholder="AIza..."
            value={newKey}
            onChange={(e) => setNewKey(e.target.value)}
            required
          />
          {error && <p className="text-sm text-danger">{error}</p>}
          {saved && (
            <p className="flex items-center gap-1.5 text-sm text-success">
              <CircleCheck className="h-4 w-4" />
              Saqlandi — keyingi generatsiyadan shu kalit ishlatiladi.
            </p>
          )}
          <Button type="submit" disabled={submitting || !newKey.trim()}>
            {submitting ? 'Saqlanmoqda...' : 'Saqlash'}
          </Button>
        </form>
      </div>

      <p className="text-xs text-text-mute">
        Kalitni{' '}
        <a
          href="https://aistudio.google.com/apikey"
          target="_blank"
          rel="noreferrer"
          className="underline"
        >
          Google AI Studio
        </a>
        dan olasiz. Bu yerda saqlansa, serverga qayta kirmasdan almashtirish mumkin.
      </p>
    </div>
  )
}
