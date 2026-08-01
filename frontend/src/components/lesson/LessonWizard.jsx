import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, Sparkles } from 'lucide-react'
import Button from '../ui/Button'
import { ProgressBar } from '../ui/Progress'
import SubjectPicker from './SubjectPicker'
import GradePicker from './GradePicker'
import TopicInput from './TopicInput'
import DurationLanguageStep from './DurationLanguageStep'

const TOTAL_STEPS = 4

const STEP_TITLES = [
  'Qaysi fandan dars?',
  'Qaysi sinf?',
  'Dars mavzusi',
  'Davomiyligi va til',
]

export default function LessonWizard({ subjects, onSubmit }) {
  const [step, setStep] = useState(1)
  const [subjectId, setSubjectId] = useState(null)
  const [grade, setGrade] = useState(null)
  const [topic, setTopic] = useState('')
  const [duration, setDuration] = useState(45)
  const [language, setLanguage] = useState('uz')
  const [direction, setDirection] = useState(1)

  const canNext =
    (step === 1 && subjectId != null) ||
    (step === 2 && grade != null) ||
    (step === 3 && topic.trim().length >= 2) ||
    step === 4

  function goNext() {
    if (!canNext) return
    if (step === TOTAL_STEPS) {
      onSubmit({
        subject_id: Number(subjectId),
        grade: Number(grade),
        topic: topic.trim(),
        duration: Number(duration),
        language,
      })
      return
    }
    setDirection(1)
    setStep((s) => Math.min(TOTAL_STEPS, s + 1))
  }

  function goBack() {
    setDirection(-1)
    setStep((s) => Math.max(1, s - 1))
  }

  // Eslatma: bu yerda ataylab AnimatePresence ishlatilmaydi — Modal.jsx allaqachon
  // o'zining AnimatePresence'i ichida render qiladi, va ichma-ich AnimatePresence
  // "exit" animatsiyasi ba'zan hech qachon tugamay qolib, eski qadam DOM'da abadiy
  // qolib ketishiga (va yangi qadam hech qachon o'rniga kelmasligiga) olib keldi.
  // Shu sabab faqat "enter" animatsiyasi qo'llanadi — `key={step}` o'zgarganda
  // React eski qadamni darhol olib tashlaydi, yangisini darhol qo'shadi.

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        {step > 1 ? (
          <button
            type="button"
            onClick={goBack}
            aria-label="Orqaga"
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-text-mute hover:bg-bg-subtle"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        ) : (
          <div className="w-10" />
        )}
        <ProgressBar steps={TOTAL_STEPS} value={step} className="flex-1" />
        <span className="w-12 shrink-0 text-right text-sm font-medium text-text-mute">
          {step} / {TOTAL_STEPS}
        </span>
      </div>

      <h2 className="font-heading text-xl font-bold text-text">{STEP_TITLES[step - 1]}</h2>

      <div className="min-h-[280px] overflow-hidden">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: direction > 0 ? 24 : -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          {step === 1 && (
            <SubjectPicker subjects={subjects} value={subjectId} onChange={setSubjectId} />
          )}
          {step === 2 && <GradePicker value={grade} onChange={setGrade} />}
          {step === 3 && (
            <TopicInput
              subjectId={subjectId}
              grade={grade}
              value={topic}
              onChange={setTopic}
            />
          )}
          {step === 4 && (
            <DurationLanguageStep
              duration={duration}
              language={language}
              onDuration={setDuration}
              onLanguage={setLanguage}
            />
          )}
        </motion.div>
      </div>

      <Button size="lg" disabled={!canNext} onClick={goNext} className="w-full">
        {step === TOTAL_STEPS ? (
          <>
            <Sparkles className="h-5 w-5" />
            Yaratish
          </>
        ) : (
          'Davom etish'
        )}
      </Button>
    </div>
  )
}
