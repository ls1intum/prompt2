import { useState } from 'react'
import { Plus, Lock } from 'lucide-react'

import {
  Card,
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
  Button,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
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
  assessmentSchemaID: string
  assessmentType: AssessmentType
  hasAssessmentData?: boolean
}

export const CategoryList = ({
  assessmentSchemaID,
  assessmentType,
  hasAssessmentData = false,
}: CategoryListProps) => {
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
                aria-labelledby='assessment-schema-header'
              ></AccordionTrigger>
            </div>
            <div className='flex justify-between items-center'>
              <div>
                <div className='flex items-center gap-2'>
                  <h2
                    id='assessment-schema-header'
                    className='text-xl font-semibold tracking-tight'
                  >
                    {assessmentType === AssessmentType.SELF
                      ? 'Self-Evaluation Schema'
                      : assessmentType === AssessmentType.PEER
                        ? 'Peer-Evaluation Schema'
                        : assessmentType === AssessmentType.TUTOR
                          ? 'Tutor-Evaluation Schema'
                          : 'Assessment Schema'}
                  </h2>
                  {hasAssessmentData && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Lock className='h-4 w-4 text-muted-foreground' />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className='max-w-xs'>
                            Schema is locked because assessment data exists for this phase. Changes
                            are disabled to protect existing assessments.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>

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
                  disabled={hasAssessmentData}
                />
              ))}

              {showAddCategoryForm ? (
                <CreateCategoryForm
                  assessmentSchemaID={assessmentSchemaID}
                  onCancel={() => setShowAddCategoryForm(false)}
                />
              ) : (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div>
                        <Button
                          variant='outline'
                          className='w-full border-dashed flex items-center justify-center p-6 hover:bg-muted/50 transition-colors'
                          onClick={() => setShowAddCategoryForm(true)}
                          disabled={hasAssessmentData}
                        >
                          <Plus className='h-5 w-5 mr-2 text-muted-foreground' />
                          <span className='text-muted-foreground'>Add Category</span>
                        </Button>
                      </div>
                    </TooltipTrigger>
                    {hasAssessmentData && (
                      <TooltipContent>
                        <p>Cannot add categories when assessment data exists</p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
              )}

              <EditCategoryDialog
                open={!!categoryToEdit}
                onOpenChange={(open) => !open && setCategoryToEdit(undefined)}
                category={categoryToEdit}
                assessmentSchemaID={assessmentSchemaID}
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
