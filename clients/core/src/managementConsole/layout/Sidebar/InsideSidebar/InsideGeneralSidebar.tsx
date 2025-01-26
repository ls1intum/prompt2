import { SidebarGroup, SidebarGroupContent, SidebarMenu } from '@/components/ui/sidebar'
import { Gauge } from 'lucide-react'
import { InsideSidebarMenuItem } from './components/InsideSidebarMenuItem'

export const InsideGeneralSidebar = (): JSX.Element => {
  return (
    <SidebarMenu>
      <SidebarGroup>
        <SidebarGroupContent>
          <InsideSidebarMenuItem
            icon={<Gauge />}
            goToPath={'/management/general'}
            title='Dashboard'
          />
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarMenu>
  )
}
