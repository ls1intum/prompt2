import { Sidebar, SidebarContent, SidebarHeader } from '@tumaet/prompt-ui-components'
import { useLocation } from 'react-router-dom'
import { InsideCourseSidebar } from './InsideCourseSidebar'
import { InsideGeneralSidebar } from './InsideGeneralSidebar'
import packageJSON from '../../../../../package.json'

export const InsideSidebar = (): JSX.Element => {
  const version = packageJSON.version

  // set the correct header
  const location = useLocation()
  const isCourseSidebar = location.pathname.startsWith('/management/course')

  return (
    <Sidebar collapsible='none' className='flex'>
      <SidebarHeader className='flex h-14 border-b justify-center items-center'>
        <div className='relative flex items-baseline'>
          <span className='text-lg font-extrabold tracking-wide text-primary drop-shadow-sm'>
            PROMPT
          </span>
          <sup className='ml-1 text-xs font-normal text-gray-400 align-super'>{version}</sup>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {isCourseSidebar ? <InsideCourseSidebar /> : <InsideGeneralSidebar />}
      </SidebarContent>
    </Sidebar>
  )
}
