import { InsideSidebarMenuItemBasic } from './InsideSidebarMenuItemBasic'
import { InsideSidebarMenuItemCollapsable } from './InsideSidebarMenuItemCollapsable'

interface InsideSidebarMenuItemProps {
  goToPath: string
  isActive: boolean
  icon: JSX.Element
  title: string
  subitems?: {
    goToPath: string
    isActive: boolean
    title: string
  }[]
}

export const InsideSidebarMenuItem = (props: InsideSidebarMenuItemProps): JSX.Element => {
  return (
    <>
      {props.subitems && props.subitems.length > 0 ? (
        <InsideSidebarMenuItemCollapsable {...props} />
      ) : (
        <InsideSidebarMenuItemBasic {...props} />
      )}
    </>
  )
}
