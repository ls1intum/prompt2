import { ApplicationGenderDiagram } from '../diagrams/ApplicationGenderDiagram'
import { ApplicationStatusCard } from '../diagrams/ApplicationStatusCard'
import { ApplicationStudyBackgroundDiagram } from '../diagrams/ApplicationStudyBackgroundDiagram'
import { ApplicationStudySemesterDiagram } from '../diagrams/ApplicationStudySemesterDiagram'
import { AssessmentDiagram } from '../diagrams/AssessmentDiagram'

interface ApplicationDashboardProps {
  applications: any[]
  applicationMetaData: any
  isApplicationConfigured: boolean
}

export const ApplicationDashboard = ({
  applications,
  applicationMetaData,
  isApplicationConfigured,
}: ApplicationDashboardProps) => (
  <>
    <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6'>
      <ApplicationStatusCard
        applicationMetaData={applicationMetaData}
        applicationPhaseIsConfigured={isApplicationConfigured}
      />
      <AssessmentDiagram applications={applications} />
      <ApplicationGenderDiagram applications={applications} />
    </div>
    <div className='grid gap-6 md:grid-cols-1 lg:grid-cols-2 mb-6'>
      <ApplicationStudyBackgroundDiagram applications={applications} />
      <ApplicationStudySemesterDiagram applications={applications} />
    </div>
  </>
)
