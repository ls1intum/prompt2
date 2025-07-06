import { useState } from 'react'

import { useCategoryStore } from '../../../zustand/useCategoryStore'

import type { CategoryWithCompetencies } from '../../../interfaces/category'

import { EditCategoryDialog } from './EditCategoryDialog'
import { DeleteConfirmDialog } from './DeleteConfirmDialog'

import { CategoryItem } from './CategoryItem'

export const CategoryList = ({ assessmentTemplateID }: { assessmentTemplateID: string }) => {
  const { categories } = useCategoryStore()

  const [categoryToEdit, setCategoryToEdit] = useState<CategoryWithCompetencies | undefined>(
    undefined,
  )
  const [categoryToDelete, setCategoryToDelete] = useState<string | undefined>(undefined)

  return (
    <div className='space-y-6'>
      {categories.map((category) => (
        <CategoryItem
          key={category.id}
          category={category}
          setCategoryToEdit={setCategoryToEdit}
          setCategoryToDelete={setCategoryToDelete}
        />
      ))}

      <EditCategoryDialog
        open={!!categoryToEdit}
        onOpenChange={(open) => !open && setCategoryToEdit(undefined)}
        category={categoryToEdit}
        assessmentTemplateID={assessmentTemplateID}
      />

      {categoryToDelete && (
        <DeleteConfirmDialog
          open={!!categoryToDelete}
          onOpenChange={(open) => !open && setCategoryToDelete(undefined)}
          title='Delete Category'
          description='Are you sure you want to delete this category? This action cannot be undone and will also delete all competencies within this category.'
          itemType='category'
          itemId={categoryToDelete}
        />
      )}
    </div>
  )
}
