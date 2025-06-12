import { ManagementPageHeader } from '@tumaet/prompt-ui-components'
import { AssessmentTemplateSelection } from './components/AssessmentTemplateSelection/AssessmentTemplateSelection'
import { CategoryList } from './components/CategoryList'
import { CreateCategoryForm } from './components/CreateCategoryForm'

export const SettingsPage = (): JSX.Element => {
  return (
    <div className='space-y-4'>
      <ManagementPageHeader>Assessment Settings</ManagementPageHeader>
      <AssessmentTemplateSelection />
      <CategoryList />
      <CreateCategoryForm />
    </div>
  )
}
