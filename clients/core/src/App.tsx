import React, { useState } from 'react'
import ErrorBoundary from './ErrorBoundary'
import { LandingPage } from './LandingPage/LandingPage'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
const TemplateComponent = React.lazy(() => import('template_component/App'))
import { KeycloakProvider } from '@/keycloak/KeycloakProvider'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
})

export const App = (): JSX.Element => {
  return (
    <KeycloakProvider>
      <QueryClientProvider client={queryClient}>
        <div>
          {/* add router here */}
          <LandingPage />
        </div>
      </QueryClientProvider>
    </KeycloakProvider>
  )
}

export default App
