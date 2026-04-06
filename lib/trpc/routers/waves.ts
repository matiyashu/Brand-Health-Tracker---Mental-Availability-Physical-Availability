import { z } from 'zod'
import { router, dbProcedure } from '../init'

export const wavesRouter = router({
  list: dbProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.wave.findMany({
        where: { projectId: input.projectId },
        include: {
          _count: {
            select: { linkages: true, kpis: true, womData: true, reachData: true },
          },
        },
        orderBy: { startDate: 'desc' },
      })
    }),

  get: dbProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.wave.findUnique({
        where: { id: input.id },
        include: {
          kpis: { include: { brand: true } },
          womData: { include: { brand: true } },
          reachData: true,
          presenceData: true,
          linkages: { include: { brand: true, cep: true } },
        },
      })
    }),

  create: dbProcedure
    .input(
      z.object({
        projectId: z.string(),
        label: z.string().min(1),
        period: z.string().min(1),
        startDate: z.date(),
        endDate: z.date(),
        sampleSize: z.number().int().min(0).default(0),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.wave.create({ data: input })
    }),

  updateStatus: dbProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.enum(['DRAFT', 'ACTIVE', 'COMPLETED']),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.wave.update({
        where: { id: input.id },
        data: { status: input.status },
      })
    }),

  delete: dbProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.wave.delete({ where: { id: input.id } })
      return { success: true }
    }),
})
