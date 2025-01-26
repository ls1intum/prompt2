import React from 'react'
import { DisabledSidebarMenuItem } from '../../layout/Sidebar/InsideSidebar/components/DisabledSidebarMenuItem'
import { SidebarMenuItemProps } from '@/interfaces/sidebar'
import { ExternalSidebarComponent } from './ExternalSidebar'

interface MatchingSidebarProps {
  rootPath: string
  title?: string
}

export const MatchingSidebar = React.lazy(() =>
  import('matching_component/sidebar')
    .then((module): { default: React.FC<MatchingSidebarProps> } => ({
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
        console.warn('Failed to load matching sidebar')
        return <DisabledSidebarMenuItem title={'Matching Not Available'} />
      },
    })),
)
