import { TemplateSidebar } from './ExternalSidebars/TemplateSidebar'
import { InterviewSidebar } from './ExternalSidebars/InterviewSidebar'
import { ApplicationSidebar } from './ExternalSidebars/ApplicationSidebar'
import { MatchingSidebar } from './ExternalSidebars/MatchingSidebar'

export const PhaseSidebarMapping: {
  [key: string]: React.FC<{ rootPath: string; title: string; coursePhaseID: string }>
} = {
  template_component: TemplateSidebar,
  Application: ApplicationSidebar,
  Interview: InterviewSidebar,
  Matching: MatchingSidebar,
}
