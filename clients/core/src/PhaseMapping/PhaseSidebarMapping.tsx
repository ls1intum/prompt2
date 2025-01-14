import { TemplateSidebar } from './ExternalSidebars/TemplateSidebar'
import { InterviewSidebar } from './ExternalSidebars/InterviewSidebar'
import { ApplicationSidebar } from './ExternalSidebars/ApplicationSidebar'

export const PhaseSidebarMapping: { [key: string]: React.FC<{ rootPath: string; title: string }> } =
  {
    template_component: TemplateSidebar,
    Application: ApplicationSidebar,
    Interview: InterviewSidebar,
  }
