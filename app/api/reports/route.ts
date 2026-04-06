/**
 * Fortuna — Report Generation API
 * Phase 4 · Generates PPTX and PDF reports for a given wave
 *
 * GET /api/reports?waveId=&format=pptx|pdf&segment=NON_LIGHT|HEAVY|OVERALL
 */

import { NextRequest, NextResponse } from 'next/server'
import { generatePptx, type ReportData } from '@/lib/reports/pptx'

export const runtime = 'nodejs' // Required for pptxgenjs + puppeteer

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const waveId = searchParams.get('waveId')
  const format = (searchParams.get('format') ?? 'pptx') as 'pptx' | 'pdf'
  const segment = (searchParams.get('segment') ?? 'NON_LIGHT') as
    | 'NON_LIGHT'
    | 'HEAVY'
    | 'OVERALL'

  if (!waveId) {
    return NextResponse.json({ error: 'waveId is required' }, { status: 400 })
  }

  try {
    // --- Try live DB data ---
    let reportData: ReportData | null = null

    if (process.env.DATABASE_URL) {
      reportData = await buildReportDataFromDb(waveId, segment)
    }

    // --- Fallback to demo data ---
    if (!reportData) {
      reportData = buildDemoReportData()
    }

    if (format === 'pdf') {
      return await generatePdfResponse(reportData)
    }

    // Default: PPTX
    const buffer = await generatePptx(reportData)
    const filename = `Fortuna_${reportData.focalBrand}_${reportData.waveLabel.replace(/\s/g, '_')}.pptx`

    return new NextResponse(buffer as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': buffer.length.toString(),
      },
    })
  } catch (err) {
    console.error('[reports] Generation failed:', err)
    return NextResponse.json(
      { error: 'Report generation failed', detail: String(err) },
      { status: 500 }
    )
  }
}

// ─── PDF generation (Puppeteer) ───────────────────────────────────────────────

async function generatePdfResponse(data: ReportData): Promise<NextResponse> {
  let puppeteer
  try {
    puppeteer = await import('puppeteer')
  } catch {
    return NextResponse.json(
      { error: 'Puppeteer is not available in this environment' },
      { status: 501 }
    )
  }

  const html = buildReportHtml(data)
  const browser = await puppeteer.default.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })

  try {
    const page = await browser.newPage()
    await page.setContent(html, { waitUntil: 'networkidle0' })
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '20mm', bottom: '20mm', left: '15mm', right: '15mm' },
    })
    const filename = `Fortuna_${data.focalBrand}_${data.waveLabel.replace(/\s/g, '_')}.pdf`

    return new NextResponse(pdfBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } finally {
    await browser.close()
  }
}

// ─── HTML template for PDF ────────────────────────────────────────────────────

