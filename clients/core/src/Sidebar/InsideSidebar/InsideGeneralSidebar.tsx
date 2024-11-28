import { SidebarMenu } from '@/components/ui/sidebar'
import { Gauge } from 'lucide-react'
import { InsideSidebarMenuItem } from './components/InsideSidebarMenuItem'
import { useLocation } from 'react-router-dom'

export const InsideGeneralSidebar = (): JSX.Element => {
  const location = useLocation()

  return (
    <SidebarMenu>
      <InsideSidebarMenuItem
        isActive={location.pathname === '/management/general'}
        icon={<Gauge />}
        goToPath={'/management/general'}
        title='Dashboard'
      />
    </SidebarMenu>
  )
}
