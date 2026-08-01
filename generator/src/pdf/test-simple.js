import { renderPdf, buildTestHeader, buildTestSections, TEST_STYLES } from './printer.js'

/**
 * O'quvchi uchun chop etiladigan qisqa test — to'g'ri javob/izoh ko'rsatilmaydi.
 * App\Services\Generator\TestSimpleBuilder to'liq savol bankidan ~20 ta
 * savolli qism-to'plamni (16 oson/o'rta + 4 qiyin) tanlab yuboradi.
 *
 * @param {{
 *   title: string, subjectName: string, grade: number, topic: string,
 *   tier1: Array<{ text: string, options: string[] }>,
 *   tier2: Array<{ text: string, options: string[] }>,
 * }} input
 * @returns {Promise<Buffer>}
 */
export async function buildTestSimplePdf(input) {
  const tier1 = input.tier1 ?? []
  const tier2 = input.tier2 ?? []
  const maxScore = tier1.length * 1 + tier2.length * 2

  const content = [
    ...buildTestHeader({
      title: input.title ?? `${input.subjectName ?? ''} fanidan test`,
      subjectName: input.subjectName,
      grade: input.grade,
      topic: input.topic,
      maxScore,
    }),
    ...buildTestSections(tier1, tier2),
  ]

  return renderPdf({ content, styles: TEST_STYLES })
}
