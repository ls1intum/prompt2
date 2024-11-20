import React from 'react'
import ErrorBoundary from './ErrorBoundary'
const TemplateComponent = React.lazy(() => import('template_component/App'))

export const App = (): JSX.Element => {
  return (
    <div>
      <h1>App</h1>
      <React.Suspense fallback='Loading...'>
        <ErrorBoundary fallback={<div>TemplateComponent is unavailable.</div>}>
          <TemplateComponent />
        </ErrorBoundary>
      </React.Suspense>
    </div>
  )
}

export default App
