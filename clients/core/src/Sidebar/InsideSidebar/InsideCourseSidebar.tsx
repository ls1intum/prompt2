import { SidebarMenu } from '@/components/ui/sidebar'
import { FileUser, Gauge, Settings } from 'lucide-react'
import { useParams } from 'react-router-dom'
import { InsideSidebarMenuItem } from './components/InsideSidebarMenuItem'

export const InsideCourseSidebar = (): JSX.Element => {
  const { courseId } = useParams<{ courseId: string }>()
  const rootPath = `/management/course/${courseId}/`

  return (
    <SidebarMenu>
      <InsideSidebarMenuItem goToPath={rootPath} icon={<Gauge />} title='Overview' />
      <InsideSidebarMenuItem
        goToPath={rootPath + 'application'}
        icon={<FileUser />}
        title='Application Phase'
      />
      {/** TODO: add submodules here */}
      <InsideSidebarMenuItem
        goToPath={rootPath + 'settings'}
        icon={<Settings />}
        title='Settings'
        subitems={[
          {
            goToPath: rootPath + 'modules/1',
            title: 'Module 1',
          },
          {
            goToPath: rootPath + 'modules/2',
            title: 'Module 2',
          },
        ]}
      />
    </SidebarMenu>
  )
}
