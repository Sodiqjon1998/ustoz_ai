import { useState } from 'react'
import { motion } from 'framer-motion'
import { BookOpen, Hourglass, AlertTriangle } from 'lucide-react'
import Modal from '../ui/Modal'
import EmptyState from '../ui/EmptyState'
import LessonCard from './LessonCard'
import MaterialCard from './MaterialCard'

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04 } },
}
const item = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] } },
}

export default function LessonList({ lessons, onCreateNew }) {
  const [selected, setSelected] = useState(null)

  if (lessons.length === 0) {
    return (
      <EmptyState
        icon={BookOpen}
        title="Hali dars yaratmadingiz"
        description="Birinchi darsingizni 2 daqiqada yarating"
        actionLabel="✨ Dars yaratish"
        onAction={onCreateNew}
      />
    )
  }

  return (
    <>
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="flex flex-col gap-3"
      >
        {lessons.map((lesson) => (
          <motion.div key={lesson.id} variants={item}>
            <LessonCard lesson={lesson} onOpen={setSelected} />
          </motion.div>
        ))}
      </motion.div>

      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.title ?? selected?.topic_raw}
      >
        {selected && <LessonDetail lesson={selected} />}
      </Modal>
    </>
  )
}

function LessonDetail({ lesson }) {
  const materials = lesson.material_set?.materials ?? []

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-text-mute">
        {lesson.subject?.name_uz} · {lesson.grade}-sinf · {lesson.duration} daqiqa
      </p>

      {lesson.status === 'generating' || lesson.status === 'queued' ? (
        <div className="flex items-center gap-2 rounded-xl bg-warning/10 px-4 py-3 text-warning">
          <Hourglass className="h-5 w-5 shrink-0" />
          <p className="text-sm font-medium">Materiallar hali tayyorlanmoqda.</p>
        </div>
      ) : lesson.status === 'failed' ? (
        <div className="flex items-center gap-2 rounded-xl bg-danger/10 px-4 py-3 text-danger">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <p className="text-sm font-medium">Bu darsni yaratishda xatolik yuz bergan.</p>
        </div>
      ) : materials.length === 0 ? (
        <p className="text-sm text-text-mute">Hech qanday fayl topilmadi.</p>
      ) : (
        <div className="flex flex-col gap-2.5">
          {materials.map((m) => (
            <MaterialCard
              key={m.id}
              lessonId={lesson.id}
              lessonTitle={lesson.title ?? lesson.topic_raw}
              material={m}
            />
          ))}
        </div>
      )}
    </div>
  )
}
