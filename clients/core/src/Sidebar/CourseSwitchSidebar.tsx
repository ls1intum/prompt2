import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { HomeIcon } from 'lucide-react'
import { NavUserMenu } from './components/NavUserMenu'

// TODO replace with actual data!!!
interface CourseSwitchSidebarProps {
  data: {
    navMain: {
      title: string
      icon: React.ForwardRefExoticComponent<React.RefAttributes<SVGSVGElement>>
    }[]
  }
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
  setOpen: (value: boolean) => void
  setActiveItem: (value: any) => void
  onLogout: () => void
}

export const CourseSwitchSidebar = ({
  data,
  activeItem,
  setOpen,
  setActiveItem,
  onLogout,
}: CourseSwitchSidebarProps): JSX.Element => {
  return (
    <Sidebar
      collapsible='none'
      className='!w-[calc(var(--sidebar-width-icon)_+_1px)] min-w-[calc(var(--sidebar-width-icon)_+_1px)] border-r'
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size='lg'
              asChild
              className='min-w-12 min-h-12 p-0'
              tooltip={{
                children: 'Home',
                hidden: false,
              }}
            >
              <a href='#'>
                <div className='flex aspect-square size-12 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground'>
                  <HomeIcon className='size-6' />
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent className='px-0'>
            <SidebarMenu>
              {data.navMain.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    size='lg'
                    tooltip={{
                      children: item.title,
                      hidden: false,
                    }}
                    onClick={() => {
                      setActiveItem(item)
                      setOpen(true)
                    }}
                    isActive={activeItem.title === item.title}
                    className='min-w-12 min-h-12 p-0'
                  >
                    <div className='flex aspect-square size-12 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground'>
                      <div className='size-6'>
                        <item.icon />
                      </div>
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <NavUserMenu onLogout={onLogout} />
      </SidebarFooter>
    </Sidebar>
  )
}
