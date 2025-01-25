import React from 'react'
import { DisabledSidebarMenuItem } from '../../layout/Sidebar/InsideSidebar/components/DisabledSidebarMenuItem'
import { SidebarMenuItemProps } from '@/interfaces/sidebar'
import { ExternalSidebarComponent } from './ExternalSidebar'

interface InterviewSidebarProps {
  rootPath: string
  title?: string
}

export const InterviewSidebar = React.lazy(() =>
  import('interview_component/sidebar')
    .then((module): { default: React.FC<InterviewSidebarProps> } => ({
      default: ({ title, rootPath }) => {
        const sidebarElement: SidebarMenuItemProps = module.default || {}
        return (
          <ExternalSidebarComponent
            title={title}
            rootPath={rootPath}
            sidebarElement={sidebarElement}
          />
        )
      },
    }))
    .catch((): { default: React.FC } => ({
      default: () => {
        console.warn('Failed to load interview sidebar')
        return <DisabledSidebarMenuItem title={'Interview Not Available'} />
      },
    })),
)
