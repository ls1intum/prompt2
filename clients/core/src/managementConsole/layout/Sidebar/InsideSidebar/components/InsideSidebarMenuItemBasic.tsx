import { SidebarMenuButton, SidebarMenuItem } from '@tumaet/prompt-ui-components'
import { useLocation, useNavigate } from 'react-router-dom'

interface SidebarMenuItemProps {
  goToPath: string
  icon
  title: string
}

export const InsideSidebarMenuItemBasic = (props: SidebarMenuItemProps) => {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild={false}
        onClick={() => navigate(props.goToPath)}
        isActive={location.pathname === props.goToPath}
      >
        {props.icon}
        <span>{props.title}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}
