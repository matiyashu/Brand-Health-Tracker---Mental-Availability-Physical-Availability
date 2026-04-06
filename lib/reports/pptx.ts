/**
 * Fortuna — PPTX Report Generator
 * Phase 4 · Uses pptxgenjs to build a CBM-compliant brand health deck
 */

// pptxgenjs is a CommonJS module
// eslint-disable-next-line @typescript-eslint/no-require-imports
const PptxGenJS = require('pptxgenjs')

export interface ReportData {
  projectName: string
  category: string
  focalBrand: string
  waveLabel: string
  generatedAt: string
  kpis: {
    brand: string
    isFocal: boolean
    mpen: number
    mms: number
    ns: number
    som: number
    segment: string
  }[]
  mentalAdvantage: {
    brand: string
    cep: string
    actual: number
    expected: number
    deviation: number
    signal: 'DEFEND' | 'MAINTAIN' | 'BUILD'
  }[]
  wom: { brand: string; pwom: number; nwom: number }[]
  reach: { creative: string; noticedPct: number; brandedPct: number; brandingRatio: number }[]
}

const NEON_GREEN = '0FA958'
const DARK = '1a1a1a'
const GRAY = '6b7280'
const LIGHT_GRAY = 'f3f4f6'
const WHITE = 'FFFFFF'
const RED = 'ef4444'

