import { z } from 'zod'
import { router, dbProcedure } from '../init'

export const linkageRouter = router({
  // Full matrix for a wave + segment — used by Mental Advantage page
  matrix: dbProcedure
    .input(
      z.object({
        waveId: z.string(),
        segment: z.enum(['NON_LIGHT', 'HEAVY', 'OVERALL']).default('NON_LIGHT'),
      })
    )
    .query(async ({ ctx, input }) => {
      return ctx.prisma.linkage.findMany({
        where: { waveId: input.waveId, segment: input.segment },
        include: {
          brand: { select: { id: true, name: true, isFocal: true } },
          cep: { select: { id: true, text: true, type: true } },
        },
        orderBy: [{ brand: { name: 'asc' } }, { cep: { sortOrder: 'asc' } }],
      })
    }),

  // Upsert a single linkage score
  upsert: dbProcedure
    .input(
      z.object({
        waveId: z.string(),
        brandId: z.string(),
        cepId: z.string(),
        score: z.number().min(0).max(100),
        segment: z.enum(['NON_LIGHT', 'HEAVY', 'OVERALL']).default('NON_LIGHT'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { waveId, brandId, cepId, segment, score } = input
      return ctx.prisma.linkage.upsert({
        where: { waveId_brandId_cepId_segment: { waveId, brandId, cepId, segment } },
        create: { waveId, brandId, cepId, segment, score },
        update: { score },
      })
    }),

  // Bulk upsert — used after Excel upload
  bulkUpsert: dbProcedure
    .input(
      z.object({
        waveId: z.string(),
        segment: z.enum(['NON_LIGHT', 'HEAVY', 'OVERALL']),
        rows: z.array(
          z.object({
            brandId: z.string(),
            cepId: z.string(),
            score: z.number().min(0).max(100),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const ops = input.rows.map((row) =>
        ctx.prisma.linkage.upsert({
          where: {
            waveId_brandId_cepId_segment: {
              waveId: input.waveId,
              brandId: row.brandId,
              cepId: row.cepId,
              segment: input.segment,
            },
          },
          create: { waveId: input.waveId, segment: input.segment, ...row },
          update: { score: row.score },
        })
      )
      await ctx.prisma.$transaction(ops)
      return { upserted: input.rows.length }
    }),

  // WOM data
  upsertWom: dbProcedure
    .input(
      z.object({
        waveId: z.string(),
        brandId: z.string(),
        pwom: z.number().min(0).max(100),
        nwom: z.number().min(0).max(100),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { waveId, brandId, pwom, nwom } = input
      return ctx.prisma.womData.upsert({
        where: { waveId_brandId: { waveId, brandId } },
        create: { waveId, brandId, pwom, nwom },
        update: { pwom, nwom, updatedAt: new Date() },
      })
    }),

  // Reach data
  upsertReach: dbProcedure
    .input(
      z.object({
        waveId: z.string(),
        creativeName: z.string().min(1),
        noticedPct: z.number().min(0).max(100),
        brandedPct: z.number().min(0).max(100),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { waveId, creativeName, noticedPct, brandedPct } = input
      const brandingRatio = noticedPct > 0 ? (brandedPct / noticedPct) * 100 : 0
      return ctx.prisma.reachData.upsert({
        where: { waveId_creativeName: { waveId, creativeName } },
        create: { waveId, creativeName, noticedPct, brandedPct, brandingRatio },
        update: { noticedPct, brandedPct, brandingRatio, updatedAt: new Date() },
      })
    }),

  // Channel presence data
  upsertPresence: dbProcedure
    .input(
      z.object({
        waveId: z.string(),
        channelName: z.string().min(1),
        coveragePct: z.number().min(0).max(100),
        categoryNormPct: z.number().min(0).max(100).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { waveId, channelName, coveragePct, categoryNormPct } = input
      return ctx.prisma.channelPresence.upsert({
        where: { waveId_channelName: { waveId, channelName } },
        create: { waveId, channelName, coveragePct, categoryNormPct },
        update: { coveragePct, categoryNormPct, updatedAt: new Date() },
      })
    }),
})
