import { SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar'
import { useNavigate } from 'react-router-dom'

interface SidebarMenuItemProps {
  goToPath: string
  isActive: boolean
  icon: JSX.Element
  title: string
}

export const CourseSidebarMenuItem = (props: SidebarMenuItemProps): JSX.Element => {
  const navigate = useNavigate()

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild onClick={() => navigate(props.goToPath)} isActive={props.isActive}>
        <div>
          {props.icon}
          <span>{props.title}</span>
        </div>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}
