import { CategoryList } from './components/CategoryList'
import { CreateCategoryForm } from './components/CreateCategoryForm'

export const SettingsPage = (): JSX.Element => {
  return (
    <div className='space-y-4'>
      <CategoryList />
      <CreateCategoryForm />
    </div>
  )
}
