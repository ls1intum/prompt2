import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
} from '@/components/ui/sidebar'
import { NavUserMenu } from '../components/NavUserMenu'
import { useCourseStore } from '@/zustand/useCourseStore'
import SidebarHeaderComponent from './components/SidebarHeader'
import { CourseSidebarItem } from './components/CourseSidebarItem'

interface CourseSwitchSidebarProps {
  onLogout: () => void
}

export const CourseSwitchSidebar = ({ onLogout }: CourseSwitchSidebarProps): JSX.Element => {
  const { courses } = useCourseStore()

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
              {courses.map((course) => {
                return <CourseSidebarItem key={course.id} course={course} />
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className='relative flex aspect-square size-12 items-center justify-center'>
          <div className='flex aspect-square size-10 items-center justify-center'>
            <NavUserMenu onLogout={onLogout} />
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
