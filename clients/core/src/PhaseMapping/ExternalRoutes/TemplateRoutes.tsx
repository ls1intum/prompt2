import React from 'react'
import { LazyLoadedRoutes } from '../RouteLoaders/LazyLoadedRoutes'

export const TemplateRoutes: React.FC = () => {
  return <LazyLoadedRoutes importPath='template_component/routers' />
}
