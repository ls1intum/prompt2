import { Construction } from 'lucide-react'
import { SidebarMenuItemProps } from '@/interfaces/sidebar'
import { Role } from '@tumaet/prompt-shared-state'

const sidebarItems: SidebarMenuItemProps = {
  title: 'TemplateComponent',
  icon: <Construction />,
  goToPath: '',
  subitems: [],
}

export default sidebarItems
