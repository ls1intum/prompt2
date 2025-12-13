import { SidebarGroup, SidebarGroupContent, SidebarMenu } from '@tumaet/prompt-ui-components'
import { Archive, File, FileText, Users } from 'lucide-react'
import { InsideSidebarMenuItem } from './components/InsideSidebarMenuItem'
import { InsideSidebarHeading } from './components/InsideSidebarHeading'

export const InsideGeneralSidebar = (): JSX.Element => {
  return (
    <SidebarMenu>
      <SidebarGroup>
        <SidebarGroupContent>
          <InsideSidebarHeading>Courses</InsideSidebarHeading>
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
          <InsideSidebarHeading>Students</InsideSidebarHeading>
          <InsideSidebarMenuItem
            icon={<Users />}
            goToPath={'/management/course_archive'}
            title='Students'
          />
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarMenu>
  )
}
