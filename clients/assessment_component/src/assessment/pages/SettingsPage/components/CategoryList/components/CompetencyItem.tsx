import { useState } from 'react'
import { ChevronRight, Edit, Trash2 } from 'lucide-react'

import { Button } from '@tumaet/prompt-ui-components'

import type { Competency } from '../../../../../interfaces/competency'

import { EditCompetencyDialog } from './EditCompetencyDialog'
import { DeleteConfirmDialog } from './DeleteConfirmDialog'

interface CompetencyItemProps {
  competency: Competency
  categoryID: string
}

export const CompetencyItem = ({ competency, categoryID }: CompetencyItemProps) => {
  const [competencyToEdit, setCompetencyToEdit] = useState<Competency | undefined>(undefined)
  const [competencyToDelete, setCompetencyToDelete] = useState<
    | {
        id: string
        categoryID: string
      }
    | undefined
  >(undefined)

  return (
    <div>
      <div className='rounded-lg border bg-card p-4 shadow-sm transition-all hover:shadow-md relative'>
        <div className='absolute top-2 right-2 flex gap-1'>
          <Button
            variant='ghost'
            size='icon'
            className='h-7 w-7'
            onClick={() => setCompetencyToEdit(competency)}
            aria-label={`Edit ${competency.name}`}
          >
            <Edit className='h-3.5 w-3.5' />
          </Button>
          <Button
            variant='ghost'
            size='icon'
            className='h-7 w-7'
            onClick={() => setCompetencyToDelete({ id: competency.id, categoryID: categoryID })}
            aria-label={`Delete ${competency.name}`}
          >
            <Trash2 className='h-3.5 w-3.5 text-destructive' />
          </Button>
        </div>
        <div className='text-base font-medium mb-2 flex items-center gap-2 pr-16'>
          <ChevronRight className='h-4 w-4 text-muted-foreground' />
          {competency.name}
        </div>
        <div className='text-sm text-muted-foreground mb-3'>{competency.description}</div>
        <div className='text-xs grid grid-cols-5 gap-x-2'>
          <div className='space-y-1'>
            <div className='font-semibold'>Very Bad</div>
            <div>{competency.descriptionVeryBad}</div>
          </div>
          <div className='space-y-1'>
            <div className='font-semibold'>Bad</div>
            <div>{competency.descriptionBad}</div>
          </div>
          <div className='space-y-1'>
            <div className='font-semibold'>OK</div>
            <div>{competency.descriptionOk}</div>
          </div>
          <div className='space-y-1'>
            <div className='font-semibold'>Good</div>
            <div>{competency.descriptionGood}</div>
          </div>
          <div className='space-y-1'>
            <div className='font-semibold'>Very Good</div>
            <div>{competency.descriptionVeryGood}</div>
          </div>
        </div>
      </div>

      <EditCompetencyDialog
        open={!!competencyToEdit}
        onOpenChange={(open) => !open && setCompetencyToEdit(undefined)}
        competency={competencyToEdit}
      />

      {competencyToDelete && (
        <DeleteConfirmDialog
          open={!!competencyToDelete}
          onOpenChange={(open) => !open && setCompetencyToDelete(undefined)}
          title='Delete Competency'
          description='Are you sure you want to delete this competency? This action cannot be undone.'
          itemType='competency'
          itemId={competencyToDelete.id}
          categoryId={competencyToDelete.categoryID}
        />
      )}
    </div>
  )
}
