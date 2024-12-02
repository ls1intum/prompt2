import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import React from 'react'
import { RouteObject, Routes, Route } from 'react-router-dom'
import ErrorBoundary from '../../ErrorBoundary'

export const TemplateRoutes = React.lazy(() =>
  import('template_component/routers')
    .then((module): { default: React.FC } => ({
      default: () => {
        const routes: RouteObject[] = module.default || []
        return (
          <Routes>
            {routes.map((route, index) => (
              <Route
                key={index}
                path={route.path}
                element={
                  <ErrorBoundary fallback={<div>Route loading failed</div>}>
                    {route.element}
                  </ErrorBoundary>
                }
              />
            ))}
          </Routes>
        )
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
