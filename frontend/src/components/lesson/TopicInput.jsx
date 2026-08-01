import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Flame, Zap } from 'lucide-react'
import Input from '../ui/Input'
import { getPopularTopics } from '../../api/lessons'

export default function TopicInput({ subjectId, grade, value, onChange }) {
  const [popular, setPopular] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!subjectId || !grade) return
    let cancelled = false
    setLoading(true)
    getPopularTopics(subjectId, grade)
      .then((topics) => {
        if (!cancelled) setPopular(topics)
      })
      .catch(() => {
        if (!cancelled) setPopular([])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [subjectId, grade])

  return (
    <div className="flex flex-col gap-5">
      <Input
        label="Dars mavzusi"
        placeholder="Masalan: Imya prilagatelnoye"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoFocus
        className="text-lg"
      />

      {!loading && popular.length > 0 && (
        <div>
          <p className="mb-2 flex items-center gap-1.5 text-sm font-medium text-text-mute">
            <Flame className="h-4 w-4 text-warning" />
            Mashhur mavzular
          </p>
          <div className="flex flex-col gap-2">
            {popular.map((t, i) => (
              <motion.button
                key={t.topic}
                type="button"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: i * 0.04, ease: [0.16, 1, 0.3, 1] }}
                onClick={() => onChange(t.topic)}
                className="flex min-h-[48px] items-center justify-between gap-2 rounded-xl border border-border bg-white px-4 py-3 text-left text-base hover:border-brand-300 hover:bg-brand-50"
              >
                <span>{t.topic}</span>
                {t.hit_count > 0 && <Zap className="h-4 w-4 shrink-0 text-info" />}
              </motion.button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
