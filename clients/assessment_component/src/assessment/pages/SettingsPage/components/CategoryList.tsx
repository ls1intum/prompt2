import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Card } from '@/components/ui/card'
import { Edit, Trash2 } from 'lucide-react'
import { CreateCompetencyForm } from './CreateCompetencyForm'
import { useCategoryStore } from '../../../zustand/useCategoryStore'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { EditCategoryDialog } from './EditCategoryDialog'
import { DeleteConfirmDialog } from './DeleteConfirmDialog'
import type { CategoryWithCompetencies } from '../../../interfaces/category'
import { CompetencyItem } from './CompetencyItem'

export const CategoryList = () => {
  const { categories } = useCategoryStore()

  const [categoryToEdit, setCategoryToEdit] = useState<CategoryWithCompetencies | undefined>(
    undefined,
  )
  const [categoryToDelete, setCategoryToDelete] = useState<string | undefined>(undefined)

  return (
    <div className='space-y-6'>
      {categories.map((category) => (
        <Card key={category.id} className='p-6 overflow-hidden'>
          <Accordion type='single' collapsible className='w-full'>
            <AccordionItem value='competencies' className='border-none'>
              <div className='flex justify-between items-center'>
                <div>
                  <h2 className='text-xl font-semibold tracking-tight'>{category.name}</h2>
                  {category.description && (
                    <p className='text-muted-foreground text-sm mt-1'>{category.description}</p>
                  )}
                </div>
                <div className='flex items-center gap-2'>
                  <Button
                    variant='ghost'
                    size='icon'
                    onClick={(e) => {
                      e.stopPropagation()
                      setCategoryToEdit(category)
                    }}
                    aria-label={`Edit ${category.name}`}
                  >
                    <Edit className='h-4 w-4' />
                  </Button>
                  <Button
                    variant='ghost'
                    size='icon'
                    onClick={(e) => {
                      e.stopPropagation()
                      setCategoryToDelete(category.id)
                    }}
                    aria-label={`Delete ${category.name}`}
                  >
                    <Trash2 className='h-4 w-4 text-destructive' />
                  </Button>
                  <AccordionTrigger className='py-3 hover:no-underline'>
                    <span className='text-sm font-medium'>Show Competencies</span>
                  </AccordionTrigger>
                </div>
              </div>
              <AccordionContent className='pt-4 pb-2 space-y-5 border-t mt-2'>
                {category.competencies.length === 0 ? (
                  <p className='text-sm text-muted-foreground italic'>
                    No competencies available yet.
                  </p>
                ) : (
                  <div className='grid gap-4 sm:grid-cols-2'>
                    {category.competencies.map((competency) => (
                      <CompetencyItem competency={competency} categoryID={category.id} />
                    ))}
                  </div>
                )}
                <div className='py-4 border-t mt-2'>
                  <CreateCompetencyForm categoryID={category.id} />
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </Card>
      ))}

      <EditCategoryDialog
        open={!!categoryToEdit}
        onOpenChange={(open) => !open && setCategoryToEdit(undefined)}
        category={categoryToEdit}
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
