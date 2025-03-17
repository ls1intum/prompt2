import * as React from 'react'
import { Moon, Sun, Monitor } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useDarkMode } from '@/contexts/DarkModeProvider'

export function ThemeToggle() {
  const { theme, setTheme } = useDarkMode()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='outline' size='icon' className='w-[120px]'>
          {theme === 'light' && <Sun className='h-4 w-4' />}
          {theme === 'dark' && <Moon className='h-4 w-4' />}
          {theme === 'system' && <Monitor className='h-4 w-4' />}
          <span className='ml-2'>{theme?.charAt(0).toUpperCase() + theme?.slice(1)}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        <DropdownMenuItem onClick={() => setTheme('light')}>
          <Sun className='mr-2 h-4 w-4' />
          <span>Light</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')}>
          <Moon className='mr-2 h-4 w-4' />
          <span>Dark</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('system')}>
          <Monitor className='mr-2 h-4 w-4' />
          <span>System</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
