import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import React from 'react'
import { ExtendedRouteObject } from '@/interfaces/extended_route_object'
import { ExternalRoutes } from '../RouteLoaders/ExternalRoutes'

/** We use this style with a separate loading file for better performance */
/** It would be possible to have one loading script and pass the import path as variable */
/** but this requires a dictionary for static compilation + leads to re-renders every time */
/** Hence this way allows for better UI expierence */
export const TemplateRoutes = React.lazy(() =>
  import('template_component/routers')
    .then((module): { default: React.FC } => ({
      default: () => {
        const routes: ExtendedRouteObject[] = module.default || []
        return <ExternalRoutes routes={routes} />
      },
    }))
    .catch((): { default: React.FC } => ({
      default: () => {
        console.warn('Failed to load template routes')
        return (
          <Alert variant='destructive'>
            <AlertCircle className='h-4 w-4' />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              We&apos;re sorry, but we couldn&apos;t load the template routes. Please try refreshing
              or contact support if the problem persists.
            </AlertDescription>
          </Alert>
        )
      },
    })),
)
