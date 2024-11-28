import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar'
import { ChevronRight, Settings } from 'lucide-react'

export const InsideGeneralSidebar = (): JSX.Element => {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <Collapsible key={'settings'} asChild defaultOpen={false} className='group/collapsible'>
          <SidebarMenuItem>
            <CollapsibleTrigger asChild>
              <SidebarMenuButton tooltip={'Settings'}>
                <Settings />
                <span>Settings</span>
                <ChevronRight className='ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90' />
              </SidebarMenuButton>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarMenuSub>
                <SidebarMenuSubItem key={'Something'}>
                  <SidebarMenuSubButton asChild>
                    <span>Something</span>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
                <SidebarMenuSubItem key={'Something else'}>
                  <SidebarMenuSubButton asChild>
                    <span>Something else</span>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              </SidebarMenuSub>
            </CollapsibleContent>
          </SidebarMenuItem>
        </Collapsible>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