export async function generatePptx(data: ReportData): Promise<Buffer> {
  const pptx = new PptxGenJS()

  pptx.layout = 'LAYOUT_WIDE'
  pptx.title = `${data.projectName} — Brand Health Report`
  pptx.subject = 'CBM Brand Health Report'
  pptx.author = 'Fortuna Brand Health Tracker'

  // ── Slide 1: Cover ─────────────────────────────────────────────────────────
  const cover = pptx.addSlide()
  cover.background = { color: DARK }
  cover.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 0.08, h: 5.63, fill: { color: NEON_GREEN } })
  cover.addText('F', { x: 0.3, y: 0.4, w: 0.5, h: 0.5, fontSize: 20, bold: true, color: WHITE, fill: { color: NEON_GREEN }, align: 'center', valign: 'middle' })
  cover.addText('Fortuna', { x: 0.9, y: 0.42, w: 3, h: 0.4, fontSize: 14, bold: true, color: WHITE })
  cover.addText(`${data.projectName}`, { x: 0.3, y: 1.4, w: 9, h: 0.8, fontSize: 28, bold: true, color: WHITE })
  cover.addText('Brand Health Report — CBM Methodology', { x: 0.3, y: 2.3, w: 9, h: 0.4, fontSize: 14, color: NEON_GREEN })
  cover.addText(`${data.waveLabel}  ·  ${data.focalBrand} Focal Brand  ·  Generated ${data.generatedAt}`, { x: 0.3, y: 2.85, w: 9, h: 0.3, fontSize: 10, color: GRAY })
  cover.addText('Design for the Category  ·  Analyse for the Buyer  ·  Report for the Brand', { x: 0.3, y: 5.1, w: 9, h: 0.25, fontSize: 9, color: GRAY, italic: true })

  // ── Slide 2: Executive Summary ─────────────────────────────────────────────
  const exec = pptx.addSlide()
  exec.background = { color: WHITE }
  exec.addText('Executive Summary', { x: 0.4, y: 0.25, w: 9, h: 0.4, fontSize: 18, bold: true, color: DARK })
  exec.addText(`${data.waveLabel} · ${data.focalBrand} · ${data.category}`, { x: 0.4, y: 0.7, w: 9, h: 0.25, fontSize: 10, color: GRAY })
  exec.addShape(pptx.ShapeType.line, { x: 0.4, y: 1.05, w: 9.2, h: 0, line: { color: LIGHT_GRAY, width: 1 } })

  const focal = data.kpis.find((k) => k.isFocal)
  if (focal) {
    const kpiCards = [
      { label: 'Mental Penetration', value: `${focal.mpen.toFixed(1)}%` },
      { label: 'Mental Market Share', value: `${focal.mms.toFixed(1)}%` },
      { label: 'Network Score', value: focal.ns.toFixed(2) },
      { label: 'Share of Mind', value: `${focal.som.toFixed(1)}%` },
    ]
    kpiCards.forEach((card, i) => {
      const x = 0.4 + i * 2.45
      exec.addShape(pptx.ShapeType.rect, { x, y: 1.2, w: 2.2, h: 1.2, fill: { color: 'f9fafb' }, line: { color: 'e5e7eb', width: 1 } })
      exec.addText(card.label, { x, y: 1.25, w: 2.2, h: 0.3, fontSize: 8, color: GRAY, align: 'center' })
      exec.addText(card.value, { x, y: 1.6, w: 2.2, h: 0.6, fontSize: 22, bold: true, color: NEON_GREEN, align: 'center' })
    })
  }

  // Competitive ranking mini-table
  exec.addText('Competitive Ranking — Mental Penetration', { x: 0.4, y: 2.65, w: 9, h: 0.3, fontSize: 11, bold: true, color: DARK })
  const sorted = [...data.kpis].sort((a, b) => b.mpen - a.mpen).slice(0, 5)
  sorted.forEach((kpi, i) => {
    const y = 3.05 + i * 0.4
    const barW = (kpi.mpen / 100) * 6
    exec.addShape(pptx.ShapeType.rect, { x: 1.8, y: y + 0.05, w: barW, h: 0.28, fill: { color: kpi.isFocal ? NEON_GREEN : 'e5e7eb' } })
    exec.addText(`${i + 1}. ${kpi.brand}`, { x: 0.4, y, w: 1.3, h: 0.35, fontSize: 9, bold: kpi.isFocal, color: kpi.isFocal ? NEON_GREEN : DARK })
    exec.addText(`${kpi.mpen.toFixed(1)}%`, { x: 8.1, y, w: 0.8, h: 0.35, fontSize: 9, bold: true, color: kpi.isFocal ? NEON_GREEN : DARK })
  })

  // ── Slide 3: Mental Advantage Map ─────────────────────────────────────────
  const ma = pptx.addSlide()
  ma.background = { color: WHITE }
  ma.addText('Mental Advantage Map', { x: 0.4, y: 0.25, w: 9, h: 0.4, fontSize: 18, bold: true, color: DARK })
  ma.addText('DJ-normalised deviation from expected score  ·  DEFEND ≥+5pp  ·  BUILD ≤−5pp', { x: 0.4, y: 0.7, w: 9, h: 0.25, fontSize: 9, color: GRAY })
  ma.addShape(pptx.ShapeType.line, { x: 0.4, y: 1.0, w: 9.2, h: 0, line: { color: LIGHT_GRAY, width: 1 } })

  const brands = Array.from(new Set(data.mentalAdvantage.map((c) => c.brand)))
  const ceps = Array.from(new Set(data.mentalAdvantage.map((c) => c.cep)))
  const cellW = Math.min(1.4, 8.5 / Math.max(brands.length, 1))
  const cellH = 0.4

  // Header row
  ceps.slice(0, 6).forEach((cep, ci) => {
    ma.addText(cep.length > 16 ? cep.slice(0, 14) + '…' : cep, {
      x: 0.4 + (ci + 1) * cellW, y: 1.1, w: cellW, h: 0.5,
      fontSize: 7, color: GRAY, align: 'center', wrap: true,
    })
  })

  brands.slice(0, 5).forEach((brand, bi) => {
    const y = 1.65 + bi * cellH
    ma.addText(brand, { x: 0.4, y, w: cellW, h: cellH, fontSize: 9, bold: brand === data.focalBrand, color: brand === data.focalBrand ? NEON_GREEN : DARK })
    ceps.slice(0, 6).forEach((cep, ci) => {
      const cell = data.mentalAdvantage.find((c) => c.brand === brand && c.cep === cep)
      if (!cell) return
      const bgColor = cell.signal === 'DEFEND' ? 'd1fae5' : cell.signal === 'BUILD' ? 'fee2e2' : LIGHT_GRAY
      const textColor = cell.signal === 'DEFEND' ? '065f46' : cell.signal === 'BUILD' ? '991b1b' : GRAY
      ma.addShape(pptx.ShapeType.rect, { x: 0.4 + (ci + 1) * cellW, y: y + 0.02, w: cellW - 0.05, h: cellH - 0.06, fill: { color: bgColor } })
      ma.addText(`${cell.deviation > 0 ? '+' : ''}${cell.deviation.toFixed(1)}`, {
        x: 0.4 + (ci + 1) * cellW, y, w: cellW, h: cellH,
        fontSize: 8, bold: true, color: textColor, align: 'center', valign: 'middle',
      })
    })
  })

  // Legend
  ma.addShape(pptx.ShapeType.rect, { x: 0.4, y: 5.1, w: 0.6, h: 0.2, fill: { color: 'd1fae5' } })
  ma.addText('DEFEND ≥+5pp', { x: 1.1, y: 5.08, w: 1.8, h: 0.25, fontSize: 8, color: '065f46' })
  ma.addShape(pptx.ShapeType.rect, { x: 3.0, y: 5.1, w: 0.6, h: 0.2, fill: { color: LIGHT_GRAY } })
  ma.addText('MAINTAIN ±4pp', { x: 3.7, y: 5.08, w: 1.8, h: 0.25, fontSize: 8, color: GRAY })
  ma.addShape(pptx.ShapeType.rect, { x: 5.6, y: 5.1, w: 0.6, h: 0.2, fill: { color: 'fee2e2' } })
  ma.addText('BUILD ≤−5pp', { x: 6.3, y: 5.08, w: 1.8, h: 0.25, fontSize: 8, color: '991b1b' })

  // ── Slide 4: WOM ───────────────────────────────────────────────────────────
  if (data.wom.length > 0) {
    const wom = pptx.addSlide()
    wom.background = { color: WHITE }
    wom.addText('Word of Mouth', { x: 0.4, y: 0.25, w: 9, h: 0.4, fontSize: 18, bold: true, color: DARK })
    wom.addText('PWOM and NWOM per 100 category buyers  ·  Binary measurement', { x: 0.4, y: 0.7, w: 9, h: 0.25, fontSize: 9, color: GRAY })
    wom.addShape(pptx.ShapeType.line, { x: 0.4, y: 1.0, w: 9.2, h: 0, line: { color: LIGHT_GRAY, width: 1 } })

    const headers = ['Brand', 'PWOM', 'NWOM', 'Net WOM', 'Ratio']
    const colW = [2.2, 1.4, 1.4, 1.4, 1.4]
    let cx = 0.4
    headers.forEach((h, i) => {
      wom.addShape(pptx.ShapeType.rect, { x: cx, y: 1.1, w: colW[i], h: 0.35, fill: { color: NEON_GREEN } })
      wom.addText(h, { x: cx, y: 1.1, w: colW[i], h: 0.35, fontSize: 9, bold: true, color: WHITE, align: 'center', valign: 'middle' })
      cx += colW[i]
    })

    data.wom.forEach((row, i) => {
      const y = 1.5 + i * 0.38
      const net = row.pwom - row.nwom
      const ratio = row.nwom > 0 ? (row.pwom / row.nwom).toFixed(1) + '×' : '—'
      const rowBg = i % 2 === 0 ? WHITE : 'f9fafb'
      const cells = [row.brand, String(row.pwom), String(row.nwom), (net > 0 ? '+' : '') + net, ratio]
      let cx2 = 0.4
      cells.forEach((val, ci) => {
        wom.addShape(pptx.ShapeType.rect, { x: cx2, y, w: colW[ci], h: 0.34, fill: { color: rowBg }, line: { color: 'e5e7eb', width: 0.5 } })
        const isNeon = ci === 0 && row.brand === data.focalBrand
        const isNeg = ci === 3 && net < 0
        wom.addText(val, { x: cx2, y, w: colW[ci], h: 0.34, fontSize: 9, color: isNeon ? NEON_GREEN : isNeg ? RED : DARK, align: ci === 0 ? 'left' : 'center', valign: 'middle', bold: isNeon })
        cx2 += colW[ci]
      })
    })
  }

  // ── Slide 5: Marketing Reach ───────────────────────────────────────────────
  if (data.reach.length > 0) {
    const reach = pptx.addSlide()
    reach.background = { color: WHITE }
    reach.addText('Marketing Reach', { x: 0.4, y: 0.25, w: 9, h: 0.4, fontSize: 18, bold: true, color: DARK })
    reach.addText('Effective reach (de-branded) and correct branding attribution per creative', { x: 0.4, y: 0.7, w: 9, h: 0.25, fontSize: 9, color: GRAY })
    reach.addShape(pptx.ShapeType.line, { x: 0.4, y: 1.0, w: 9.2, h: 0, line: { color: LIGHT_GRAY, width: 1 } })

    const headers = ['Creative', 'Noticed %', 'Branded %', 'Branding Ratio', 'Rating']
    const colW = [2.8, 1.4, 1.4, 1.8, 1.4]
    let cx = 0.4
    headers.forEach((h, i) => {
      reach.addShape(pptx.ShapeType.rect, { x: cx, y: 1.1, w: colW[i], h: 0.35, fill: { color: NEON_GREEN } })
      reach.addText(h, { x: cx, y: 1.1, w: colW[i], h: 0.35, fontSize: 9, bold: true, color: WHITE, align: 'center', valign: 'middle' })
      cx += colW[i]
    })

    data.reach.forEach((row, i) => {
      const y = 1.5 + i * 0.38
      const rating = row.brandingRatio >= 70 ? 'Strong' : row.brandingRatio >= 60 ? 'Medium' : 'Weak'
      const ratingColor = rating === 'Strong' ? NEON_GREEN : rating === 'Medium' ? 'f59e0b' : RED
      const cells = [row.creative, `${row.noticedPct.toFixed(1)}%`, `${row.brandedPct.toFixed(1)}%`, `${row.brandingRatio.toFixed(1)}%`]
      const rowBg = i % 2 === 0 ? WHITE : 'f9fafb'
      let cx2 = 0.4
      cells.forEach((val, ci) => {
        reach.addShape(pptx.ShapeType.rect, { x: cx2, y, w: colW[ci], h: 0.34, fill: { color: rowBg }, line: { color: 'e5e7eb', width: 0.5 } })
        reach.addText(val, { x: cx2, y, w: colW[ci], h: 0.34, fontSize: 9, color: DARK, align: ci === 0 ? 'left' : 'center', valign: 'middle' })
        cx2 += colW[ci]
      })
      reach.addShape(pptx.ShapeType.rect, { x: cx2, y, w: colW[4], h: 0.34, fill: { color: rowBg }, line: { color: 'e5e7eb', width: 0.5 } })
      reach.addText(rating, { x: cx2, y, w: colW[4], h: 0.34, fontSize: 9, bold: true, color: ratingColor, align: 'center', valign: 'middle' })
    })
  }

  // ── Slide 6: Methodology note ──────────────────────────────────────────────
  const meth = pptx.addSlide()
  meth.background = { color: DARK }
  meth.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 0.08, h: 5.63, fill: { color: NEON_GREEN } })
  meth.addText('Methodology', { x: 0.3, y: 0.3, w: 9, h: 0.5, fontSize: 20, bold: true, color: WHITE })
  const notes = [
    ['Survey format', 'Binary pick-any only — no Likert scales. Alphabetical brand ordering enforced.'],
    ['CBM Mantra', '1. Design for the Category  2. Analyse for the Buyer  3. Report for the Brand'],
    ['DJ normalization', 'Expected = (Row Total × Col Total) ÷ Grand Total. Deviation = Actual − Expected.'],
    ['Primary segment', 'Non-buyers + Light buyers. Default for all competitive analysis.'],
    ['MMS vs SMS gap', 'MMS > SMS = Physical availability problem. SMS > MMS = Mental availability problem.'],
    ['WOM measurement', 'Binary past-month advocacy/warning. Not NPS intent scale.'],
  ]
  notes.forEach(([label, text], i) => {
    const y = 1.0 + i * 0.72
    meth.addText(label, { x: 0.3, y, w: 2.5, h: 0.3, fontSize: 10, bold: true, color: NEON_GREEN })
    meth.addText(text, { x: 0.3, y: y + 0.3, w: 9.2, h: 0.35, fontSize: 9, color: '9ca3af' })
  })
  meth.addText(`Generated by Fortuna Brand Health Tracker · ${data.generatedAt}`, { x: 0.3, y: 5.3, w: 9.2, h: 0.2, fontSize: 8, color: GRAY, italic: true })

  // Return as buffer
  const buffer = await pptx.write({ outputType: 'nodebuffer' }) as Buffer
  return buffer
}
