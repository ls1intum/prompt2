import { CategoryList } from './components/CategoryList'
import { CreateCategoryForm } from './components/CreateCategoryForm'
import { CreateCompetencyForm } from './components/CreateCompetencyForm'

export const SettingsPage = (): JSX.Element => {
  return (
    <div>
      <CategoryList />
      <CreateCategoryForm />
    </div>
  )
}
