import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible'
import {
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from '@/components/ui/sidebar'
import { Settings, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

interface CollapsableSidebarMenuItemProps {
  goToPath: string
  isActive: boolean
  icon: JSX.Element
  title: string
  subitems?: {
    goToPath: string
    isActive: boolean
    title: string
  }[]
}

export const SidebarMenuItemCollapsable = (props: CollapsableSidebarMenuItemProps): JSX.Element => {
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)

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
          <CollapsibleTrigger asChild>
            <SidebarMenuButton tooltip={props.title} onClick={() => navigate(props.goToPath)}>
              <Settings />
              <span>{props.title}</span>
              <ChevronRight
                className='ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90'
                onClick={(event) => {
                  event.preventDefault()
                  event.stopPropagation()
                  setIsOpen((prev) => !prev)
                }}
              />
            </SidebarMenuButton>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <SidebarMenuSub>
              {props.subitems?.map((subitem) => (
                <SidebarMenuSubItem key={subitem.title}>
                  <SidebarMenuSubButton asChild onClick={() => navigate(subitem.goToPath)}>
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
