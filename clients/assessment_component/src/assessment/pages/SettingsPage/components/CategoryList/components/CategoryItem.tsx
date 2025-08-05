import { useState } from 'react'
import { ChevronRight, ChevronDown, Edit, Trash2, Plus } from 'lucide-react'

import { Button } from '@tumaet/prompt-ui-components'

import type { CategoryWithCompetencies } from '../../../../../interfaces/category'

import { CompetencyItem } from './CompetencyItem'
import { CreateCompetencyForm } from './CreateCompetencyForm'

interface CategoryItemProps {
  category: CategoryWithCompetencies
  setCategoryToEdit: (category: CategoryWithCompetencies | undefined) => void
  setCategoryToDelete: (categoryID: string | undefined) => void
}

export const CategoryItem = ({
  category,
  setCategoryToEdit,
  setCategoryToDelete,
}: CategoryItemProps) => {
  const [isExpanded, setIsExpanded] = useState(true)
  const [showAddCompetencyForm, setShowAddCompetencyForm] = useState(false)

  const toggleExpand = () => {
    setIsExpanded(!isExpanded)
  }

  return (
    <div key={category.id} className='mb-6'>
      <div className='flex items-center mb-4'>
        <button
          onClick={toggleExpand}
          className='p-1 mr-2 hover:bg-gray-100 rounded-sm focus:outline-none'
          aria-expanded={isExpanded}
          aria-controls={`content-${category.id}`}
        >
          {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
        </button>
        <h2 className='text-xl font-semibold tracking-tight flex-grow'>{category.name}</h2>
        <div className='flex items-center gap-2'>
          <Button
            variant='ghost'
            size='icon'
            onClick={() => setCategoryToEdit(category)}
            aria-label={`Edit ${category.name}`}
          >
            <Edit className='h-4 w-4' />
          </Button>
          <Button
            variant='ghost'
            size='icon'
            onClick={() => setCategoryToDelete(category.id)}
            aria-label={`Delete ${category.name}`}
          >
            <Trash2 className='h-4 w-4 text-destructive' />
          </Button>
        </div>
      </div>

      {isExpanded && (
        <div>
          {category.competencies.length === 0 ? (
            <p className='text-sm text-muted-foreground italic'>No competencies available yet.</p>
          ) : (
            <div className='grid gap-4'>
              {category.competencies.map((competency) => (
                <CompetencyItem
                  key={competency.id}
                  competency={competency}
                  categoryID={category.id}
                />
              ))}
            </div>
          )}
          <div className='py-4 border-t mt-2'>
            {showAddCompetencyForm ? (
              <CreateCompetencyForm
                categoryID={category.id}
                onCancel={() => setShowAddCompetencyForm(false)}
              />
            ) : (
              <Button
                variant='outline'
                className='w-full border-dashed flex items-center justify-center p-4 hover:bg-muted/50 transition-colors'
                onClick={() => setShowAddCompetencyForm(true)}
              >
                <Plus className='h-4 w-4 mr-2 text-muted-foreground' />
                <span className='text-muted-foreground'>Add Competency</span>
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
