import { RouteObject } from 'react-router-dom'
import OverviewPage from 'template_component/src/OverviewPage'
import SettingsPage from 'template_component/src/SettingsPage'

const templateRoutes: RouteObject[] = [
  {
    path: '',
    element: <OverviewPage />,
  },
  {
    path: '/settings',
    element: <SettingsPage />,
  },
  // Add more routes here as needed
]

export default templateRoutes
