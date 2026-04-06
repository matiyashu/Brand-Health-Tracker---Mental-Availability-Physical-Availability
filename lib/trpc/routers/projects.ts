import { z } from 'zod'
import { router, dbProcedure } from '../init'

export const projectsRouter = router({
  list: dbProcedure.query(async ({ ctx }) => {
    return ctx.prisma.project.findMany({
      where: { ownerId: ctx.userId },
      include: { _count: { select: { waves: true, brands: true, ceps: true } } },
      orderBy: { createdAt: 'desc' },
    })
  }),

  get: dbProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const project = await ctx.prisma.project.findFirst({
        where: { id: input.id, ownerId: ctx.userId },
        include: {
          brands: { orderBy: { name: 'asc' } },
          ceps: { where: { isActive: true }, orderBy: { sortOrder: 'asc' } },
          waves: { orderBy: { startDate: 'desc' } },
        },
      })
      if (!project) throw new Error('Project not found')
      return project
    }),

  create: dbProcedure
    .input(
      z.object({
        name: z.string().min(2),
        category: z.string().min(2),
        country: z.string().min(2),
        focalBrand: z.string().min(1),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.project.create({
        data: { ...input, ownerId: ctx.userId },
      })
    }),

  update: dbProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(2).optional(),
        category: z.string().optional(),
        country: z.string().optional(),
        focalBrand: z.string().optional(),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input
      return ctx.prisma.project.update({
        where: { id, ownerId: ctx.userId },
        data,
      })
    }),

  delete: dbProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.project.delete({
        where: { id: input.id, ownerId: ctx.userId },
      })
      return { success: true }
    }),
})
