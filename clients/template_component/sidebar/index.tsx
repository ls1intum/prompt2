import { Construction } from 'lucide-react'
import { SidebarMenuItemProps } from '@/interfaces/sidebar'

const templateSidebarItems: SidebarMenuItemProps = {
  title: 'TemplateComponent',
  icon: <Construction />,
  goToPath: '',
  subitems: [
    {
      title: 'Settings',
      goToPath: '/settings',
    },
  ],
}

export default templateSidebarItems
