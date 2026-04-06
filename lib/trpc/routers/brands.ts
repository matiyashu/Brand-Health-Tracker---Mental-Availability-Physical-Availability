import { z } from 'zod'
import { router, dbProcedure } from '../init'

export const brandsRouter = router({
  list: dbProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      // Alphabetical order enforced — CBM methodology rule
      return ctx.prisma.brand.findMany({
        where: { projectId: input.projectId },
        orderBy: { name: 'asc' },
      })
    }),

  create: dbProcedure
    .input(
      z.object({
        projectId: z.string(),
        name: z.string().min(1),
        isFocal: z.boolean().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.brand.create({ data: input })
    }),

  bulkCreate: dbProcedure
    .input(
      z.object({
        projectId: z.string(),
        brands: z.array(
          z.object({ name: z.string().min(1), isFocal: z.boolean().default(false) })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.brand.createMany({
        data: input.brands.map((b) => ({ ...b, projectId: input.projectId })),
        skipDuplicates: true,
      })
    }),

  delete: dbProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.brand.delete({ where: { id: input.id } })
      return { success: true }
    }),

  // KPIs for a brand across waves — for trend charts
  kpiHistory: dbProcedure
    .input(
      z.object({
        brandId: z.string(),
        segment: z.enum(['NON_LIGHT', 'HEAVY', 'OVERALL']).default('NON_LIGHT'),
      })
    )
    .query(async ({ ctx, input }) => {
      return ctx.prisma.waveKpi.findMany({
        where: { brandId: input.brandId, segment: input.segment },
        include: { wave: { select: { label: true, period: true, startDate: true } } },
        orderBy: { wave: { startDate: 'asc' } },
      })
    }),

  // All KPIs for a wave — for competitive charts
  waveKpis: dbProcedure
    .input(
      z.object({
        waveId: z.string(),
        segment: z.enum(['NON_LIGHT', 'HEAVY', 'OVERALL']).default('NON_LIGHT'),
      })
    )
    .query(async ({ ctx, input }) => {
      return ctx.prisma.waveKpi.findMany({
        where: { waveId: input.waveId, segment: input.segment },
        include: { brand: true },
        orderBy: { mpen: 'desc' },
      })
    }),

  upsertKpi: dbProcedure
    .input(
      z.object({
        waveId: z.string(),
        brandId: z.string(),
        segment: z.enum(['NON_LIGHT', 'HEAVY', 'OVERALL']),
        mpen: z.number().min(0).max(100).optional(),
        mms: z.number().min(0).max(100).optional(),
        ns: z.number().min(0).optional(),
        som: z.number().min(0).max(100).optional(),
        sms: z.number().min(0).max(100).optional(),
        awareness: z.number().min(0).max(100).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { waveId, brandId, segment, ...data } = input
      return ctx.prisma.waveKpi.upsert({
        where: { waveId_brandId_segment: { waveId, brandId, segment } },
        create: { waveId, brandId, segment, ...data },
        update: { ...data, updatedAt: new Date() },
      })
    }),
})
