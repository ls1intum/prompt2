import React from 'react'
import { DisabledSidebarMenuItem } from '../../layout/Sidebar/InsideSidebar/components/DisabledSidebarMenuItem'
import { SidebarMenuItemProps } from '@/interfaces/sidebar'
import { ExternalSidebarComponent } from './ExternalSidebar'

interface IntroCourseTutorSidebarProps {
  rootPath: string
  title?: string
  coursePhaseID: string
}

export const IntroCourseTutorSidebar = React.lazy(() =>
  import('intro_course_tutor_component/sidebar')
    .then((module): { default: React.FC<IntroCourseTutorSidebarProps> } => ({
      default: ({ title, rootPath, coursePhaseID }) => {
        const sidebarElement: SidebarMenuItemProps = module.default || {}
        return (
          <ExternalSidebarComponent
            title={title}
            rootPath={rootPath}
            sidebarElement={sidebarElement}
            coursePhaseID={coursePhaseID}
          />
        )
      },
    }))
    .catch((): { default: React.FC } => ({
      default: () => {
        console.warn('Failed to load intro course tutor sidebar')
        return <DisabledSidebarMenuItem title={'Intro Course Not Available'} />
      },
    })),
)
