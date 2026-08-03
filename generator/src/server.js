import express from 'express'
import cors from 'cors'
import { randomUUID } from 'node:crypto'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildPptx } from './pptx/build.js'
import { buildDocx } from './docx/build.js'
import { buildHandoutPdf } from './pdf/handout.js'
import { buildTestSimplePdf } from './pdf/test-simple.js'

const app = express()
const PORT = process.env.GENERATOR_PORT ?? 4000
// Laravel bu fayllarni "local" diskdan o'qiydi, shuning uchun yo'l generator
// qaysi papkadan ishga tushirilganiga bog'liq bo'lmasligi kerak.
const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..')
const OUTPUT_DIR =
  process.env.GENERATOR_OUTPUT_DIR ??
  path.join(PROJECT_ROOT, 'storage', 'app', 'private', 'generated')

app.use(cors())
app.use(express.json({ limit: '10mb' }))

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' })
})

async function saveOutput(subdir, extension, buffer) {
  const dir = path.join(OUTPUT_DIR, subdir)
  await mkdir(dir, { recursive: true })

  const filename = `${randomUUID()}.${extension}`
  const filePath = path.join(dir, filename)
  await writeFile(filePath, buffer)

  return {
    path: filePath,
    relative_path: path.join(subdir, filename),
    file_size: buffer.length,
  }
}

app.post('/render/pptx', async (req, res) => {
  try {
    const presentation = req.body

    if (!presentation?.slides?.length) {
      return res.status(422).json({ error: '"slides" massivi bo\'sh yoki yo\'q.' })
    }

    const buffer = await buildPptx(presentation)
    res.json(await saveOutput('pptx', 'pptx', buffer))
  } catch (err) {
    console.error('[render/pptx]', err)
    res.status(500).json({ error: err.message })
  }
})

app.post('/render/docx', async (req, res) => {
  try {
    const outline = req.body

    if (!outline?.phases?.length) {
      return res.status(422).json({ error: '"phases" massivi bo\'sh yoki yo\'q.' })
    }

    const buffer = await buildDocx(outline)
    res.json(await saveOutput('docx', 'docx', buffer))
  } catch (err) {
    console.error('[render/docx]', err)
    res.status(500).json({ error: err.message })
  }
})

app.post('/render/pdf/handout', async (req, res) => {
  try {
    const input = req.body

    if (!input?.title) {
      return res.status(422).json({ error: '"title" maydoni yo\'q.' })
    }

    const buffer = await buildHandoutPdf(input)
    res.json(await saveOutput('pdf_handout', 'pdf', buffer))
  } catch (err) {
    console.error('[render/pdf/handout]', err)
    res.status(500).json({ error: err.message })
  }
})

app.post('/render/pdf/test-simple', async (req, res) => {
  try {
    const input = req.body

    if (!input?.tier1?.length && !input?.tier2?.length) {
      return res.status(422).json({ error: '"tier1"/"tier2" massivlari bo\'sh yoki yo\'q.' })
    }

    const buffer = await buildTestSimplePdf(input)
    res.json(await saveOutput('pdf_test_simple', 'pdf', buffer))
  } catch (err) {
    console.error('[render/pdf/test-simple]', err)
    res.status(500).json({ error: err.message })
  }
})

app.listen(PORT, () => {
  console.log(`USTOZ AI generator xizmati: http://localhost:${PORT}`)
})
