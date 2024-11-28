import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar'
import { ChevronRight, Gauge, Settings, Settings2 } from 'lucide-react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { CourseSidebarMenuItem } from './components/CourseSidebarMenuItem'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { SidebarMenuItemCollapsable } from './components/SidebarMenuItemCollapsable'

export const InsideCourseSidebar = (): JSX.Element => {
  const { courseId } = useParams<{ courseId: string }>()
  const location = useLocation()
  const navigate = useNavigate()

  const rootPath = `/management/course/${courseId}/`
  const courseSubpath = location.pathname.split(rootPath)[1] || ''

  return (
    <SidebarMenu>
      <CourseSidebarMenuItem
        isActive={false}
        goToPath={rootPath}
        icon={<Settings />}
        title='Overview'
      />
      {/** TODO: add submodules here */}
      <SidebarMenuItemCollapsable
        isActive={courseSubpath === 'settings'}
        goToPath={rootPath + 'settings'}
        icon={<Settings />}
        title='Settings'
        subitems={[
          {
            goToPath: rootPath + 'modules/1',
            isActive: courseSubpath === 'modules/1',
            title: 'Module 1',
          },
          {
            goToPath: rootPath + 'modules/2',
            isActive: courseSubpath === 'modules/2',
            title: 'Module 2',
          },
        ]} /> 
    </SidebarMenu>
  )
}
