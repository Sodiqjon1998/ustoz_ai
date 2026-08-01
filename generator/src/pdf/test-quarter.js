import { renderPdf, buildTestHeader, buildTestSections, TEST_STYLES } from './printer.js'

/**
 * "Chorak nazorat ishi" — App\Services\Generator\TestQuarterBuilder to'liq
 * savol bankini (~28-30 ta) yuboradi: barcha oson/o'rta savollar "Asosiy
 * savollar" (1 ball), barcha qiyin savollar "Qo'shimcha savollar" (2 ball)
 * bo'limiga tushadi — test-simple.js bilan bir xil render mantig'i,
 * faqat kattaroq va to'liq savol banki bilan.
 *
 * @param {{
 *   title: string, subjectName: string, grade: number, topic: string,
 *   tier1: Array<{ text: string, options: string[] }>,
 *   tier2: Array<{ text: string, options: string[] }>,
 * }} input
 * @returns {Promise<Buffer>}
 */
export async function buildTestQuarterPdf(input) {
  const tier1 = input.tier1 ?? []
  const tier2 = input.tier2 ?? []
  const maxScore = tier1.length * 1 + tier2.length * 2

  const content = [
    ...buildTestHeader({
      title: input.title ?? 'Chorak nazorat ishi',
      subjectName: input.subjectName,
      grade: input.grade,
      topic: input.topic,
      maxScore,
    }),
    ...buildTestSections(tier1, tier2),
  ]

  return renderPdf({ content, styles: TEST_STYLES })
}
