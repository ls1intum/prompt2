import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarMenuAction,
} from '@tumaet/prompt-ui-components'
import { ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

interface CollapsableSidebarMenuItemProps {
  goToPath: string
  icon: JSX.Element
  title: string
  subitems?: {
    goToPath: string
    title: string
  }[]
}

export const InsideSidebarMenuItemCollapsable = (
  props: CollapsableSidebarMenuItemProps,
): JSX.Element => {
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const pathname = useLocation().pathname

  return (
    <SidebarMenuItem>
      <Collapsible
        open={isOpen}
        onOpenChange={setIsOpen}
        defaultOpen={false}
        className='group/collapsible w-full'
      >
        <div className='flex items-center w-full'>
          <SidebarMenuButton
            tooltip={props.title}
            onClick={() => {
              navigate(props.goToPath)
              setIsOpen(true)
            }}
            isActive={props.goToPath === pathname}
          >
            {props.icon}
            <span>{props.title}</span>
          </SidebarMenuButton>
          <CollapsibleTrigger asChild>
            <SidebarMenuAction className='data-[state=open]:rotate-90'>
              <ChevronRight />
              <span className='sr-only'>Toggle</span>
            </SidebarMenuAction>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent>
          <SidebarMenuSub>
            {props.subitems?.map((subitem) => (
              <SidebarMenuSubItem key={subitem.title}>
                <SidebarMenuSubButton
                  asChild
                  onClick={() => navigate(subitem.goToPath)}
                  isActive={subitem.goToPath === pathname}
                >
                  <span>{subitem.title}</span>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </Collapsible>
    </SidebarMenuItem>
  )
}
