import * as React from 'react'

import { Sidebar } from '@tumaet/prompt-ui-components'
import { InsideSidebar } from './InsideSidebar/InsideSidebar'
import { CourseSwitchSidebar } from './CourseSwitchSidebar/CourseSwitchSidebar'

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {}

export function AppSidebar({ ...props }: AppSidebarProps): JSX.Element {
  return (
    <Sidebar
      collapsible='icon'
      className='overflow-hidden [&>[data-sidebar=sidebar]]:flex-row'
      {...props}
    >
      {/* This is the first sidebar */}
      <CourseSwitchSidebar />
      <InsideSidebar />
    </Sidebar>
  )
}
