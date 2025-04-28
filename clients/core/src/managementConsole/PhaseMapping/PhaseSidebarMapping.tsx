import { TemplateSidebar } from './ExternalSidebars/TemplateSidebar'
import { InterviewSidebar } from './ExternalSidebars/InterviewSidebar'
import { ApplicationSidebar } from './ExternalSidebars/ApplicationSidebar'
import { MatchingSidebar } from './ExternalSidebars/MatchingSidebar'
import { IntroCourseDeveloperSidebar } from './ExternalSidebars/IntroCourseDeveloperSidebar'
import { IntroCourseTutorSidebar } from './ExternalSidebars/IntroCourseTutorSidebar'
import { AssessmentSidebar } from './ExternalSidebars/AssessmentSidebar'
import { DevOpsChallengeSidebar } from './ExternalSidebars/DevOpsChallengeSidebar'
import { TeamAllocationSidebar } from './ExternalSidebars/TeamAllocationSidebar'
import { SelfTeamAllocationSidebar } from './ExternalSidebars/SelfTeamAllocationSidebar'

export const PhaseSidebarMapping: {
  [key: string]: React.FC<{ rootPath: string; title: string; coursePhaseID: string }>
} = {
  template_component: TemplateSidebar,
  Application: ApplicationSidebar,
  Interview: InterviewSidebar,
  Matching: MatchingSidebar,
  IntroCourseDeveloper: IntroCourseDeveloperSidebar,
  IntroCourseTutor: IntroCourseTutorSidebar,
  Assessment: AssessmentSidebar,
  DevOpsChallenge: DevOpsChallengeSidebar,
  'Team Allocation': TeamAllocationSidebar,
  'Self Team Allocation': SelfTeamAllocationSidebar,
}
