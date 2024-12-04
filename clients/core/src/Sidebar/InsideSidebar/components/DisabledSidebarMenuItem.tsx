import React from 'react'
import { AlertTriangle } from 'lucide-react'
import { SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface DisabledSidebarMenuItemProps {
  title: string
  warningMessage?: string
}

export const DisabledSidebarMenuItem: React.FC<DisabledSidebarMenuItemProps> = ({
  title,
  warningMessage = 'This feature is currently unavailable',
}) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <SidebarMenuItem>
            <SidebarMenuButton
              className='text-yellow-700 dark:text-yellow-500 cursor-not-allowed'
              disabled
              aria-disabled='true'
            >
              <AlertTriangle className='h-4 w-4 text-warning' />
              <span>{title}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </TooltipTrigger>
        <TooltipContent side='right' align='center'>
          <p>{warningMessage}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
