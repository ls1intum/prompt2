import { ManagementPageHeader } from '@tumaet/prompt-ui-components'

import { DeadlineSelection } from './components/DeadlineSelection/DeadlineSelection'
import { AssessmentTemplateSelection } from './components/AssessmentTemplateSelection/AssessmentTemplateSelection'
import { CategoryList } from './components/CategoryList'
import { CreateCategoryForm } from './components/CreateCategoryForm'

export const SettingsPage = (): JSX.Element => {
  return (
    <div className='space-y-4'>
      <ManagementPageHeader>Assessment Settings</ManagementPageHeader>
      <div className='grid md:grid-cols-3 gap-4'>
        <AssessmentTemplateSelection />
        <DeadlineSelection />
      </div>

      <CategoryList />
      <CreateCategoryForm />
    </div>
  )
}
