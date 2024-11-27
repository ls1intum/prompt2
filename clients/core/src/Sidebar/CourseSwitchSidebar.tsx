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
    items?: {
      title?: string
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
  // Array of subtle pastel colors
  const subtleColors = [
    'bg-red-100',
    'bg-yellow-100',
    'bg-green-100',
    'bg-blue-100',
    'bg-indigo-100',
    'bg-purple-100',
    'bg-pink-100',
    'bg-orange-100',
    'bg-teal-100',
    'bg-cyan-100',
  ]

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
              <div
                className={
                  `relative flex aspect-square size-12 items-center justify-center` /**Todo add highlighting here */
                }
              >
                <div
                  className={`flex aspect-square size-10 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground`}
                >
                  <HomeIcon className='size-6' />
                </div>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent className='px-0'>
            <SidebarMenu>
              {data.navMain.map((item, index) => {
                const isActive = activeItem.title === item.title
                return (
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
                      <div
                        className={`relative flex aspect-square size-12 items-center justify-center ${isActive ? 'after:absolute after:inset-0 after:rounded-lg after:border-2 after:border-primary' : ''}`}
                      >
                        <div
                          className={`flex aspect-square ${isActive ? 'size-12' : 'size-10'} items-center justify-center rounded-lg ${subtleColors[index % subtleColors.length]} text-gray-800`}
                        >
                          <div className='size-6'>
                            <item.icon />
                          </div>
                        </div>
                      </div>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className='relative flex aspect-square size-12 items-center justify-center'>
          <div className='flex aspect-square size-10 items-center justify-center'>
            <NavUserMenu onLogout={onLogout} />
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
