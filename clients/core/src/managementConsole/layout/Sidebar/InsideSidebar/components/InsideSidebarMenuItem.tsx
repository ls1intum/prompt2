import { InsideSidebarMenuItemBasic } from './InsideSidebarMenuItemBasic'
import { InsideSidebarMenuItemCollapsable } from './InsideSidebarMenuItemCollapsable'

interface InsideSidebarMenuItemProps {
  goToPath: string
  icon
  title: string
  subitems?: {
    goToPath: string
    title: string
  }[]
}

export const InsideSidebarMenuItem = (props: InsideSidebarMenuItemProps) => {
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
