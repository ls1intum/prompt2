import React, { Suspense } from 'react'
import { LandingPage } from './LandingPage/LandingPage'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { KeycloakProvider } from '@/keycloak/KeycloakProvider'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { ManagementRoot } from './management/ManagementConsole'
import { CourseOverview } from './Course/CourseOverview'
import { TemplateRoutes } from './Router/TemplateRoutes'
import { Application } from './Application/Application'
import { PhaseRouterMapping } from './PhaseMapping/PhaseRouterMapping'

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
            <Route path='/management/general' element={<ManagementRoot />} />
            <Route
              path='/management/course/:courseId'
              element={
                <ManagementRoot>
                  <CourseOverview />
                </ManagementRoot>
              }
            />
            <Route
              path='/management/course/:courseId/:phaseId/*'
              element={
                <ManagementRoot>
                  <PhaseRouterMapping />
                </ManagementRoot>
              }
            />
            <Route
              path='/management/course/:courseId/application/*'
              element={
                <ManagementRoot>
                  <Application />
                </ManagementRoot>
              }
            />
            <Route
              path='/management/course/:courseId/template_component/*'
              element={
                <ManagementRoot>
                  <Suspense fallback={<div>Fallback</div>}>
                    <TemplateRoutes />
                  </Suspense>
                </ManagementRoot>
              }
            />
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </KeycloakProvider>
  )
}

export default App
