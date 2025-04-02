import { CategoryList } from './components/CategoryList'
import { CreateCategoryForm } from './components/CreateCategoryForm'

export const SettingsPage = (): JSX.Element => {
  return (
    <div>
      <CategoryList />
      <CreateCategoryForm />
    </div>
  )
}
