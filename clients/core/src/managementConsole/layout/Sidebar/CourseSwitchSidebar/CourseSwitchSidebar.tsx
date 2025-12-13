import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
} from '@tumaet/prompt-ui-components'
import SidebarHeaderComponent from './components/SidebarHeader'
import { CourseSidebarItem } from './components/CourseSidebarItem'
import { AddCourseButton } from './components/AddCourseSidebarItem'
import { useAuthStore, useCourseStore } from '@tumaet/prompt-shared-state'
import { Role } from '@tumaet/prompt-shared-state'

export const CourseSwitchSidebar = (): JSX.Element => {
  const { courses } = useCourseStore()
  const activeCourses = courses.filter((c) => !c.template && !c.archived)
  const { permissions } = useAuthStore()

  const canAddCourse = permissions.some(
    (permission) => permission === Role.PROMPT_ADMIN || permission === Role.PROMPT_LECTURER,
  )

  return (
    <Sidebar
      collapsible='none'
      className='!w-[calc(var(--sidebar-width-icon)_+_1px)] min-w-[calc(var(--sidebar-width-icon)_+_1px)] border-r'
    >
      <SidebarHeaderComponent />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent className='px-0'>
            <SidebarMenu>
              {activeCourses.map((course) => {
                return <CourseSidebarItem key={course.id} course={course} />
              })}
              {canAddCourse && <AddCourseButton />}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
