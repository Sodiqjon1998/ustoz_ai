import Card from '../ui/Card'
import { downloadLesson } from '../../api/lessons'

const STATUS_LABELS = {
  queued: { text: 'Navbatda', className: 'bg-amber-100 text-amber-700' },
  generating: { text: 'Yaratilmoqda', className: 'bg-amber-100 text-amber-700' },
  ready: { text: 'Tayyor', className: 'bg-emerald-100 text-emerald-700' },
  failed: { text: 'Xato', className: 'bg-red-100 text-red-700' },
}

export default function LessonList({ lessons }) {
  if (lessons.length === 0) {
    return (
      <p className="text-center text-text-mute">
        Hali darslar yo'q. Yuqoridagi tugma orqali birinchisini yarating.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {lessons.map((lesson) => {
        const status = STATUS_LABELS[lesson.status] ?? STATUS_LABELS.queued
        const materialTypes = (lesson.material_set?.materials ?? []).map((m) => m.type)

        return (
          <Card key={lesson.id} className="flex items-center justify-between gap-3">
            <div>
              <p className="font-medium">{lesson.title ?? lesson.topic_raw}</p>
              <p className="text-sm text-text-mute">
                {lesson.subject?.name_uz} · {lesson.grade}-sinf · {lesson.duration} daq
                {lesson.was_cache_hit && ' · ⚡ keshdan'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {materialTypes.includes('pptx') && (
                <button
                  onClick={() => downloadLesson(lesson.id, 'pptx', `${lesson.title}.pptx`)}
                  className="text-sm font-medium text-brand-700 hover:underline"
                >
                  ⬇ PPTX
                </button>
              )}
              {materialTypes.includes('docx') && (
                <button
                  onClick={() => downloadLesson(lesson.id, 'docx', `${lesson.title}.docx`)}
                  className="text-sm font-medium text-brand-700 hover:underline"
                >
                  ⬇ DOCX
                </button>
              )}
              {materialTypes.includes('pdf_handout') && (
                <button
                  onClick={() => downloadLesson(lesson.id, 'pdf_handout', `${lesson.title}-tarqatma.pdf`)}
                  className="text-sm font-medium text-brand-700 hover:underline"
                >
                  ⬇ Tarqatma
                </button>
              )}
              {materialTypes.includes('pdf_test_simple') && (
                <button
                  onClick={() => downloadLesson(lesson.id, 'pdf_test_simple', `${lesson.title}-test.pdf`)}
                  className="text-sm font-medium text-brand-700 hover:underline"
                >
                  ⬇ Test (20)
                </button>
              )}
              {materialTypes.includes('pdf_test_quarter') && (
                <button
                  onClick={() => downloadLesson(lesson.id, 'pdf_test_quarter', `${lesson.title}-chorak-testi.pdf`)}
                  className="text-sm font-medium text-brand-700 hover:underline"
                >
                  ⬇ Chorak testi
                </button>
              )}
              {materialTypes.includes('pdf_extras') && (
                <button
                  onClick={() => downloadLesson(lesson.id, 'pdf_extras', `${lesson.title}-qoshimcha.pdf`)}
                  className="text-sm font-medium text-brand-700 hover:underline"
                >
                  ⬇ Qo'shimcha
                </button>
              )}
              <span className={`rounded-full px-3 py-1 text-xs font-medium ${status.className}`}>
                {status.text}
              </span>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
