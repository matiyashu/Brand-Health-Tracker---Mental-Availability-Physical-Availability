import { router } from '../init'
import { projectsRouter } from './projects'
import { wavesRouter } from './waves'
import { brandsRouter } from './brands'
import { cepsRouter } from './ceps'
import { linkageRouter } from './linkage'
import { analyticsRouter } from './analytics'
import { distributionRouter } from './distribution'

export const appRouter = router({
  projects: projectsRouter,
  waves: wavesRouter,
  brands: brandsRouter,
  ceps: cepsRouter,
  linkage: linkageRouter,
  analytics: analyticsRouter,
  distribution: distributionRouter,
})

export type AppRouter = typeof appRouter
