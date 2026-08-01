import {
  addBottomBar,
  addEdgeStripe,
  addHeading,
  addNumberBadge,
  bodyFontSize,
  IMAGE_BOX,
  TEXT_W,
  TEXT_X,
} from './shared.js'

/**
 * "chart" maketi — chap tomonda odatdagi matn, o'ng tomonda (illyustratsiya
 * kartasi o'rnida) haqiqiy PPTX grafigi: ustunli yoki doiraviy diagramma.
 * Grafik PowerPoint'ning o'z obyekti sifatida qo'shiladi, ya'ni o'qituvchi
 * uni tahrirlashi ham mumkin.
 *
 * Raqamlar Gemini'dan keladi — mavzuda haqiqiy, tekshiriladigan son bo'lmasa
 * bu maket umuman tanlanmasligi kerak (prompt'da shu qat'iy aytilgan).
 */

// Grafik uchun o'ng ustun: sarlavha, grafik maydoni va izoh qatori.
const PANEL = IMAGE_BOX
const CHART_TITLE_H = 0.55
const CAPTION_H = 0.62

// Doiraviy diagrammada bo'laklar bir-biridan ajralib turishi kerak, ustunli
// diagrammada esa bitta qatorning hamma ustuni BIR XIL rangda bo'lsin —
// aks holda ranglar almashib, o'quvchida "har rang boshqa narsani bildiradi"
// degan noto'g'ri taassurot qoladi.
function pieColors(theme) {
  return [theme.accent, theme.soft, theme.cream, theme.brand]
}

export function buildChartSlide(pptx, slide, theme, meta = {}) {
  const s = pptx.addSlide()

  s.background = { color: theme.cream }

  addEdgeStripe(s, { color: theme.brand })
  addNumberBadge(s, { pageNumber: meta.pageNumber ?? 0, theme })
  addHeading(s, { title: slide.title, theme })

  // Grafik uchun to'q fon paneli — illyustratsiya kartasi bilan bir xil o'lcham,
  // shunda slaydlar ketma-ketligida ritm buzilmaydi.
  s.addShape('rect', {
    x: PANEL.x,
    y: PANEL.y,
    w: PANEL.w,
    h: PANEL.h,
    fill: { color: theme.deep },
    line: { type: 'none' },
  })

  const chart = slide.chart ?? {}
  const points = (chart.data ?? []).filter((d) => d && d.label && Number.isFinite(Number(d.value)))

  if (chart.title) {
    s.addText(chart.title, {
      x: PANEL.x + 0.22,
      y: PANEL.y + 0.18,
      w: PANEL.w - 0.44,
      h: CHART_TITLE_H,
      fontFace: theme.headFont,
      fontSize: 13,
      bold: true,
      color: 'FFFFFF',
      align: 'center',
      valign: 'middle',
    })
  }

  if (points.length > 0) {
    const isPie = chart.kind === 'pie'
    const chartY = PANEL.y + CHART_TITLE_H + 0.22
    const chartH = PANEL.h - CHART_TITLE_H - CAPTION_H - 0.5

    const data = [
      {
        name: chart.series_name || chart.title || 'Qiymat',
        labels: points.map((d) => String(d.label)),
        values: points.map((d) => Number(d.value)),
      },
    ]

    const common = {
      x: PANEL.x + 0.16,
      y: chartY,
      w: PANEL.w - 0.32,
      h: chartH,
      dataBorder: { pt: 0, color: theme.deep },
      showLegend: false,
      showTitle: false,
    }

    if (isPie) {
      s.addChart(pptx.ChartType.doughnut, data, {
        ...common,
        chartColors: pieColors(theme),
        holeSize: 52,
        showLegend: true,
        legendPos: 'b',
        legendColor: 'FFFFFF',
        legendFontSize: 10,
        legendFontFace: theme.bodyFont,
        showPercent: true,
        dataLabelColor: 'FFFFFF',
        dataLabelFontSize: 10,
        dataLabelFontFace: theme.bodyFont,
      })
    } else {
      // Gorizontal ustunlar — yorliqlar uzun bo'lsa ham o'qiladi (panel tor).
      s.addChart(pptx.ChartType.bar, data, {
        ...common,
        barDir: 'bar',
        barGapWidthPct: 45,
        // Bitta qator — bitta rang (ro'yxat aylanib, hamma ustunga shu rang tushadi).
        chartColors: [theme.accent],
        catAxisLabelColor: 'FFFFFF',
        catAxisLabelFontSize: 10,
        catAxisLabelFontFace: theme.bodyFont,
        catAxisLineShow: false,
        // Qiymat har bir ustun yonida yozilgani uchun pastdagi son o'qi ortiqcha —
        // tor panelda u siqilib, o'qilmas bo'lib qolardi.
        valAxisHidden: true,
        valAxisLineShow: false,
        valGridLine: { style: 'none' },
        showValue: true,
        dataLabelColor: 'FFFFFF',
        dataLabelFontSize: 10,
        dataLabelFontFace: theme.bodyFont,
        dataLabelPosition: 'outEnd',
      })
    }
  }

  if (chart.caption) {
    s.addText(chart.caption, {
      x: PANEL.x + 0.22,
      y: PANEL.y + PANEL.h - CAPTION_H - 0.1,
      w: PANEL.w - 0.44,
      h: CAPTION_H,
      fontFace: theme.bodyFont,
      fontSize: 10,
      italic: true,
      color: theme.soft,
      align: 'center',
      valign: 'middle',
    })
  }

  const items = (slide.items ?? []).filter(Boolean)

  if (items.length > 0) {
    const bullets = items.map((text, i) => ({
      text,
      options: {
        bullet: { code: '2022', indent: 18 },
        breakLine: i < items.length - 1,
        paraSpaceAfter: 11,
      },
    }))

    s.addText(bullets, {
      x: TEXT_X,
      y: 0.95,
      w: TEXT_W,
      h: 4.1,
      fontFace: theme.bodyFont,
      fontSize: bodyFontSize(items),
      color: theme.body,
      align: 'left',
      valign: 'top',
      lineSpacingMultiple: 1.25,
    })
  }

  addBottomBar(s, {
    text: slide.footer,
    barColor: theme.deep,
    textColor: theme.accent,
    font: theme.bodyFont,
    fontSize: 10,
  })

  if (slide.notes) {
    s.addNotes(slide.notes)
  }

  return s
}
