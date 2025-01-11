declare module 'template_component/App' {
  const App: React.ComponentType
  export default App
}

// TODO: add your new components here!
declare module 'template_component/routers' {
  import { RouteObject } from 'react-router-dom'

  const routes: RouteObject[]
  export default routes
}

declare module 'template_component/sidebar' {
  import { SidebarMenuItemProps } from '@/interfaces/sidebar'

  const TemplateSidebar: SidebarMenuItemProps
  export default TemplateSidebar
}
