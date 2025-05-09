import * as React from 'react'

import { Sidebar } from '@tumaet/prompt-ui-components'
import { InsideSidebar } from './InsideSidebar/InsideSidebar'
import { CourseSwitchSidebar } from './CourseSwitchSidebar/CourseSwitchSidebar'

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  onLogout: () => void
}

export function AppSidebar({ onLogout, ...props }: AppSidebarProps): JSX.Element {
  return (
    <Sidebar
      collapsible='icon'
      className='overflow-hidden [&>[data-sidebar=sidebar]]:flex-row'
      {...props}
    >
      {/* This is the first sidebar */}
      <CourseSwitchSidebar onLogout={onLogout} />
      <InsideSidebar />
    </Sidebar>
  )
}
