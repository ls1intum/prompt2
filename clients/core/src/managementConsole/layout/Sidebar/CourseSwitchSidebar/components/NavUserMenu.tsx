import { ChevronsUpDown, LogOut } from 'lucide-react'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@tumaet/prompt-ui-components'
import { NavAvatar } from './NavAvatar'
import { ThemeToggle } from '@/components/ThemeToggle'

interface NavUserProps {
  onLogout: () => void
}

export function NavUserMenu({ onLogout }: NavUserProps): JSX.Element {
  const { isMobile } = useSidebar()

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size='lg'
              className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground max-w-10 max-h-10 min-h-10 min-w-10 p-0'
            >
              <NavAvatar />
              <ChevronsUpDown className='ml-auto size-4' />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className='w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg'
            side={isMobile ? 'bottom' : 'right'}
            align='end'
            sideOffset={4}
          >
            <DropdownMenuLabel className='p-0 font-normal'>
              <div className='flex items-center gap-2 px-1 py-1.5 text-left text-sm'>
                <NavAvatar />
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className='p-2'>
              <p className='text-sm text-muted-foreground mb-3'>Preferences</p>
              <div className='flex flex-col gap-4'>
                <div className='flex items-center justify-between'>
                  <span className='text-sm'>Theme</span>
                  <ThemeToggle />
                </div>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onLogout}>
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
