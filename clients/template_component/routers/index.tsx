import { Settings } from 'lucide-react'
import React from 'react'
import { RouteObject } from 'react-router-dom'
import SettingsPage from 'template_component/src/SettingsPage'
import ErrorBoundary from './ErrorBoundary'

const templateRoutes: RouteObject[] = [
  {
    path: '/settings',
    element: (
      <ErrorBoundary fallback={'loading failed'}>
        <SettingsPage />
      </ErrorBoundary>
    ),
  },
  // Add more routes here as needed
]

export default templateRoutes
