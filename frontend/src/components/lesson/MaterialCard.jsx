import { Presentation, FileText, Printer, ListChecks, Download } from 'lucide-react'
import { formatFileSize } from '../../lib/format'
import { downloadLesson } from '../../api/lessons'

export const MATERIAL_META = {
  pptx: { icon: Presentation, label: 'Prezentatsiya', ext: 'pptx', suffix: '' },
  docx: { icon: FileText, label: 'Konspekt', ext: 'docx', suffix: '' },
  pdf_handout: { icon: Printer, label: 'Tarqatma materiallar', ext: 'pdf', suffix: '-tarqatma' },
  pdf_test_simple: { icon: ListChecks, label: 'Oddiy test', ext: 'pdf', suffix: '-test' },
}

export default function MaterialCard({ lessonId, lessonTitle, material }) {
  const meta = MATERIAL_META[material.type]
  if (!meta) return null
  const Icon = meta.icon
  const size = formatFileSize(material.file_size)

  function handleDownload() {
    downloadLesson(lessonId, material.type, `${lessonTitle}${meta.suffix}.${meta.ext}`)
  }

  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-white p-3.5">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600">
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate font-heading text-base font-semibold text-text">{meta.label}</p>
        <p className="text-sm text-text-mute">
          {meta.ext.toUpperCase()}
          {size ? ` · ${size}` : ''}
        </p>
      </div>
      <button
        onClick={handleDownload}
        aria-label={`${meta.label} yuklab olish`}
        className="flex h-11 min-w-[44px] shrink-0 items-center justify-center gap-1.5 rounded-xl bg-brand-50 px-3 text-sm font-semibold text-brand-700 hover:bg-brand-100"
      >
        <Download className="h-4 w-4" />
      </button>
    </div>
  )
}
