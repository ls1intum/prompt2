import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
} from '@/components/ui/sidebar'
import { useCourseStore } from '@/zustand/useCourseStore'
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
    <Sidebar collapsible='none' className='flex-1 flex'>
      <SidebarHeader className='flex h-14 border-b justify-center'>
        <div className='text-base font-medium text-foreground'>{headerName}</div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className='px-2 py-4'>
          <SidebarGroupContent>
            {isCourseSidebar ? <InsideCourseSidebar /> : <InsideGeneralSidebar />}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
