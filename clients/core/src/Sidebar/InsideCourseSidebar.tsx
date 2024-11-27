import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Label } from '@/components/ui/label'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar'
import { ChevronRight } from 'lucide-react'

// TODO to be replaced!!!
interface InsideCourseSidebarProps extends React.ComponentProps<typeof Sidebar> {
  activeItem: {
    title: string
    url?: string
    icon?: React.ForwardRefExoticComponent<React.RefAttributes<SVGSVGElement>>
    isActive?: boolean
  }
}

export const InsideCourseSidebar = ({ activeItem }: InsideCourseSidebarProps): JSX.Element => {
  return (
    <Sidebar collapsible='none' className='flex-1 flex'>
      <SidebarHeader className='gap-3.5 border-b p-4'>
        <div className='flex w-full items-center justify-between'>
          <div className='text-base font-medium text-foreground'>{activeItem.title}</div>
          <Label className='flex items-center gap-2 text-sm'></Label>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className='px-2 py-4'>
          <SidebarGroupContent>
            <SidebarMenu>
              {activeItem.items?.map((item) => (
                <Collapsible
                  key={item.title}
                  asChild
                  defaultOpen={false}
                  className='group/collapsible'
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton tooltip={item.title}>
                        {item.icon && <item.icon />}
                        <span>{item.title}</span>
                        <ChevronRight className='ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90' />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {Array.isArray(item.items) &&
                          item.items.map((subItem) => (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuSubButton asChild>
                                <a href={subItem.url}>
                                  <span>{subItem.title}</span>
                                </a>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
