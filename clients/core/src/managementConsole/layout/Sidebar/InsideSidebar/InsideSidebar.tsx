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
        <div className='flex items-center'>
          <img src='/prompt_logo.svg' alt='Home' className='size-8 -mr-1' />
          <div className='relative flex items-baseline'>
            <span className='text-lg font-extrabold tracking-wide text-primary drop-shadow-sm'>
              PROMPT
            </span>
            <span className='ml-1 text-xs font-normal text-gray-400'>{version}</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {isCourseSidebar ? <InsideCourseSidebar /> : <InsideGeneralSidebar />}
      </SidebarContent>
    </Sidebar>
  )
}
