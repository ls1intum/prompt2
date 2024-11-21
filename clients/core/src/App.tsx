import React from 'react'
import ErrorBoundary from './ErrorBoundary'
import { LandingPage } from './LandingPage/LandingPage'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
const TemplateComponent = React.lazy(() => import('template_component/App'))

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
})

export const App = (): JSX.Element => {
  return (
    <QueryClientProvider client={queryClient}>
      <div>
        {/* add router here */}
        <LandingPage />
      </div>
    </QueryClientProvider>
  )
}

export default App
