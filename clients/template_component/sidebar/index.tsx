import { Construction } from 'lucide-react'
import { SidebarMenuItemProps } from '@/interfaces/Sidebar'

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
