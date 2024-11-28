import { SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar'
import { useLocation, useNavigate } from 'react-router-dom'

interface SidebarMenuItemProps {
  goToPath: string
  icon: JSX.Element
  title: string
}

export const InsideSidebarMenuItemBasic = (props: SidebarMenuItemProps): JSX.Element => {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        onClick={() => navigate(props.goToPath)}
        isActive={location.pathname === props.goToPath}
      >
        <div>
          {props.icon}
          <span>{props.title}</span>
        </div>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}
