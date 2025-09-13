import { useState } from 'react'
import { Plus } from 'lucide-react'

import {
  Card,
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
  Button,
} from '@tumaet/prompt-ui-components'

import { useCategoryStore } from '../../../../zustand/useCategoryStore'
import { useSelfEvaluationCategoryStore } from '../../../../zustand/useSelfEvaluationCategoryStore'
import { usePeerEvaluationCategoryStore } from '../../../../zustand/usePeerEvaluationCategoryStore'
import { useTutorEvaluationCategoryStore } from '../../../../zustand/useTutorEvaluationCategoryStore'

import { AssessmentType } from '../../../../interfaces/assessmentType'
import type { CategoryWithCompetencies } from '../../../../interfaces/category'

import { CategoryItem } from './components/CategoryItem'
import { EditCategoryDialog } from './components/EditCategoryDialog'
import { DeleteConfirmDialog } from './components/DeleteConfirmDialog'
import { CreateCategoryForm } from './components/CreateCategoryForm'
import { useEffect } from 'react'

interface CategoryListProps {
  assessmentTemplateID: string
  assessmentType: AssessmentType
}

export const CategoryList = ({ assessmentTemplateID, assessmentType }: CategoryListProps) => {
  const [categoryToEdit, setCategoryToEdit] = useState<CategoryWithCompetencies | undefined>(
    undefined,
  )
  const [categoryToDelete, setCategoryToDelete] = useState<string | undefined>(undefined)
  const [showAddCategoryForm, setShowAddCategoryForm] = useState(false)

  const { categories: assessmentCategories } = useCategoryStore()
  const { selfEvaluationCategories } = useSelfEvaluationCategoryStore()
  const { peerEvaluationCategories } = usePeerEvaluationCategoryStore()
  const { tutorEvaluationCategories } = useTutorEvaluationCategoryStore()

  const [categories, setCategories] = useState<CategoryWithCompetencies[]>([])

  useEffect(() => {
    switch (assessmentType) {
      case AssessmentType.SELF:
        setCategories(selfEvaluationCategories)
        break
      case AssessmentType.PEER:
        setCategories(peerEvaluationCategories)
        break
      case AssessmentType.TUTOR:
        setCategories(tutorEvaluationCategories)
        break
      default:
        setCategories(assessmentCategories)
    }
  }, [
    assessmentType,
    selfEvaluationCategories,
    peerEvaluationCategories,
    tutorEvaluationCategories,
    assessmentCategories,
  ])

  return (
    <Card className='p-6 overflow-hidden'>
      <Accordion type='single' collapsible className='w-full'>
        <AccordionItem value='competencies' className='border-none'>
          <div className='flex items-center gap-4'>
            <div className='flex items-center gap-2'>
              <AccordionTrigger
                className='py-3 hover:no-underline'
                aria-labelledby='assessment-template-header'
              ></AccordionTrigger>
            </div>
            <div className='flex justify-between items-center'>
              <div>
                <h2
                  id='assessment-template-header'
                  className='text-xl font-semibold tracking-tight'
                >
                  {assessmentType === AssessmentType.SELF
                    ? 'Self-Evaluation Template'
                    : assessmentType === AssessmentType.PEER
                      ? 'Peer-Evaluation Template'
                      : assessmentType === AssessmentType.TUTOR
                        ? 'Tutor-Evaluation Template'
                        : 'Assessment Template'}
                </h2>

                <p className='text-muted-foreground text-sm mt-1'>
                  {assessmentType === AssessmentType.SELF
                    ? 'Define the Self-Evaluation Categories and Competencies here'
                    : assessmentType === AssessmentType.PEER
                      ? 'Define the Peer-Evaluation Categories and Competencies here'
                      : assessmentType === AssessmentType.TUTOR
                        ? 'Define the Tutor-Evaluation Categories and Competencies here'
                        : 'Define the Assessment Categories and Competencies here'}
                </p>
              </div>
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
                  assessmentType={assessmentType}
                />
              ))}

              {showAddCategoryForm ? (
                <CreateCategoryForm
                  assessmentTemplateID={assessmentTemplateID}
                  onCancel={() => setShowAddCategoryForm(false)}
                />
              ) : (
                <Button
                  variant='outline'
                  className='w-full border-dashed flex items-center justify-center p-6 hover:bg-muted/50 transition-colors'
                  onClick={() => setShowAddCategoryForm(true)}
                >
                  <Plus className='h-5 w-5 mr-2 text-muted-foreground' />
                  <span className='text-muted-foreground'>Add Category</span>
                </Button>
              )}

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
