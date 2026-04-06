import { NextRequest, NextResponse } from 'next/server'
import { parseExcelBuffer, type UploadType } from '@/lib/excel/parser'
import { prisma, dbAvailable } from '@/lib/db'

export const runtime = 'nodejs'
export const maxDuration = 30

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const waveId = formData.get('waveId') as string | null
    const uploadType = (formData.get('type') as UploadType) ?? 'linkage'


    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    if (!waveId && dbAvailable) return NextResponse.json({ error: 'waveId is required' }, { status: 400 })

    // Parse the Excel/CSV file
    const buffer = await file.arrayBuffer()
    const result = parseExcelBuffer(buffer, uploadType)

    if (result.errors.length > 0 && result.rows.length === 0) {
      return NextResponse.json({ success: false, errors: result.errors }, { status: 422 })
    }

    // Preview mode (no DB) — return parsed rows for client-side use
    if (!dbAvailable || !waveId) {
      return NextResponse.json({
        success: true,
        preview: true,
        type: uploadType,
        rows: result.rows,
        errors: result.errors,
        count: result.rows.length,
      })
    }

    // DB mode — look up entity IDs and write to database
    const wave = await prisma.wave.findUnique({
      where: { id: waveId },
      include: {
        project: {
          include: {
            brands: true,
            ceps: { where: { isActive: true } },
          },
        },
      },
    })

    if (!wave) return NextResponse.json({ error: 'Wave not found' }, { status: 404 })

    const brandMap = new Map(wave.project.brands.map((b) => [b.name.toLowerCase(), b.id]))
    const cepMap = new Map(wave.project.ceps.map((c) => [c.text.toLowerCase(), c.id]))

    let saved = 0
    const dbErrors: string[] = [...result.errors]

    if (result.type === 'linkage') {
      const ops = result.rows.flatMap((row) => {
        const brandId = brandMap.get(row.brand.toLowerCase())
        const cepId = cepMap.get(row.cep.toLowerCase())
        if (!brandId) { dbErrors.push(`Brand not found: "${row.brand}"`); return [] }
        if (!cepId) { dbErrors.push(`CEP not found: "${row.cep}"`); return [] }
        saved++
        return [
          prisma.linkage.upsert({
            where: {
              waveId_brandId_cepId_segment: {
                waveId,
                brandId,
                cepId,
                segment: row.segment,
              },
            },
            create: { waveId, brandId, cepId, segment: row.segment, score: row.score },
            update: { score: row.score },
          }),
        ]
      })
      if (ops.length > 0) await prisma.$transaction(ops)
    }

    if (result.type === 'wom') {
      const ops = result.rows.flatMap((row) => {
        const brandId = brandMap.get(row.brand.toLowerCase())
        if (!brandId) { dbErrors.push(`Brand not found: "${row.brand}"`); return [] }
        saved++
        return [
          prisma.womData.upsert({
            where: { waveId_brandId: { waveId, brandId } },
            create: { waveId, brandId, pwom: row.pwom, nwom: row.nwom },
            update: { pwom: row.pwom, nwom: row.nwom, updatedAt: new Date() },
          }),
        ]
      })
      if (ops.length > 0) await prisma.$transaction(ops)
    }

    if (result.type === 'reach') {
      const ops = result.rows.map((row) => {
        saved++
        const ratio = row.noticedPct > 0 ? (row.brandedPct / row.noticedPct) * 100 : 0
        return prisma.reachData.upsert({
          where: { waveId_creativeName: { waveId, creativeName: row.creative } },
          create: {
            waveId,
            creativeName: row.creative,
            noticedPct: row.noticedPct,
            brandedPct: row.brandedPct,
            brandingRatio: ratio,
          },
          update: {
            noticedPct: row.noticedPct,
            brandedPct: row.brandedPct,
            brandingRatio: ratio,
            updatedAt: new Date(),
          },
        })
      })
      if (ops.length > 0) await prisma.$transaction(ops)
    }

    if (result.type === 'presence') {
      const ops = result.rows.map((row) => {
        saved++
        return prisma.channelPresence.upsert({
          where: { waveId_channelName: { waveId, channelName: row.channel } },
          create: {
            waveId,
            channelName: row.channel,
            coveragePct: row.coveragePct,
            categoryNormPct: row.categoryNormPct,
          },
          update: {
            coveragePct: row.coveragePct,
            categoryNormPct: row.categoryNormPct,
            updatedAt: new Date(),
          },
        })
      })
      if (ops.length > 0) await prisma.$transaction(ops)
    }

    if (result.type === 'kpis') {
      const ops = result.rows.flatMap((row) => {
        const brandId = brandMap.get(row.brand.toLowerCase())
        if (!brandId) { dbErrors.push(`Brand not found: "${row.brand}"`); return [] }
        saved++
        const { brand: _b, segment: _seg, ...kpiFields } = row
        return [
          prisma.waveKpi.upsert({
            where: {
              waveId_brandId_segment: { waveId, brandId, segment: row.segment },
            },
            create: { waveId, brandId, segment: row.segment, ...kpiFields },
            update: { ...kpiFields, updatedAt: new Date() },
          }),
        ]
      })
      if (ops.length > 0) await prisma.$transaction(ops)
    }

    return NextResponse.json({
      success: true,
      type: uploadType,
      saved,
      errors: dbErrors,
      total: result.rows.length,
    })
  } catch (err) {
    console.error('Upload error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Upload failed' },
      { status: 500 }
    )
  }
}
