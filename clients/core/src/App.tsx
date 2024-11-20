import React from 'react'
import ErrorBoundary from './ErrorBoundary'
import { LandingPage } from './LandingPage/LandingPage'
const TemplateComponent = React.lazy(() => import('template_component/App'))

export const App = (): JSX.Element => {
  return (
    <div>
      {/* add router here */}
      <LandingPage />
    </div>
  )
}

export default App
