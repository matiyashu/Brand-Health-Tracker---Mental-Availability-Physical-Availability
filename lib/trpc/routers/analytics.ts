import { z } from 'zod'
import { router, dbProcedure, publicProcedure } from '../init'

const ANALYTICS_SERVICE_URL = process.env.ANALYTICS_SERVICE_URL ?? 'http://localhost:8000'

async function callAnalyticsService<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${ANALYTICS_SERVICE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(15000),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Analytics service error (${res.status}): ${err}`)
  }
  return res.json() as T
}

export const analyticsRouter = router({
  // Health check — is the Python service running?
  health: publicProcedure.query(async () => {
    try {
      const res = await fetch(`${ANALYTICS_SERVICE_URL}/health`, {
        signal: AbortSignal.timeout(3000),
      })
      const data = await res.json() as { status: string }
      return { online: true, status: data.status }
    } catch {
      return { online: false, status: 'offline' }
    }
  }),

  // Calculate all KPIs for a wave from its linkage matrix
  calculateKpis: dbProcedure
    .input(
      z.object({
        waveId: z.string(),
        segment: z.enum(['NON_LIGHT', 'HEAVY', 'OVERALL']).default('NON_LIGHT'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Load linkage matrix from DB
      const linkages = await ctx.prisma.linkage.findMany({
        where: { waveId: input.waveId, segment: input.segment },
        include: {
          brand: { select: { id: true, name: true } },
          cep: { select: { id: true, text: true } },
        },
      })

      if (linkages.length === 0) {
        throw new Error('No linkage data found for this wave and segment')
      }

      // Call Python analytics service
      type KpiResult = {
        brand_id: string
        brand_name: string
        mpen: number
        mms: number
        ns: number
        som: number
        dj_expected: number
        dj_deviation: number
      }

      const result = await callAnalyticsService<{ kpis: KpiResult[] }>('/calculate/kpis', {
        linkages: linkages.map((l) => ({
          brand_id: l.brandId,
          brand_name: l.brand.name,
          cep_id: l.cepId,
          cep_name: l.cep.text,
          score: l.score,
        })),
        segment: input.segment,
      })

      // Write calculated KPIs back to DB
      const wave = await ctx.prisma.wave.findUnique({
        where: { id: input.waveId },
        include: { project: { select: { focalBrand: true } } },
      })

      const brands = await ctx.prisma.brand.findMany({
        where: { projectId: wave!.projectId },
      })
      const brandMap = new Map(brands.map((b) => [b.name, b.id]))

      const upserts = result.kpis.map((kpi) => {
        const brandId = brandMap.get(kpi.brand_name) ?? kpi.brand_id
        return ctx.prisma.waveKpi.upsert({
          where: {
            waveId_brandId_segment: {
              waveId: input.waveId,
              brandId,
              segment: input.segment,
            },
          },
          create: {
            waveId: input.waveId,
            brandId,
            segment: input.segment,
            mpen: kpi.mpen,
            mms: kpi.mms,
            ns: kpi.ns,
            som: kpi.som,
            djExpected: kpi.dj_expected,
            djDeviation: kpi.dj_deviation,
            calculatedAt: new Date(),
          },
          update: {
            mpen: kpi.mpen,
            mms: kpi.mms,
            ns: kpi.ns,
            som: kpi.som,
            djExpected: kpi.dj_expected,
            djDeviation: kpi.dj_deviation,
            calculatedAt: new Date(),
          },
        })
      })

      await ctx.prisma.$transaction(upserts)
      return { calculated: result.kpis.length, kpis: result.kpis }
    }),

  // Mental Advantage matrix — DJ-normalized deviation per brand × CEP
  mentalAdvantage: dbProcedure
    .input(
      z.object({
        waveId: z.string(),
        segment: z.enum(['NON_LIGHT', 'HEAVY', 'OVERALL']).default('NON_LIGHT'),
      })
    )
    .query(async ({ ctx, input }) => {
      const linkages = await ctx.prisma.linkage.findMany({
        where: { waveId: input.waveId, segment: input.segment },
        include: {
          brand: { select: { id: true, name: true, isFocal: true } },
          cep: { select: { id: true, text: true } },
        },
      })

      if (linkages.length === 0) return { matrix: [], brands: [], ceps: [] }

      type MaResult = {
        brand: string
        cep: string
        actual: number
        expected: number
        deviation: number
        signal: 'DEFEND' | 'MAINTAIN' | 'BUILD'
      }

      return callAnalyticsService<{ matrix: MaResult[]; brands: string[]; ceps: string[] }>(
        '/calculate/mental-advantage',
        {
          linkages: linkages.map((l) => ({
            brand: l.brand.name,
            cep: l.cep.text,
            score: l.score,
          })),
        }
      )
    }),

  // DJ curve + scenario
  djCurve: dbProcedure
    .input(
      z.object({
        waveId: z.string(),
        segment: z.enum(['NON_LIGHT', 'HEAVY', 'OVERALL']).default('OVERALL'),
      })
    )
    .query(async ({ ctx, input }) => {
      const kpis = await ctx.prisma.waveKpi.findMany({
        where: { waveId: input.waveId, segment: input.segment },
        include: { brand: { select: { name: true, isFocal: true } } },
      })

      const brands = kpis
        .filter((k) => k.mpen !== null && k.ns !== null)
        .map((k) => ({ name: k.brand.name, penetration: k.mpen!, frequency: k.ns!, isFocal: k.brand.isFocal }))

      if (brands.length < 2) return { curve: [], brands, fitted_params: null }

      type DjResult = {
        curve: { pen: number; freq: number }[]
        brands: { name: string; penetration: number; frequency: number; isFocal: boolean }[]
        fitted_params: { a: number; b: number }
      }

      return callAnalyticsService<DjResult>('/calculate/dj-curve', { brands })
    }),
})
