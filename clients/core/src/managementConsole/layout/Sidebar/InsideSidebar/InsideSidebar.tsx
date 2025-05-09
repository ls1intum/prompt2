import { Sidebar, SidebarContent, SidebarHeader } from '@tumaet/prompt-ui-components'
import { useCourseStore } from '@tumaet/prompt-shared-state'
import { useLocation, useParams } from 'react-router-dom'
import { InsideCourseSidebar } from './InsideCourseSidebar'
import { InsideGeneralSidebar } from './InsideGeneralSidebar'

export const InsideSidebar = (): JSX.Element => {
  const { courses } = useCourseStore()
  const { courseId } = useParams<{ courseId: string }>()
  const currentCourse = courses.find((course) => course.id === courseId)

  // set the correct header
  const location = useLocation()
  const isCourseSidebar = location.pathname.startsWith('/management/course')
  const headerName = isCourseSidebar ? currentCourse?.name || 'Unknown Course' : 'General'

  return (
    <Sidebar collapsible='none' className='flex'>
      <SidebarHeader className='flex h-14 border-b justify-center'>
        <div className='text-base font-medium text-foreground'>{headerName}</div>
      </SidebarHeader>
      <SidebarContent>
        {isCourseSidebar ? <InsideCourseSidebar /> : <InsideGeneralSidebar />}
      </SidebarContent>
    </Sidebar>
  )
}
