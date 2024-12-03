import React from 'react'
import { InsideSidebarMenuItem } from '../../Sidebar/InsideSidebar/components/InsideSidebarMenuItem'
import { DisabledSidebarMenuItem } from '../../Sidebar/InsideSidebar/components/DisabledSidebarMenuItem'
import { SidebarMenuItemProps } from '@/interfaces/sidebar'


interface TemplateSidebarProps {
  rootPath: string
  title?: string
}

export const TemplateSidebar = React.lazy(() =>
  import('template_component/sidebar')
    .then((module): { default: React.FC<TemplateSidebarProps> } => ({
      default: ({ title, rootPath }) => {
        const sidebarElement: SidebarMenuItemProps = module.default || {}
        return (
          <InsideSidebarMenuItem
            title={title || sidebarElement.title}
            icon={sidebarElement.icon}
            goToPath={rootPath + sidebarElement.goToPath}
            subitems={
              sidebarElement.subitems?.map((subitem) => ({
                title: subitem.title,
                goToPath: rootPath + subitem.goToPath,
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