function buildReportHtml(data: ReportData): string {
  const focal = data.kpis.find((k) => k.isFocal)
  const focalMms = focal?.mms ?? 0
  const focalMpen = focal?.mpen ?? 0

  const kpiRows = data.kpis
    .map(
      (k) => `
    <tr ${k.isFocal ? 'class="focal"' : ''}>
      <td>${k.brand}${k.isFocal ? ' ★' : ''}</td>
      <td>${k.mpen.toFixed(1)}%</td>
      <td>${k.mms.toFixed(1)}%</td>
      <td>${k.ns.toFixed(2)}</td>
      <td>${k.som.toFixed(1)}%</td>
    </tr>`
    )
    .join('')

  const maRows = data.mentalAdvantage
    .filter((m) => m.brand === data.focalBrand)
    .map(
      (m) => `
    <tr>
      <td>${m.cep}</td>
      <td>${m.actual.toFixed(1)}%</td>
      <td>${m.expected.toFixed(1)}%</td>
      <td class="${m.signal === 'DEFEND' ? 'defend' : m.signal === 'BUILD' ? 'build' : ''}">${m.deviation > 0 ? '+' : ''}${m.deviation.toFixed(1)}pp · ${m.signal}</td>
    </tr>`
    )
    .join('')

  const womRows = data.wom
    .map(
      (w) => `
    <tr>
      <td>${w.brand}</td>
      <td class="green">${w.pwom.toFixed(1)}</td>
      <td class="red">${w.nwom.toFixed(1)}</td>
      <td>${(w.pwom - w.nwom).toFixed(1)}</td>
    </tr>`
    )
    .join('')

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<title>Fortuna Brand Health Report — ${data.focalBrand}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, Arial, sans-serif; background: #fff; color: #1a1a1a; font-size: 12px; }
  .cover { background: #1a1a1a; color: #fff; padding: 60px 48px; min-height: 200px; }
  .cover h1 { font-size: 28px; color: #0FA958; margin-bottom: 8px; }
  .cover h2 { font-size: 18px; font-weight: 400; color: #d1d5db; }
  .cover .meta { margin-top: 24px; font-size: 11px; color: #9ca3af; }
  section { padding: 32px 48px; page-break-inside: avoid; }
  section + section { border-top: 2px solid #0FA958; }
  h3 { font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #0FA958; margin-bottom: 16px; }
  table { width: 100%; border-collapse: collapse; }
  th { background: #1a1a1a; color: #fff; padding: 8px 12px; text-align: left; font-size: 11px; }
  td { padding: 7px 12px; border-bottom: 1px solid #e5e7eb; }
  tr.focal { background: #f0fdf4; font-weight: 600; }
  .defend { color: #15803d; font-weight: 600; }
  .build { color: #ef4444; font-weight: 600; }
  .green { color: #15803d; }
  .red { color: #ef4444; }
  .headline { background: #f0fdf4; border-left: 4px solid #0FA958; padding: 16px 20px; margin-bottom: 20px; }
  .headline strong { font-size: 14px; display: block; margin-bottom: 4px; }
  .footnote { margin-top: 40px; padding: 20px 48px; background: #f9fafb; font-size: 10px; color: #6b7280; }
</style>
</head>
<body>

<div class="cover">
  <h1>Fortuna Brand Health Report</h1>
  <h2>${data.projectName} · ${data.waveLabel}</h2>
  <div class="meta">
    Focal Brand: ${data.focalBrand} &nbsp;|&nbsp; Category: ${data.category} &nbsp;|&nbsp; Generated: ${data.generatedAt}
  </div>
</div>

<section>
  <div class="headline">
    <strong>Executive Summary</strong>
    ${data.focalBrand} holds ${focalMpen.toFixed(1)}% Mental Penetration with ${focalMms.toFixed(1)}% Mental Market Share.
    DJ normalization reveals whether this represents over- or under-performance relative to brand size.
  </div>
  <h3>KPI Scorecard</h3>
  <table>
    <thead><tr><th>Brand</th><th>MPen %</th><th>MMS %</th><th>NS</th><th>SoM %</th></tr></thead>
    <tbody>${kpiRows}</tbody>
  </table>
</section>

${
  maRows
    ? `<section>
  <h3>Mental Advantage Map — ${data.focalBrand}</h3>
  <table>
    <thead><tr><th>CEP</th><th>Actual %</th><th>Expected %</th><th>Signal</th></tr></thead>
    <tbody>${maRows}</tbody>
  </table>
</section>`
    : ''
}

${
  womRows
    ? `<section>
  <h3>Word of Mouth</h3>
  <table>
    <thead><tr><th>Brand</th><th>pWOM</th><th>nWOM</th><th>Net WOM</th></tr></thead>
    <tbody>${womRows}</tbody>
  </table>
</section>`
    : ''
}

<div class="footnote">
  Fortuna Brand Health Platform · CBM methodology by Ehrenberg-Bass Institute ·
  Analysis applies Double Jeopardy normalization. DEFEND: actual ≥ expected + 5pp. BUILD: actual ≤ expected − 5pp.
  Segment: NON-BUYERS + LIGHT BUYERS (primary analysis view).
</div>
</body>
</html>`
}

// ─── Build ReportData from Prisma DB ─────────────────────────────────────────

async function buildReportDataFromDb(
  waveId: string,
  segment: 'NON_LIGHT' | 'HEAVY' | 'OVERALL'
): Promise<ReportData | null> {
  try {
    const { prisma } = await import('@/lib/db')

    const wave = await prisma.wave.findUnique({
      where: { id: waveId },
      include: {
        project: true,
        kpis: { where: { segment }, include: { brand: true } },
        womData: { include: { brand: true } },
        reachData: true,
        linkages: { include: { brand: true, cep: true } },
      },
    })

    if (!wave) return null

    // Build mental advantage map (DJ expected scores)
    const grandTotal = wave.linkages.reduce((s, l) => s + l.score, 0)

    const mentalAdvantage = wave.linkages
      .filter((l) => l.segment === segment)
      .map((l) => {
        const rowTotal = wave.linkages
          .filter((x) => x.brandId === l.brandId && x.segment === segment)
          .reduce((s, x) => s + x.score, 0)
        const colTotal = wave.linkages
          .filter((x) => x.cepId === l.cepId && x.segment === segment)
          .reduce((s, x) => s + x.score, 0)
        const expected = grandTotal > 0 ? (rowTotal * colTotal) / grandTotal : 0
        const deviation = l.score - expected
        const signal: 'DEFEND' | 'MAINTAIN' | 'BUILD' =
          deviation >= 5 ? 'DEFEND' : deviation <= -5 ? 'BUILD' : 'MAINTAIN'
        return {
          brand: l.brand.name,
          cep: l.cep.text,
          actual: l.score,
          expected,
          deviation,
          signal,
        }
      })

    return {
      projectName: wave.project.name,
      category: wave.project.category,
      focalBrand: wave.project.focalBrand,
      waveLabel: wave.label,
      generatedAt: new Date().toLocaleDateString('en-GB', {
        day: 'numeric', month: 'long', year: 'numeric',
      }),
      kpis: wave.kpis.map((k) => ({
        brand: k.brand.name,
        isFocal: k.brand.isFocal,
        mpen: k.mpen ?? 0,
        mms: k.mms ?? 0,
        ns: k.ns ?? 0,
        som: k.som ?? 0,
        segment,
      })),
      mentalAdvantage,
      wom: wave.womData.map((w) => ({
        brand: w.brand.name,
        pwom: w.pwom,
        nwom: w.nwom,
      })),
      reach: wave.reachData.map((r) => ({
        creative: r.creativeName,
        noticedPct: r.noticedPct,
        brandedPct: r.brandedPct,
        brandingRatio: r.brandingRatio ?? r.brandedPct / (r.noticedPct || 1),
      })),
    }
  } catch (err) {
    console.error('[reports] DB fetch failed:', err)
    return null
  }
}

// ─── Demo data ────────────────────────────────────────────────────────────────

function buildDemoReportData(): ReportData {
  return {
    projectName: 'Indonesian Credit Cards 2024',
    category: 'Credit Cards',
    focalBrand: 'BCA',
    waveLabel: 'Q4 2024',
    generatedAt: new Date().toLocaleDateString('en-GB', {
      day: 'numeric', month: 'long', year: 'numeric',
    }),
    kpis: [
      { brand: 'BCA', isFocal: true, mpen: 68.4, mms: 28.3, ns: 4.2, som: 31.2, segment: 'NON_LIGHT' },
      { brand: 'Mandiri', isFocal: false, mpen: 55.1, mms: 22.8, ns: 3.8, som: 24.5, segment: 'NON_LIGHT' },
      { brand: 'BRI', isFocal: false, mpen: 48.3, mms: 20.1, ns: 3.4, som: 22.1, segment: 'NON_LIGHT' },
      { brand: 'CIMB', isFocal: false, mpen: 31.2, mms: 12.8, ns: 2.9, som: 13.5, segment: 'NON_LIGHT' },
      { brand: 'OCBC', isFocal: false, mpen: 22.4, mms: 9.2, ns: 2.5, som: 8.7, segment: 'NON_LIGHT' },
    ],
    mentalAdvantage: [
      { brand: 'BCA', cep: 'Accepted everywhere I shop', actual: 62, expected: 45, deviation: 17, signal: 'DEFEND' },
      { brand: 'BCA', cep: 'Rewards that matter', actual: 41, expected: 38, deviation: 3, signal: 'MAINTAIN' },
      { brand: 'BCA', cep: 'Easy online payments', actual: 28, expected: 42, deviation: -14, signal: 'BUILD' },
      { brand: 'BCA', cep: 'Good travel benefits', actual: 35, expected: 33, deviation: 2, signal: 'MAINTAIN' },
      { brand: 'BCA', cep: 'Trusted security', actual: 58, expected: 44, deviation: 14, signal: 'DEFEND' },
    ],
    wom: [
      { brand: 'BCA', pwom: 38.2, nwom: 8.4 },
      { brand: 'Mandiri', pwom: 29.1, nwom: 11.2 },
      { brand: 'BRI', pwom: 25.8, nwom: 9.7 },
      { brand: 'CIMB', pwom: 18.3, nwom: 14.1 },
      { brand: 'OCBC', pwom: 14.2, nwom: 10.8 },
    ],
    reach: [
      { creative: 'TV Spot A', noticedPct: 72, brandedPct: 61, brandingRatio: 0.85 },
      { creative: 'Digital Banner', noticedPct: 48, brandedPct: 31, brandingRatio: 0.65 },
      { creative: 'Social Video', noticedPct: 65, brandedPct: 48, brandingRatio: 0.74 },
    ],
  }
}
