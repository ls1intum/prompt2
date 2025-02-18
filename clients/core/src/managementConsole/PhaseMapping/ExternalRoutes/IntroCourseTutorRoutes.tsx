import React from 'react'
import { ExtendedRouteObject } from '@/interfaces/extendedRouteObject'
import { ExternalRoutes } from './ExternalRoutes'
import { LoadingError } from '../utils/LoadingError'

export const IntroCourseTutorRoutes = React.lazy(() =>
  import('intro_course_tutor_component/routes')
    .then((module): { default: React.FC } => ({
      default: () => {
        const routes: ExtendedRouteObject[] = module.default || []
        return <ExternalRoutes routes={routes} />
      },
    }))
    .catch((error): { default: React.FC } => ({
      default: () => {
        console.warn('Failed to load intro course tutor routes')
        console.warn(error)
        return <LoadingError phaseTitle={'Intro Course Tutor'} />
      },
    })),
)
