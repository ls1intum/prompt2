import React from 'react'
import ErrorBoundary from './ErrorBoundary'
import { LandingPage } from './LandingPage/LandingPage'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
const TemplateComponent = React.lazy(() => import('template_component/App'))
import { KeycloakProvider } from '@/keycloak/KeycloakProvider'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { ManagementRoot } from './management/ManagementConsole'

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
        <BrowserRouter>
          <Routes>
            <Route path='/' element={<LandingPage />} />
            <Route path='/management' element={<ManagementRoot />} />
            <Route
              path='/template'
              element={
                <ErrorBoundary fallback={<div>TemplateComponent is unavailable.</div>}>
                  <React.Suspense fallback={<div>Loading...</div>}>
                    <TemplateComponent />
                  </React.Suspense>
                </ErrorBoundary>
              }
            />
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </KeycloakProvider>
  )
}

export default App
