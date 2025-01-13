import React, { Suspense } from 'react'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import { ExtendedRouteObject } from '@/interfaces/extended_route_object'
import { ExternalRoutes } from './ExternalRoutes'

interface LazyLoadedRoutesProps {
  importPath: string
}

/**
 * A dictionary of all dynamic modules we allow to load.
 * This is required such that webpack can statically analyze the code and
 * generate the necessary chunks for lazy-loading.
 */
const ROUTE_IMPORTS: Record<string, () => Promise<any>> = {
  'interview_component/routers': () => import('interview_component/routers'),
  'template_component/routers': () => import('template_component/routers'),
  // Add more paths here if you have other dynamic modules you want to load
}

/**
 * A reusable lazy-loading component that dynamically imports a routes module,
 * extracts the route objects, and renders them through ExternalRoutes.
 */
export const LazyLoadedRoutes: React.FC<LazyLoadedRoutesProps> = ({ importPath }) => {
  const importFn = ROUTE_IMPORTS[importPath]

  // If the path is not in the dictionary, show an immediate error
  if (!importFn) {
    console.warn(`Unknown path "${importPath}" - no matching module found.`)
    return (
      <Alert variant='destructive'>
        <AlertCircle className='h-4 w-4' />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          The import path <code>{importPath}</code> is not recognized.
        </AlertDescription>
      </Alert>
    )
  }

  /**
   * Define the lazy component "inside" the component so we can render it below.
   */
  const LazyComponent = React.lazy(() =>
    importFn()
      .then((module): { default: React.FC } => ({
        default: () => {
          const routes: ExtendedRouteObject[] = module.default || []
          return <ExternalRoutes routes={routes} />
        },
      }))
      .catch((): { default: React.FC } => ({
        default: () => {
          console.warn(`Failed to load routes from "${importPath}"`)
          return (
            <Alert variant='destructive'>
              <AlertCircle className='h-4 w-4' />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                We&apos;re sorry, but we couldn&apos;t load the routes from{' '}
                <code>{importPath}</code>. Please try refreshing or contact support if the problem
                persists.
              </AlertDescription>
            </Alert>
          )
        },
      })),
  )

  // TODO: make nicer loading state
  return (
    <Suspense fallback={<div>Loading Component...</div>}>
      <LazyComponent />
    </Suspense>
  )
}
