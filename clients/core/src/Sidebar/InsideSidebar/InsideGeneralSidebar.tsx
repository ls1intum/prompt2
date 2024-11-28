import { SidebarMenu } from '@/components/ui/sidebar'
import { Gauge } from 'lucide-react'
import { InsideSidebarMenuItem } from './components/InsideSidebarMenuItem'

export const InsideGeneralSidebar = (): JSX.Element => {
  return (
    <SidebarMenu>
      <InsideSidebarMenuItem icon={<Gauge />} goToPath={'/management/general'} title='Dashboard' />
    </SidebarMenu>
  )
}
