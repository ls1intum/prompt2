import React from 'react'
import { LazyLoadedRoutes } from '../RouteLoaders/LazyLoadedRoutes'

export const InterviewRoutes: React.FC = () => {
  return <LazyLoadedRoutes importPath='interview_component/routers' />
}
