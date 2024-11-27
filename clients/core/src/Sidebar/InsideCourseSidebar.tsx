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
} from '@/components/ui/sidebar'

// TODO to be replaced!!!
interface InsideCourseSidebarProps extends React.ComponentProps<typeof Sidebar> {
  activeItem: {
    title: string
    url?: string
    icon?: React.ForwardRefExoticComponent<React.RefAttributes<SVGSVGElement>>
    isActive?: boolean
    items: {
      title: string
      url?: string
      icon?: React.ForwardRefExoticComponent<React.RefAttributes<SVGSVGElement>>
    }[]
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
        <SidebarGroup className='px-0'>
          <SidebarGroupContent>
            <SidebarMenu>
              {activeItem.items?.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
