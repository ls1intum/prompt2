import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import React from 'react'
import { ExtendedRouteObject } from '@/interfaces/extendedRouteObject'
import { ExternalRoutes } from './ExternalRoutes'

export const InterviewRoutes = React.lazy(() =>
  import('interview_component/routes')
    .then((module): { default: React.FC } => ({
      default: () => {
        const routes: ExtendedRouteObject[] = module.default || []
        return <ExternalRoutes routes={routes} />
      },
    }))
    .catch((error): { default: React.FC } => ({
      default: () => {
        console.warn('Failed to load interview routes')
        console.warn(error)
        return (
          <Alert variant='destructive'>
            <AlertCircle className='h-4 w-4' />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              We&apos;re sorry, but we couldn&apos;t load the interview routes. Please try
              refreshing or contact support if the problem persists.
            </AlertDescription>
          </Alert>
        )
      },
    })),
)
