import { Label } from '@/components/ui/label'
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
      <SidebarHeader className='gap-3.5 border-b p-4'>
        <div className='flex w-full items-center justify-between'>
          <div className='text-base font-medium text-foreground'>{headerName}</div>
          <Label className='flex items-center gap-2 text-sm'></Label>
        </div>
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
