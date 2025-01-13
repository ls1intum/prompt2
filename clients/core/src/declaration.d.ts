// Matches all * _component files
declare module '*_component/routers' {
  import { RouteObject } from 'react-router-dom'

  const routes: RouteObject[]
  export default routes
}

declare module '*_component/sidebar' {
  import { SidebarMenuItemProps } from '@/interfaces/sidebar'

  const sidebar: SidebarMenuItemProps
  export default sidebar
}
