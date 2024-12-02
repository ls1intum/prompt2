import { InsideSidebarMenuItem } from '../Sidebar/InsideSidebar/components/InsideSidebarMenuItem'
import { TemplateSidebar } from './ExternalSidebars/TemplateSidebar'
import { FileUser } from 'lucide-react'

const ApplicationSidebar = ({ rootPath, title }: { rootPath: string; title: string }) => {
  // todo possible add more sidebar tiems
  return <InsideSidebarMenuItem goToPath={rootPath} icon={<FileUser />} title={title} />
}

export const PhaseSidebarMapping: { [key: string]: React.FC<{ rootPath: string; title: string }> } =
  {
    template_component: TemplateSidebar,
    application: ApplicationSidebar,
  }
