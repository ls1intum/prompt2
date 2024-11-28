import React from 'react'
import { SidebarMenuItemProps } from '@/interfaces/Sidebar'
import { InsideSidebarMenuItem } from '../Sidebar/InsideSidebar/components/InsideSidebarMenuItem'
import { DisabledSidebarMenuItem } from '../Sidebar/InsideSidebar/components/DisabledSidebarMenuItem'

interface TemplateSidebarProps {
  baseRoot: string
  title?: string
}

export const TemplateSidebar = React.lazy(() =>
  import('template_component/sidebar')
    .then((module): { default: React.FC<TemplateSidebarProps> } => ({
      default: ({ title, baseRoot }) => {
        const sidebarElement: SidebarMenuItemProps = module.default || {}
        return (
          <InsideSidebarMenuItem
            title={title || sidebarElement.title}
            icon={sidebarElement.icon}
            goToPath={baseRoot + sidebarElement.goToPath}
            subitems={
              sidebarElement.subitems?.map((subitem) => ({
                title: subitem.title,
                goToPath: baseRoot + subitem.goToPath,
              })) || []
            }
          />
        )
      },
    }))
    .catch((): { default: React.FC } => ({
      default: () => {
        console.warn('Failed to load template routes')
        return <DisabledSidebarMenuItem title={'Failed loading'} />
      },
    })),
)
