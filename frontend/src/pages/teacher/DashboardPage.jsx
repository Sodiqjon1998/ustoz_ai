import { useCallback, useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sparkles, CircleCheck, Zap, LogOut } from 'lucide-react'
import { useAuth, resolveAuthRoute } from '../../hooks/useAuth'
import Modal from '../../components/ui/Modal'
import Button from '../../components/ui/Button'
import { SkeletonLessonCard } from '../../components/ui/Skeleton'
import LessonWizard from '../../components/lesson/LessonWizard'
import GenerationProgress from '../../components/lesson/GenerationProgress'
import LessonList from '../../components/lesson/LessonList'
import { listLessons, listSubjects, createLesson } from '../../api/lessons'
import { isSameDay, isSameMonth } from '../../lib/format'

export default function DashboardPage() {
  const { user, loading, logout } = useAuth()
  const [lessons, setLessons] = useState([])
  const [lessonsLoading, setLessonsLoading] = useState(true)
  const [subjects, setSubjects] = useState([])

  const [wizardOpen, setWizardOpen] = useState(false)
  const [genState, setGenState] = useState(null) // { status: 'running'|'done'|'error', payload, result }

  const authRoute = user ? resolveAuthRoute(user) : null
  const ready = authRoute === '/kabinet'

  const refreshLessons = useCallback(() => {
    setLessonsLoading(true)
    listLessons()
      .then(setLessons)
      .finally(() => setLessonsLoading(false))
  }, [])

  useEffect(() => {
    if (ready) {
      refreshLessons()
      listSubjects().then(setSubjects)
    }
  }, [ready, refreshLessons])

  if (loading) {
    return <div className="p-6 text-center text-text-mute">Yuklanmoqda...</div>
  }

  if (!user) {
    window.location.href = '/login'
    return null
  }

  if (!ready) {
    return <Navigate to={authRoute} replace />
  }

  function openWizard() {
    setGenState(null)
    setWizardOpen(true)
  }

  async function handleWizardSubmit(payload) {
    setGenState({ status: 'running', payload })
    try {
      const { data, cache_hit } = await createLesson(payload)
      setGenState({ status: 'done', payload, result: { lesson: data, cacheHit: cache_hit } })
      refreshLessons()
    } catch (err) {
      setGenState({
        status: 'error',
        payload,
        error: err.response?.data?.errors?.[0]?.message ?? 'Xatolik yuz berdi.',
      })
    }
  }

  function handleFinish() {
    setWizardOpen(false)
    setGenState(null)
  }

  const today = lessons.filter((l) => isSameDay(l.created_at)).length
  const thisMonth = lessons.filter((l) => isSameMonth(l.created_at)).length
  const total = lessons.length

  const isBackgroundGenerating = !wizardOpen && genState?.status === 'running'
  const isBackgroundDone = !wizardOpen && genState?.status === 'done'

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 pb-24 sm:pb-8">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="font-heading text-xl font-bold bg-gradient-to-br from-brand-500 to-purple-500 bg-clip-text text-transparent">
          USTOZ AI
        </h1>
        <button
          onClick={logout}
          className="flex h-10 items-center gap-1.5 rounded-full px-3 text-sm font-medium text-text-mute hover:bg-bg-subtle"
        >
          <LogOut className="h-4 w-4" />
          Chiqish
        </button>
      </header>

      <div className="mb-6">
        <p className="font-heading text-xl font-bold text-text">
          Assalomu alaykum, {user.full_name?.split(' ')[0] ?? user.full_name}! 👋
        </p>
        <p className="text-text-mute">
          {today > 0 ? `Bugun ${today} ta dars yaratdingiz` : 'Yangi dars yaratishga tayyormisiz?'}
        </p>
      </div>

      <motion.button
        type="button"
        onClick={openWizard}
        whileTap={{ scale: 0.98 }}
        className="mb-6 flex w-full flex-col items-center justify-center gap-1 rounded-2xl bg-gradient-to-br from-brand-500 to-purple-500 px-6 py-6 text-white shadow"
      >
        <span className="flex items-center gap-2 font-heading text-lg font-bold">
          <Sparkles className="h-5 w-5" />
          YANGI DARS YARATISH
        </span>
        <span className="text-sm text-white/85">2 daqiqada tayyor</span>
      </motion.button>

      <div className="mb-6 grid grid-cols-3 gap-3">
        <StatTile value={total === 20 ? '20+' : total} label="Darslar" />
        <StatTile value={thisMonth} label="Bu oy" />
        <StatTile value={today} label="Bugun" />
      </div>

      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-heading font-semibold">So'nggi darslar</h2>
      </div>

      {lessonsLoading ? (
        <div className="flex flex-col gap-3">
          <SkeletonLessonCard />
          <SkeletonLessonCard />
          <SkeletonLessonCard />
        </div>
      ) : (
        <LessonList lessons={lessons} onCreateNew={openWizard} />
      )}

      <Modal
        open={wizardOpen}
        onClose={() => setWizardOpen(false)}
        title={genState ? undefined : 'Yangi dars'}
      >
        {!genState && <LessonWizard subjects={subjects} onSubmit={handleWizardSubmit} />}

        {genState && genState.status !== 'done' && (
          <GenerationProgress
            status={genState.status}
            topic={genState.payload?.topic}
            onBackground={() => setWizardOpen(false)}
            onRetry={() => handleWizardSubmit(genState.payload)}
          />
        )}

        {genState?.status === 'done' && (
          <GenerationResult genState={genState} onClose={handleFinish} />
        )}
      </Modal>

      {(isBackgroundGenerating || isBackgroundDone) && (
        <motion.button
          type="button"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => setWizardOpen(true)}
          className={`fixed inset-x-4 bottom-4 z-40 mx-auto flex max-w-sm items-center gap-3 rounded-2xl px-4 py-3.5 text-left shadow-lg sm:inset-x-auto sm:right-6 ${
            isBackgroundDone ? 'bg-success text-white' : 'bg-text text-white'
          }`}
        >
          {isBackgroundDone ? (
            <CircleCheck className="h-5 w-5 shrink-0" />
          ) : (
            <Zap className="h-5 w-5 shrink-0 animate-pulse" />
          )}
          <span className="flex-1 text-sm font-medium">
            {isBackgroundDone ? 'Dars tayyor! Ko\'rish uchun bosing' : 'AI materiallarni tayyorlamoqda...'}
          </span>
        </motion.button>
      )}
    </div>
  )
}

function StatTile({ value, label }) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-border bg-white py-3">
      <span className="font-heading text-2xl font-bold text-text">{value}</span>
      <span className="text-sm text-text-mute">{label}</span>
    </div>
  )
}

function GenerationResult({ genState, onClose }) {
  const { lesson } = genState.result
  return (
    <div className="flex flex-col items-center gap-4 py-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
        <CircleCheck className="h-9 w-9 text-success" />
      </div>
      <div>
        <h3 className="font-heading text-lg font-semibold text-text">Dars tayyor!</h3>
        <p className="mt-1 text-text-mute">{lesson.title}</p>
        <p className="text-sm text-text-mute">
          {lesson.subject?.name_uz} · {lesson.grade}-sinf · {lesson.duration} daqiqa
        </p>
        <p className="mt-2 text-sm text-brand-700">
          {genState.result.cacheHit
            ? '⚡ Bu mavzu keshda topildi — darhol tayyor bo\'ldi!'
            : '✨ AI orqali yangidan yaratildi!'}
        </p>
      </div>
      <Button size="lg" className="w-full" onClick={onClose}>
        Materiallarni ko'rish
      </Button>
    </div>
  )
}
