import React, { Suspense } from 'react'
import { LandingPage } from './LandingPage/LandingPage'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { KeycloakProvider } from './keycloak/KeycloakProvider'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { ManagementRoot } from './management/ManagementConsole'
import { TemplateRoutes } from './PhaseMapping/ExternalRoutes/TemplateRoutes'
import { PhaseRouterMapping } from './PhaseMapping/PhaseRouterMapping'
import PrivacyPage from './LegalPages/Privacy'
import ImprintPage from './LegalPages/Imprint'
import AboutPage from './LegalPages/AboutPage'
import { CourseOverview } from './Course/CourseOverview'
import { ApplicationLoginPage } from './Application/ApplicationLoginPage'
import { ApplicationAuthenticated } from './Application/pages/ApplicationAuthenticated/ApplicationAuthenticated'
import { Toaster } from '@/components/ui/toaster'
import CourseConfiguratorPage from './CourseConfigurator/CourseConfiguratorPage'
import { PermissionRestriction } from './management/PermissionRestriction'
import { Role } from '@/interfaces/permission_roles'
import { env } from './env'
import { parseURL } from './utils/parseURL'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
})

const keycloakUrl = parseURL(env.KEYCLOAK_HOST)
const keycloakRealmName = env.KEYCLOAK_REALM_NAME

export const App = (): JSX.Element => {
  return (
    <KeycloakProvider keycloakRealmName={keycloakRealmName} keycloakUrl={keycloakUrl}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            <Route path='/about' element={<AboutPage />} />
            <Route path='/privacy' element={<PrivacyPage />} />
            <Route path='/imprint' element={<ImprintPage />} />
            <Route path='/' element={<LandingPage />} />
            <Route path='/apply/:phaseId' element={<ApplicationLoginPage />} />
            <Route path='/apply/:phaseId/authenticated' element={<ApplicationAuthenticated />} />
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
              path='/management/course/:courseId/configurator'
              element={
                <ManagementRoot>
                  <PermissionRestriction
                    requiredPermissions={[
                      Role.PROMPT_ADMIN,
                      Role.COURSE_LECTURER,
                      Role.COURSE_EDITOR,
                    ]}
                  >
                    <CourseConfiguratorPage />
                  </PermissionRestriction>
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
          <Toaster />
        </BrowserRouter>
      </QueryClientProvider>
    </KeycloakProvider>
  )
}

export default App
