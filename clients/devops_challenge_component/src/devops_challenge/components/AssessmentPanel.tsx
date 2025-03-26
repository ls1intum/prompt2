import { RepositoryInformation } from './RepositoryInformation'
import { Assessment } from './Assessment'

export const AssessmentPanel = (): JSX.Element => {
  return (
    <div className='grid gap-6 mt-4'>
      <RepositoryInformation />
      <Assessment />
    </div>
  )
}
