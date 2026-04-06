import * as XLSX from 'xlsx'

export type UploadType = 'linkage' | 'kpis' | 'wom' | 'reach' | 'presence'

export interface ParsedLinkageRow {
  brand: string
  cep: string
  score: number
  segment: 'NON_LIGHT' | 'HEAVY' | 'OVERALL'
}

export interface ParsedKpiRow {
  brand: string
  segment: 'NON_LIGHT' | 'HEAVY' | 'OVERALL'
  mpen?: number
  mms?: number
  ns?: number
  som?: number
  sms?: number
  awareness?: number
}

export interface ParsedWomRow {
  brand: string
  pwom: number
  nwom: number
}

export interface ParsedReachRow {
  creative: string
  noticedPct: number
  brandedPct: number
}

export interface ParsedPresenceRow {
  channel: string
  coveragePct: number
  categoryNormPct?: number
}

export type ParseResult =
  | { type: 'linkage'; rows: ParsedLinkageRow[]; errors: string[] }
  | { type: 'kpis'; rows: ParsedKpiRow[]; errors: string[] }
  | { type: 'wom'; rows: ParsedWomRow[]; errors: string[] }
  | { type: 'reach'; rows: ParsedReachRow[]; errors: string[] }
  | { type: 'presence'; rows: ParsedPresenceRow[]; errors: string[] }

function toFloat(val: unknown): number | undefined {
  if (val === null || val === undefined || val === '') return undefined
  const n = parseFloat(String(val))
  return isNaN(n) ? undefined : n
}

function toSegment(val: unknown): 'NON_LIGHT' | 'HEAVY' | 'OVERALL' {
  const s = String(val ?? '').toUpperCase().replace(/[^A-Z]/g, '_')
  if (s === 'HEAVY') return 'HEAVY'
  if (s === 'OVERALL') return 'OVERALL'
  return 'NON_LIGHT'
}

export function parseExcelBuffer(
  buffer: ArrayBuffer,
  type: UploadType
): ParseResult {
  const workbook = XLSX.read(buffer, { type: 'array' })
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' })
  const errors: string[] = []

  if (rows.length === 0) {
    errors.push('The uploaded file has no data rows.')
  }

  switch (type) {
    case 'linkage': {
      const parsed: ParsedLinkageRow[] = []
      rows.forEach((row, i) => {
        const brand = String(row['Brand'] ?? row['brand'] ?? '').trim()
        const cep = String(row['CEP'] ?? row['cep'] ?? row['Cep'] ?? '').trim()
        const score = toFloat(row['Score'] ?? row['score'] ?? row['%'] ?? row['Linkage %'])
        const segment = toSegment(row['Segment'] ?? row['segment'] ?? 'NON_LIGHT')

        if (!brand) { errors.push(`Row ${i + 2}: Missing Brand`); return }
        if (!cep) { errors.push(`Row ${i + 2}: Missing CEP`); return }
        if (score === undefined) { errors.push(`Row ${i + 2}: Missing or invalid Score`); return }
        if (score < 0 || score > 100) { errors.push(`Row ${i + 2}: Score must be 0–100 (got ${score})`); return }

        parsed.push({ brand, cep, score, segment })
      })
      return { type: 'linkage', rows: parsed, errors }
    }

    case 'kpis': {
      const parsed: ParsedKpiRow[] = []
      rows.forEach((row, i) => {
        const brand = String(row['Brand'] ?? row['brand'] ?? '').trim()
        const segment = toSegment(row['Segment'] ?? row['segment'] ?? 'NON_LIGHT')
        if (!brand) { errors.push(`Row ${i + 2}: Missing Brand`); return }
        parsed.push({
          brand,
          segment,
          mpen: toFloat(row['MPen'] ?? row['mpen'] ?? row['Mental Penetration']),
          mms: toFloat(row['MMS'] ?? row['mms'] ?? row['Mental Market Share']),
          ns: toFloat(row['NS'] ?? row['ns'] ?? row['Network Score']),
          som: toFloat(row['SoM'] ?? row['som'] ?? row['Share of Mind']),
          sms: toFloat(row['SMS'] ?? row['sms'] ?? row['Sales Market Share']),
          awareness: toFloat(row['Awareness'] ?? row['awareness'] ?? row['Prompted Awareness']),
        })
      })
      return { type: 'kpis', rows: parsed, errors }
    }

    case 'wom': {
      const parsed: ParsedWomRow[] = []
      rows.forEach((row, i) => {
        const brand = String(row['Brand'] ?? row['brand'] ?? '').trim()
        const pwom = toFloat(row['PWOM'] ?? row['pwom'] ?? row['Positive WOM'])
        const nwom = toFloat(row['NWOM'] ?? row['nwom'] ?? row['Negative WOM'])
        if (!brand) { errors.push(`Row ${i + 2}: Missing Brand`); return }
        if (pwom === undefined) { errors.push(`Row ${i + 2}: Missing PWOM`); return }
        if (nwom === undefined) { errors.push(`Row ${i + 2}: Missing NWOM`); return }
        parsed.push({ brand, pwom, nwom })
      })
      return { type: 'wom', rows: parsed, errors }
    }

    case 'reach': {
      const parsed: ParsedReachRow[] = []
      rows.forEach((row, i) => {
        const creative = String(row['Creative'] ?? row['creative'] ?? row['Creative Name'] ?? '').trim()
        const noticedPct = toFloat(row['Noticed %'] ?? row['noticedPct'] ?? row['Noticed'])
        const brandedPct = toFloat(row['Branded %'] ?? row['brandedPct'] ?? row['Correctly Branded %'])
        if (!creative) { errors.push(`Row ${i + 2}: Missing Creative name`); return }
        if (noticedPct === undefined) { errors.push(`Row ${i + 2}: Missing Noticed %`); return }
        if (brandedPct === undefined) { errors.push(`Row ${i + 2}: Missing Branded %`); return }
        parsed.push({ creative, noticedPct, brandedPct })
      })
      return { type: 'reach', rows: parsed, errors }
    }

    case 'presence': {
      const parsed: ParsedPresenceRow[] = []
      rows.forEach((row, i) => {
        const channel = String(row['Channel'] ?? row['channel'] ?? '').trim()
        const coveragePct = toFloat(row['Coverage %'] ?? row['coveragePct'] ?? row['BCA Coverage %'])
        const categoryNormPct = toFloat(row['Category Norm %'] ?? row['categoryNormPct'] ?? row['Norm %'])
        if (!channel) { errors.push(`Row ${i + 2}: Missing Channel`); return }
        if (coveragePct === undefined) { errors.push(`Row ${i + 2}: Missing Coverage %`); return }
        parsed.push({ channel, coveragePct, categoryNormPct })
      })
      return { type: 'presence', rows: parsed, errors }
    }

    default:
      return { type: 'linkage', rows: [], errors: ['Unknown upload type'] }
  }
}
