import { SidebarGroup, SidebarGroupContent, SidebarMenu } from '@tumaet/prompt-ui-components'
import { Archive, File, FileText } from 'lucide-react'
import { InsideSidebarMenuItem } from './components/InsideSidebarMenuItem'
import { InsideSidebarVisualGroup } from './components/InsideSidebarHeading'

export const InsideGeneralSidebar = (): JSX.Element => {
  return (
    <SidebarMenu>
      <SidebarGroup>
        <SidebarGroupContent className='flex flex-col gap-5'>
          <InsideSidebarVisualGroup title='Courses'>
            <InsideSidebarMenuItem
              icon={<FileText />}
              goToPath={'/management/courses'}
              title='Courses'
            />
            <InsideSidebarMenuItem
              icon={<File />}
              goToPath={'/management/course_templates'}
              title='Template Courses'
            />
            <InsideSidebarMenuItem
              icon={<Archive />}
              goToPath={'/management/course_archive'}
              title='Archived Courses'
            />
          </InsideSidebarVisualGroup>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarMenu>
  )
}
