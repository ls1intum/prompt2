import { useState } from 'react'

import {
  Card,
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@tumaet/prompt-ui-components'

import type { CategoryWithCompetencies } from '../../../../interfaces/category'

import { CategoryItem } from './components/CategoryItem'
import { EditCategoryDialog } from './components/EditCategoryDialog'
import { DeleteConfirmDialog } from './components/DeleteConfirmDialog'
import { CreateCategoryForm } from './components/CreateCategoryForm'

interface CategoryListProps {
  assessmentTemplateID: string
  categories: CategoryWithCompetencies[]
}

export const CategoryList = ({ assessmentTemplateID, categories }: CategoryListProps) => {
  const [categoryToEdit, setCategoryToEdit] = useState<CategoryWithCompetencies | undefined>(
    undefined,
  )
  const [categoryToDelete, setCategoryToDelete] = useState<string | undefined>(undefined)

  return (
    <Card className='p-6 overflow-hidden'>
      <Accordion type='single' collapsible className='w-full'>
        <AccordionItem value='competencies' className='border-none'>
          <div className='flex justify-between items-center'>
            <div>
              <h2 className='text-xl font-semibold tracking-tight'>Assessment Template</h2>

              <p className='text-muted-foreground text-sm mt-1'>
                Define the Assessment Categories and Competencies here
              </p>
            </div>
            <div className='flex items-center gap-2'>
              <AccordionTrigger className='py-3 hover:no-underline'>
                <span className='text-sm font-medium'>Show Assessment Competencies</span>
              </AccordionTrigger>
            </div>
          </div>
          <AccordionContent className='pt-4 pb-2 space-y-5 border-t mt-2'>
            <div className='space-y-6'>
              {categories.map((category) => (
                <CategoryItem
                  key={category.id}
                  category={category}
                  setCategoryToEdit={setCategoryToEdit}
                  setCategoryToDelete={setCategoryToDelete}
                />
              ))}

              <CreateCategoryForm assessmentTemplateID={assessmentTemplateID} />

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
                  description={
                    'Are you sure you want to delete this category? ' +
                    'This action cannot be undone and will delete all competencies within this category.'
                  }
                  itemType='category'
                  itemId={categoryToDelete}
                />
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  )
}
