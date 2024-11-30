import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible'
import {
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarMenuAction,
} from '@/components/ui/sidebar'
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
        key={props.title}
        asChild
        open={isOpen}
        onOpenChange={setIsOpen}
        defaultOpen={false}
        className='group/collapsible'
      >
        <SidebarMenuItem>
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
          <CollapsibleContent>
            <SidebarMenuSub>
              {props.subitems?.map((subitem) => (
                <SidebarMenuSubItem key={subitem.title}>
                  <SidebarMenuSubButton
                    asChild
                    onClick={() => navigate(subitem.goToPath)}
                    isActive={subitem.goToPath == pathname}
                  >
                    <span>{subitem.title}</span>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              ))}
            </SidebarMenuSub>
          </CollapsibleContent>
        </SidebarMenuItem>
      </Collapsible>
    </SidebarMenuItem>
  )
}
