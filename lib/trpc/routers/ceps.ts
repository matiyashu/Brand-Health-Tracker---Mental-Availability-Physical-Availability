import { z } from 'zod'
import { router, dbProcedure } from '../init'

// CBM wording rules — superlatives that make a CEP invalid
const FORBIDDEN_SUPERLATIVES = ['most', 'best', 'more', 'least', 'worst', 'biggest', 'largest', 'fastest']

function validateCepWording(text: string): string | null {
  const lower = text.toLowerCase()
  for (const word of FORBIDDEN_SUPERLATIVES) {
    if (lower.includes(word)) {
      return `CEP contains forbidden superlative: "${word}". Rephrase to plain-form.`
    }
  }
  return null
}

export const cepsRouter = router({
  list: dbProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.cep.findMany({
        where: { projectId: input.projectId, isActive: true },
        orderBy: [{ type: 'asc' }, { sortOrder: 'asc' }],
      })
    }),

  composition: dbProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      const ceps = await ctx.prisma.cep.findMany({
        where: { projectId: input.projectId, isActive: true },
        select: { type: true },
      })
      const total = ceps.length
      const counts = { CEP: 0, BASELINE: 0, SECONDARY: 0 }
      ceps.forEach((c) => counts[c.type]++)
      return {
        total,
        counts,
        percentages: {
          CEP: total ? (counts.CEP / total) * 100 : 0,
          BASELINE: total ? (counts.BASELINE / total) * 100 : 0,
          SECONDARY: total ? (counts.SECONDARY / total) * 100 : 0,
        },
        // CBM compliance: 60-70% CEP, ≤30% BASELINE, ≤20% SECONDARY
        isCompliant:
          total > 0 &&
          counts.CEP / total >= 0.6 &&
          counts.CEP / total <= 0.7 &&
          counts.BASELINE / total <= 0.3 &&
          counts.SECONDARY / total <= 0.2,
      }
    }),

  create: dbProcedure
    .input(
      z.object({
        projectId: z.string(),
        text: z.string().min(5),
        type: z.enum(['CEP', 'BASELINE', 'SECONDARY']).default('CEP'),
        dimension: z
          .enum(['WHO', 'WHAT', 'WHEN', 'WHERE', 'WHY', 'WITH_WHAT', 'WITH_WHOM'])
          .optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Enforce CBM wording rules
      const violation = validateCepWording(input.text)
      if (violation) throw new Error(violation)

      const count = await ctx.prisma.cep.count({ where: { projectId: input.projectId } })
      return ctx.prisma.cep.create({ data: { ...input, sortOrder: count } })
    }),

  bulkCreate: dbProcedure
    .input(
      z.object({
        projectId: z.string(),
        ceps: z.array(
          z.object({
            text: z.string().min(5),
            type: z.enum(['CEP', 'BASELINE', 'SECONDARY']).default('CEP'),
            dimension: z
              .enum(['WHO', 'WHAT', 'WHEN', 'WHERE', 'WHY', 'WITH_WHAT', 'WITH_WHOM'])
              .optional(),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const violations = input.ceps
        .map((c, i) => ({ i, msg: validateCepWording(c.text) }))
        .filter((v) => v.msg)
      if (violations.length > 0) {
        throw new Error(
          `Wording violations: ${violations.map((v) => `Row ${v.i + 1}: ${v.msg}`).join('; ')}`
        )
      }
      return ctx.prisma.cep.createMany({
        data: input.ceps.map((c, i) => ({ ...c, projectId: input.projectId, sortOrder: i })),
        skipDuplicates: true,
      })
    }),

  update: dbProcedure
    .input(
      z.object({
        id: z.string(),
        text: z.string().min(5).optional(),
        type: z.enum(['CEP', 'BASELINE', 'SECONDARY']).optional(),
        dimension: z
          .enum(['WHO', 'WHAT', 'WHEN', 'WHERE', 'WHY', 'WITH_WHAT', 'WITH_WHOM'])
          .optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, text, ...rest } = input
      if (text) {
        const violation = validateCepWording(text)
        if (violation) throw new Error(violation)
      }
      return ctx.prisma.cep.update({ where: { id }, data: { ...(text ? { text } : {}), ...rest } })
    }),

  delete: dbProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Soft delete — mark inactive to preserve historical linkage data
      await ctx.prisma.cep.update({ where: { id: input.id }, data: { isActive: false } })
      return { success: true }
    }),
})
