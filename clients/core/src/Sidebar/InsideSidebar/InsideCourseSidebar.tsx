import { SidebarMenu } from '@/components/ui/sidebar'
import { FileUser, Gauge, Settings } from 'lucide-react'
import { useLocation, useParams } from 'react-router-dom'
import { InsideSidebarMenuItem } from './components/InsideSidebarMenuItem'

export const InsideCourseSidebar = (): JSX.Element => {
  const { courseId } = useParams<{ courseId: string }>()
  const location = useLocation()

  const rootPath = `/management/course/${courseId}/`
  const courseSubpath = location.pathname.split(rootPath)[1] || ''

  return (
    <SidebarMenu>
      <InsideSidebarMenuItem
        isActive={courseSubpath === ''}
        goToPath={rootPath}
        icon={<Gauge />}
        title='Overview'
      />
      <InsideSidebarMenuItem
        isActive={courseSubpath === 'application'}
        goToPath={rootPath + 'application'}
        icon={<FileUser />}
        title='Application Phase'
      />
      {/** TODO: add submodules here */}
      <InsideSidebarMenuItem
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
        ]}
      />
    </SidebarMenu>
  )
}
