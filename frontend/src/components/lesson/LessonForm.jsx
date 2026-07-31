import { useEffect, useState } from 'react'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Select from '../ui/Select'
import { createLesson, listSubjects } from '../../api/lessons'

const GRADES = Array.from({ length: 11 }, (_, i) => i + 1)
const LANGUAGES = [
  { value: 'uz', label: "O'zbek" },
  { value: 'ru', label: 'Rus' },
  { value: 'en', label: 'Ingliz' },
]

export default function LessonForm({ onCreated, onCancel }) {
  const [subjects, setSubjects] = useState([])
  const [subjectId, setSubjectId] = useState('')
  const [grade, setGrade] = useState(5)
  const [topic, setTopic] = useState('')
  const [duration, setDuration] = useState(45)
  const [language, setLanguage] = useState('uz')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)

  useEffect(() => {
    listSubjects().then((data) => {
      setSubjects(data)
      if (data.length > 0) setSubjectId(data[0].id)
    })
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setResult(null)
    setSubmitting(true)
    try {
      const { data, cache_hit } = await createLesson({
        subject_id: Number(subjectId),
        grade: Number(grade),
        topic,
        duration: Number(duration),
        language,
      })
      setResult({ cacheHit: cache_hit, lesson: data })
      onCreated?.()
    } catch (err) {
      setError(
        err.response?.data?.errors?.[0]?.message ?? 'Xatolik yuz berdi.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Select
        label="Fan"
        value={subjectId}
        onChange={(e) => setSubjectId(e.target.value)}
        required
      >
        {subjects.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name_uz}
          </option>
        ))}
      </Select>

      <Select label="Sinf" value={grade} onChange={(e) => setGrade(e.target.value)}>
        {GRADES.map((g) => (
          <option key={g} value={g}>
            {g}-sinf
          </option>
        ))}
      </Select>

      <Input
        label="Mavzu"
        placeholder="Masalan: Imya prilagatelnoye"
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        required
      />

      <Select
        label="Davomiyligi"
        value={duration}
        onChange={(e) => setDuration(e.target.value)}
      >
        <option value={45}>45 daqiqa</option>
        <option value={80}>80 daqiqa (juftlik)</option>
      </Select>

      <Select
        label="Til"
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
      >
        {LANGUAGES.map((l) => (
          <option key={l.value} value={l.value}>
            {l.label}
          </option>
        ))}
      </Select>

      {error && <p className="text-sm text-danger">{error}</p>}

      {result && (
        <p className="text-sm text-brand-700">
          {result.cacheHit
            ? '✅ Bu mavzu keshda topildi — darhol tayyor!'
            : '✨ AI orqali yangi material yaratildi!'}
        </p>
      )}

      <div className="flex gap-2">
        <Button type="submit" disabled={submitting} className="flex-1">
          {submitting ? 'Yuborilmoqda...' : 'Yaratish'}
        </Button>
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Bekor qilish
          </Button>
        )}
      </div>
    </form>
  )
}
